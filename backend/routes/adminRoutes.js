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

router.post('/gallery', requireAdmin, upload.single('image'), async (req, res) => {
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

router.delete('/gallery/:id', requireAdmin, async (req, res) => {
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

export default router;
