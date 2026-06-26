import express from 'express';
import Setting from '../models/setting.js';

const router = express.Router();

// GET /api/public/settings
router.get('/settings', async (req, res) => {
    try {
        const settings = await Setting.findOne();
        if (!settings) {
            return res.json({ success: true, settings: {} });
        }
        res.json({
            success: true,
            settings: {
                orgName: settings.orgName,
                enable2FA: settings.enable2FA,
                maintenanceMode: settings.maintenanceMode
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch public settings.' });
    }
});

export default router;
