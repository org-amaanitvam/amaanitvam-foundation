import crypto from 'crypto';
import https from 'https';
import User from '../models/user.js';

const GOOGLE_FIREBASE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

let cachedCerts = null;
let cachedCertsExpiresAt = 0;

const normalizeEmail = (email = '') => String(email).trim().toLowerCase();

const getFirebaseProjectId = () =>
  process.env.FIREBASE_PROJECT_ID ||
  process.env.VITE_FIREBASE_PROJECT_ID ||
  process.env.GCLOUD_PROJECT ||
  process.env.GOOGLE_CLOUD_PROJECT;

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64');
};

const decodeJwtPart = (value) => JSON.parse(decodeBase64Url(value).toString('utf8'));

const fetchFirebaseCerts = () =>
  new Promise((resolve, reject) => {
    https
      .get(GOOGLE_FIREBASE_CERTS_URL, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            return reject(
              new Error(`Unable to fetch Firebase certs. Status: ${response.statusCode}`)
            );
          }

          try {
            const cacheControl = response.headers['cache-control'] || '';
            const maxAgeMatch = /max-age=(\d+)/.exec(cacheControl);
            const maxAgeSeconds = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;

            resolve({
              certs: JSON.parse(data),
              expiresAt: Date.now() + maxAgeSeconds * 1000,
            });
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', reject);
  });

const getFirebaseCerts = async () => {
  if (cachedCerts && Date.now() < cachedCertsExpiresAt) {
    return cachedCerts;
  }

  const result = await fetchFirebaseCerts();
  cachedCerts = result.certs;
  cachedCertsExpiresAt = result.expiresAt;
  return cachedCerts;
};

const verifyFirebaseIdToken = async (token) => {
  const projectId = getFirebaseProjectId();

  if (!projectId) {
    throw new Error(
      'FIREBASE_PROJECT_ID is missing in backend environment. Add it to backend/.env.'
    );
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid Firebase token format.');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJwtPart(encodedHeader);
  const claims = decodeJwtPart(encodedPayload);

  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Invalid Firebase token header.');
  }

  const certs = await getFirebaseCerts();
  const certificate = certs[header.kid];

  if (!certificate) {
    throw new Error('Firebase token signing certificate not found.');
  }

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();

  const isValidSignature = verifier.verify(certificate, decodeBase64Url(encodedSignature));
  if (!isValidSignature) {
    throw new Error('Invalid Firebase token signature.');
  }

  const now = Math.floor(Date.now() / 1000);
  const expectedIssuer = `https://securetoken.google.com/${projectId}`;

  if (claims.aud !== projectId) {
    throw new Error('Invalid Firebase token audience.');
  }

  if (claims.iss !== expectedIssuer) {
    throw new Error('Invalid Firebase token issuer.');
  }

  if (!claims.sub || typeof claims.sub !== 'string' || claims.sub.length > 128) {
    throw new Error('Invalid Firebase token subject.');
  }

  if (!claims.exp || Number(claims.exp) <= now) {
    throw new Error('Firebase token has expired.');
  }

  if (!claims.iat || Number(claims.iat) > now + 300) {
    throw new Error('Invalid Firebase token issued-at time.');
  }

  return claims;
};

export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided.',
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token || token === 'mock') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
    }

    let decoded;
    try {
      decoded = await verifyFirebaseIdToken(token);
    } catch (error) {
      console.warn('Firebase token rejected:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token.',
      });
    }

    const email = normalizeEmail(decoded.email);

    if (!email) {
      return res.status(401).json({
        success: false,
        message: 'Token does not contain email.',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Account is not registered in the system.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated.',
      });
    }

    const firebaseUid = decoded.user_id || decoded.sub || decoded.uid;

    if (user.firebaseUid && firebaseUid && user.firebaseUid !== firebaseUid) {
      return res.status(403).json({
        success: false,
        message: 'Firebase account does not match this system user.',
      });
    }

    if (!user.firebaseUid && firebaseUid) {
      user.firebaseUid = firebaseUid;
      await user.save();
    }

    req.user = user;
    req.firebaseToken = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error.',
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || !['super_admin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }

  next();
};
