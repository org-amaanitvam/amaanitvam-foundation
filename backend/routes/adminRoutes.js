import express from 'express';
import { verifyFirebaseToken, requireAdmin } from '../middleware/verifyFirebaseToken.js';
import { requireAllowedIP } from '../middleware/ipRestriction.js';
import User from '../models/user.js';
import {
    getMe, getDashboardStats,
    getCandidates, updateCandidateStatus,
    getMembers, addMember, updateMemberRole, deactivateMember, deleteMember,
    getDonations,
    getCertificates, generateCertificate, revokeCertificate,
    getSettings, updateSettings, getAuditLogs
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
        await adminUser.save();
        res.json({ success: true, message: "Super admin created successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.use(verifyFirebaseToken);
router.get('/me', getMe);
router.get('/stats', requireAdmin, requireAllowedIP, getDashboardStats);

router.get('/candidates', requireAdmin, requireAllowedIP, getCandidates);
router.put('/candidates/:id/status', requireAdmin, requireAllowedIP, updateCandidateStatus);
router.get('/members', requireAdmin, requireAllowedIP, getMembers);
router.post('/members', requireAdmin, requireAllowedIP, addMember);
router.put('/members/:id/role', requireAdmin, requireAllowedIP, updateMemberRole);
router.put('/members/:id/deactivate', requireAdmin, requireAllowedIP, deactivateMember);
router.delete('/members/:id', requireAdmin, requireAllowedIP, deleteMember);

router.get('/donations', requireAdmin, requireAllowedIP, getDonations);

router.get('/certificates', requireAdmin, requireAllowedIP, getCertificates);
router.post('/certificates', requireAdmin, requireAllowedIP, generateCertificate);
router.put('/certificates/:id/revoke', requireAdmin, requireAllowedIP, revokeCertificate);

router.get('/settings', requireAdmin, requireAllowedIP, getSettings);
router.put('/settings', requireAdmin, requireAllowedIP, updateSettings);

router.get('/audit-logs', requireAdmin, requireAllowedIP, getAuditLogs);

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Gallery from '../models/gallery.js';
import { fileURLToPath } from 'url';

const __filenameAdmin = fileURLToPath(import.meta.url);
const __dirnameAdmin = path.dirname(__filenameAdmin);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirnameAdmin, '../uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.post('/gallery', requireAdmin, requireAllowedIP, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        const newImage = new Gallery({ imageUrl, title });
        await newImage.save();
        res.status(201).json({ success: true, image: newImage });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/gallery/:id', requireAdmin, requireAllowedIP, async (req, res) => {
    try {
        const image = await Gallery.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ success: false, message: 'Image not found' });
        }
        const filePath = path.join(__dirnameAdmin, '..', image.imageUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        await Gallery.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/gallery/:id', requireAdmin, requireAllowedIP, upload.single('image'), async (req, res) => {
    try {
        const image = await Gallery.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ success: false, message: 'Image not found' });
        }
        
        if (req.body.title) {
            image.title = req.body.title;
        }

        if (req.file) {
            // Delete old file
            const oldFilePath = path.join(__dirnameAdmin, '..', image.imageUrl);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
            image.imageUrl = `/uploads/${req.file.filename}`;
        }

        await image.save();
        res.status(200).json({ success: true, image });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
