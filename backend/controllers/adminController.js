import User from '../models/user.js';
import InternshipApplication from '../models/internshipApplication.js';
import VolunteerApplication from '../models/volunteerApplication.js';
import Donation from '../models/donation.js';
import Certificate from '../models/certificate.js';

// GET /api/admin/me
export const getMe = async (req, res) => {
    res.json({ success: true, user: req.user });
};

// GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
    try {
        const [totalCandidates, activeMembers, totalDonations, certificatesIssued] = await Promise.all([
            InternshipApplication.countDocuments(),
            User.countDocuments({ status: 'active', role: { $in: ['member', 'intern'] } }),
            Donation.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
            Certificate.countDocuments({ isValid: true })
        ]);

        res.json({
            success: true,
            stats: {
                totalCandidates,
                activeMembers,
                totalDonations: totalDonations[0]?.total || 0,
                certificatesIssued
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
    }
};

// GET /api/admin/candidates
export const getCandidates = async (req, res) => {
    try {
        const { search, domain, status, page = 1, limit = 20 } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (domain) query.track = domain;
        if (status) query.status = status;

        const skip = (Number(page) - 1) * Number(limit);
        const [candidates, total] = await Promise.all([
            InternshipApplication.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            InternshipApplication.countDocuments(query)
        ]);

        res.json({ success: true, candidates, total, page: Number(page), totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('Candidates error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch candidates.' });
    }
};

// PUT /api/admin/candidates/:id/status
export const updateCandidateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'shortlisted', 'rejected', 'accepted'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status.' });
        }

        if (status === 'rejected') {
            const candidate = await InternshipApplication.findByIdAndDelete(req.params.id);
            if (!candidate) {
                return res.status(404).json({ success: false, message: 'Candidate not found.' });
            }
            return res.json({ success: true, message: 'Candidate rejected and deleted.' });
        }

        if (status === 'shortlisted') {
            const candidate = await InternshipApplication.findByIdAndDelete(req.params.id);
            if (!candidate) {
                return res.status(404).json({ success: false, message: 'Candidate not found.' });
            }

            const existingUser = await User.findOne({ email: candidate.email });
            if (!existingUser) {
                const newIntern = new User({
                    name: candidate.name,
                    email: candidate.email,
                    phone: candidate.phone,
                    role: 'intern',
                    department: candidate.track,
                    status: 'active'
                });
                await newIntern.save();
            }
            return res.json({ success: true, message: 'Candidate shortlisted and moved to Members.' });
        }

        // For any other status updates (like 'accepted' or reverting to 'pending' if ever needed)
        const candidate = await InternshipApplication.findByIdAndUpdate(
            req.params.id,
            { status },
            { returnDocument: 'after' }
        );

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found.' });
        }

        res.json({ success: true, candidate });
    } catch (error) {
        console.error('Update candidate error:', error);
        res.status(500).json({ success: false, message: 'Failed to update candidate.' });
    }
};

// GET /api/admin/members
export const getMembers = async (req, res) => {
    try {
        const members = await User.find().sort({ createdAt: -1 });
        res.json({ success: true, members });
    } catch (error) {
        console.error('Members error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch members.' });
    }
};

// POST /api/admin/members
export const addMember = async (req, res) => {
    try {
        const { name, email, phone, role, department } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'User with this email already exists.' });
        }

        const member = new User({ name, email, phone, role: role || 'member', department });
        await member.save();

        res.status(201).json({ success: true, member });
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({ success: false, message: 'Failed to add member.' });
    }
};

// PUT /api/admin/members/:id/role
export const updateMemberRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['super_admin', 'admin', 'member', 'intern'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role.' });
        }

        const member = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { returnDocument: 'after' }
        );

        if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
        res.json({ success: true, member });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ success: false, message: 'Failed to update role.' });
    }
};

// PUT /api/admin/members/:id/deactivate
export const deactivateMember = async (req, res) => {
    try {
        const member = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'inactive' },
            { returnDocument: 'after' }
        );

        if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
        res.json({ success: true, member });
    } catch (error) {
        console.error('Deactivate error:', error);
        res.status(500).json({ success: false, message: 'Failed to deactivate member.' });
    }
};

// GET /api/admin/donations
export const getDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ status: 'paid' }).sort({ createdAt: -1 });
        const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

        res.json({ success: true, donations, totalAmount });
    } catch (error) {
        console.error('Donations error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch donations.' });
    }
};

// GET /api/admin/certificates
export const getCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find().sort({ createdAt: -1 });
        res.json({ success: true, certificates });
    } catch (error) {
        console.error('Certificates error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch certificates.' });
    }
};

// POST /api/admin/certificates
export const generateCertificate = async (req, res) => {
    try {
        const { issuedTo, email, type, domain } = req.body;

        const count = await Certificate.countDocuments();
        const year = new Date().getFullYear();
        const certificateId = `AF-${year}-${String(count + 1).padStart(3, '0')}`;

        const certificate = new Certificate({ certificateId, issuedTo, email, type, domain });
        await certificate.save();

        res.status(201).json({ success: true, certificate });
    } catch (error) {
        console.error('Generate certificate error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate certificate.' });
    }
};

// PUT /api/admin/certificates/:id/revoke
export const revokeCertificate = async (req, res) => {
    try {
        const { reason } = req.body;
        const certificate = await Certificate.findByIdAndUpdate(
            req.params.id,
            { isValid: false, revokedAt: new Date(), revokedReason: reason || 'No reason provided' },
            { returnDocument: 'after' }
        );

        if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found.' });
        res.json({ success: true, certificate });
    } catch (error) {
        console.error('Revoke certificate error:', error);
        res.status(500).json({ success: false, message: 'Failed to revoke certificate.' });
    }
};
