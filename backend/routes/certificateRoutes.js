import express from 'express';
import Certificate from '../models/certificate.js';

const router = express.Router();

// GET /api/certificates/verify/:certificateId
// PUBLIC route — no authentication required (mirrors amaanitvam-assignment logic)
router.get('/verify/:certificateId', async (req, res) => {
    try {
        const certId = req.params.certificateId.toUpperCase().trim();
        const certificate = await Certificate.findOne({ certificateId: certId });

        if (!certificate) {
            return res.status(404).json({ valid: false, error: 'Certificate not found' });
        }

        if (!certificate.isValid) {
            return res.status(200).json({
                valid: false,
                error: 'Certificate has been revoked',
                certificate: {
                    certificateId: certificate.certificateId,
                    issuedTo: certificate.issuedTo,
                    isValid: false,
                    revokedAt: certificate.revokedAt,
                    revokedReason: certificate.revokedReason
                }
            });
        }

        res.status(200).json({
            valid: true,
            certificate: {
                certificateId: certificate.certificateId,
                issuedTo: certificate.issuedTo,
                email: certificate.email,
                phone: certificate.phone,
                type: certificate.type,
                domain: certificate.domain,
                duration: certificate.duration,
                startDate: certificate.startDate,
                endDate: certificate.endDate,
                issueDate: certificate.issueDate,
                issuedBy: certificate.issuedBy,
                isValid: certificate.isValid
            }
        });
    } catch (error) {
        console.error('Certificate verification error:', error);
        res.status(500).json({ valid: false, error: 'Server error during verification.' });
    }
});

// GET /api/certificates/seed — PUBLIC route to seed demo certificates for testing
router.get('/seed', async (req, res) => {
    try {
        const demoCerts = [
            {
                certificateId: 'AF-2025-001',
                issuedTo: 'Aarav Sharma',
                email: 'aarav.sharma@example.com',
                phone: '+91 9876543210',
                type: 'Internship',
                domain: 'Frontend',
                duration: '3 Months',
                startDate: new Date('2025-01-15'),
                endDate: new Date('2025-04-15'),
                issueDate: new Date('2025-04-20'),
                issuedBy: 'Amaanitvam Foundation',
                isValid: true
            },
            {
                certificateId: 'AF-2025-002',
                issuedTo: 'Priya Mehta',
                email: 'priya.mehta@example.com',
                phone: '+91 9123456780',
                type: 'Volunteer',
                domain: 'Community Development',
                duration: '6 Months',
                startDate: new Date('2024-10-01'),
                endDate: new Date('2025-03-31'),
                issueDate: new Date('2025-04-05'),
                issuedBy: 'Amaanitvam Foundation',
                isValid: true
            },
            {
                certificateId: 'AF-2025-003',
                issuedTo: 'Rohan Verma',
                email: 'rohan.verma@example.com',
                phone: '+91 8765432190',
                type: 'Internship',
                domain: 'Backend',
                duration: '2 Months',
                startDate: new Date('2025-02-01'),
                endDate: new Date('2025-03-31'),
                issueDate: new Date('2025-04-10'),
                issuedBy: 'Amaanitvam Foundation',
                isValid: true
            },
            {
                certificateId: 'AF-2025-004',
                issuedTo: 'Ananya Gupta',
                email: 'ananya.gupta@example.com',
                phone: '+91 7654321890',
                type: 'Appreciation',
                domain: 'Social Media',
                duration: '1 Month',
                startDate: new Date('2025-03-01'),
                endDate: new Date('2025-03-31'),
                issueDate: new Date('2025-04-02'),
                issuedBy: 'Amaanitvam Foundation',
                isValid: true
            },
            {
                certificateId: 'AF-2024-892X',
                issuedTo: 'Vikram Singh',
                email: 'vikram.singh@example.com',
                phone: '+91 6543218790',
                type: 'Achievement',
                domain: 'Project Manager',
                duration: '4 Months',
                startDate: new Date('2024-06-01'),
                endDate: new Date('2024-09-30'),
                issueDate: new Date('2024-10-15'),
                issuedBy: 'Amaanitvam Foundation',
                isValid: true
            }
        ];

        let created = 0;
        let updated = 0;
        for (const cert of demoCerts) {
            const existing = await Certificate.findOne({ certificateId: cert.certificateId });
            if (existing) {
                await Certificate.findOneAndUpdate({ certificateId: cert.certificateId }, cert);
                updated++;
            } else {
                await Certificate.create(cert);
                created++;
            }
        }

        res.json({
            success: true,
            message: `Seeded ${created} new + ${updated} updated certificates. Total: ${demoCerts.length}`,
            testIds: demoCerts.map(c => c.certificateId)
        });
    } catch (error) {
        console.error('Seed certificates error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
