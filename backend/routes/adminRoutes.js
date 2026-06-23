import express from 'express';
import { verifyFirebaseToken, requireAdmin } from '../middleware/verifyFirebaseToken.js';
import User from '../models/user.js';
import {
    getMe, getDashboardStats,
    getCandidates, updateCandidateStatus,
    getMembers, addMember, updateMemberRole, deactivateMember,
    getDonations,
    getCertificates, generateCertificate, revokeCertificate
} from '../controllers/adminController.js';

const router = express.Router();

// Unprotected route so you can seed the DB from your browser!
router.get('/seed', async (req, res) => {
    try {
        const ADMIN_EMAIL = "tech.amaanitvam@gmail.com";
        const existing = await User.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            existing.role = 'admin';
            existing.status = 'active';
            await existing.save();
            return res.json({ success: true, message: "User already existed and was updated to admin" });
        }
        const adminUser = new User({
            name: "Amaanitvam Admin",
            email: ADMIN_EMAIL,
            role: "admin",
            status: "active",
            department: "Technology"
        });
        await admin.save();
        res.json({ success: true, message: "Super admin created successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.use(verifyFirebaseToken);

router.get('/me', getMe);
router.get('/stats', getDashboardStats);

router.get('/candidates', requireAdmin, getCandidates);
router.put('/candidates/:id/status', requireAdmin, updateCandidateStatus);

router.get('/members', requireAdmin, getMembers);
router.post('/members', requireAdmin, addMember);
router.put('/members/:id/role', requireAdmin, updateMemberRole);
router.put('/members/:id/deactivate', requireAdmin, deactivateMember);

router.get('/donations', requireAdmin, getDonations);

router.get('/certificates', requireAdmin, getCertificates);
router.post('/certificates', requireAdmin, generateCertificate);
router.put('/certificates/:id/revoke', requireAdmin, revokeCertificate);

export default router;
