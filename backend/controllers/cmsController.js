import CMS from '../models/cms.js';
import AuditLog from '../models/auditLog.js';

export const getCMSContent = async (req, res) => {
    try {
        let content = await CMS.findOne();
        if (!content) {
            content = await CMS.create({});
        }
        res.json({ success: true, content });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch CMS content.' });
    }
};

export const updateCMSContent = async (req, res) => {
    try {
        let content = await CMS.findOne();
        if (!content) {
            content = new CMS(req.body);
            await content.save();
        } else {
            content = await CMS.findByIdAndUpdate(content._id, req.body, { new: true });
        }

        if (req.user) {
            await AuditLog.create({
                userId: req.user._id,
                action: 'update_cms',
                details: 'Updated website CMS content',
                ipAddress: req.ip
            });
        }

        res.json({ success: true, content });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update CMS content.' });
    }
};
