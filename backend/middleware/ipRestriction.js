import Setting from '../models/setting.js';

export const requireAllowedIP = async (req, res, next) => {
    try {
        const settings = await Setting.findOne();
        if (settings && settings.allowedIPs && settings.allowedIPs.length > 0) {
            const clientIP = req.ip || req.connection.remoteAddress;
            // Clean up IPv6-mapped IPv4 addresses (e.g. ::ffff:127.0.0.1)
            const cleanIP = clientIP.replace(/^.*:/, '');

            if (!settings.allowedIPs.includes(cleanIP) && !settings.allowedIPs.includes(clientIP)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access Denied: Your IP address is not authorized to access this resource.'
                });
            }
        }
        next();
    } catch (error) {
        console.error('IP Restriction Error:', error);
        res.status(500).json({ success: false, message: 'Server error checking IP restrictions.' });
    }
};
