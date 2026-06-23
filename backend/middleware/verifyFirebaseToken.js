import User from '../models/user.js';

// DEMO MODE: In production, use firebase-admin SDK to verify tokens
// For now, this extracts the email from the Firebase JWT payload without cryptographic verification
// TODO: Install firebase-admin and use admin.auth().verifyIdToken(token) for production
export const verifyFirebaseToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No authentication token provided.' });
        }

        const token = authHeader.split(' ')[1];

        // DEMO: Decode JWT payload (middle part) without verification
        // In production, replace this with: const decoded = await admin.auth().verifyIdToken(token);
        let decoded;
        try {
            const payload = token.split('.')[1];
            decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
        } catch {
            return res.status(401).json({ success: false, message: 'Invalid token format.' });
        }

        const email = decoded.email;
        if (!email) {
            return res.status(401).json({ success: false, message: 'Token does not contain email.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(403).json({ success: false, message: 'User not registered in the system.' });
        }

        if (user.status === 'inactive') {
            return res.status(403).json({ success: false, message: 'Account has been deactivated.' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ success: false, message: 'Authentication error.' });
    }
};

export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required.' });
    }
    next();
};
