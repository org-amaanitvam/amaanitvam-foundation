import express from 'express';
import Certificate from '../models/certificate.js';
import { getCertificates, downloadCertificate } from '../controllers/adminController.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

const router = express.Router();


// GET /api/certificates/verify/:certificateId
// PUBLIC route — no authentication required
router.get('/verify/:certificateId', async (req, res) => {
    try {
        const certificateId = req.params.certificateId.trim().toUpperCase();

        const cert = await Certificate.findOne({
            certificateId,
            isValid: true
        });

        if (!cert) {
            return res.status(404).json({
                success: false,
                verified: false,
                message: 'Certificate not found. This certificate ID is invalid.'
            });
        }

        res.json({
            success: true,
            verified: true,
            certificate: {
                certificateId: cert.certificateId,
                issuedTo: cert.issuedTo,
                email: cert.email,
                type: cert.type,
                domain: cert.domain,
                duration: cert.duration,
                startDate: cert.startDate,
                endDate: cert.endDate,
                issueDate: cert.issueDate,
                issuedBy: cert.issuedBy
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, verified: false, message: error.message });
    }
});

// GET /api/certificates/my — Authenticated; returns only the current user's certificates
router.get('/my', verifyFirebaseToken, getCertificates);

// GET /api/certificates/:id/download — Authenticated; downloads a specific certificate PDF
router.get('/:id/download', verifyFirebaseToken, downloadCertificate);

// GET /api/certificates/my — Authenticated; returns only the current user's certificates
router.get('/my', verifyFirebaseToken, getCertificates);

// GET /api/certificates/:id/download — Authenticated; downloads a specific certificate PDF
router.get('/:id/download', verifyFirebaseToken, downloadCertificate);

export default router;

