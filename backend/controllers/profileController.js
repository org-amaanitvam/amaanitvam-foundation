export const getMyProfile = async (req, res) => {
    try {
        return res.json({
            success: true,
            user: req.user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};