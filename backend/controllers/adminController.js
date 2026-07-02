import PDFDocument from "pdfkit";
import User from '../models/user.js';
import InternshipApplication from '../models/internshipApplication.js';
import VolunteerApplication from '../models/volunteerApplication.js';
import Donation from '../models/donation.js';
import Certificate from '../models/certificate.js';
import Setting from '../models/setting.js';
import AuditLog from '../models/auditLog.js';
import Department from '../models/department.js';

// GET /api/admin/me
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
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

// ✅ CHANGED: non-admins only see candidates from their own department/domain
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

        // 🔒 Scope by department for non-admins
        if (!['super_admin', 'admin'].includes(req.user.role)) {
            if (req.user.department) {
                query.track = req.user.department;
            } else {
                return res.json({ success: true, candidates: [], total: 0, totalPages: 0, domains: [] });
            }
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [candidates, total, departmentDomains] = await Promise.all([
            InternshipApplication.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            InternshipApplication.countDocuments(query),
            Department.distinct('departmentName')
        ]);

        const domainSet = new Set([
            ...candidates.map((candidate) => candidate?.track).filter(Boolean),
            ...departmentDomains.filter(Boolean),
        ]);

        res.json({
            success: true,
            candidates,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            domains: [...domainSet].sort(),
        });
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
            await AuditLog.create({
                userId: req.user._id,
                action: 'reject_candidate',
                details: `Rejected candidate ${candidate.email}`,
                ipAddress: req.ip
            });
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
            await AuditLog.create({
                userId: req.user._id,
                action: 'shortlist_candidate',
                details: `Shortlisted candidate ${candidate.email}`,
                ipAddress: req.ip
            });
            return res.json({ success: true, message: 'Candidate shortlisted and moved to interns.' });
        }

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

// ✅ CHANGED: non-admins only see members in their own department
export const getMembers = async (req, res) => {
    try {
        let query = {};

        // 🔒 Scope by department for non-admins
        if (!['super_admin', 'admin'].includes(req.user.role)) {
            if (req.user.department) {
                query.department = req.user.department;
            } else {
                return res.json({ success: true, members: [] });
            }
        }

        const members = await User.find(query).sort({ createdAt: -1 });
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

        await AuditLog.create({
            userId: req.user._id,
            action: 'add_member',
            details: `Added new member: ${email} (${role})`,
            ipAddress: req.ip
        });

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

    if (!['super_admin', 'admin', 'member', 'intern', 'volunteer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const member = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    await AuditLog.create({
      userId: req.user._id,
      action: 'update_member_role',
      details: `Updated role of ${member.email} to ${role}`,
      ipAddress: req.ip
    });

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

        await AuditLog.create({
            userId: req.user._id,
            action: 'deactivate_member',
            details: `Deactivated member ${member.email}`,
            ipAddress: req.ip
        });

        res.json({ success: true, member });
    } catch (error) {
        console.error('Deactivate error:', error);
        res.status(500).json({ success: false, message: 'Failed to deactivate member.' });
    }
};

// DELETE /api/admin/members/:id
export const deleteMember = async (req, res) => {
    try {
        const member = await User.findByIdAndDelete(req.params.id);
        if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });

        await AuditLog.create({
            userId: req.user._id,
            action: 'delete_member',
            details: `Deleted member ${member.email}`,
            ipAddress: req.ip
        });

        res.json({ success: true, message: 'Member deleted successfully.' });
    } catch (error) {
        console.error('Delete member error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete member.' });
    }
};

// GET /api/admin/donations
export const getDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ status: 'paid' }).populate('campaign', 'title status goalAmount raisedAmount').sort({ createdAt: -1 });
        const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
        res.json({ success: true, donations, totalAmount });
    } catch (error) {
        console.error('Donations error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch donations.' });
    }
};

// ✅ CHANGED: non-admins only see their own certificates
export const getCertificates = async (req, res) => {
  try {
    // 🔒 Scope by email for non-admins
    let query = {};
    if (!['super_admin', 'admin'].includes(req.user.role)) {
      query = { email: req.user.email };
    }

    const certificates = await Certificate.find(query)
      .select('-pdfBuffer')
      .sort({ createdAt: -1 });

    const certsWithUrl = certificates.map(cert => {
      const c = cert.toObject();
      c.certificateUrl = `/api/certificates/${cert._id}/download`;
      return c;
    });

    res.json({ success: true, certificates: certsWithUrl });
  } catch (error) {
    console.error('Certificates error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch certificates.' });
  }
};

export const uploadCertificateFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a certificate PDF.' });
    }
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ success: false, message: 'Only PDF certificate files are allowed.' });
    }

    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      {
        pdfBuffer: req.file.buffer,
        pdfContentType: req.file.mimetype,
        pdfOriginalName: req.file.originalname,
        pdfUploadedAt: new Date(),
      },
      { new: true }
    ).select('-pdfBuffer');

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    await AuditLog.create({
      userId: req.user._id,
      action: 'upload_certificate_pdf',
      details: `Uploaded PDF for certificate ${certificate.certificateId}`,
      ipAddress: req.ip,
    });

    const certObj = certificate.toObject();
    certObj.certificateUrl = `/api/certificates/${certificate._id}/download`;
    res.json({ success: true, message: 'Certificate PDF uploaded successfully.', certificate: certObj });
  } catch (error) {
    console.error('Upload certificate file error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to upload certificate PDF.' });
  }
};

// POST /api/admin/certificates
export const generateCertificate = async (req, res) => {
  try {
    const {
      issuedTo, email, phone, type = 'Internship', domain,
      duration, startDate, endDate, issueDate, isValid,
    } = req.body;

    if (!issuedTo?.trim()) return res.status(400).json({ success: false, message: 'Intern name is required.' });
    if (!email?.trim()) return res.status(400).json({ success: false, message: 'Intern email is required.' });
    if (!domain?.trim()) return res.status(400).json({ success: false, message: 'Internship domain is required.' });
    if (!['Internship', 'Volunteer', 'Appreciation', 'Achievement'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid certificate type.' });
    }
    if (req.file && req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ success: false, message: 'Only PDF certificate files are allowed.' });
    }

    const year = new Date().getFullYear();
    const existingCount = await Certificate.countDocuments({ certificateId: { $regex: `^AF-${year}-` } });

    let certificateId;
    for (let attempt = 1; attempt <= 100; attempt += 1) {
      const serial = String(existingCount + attempt).padStart(4, '0');
      const candidateId = `AF-${year}-${serial}`;
      const exists = await Certificate.exists({ certificateId: candidateId });
      if (!exists) { certificateId = candidateId; break; }
    }
    if (!certificateId) certificateId = `AF-${year}-${Date.now().toString().slice(-6)}`;

    const certificateData = {
      certificateId,
      issuedTo: issuedTo.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      type, domain: domain.trim(),
      duration: duration?.trim() || '',
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      issueDate: issueDate || new Date(),
      isValid: isValid === false || isValid === 'false' ? false : true,
    };

    if (req.file) {
      certificateData.pdfBuffer = req.file.buffer;
      certificateData.pdfContentType = req.file.mimetype;
      certificateData.pdfOriginalName = req.file.originalname;
      certificateData.pdfUploadedAt = new Date();
    }

    const certificate = new Certificate(certificateData);
    await certificate.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'generate_certificate',
      details: `Generated ${type} certificate ${certificate.certificateId} for ${issuedTo} (${email})`,
      ipAddress: req.ip,
    });

    const safeCertificate = certificate.toObject();
    delete safeCertificate.pdfBuffer;
    safeCertificate.certificateUrl = `/api/certificates/${certificate._id}/download`;

    res.status(201).json({ success: true, certificate: safeCertificate });
  } catch (error) {
    console.error('Generate certificate error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Certificate ID already exists. Please try again.' });
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to generate certificate.' });
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

        await AuditLog.create({
            userId: req.user._id,
            action: 'revoke_certificate',
            details: `Revoked certificate ${certificate.certificateId}. Reason: ${reason || 'None'}`,
            ipAddress: req.ip
        });

        res.json({ success: true, certificate });
    } catch (error) {
        console.error('Revoke certificate error:', error);
        res.status(500).json({ success: false, message: 'Failed to revoke certificate.' });
    }
};

// GET /api/admin/certificates/:id/download
export const downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found.' });
    if (!certificate.pdfBuffer) return res.status(404).json({ success: false, message: 'No uploaded certificate PDF found for this record.' });

    // 🔒 Non-admins can only download their own certificate
    if (!['super_admin', 'admin'].includes(req.user.role)) {
      if (certificate.email !== req.user.email) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    const safeFileName = (certificate.pdfOriginalName || `${certificate.certificateId}.pdf`).replace(/[^\w.\-() ]/g, '_');
    res.setHeader('Content-Type', certificate.pdfContentType || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
    return res.send(certificate.pdfBuffer);
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/members/:id
export const updateMember = async (req, res) => {
  try {
    const { name, phone, department } = req.body;
    const member = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, department },
      { new: true, runValidators: true }
    );
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/settings
export const getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) settings = await Setting.create({});
        res.json({ success: true, settings });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
    }
};

// PUT /api/admin/settings
export const updateSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) settings = await Setting.create({});

        const updated = await Setting.findByIdAndUpdate(settings._id, req.body, { new: true });

        await AuditLog.create({
            userId: req.user._id,
            action: 'update_settings',
            details: `Updated global system settings`,
            ipAddress: req.ip
        });

        res.json({ success: true, settings: updated });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ success: false, message: 'Failed to update settings.' });
    }
};

// GET /api/admin/audit-logs
export const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find().populate('userId', 'name email role').sort({ createdAt: -1 }).limit(100);
        res.json({ success: true, logs });
    } catch (error) {
        console.error('Audit logs error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
    }
};

// GET /api/admin/reports
export const getReports = async (req, res) => {
  try {
    const [users, candidates, donations] = await Promise.all([
      User.find()
        .select('name email phone role status department profileImage joinedAt createdAt')
        .sort({ createdAt: -1 }),
      InternshipApplication.countDocuments(),
      Donation.find().populate('campaign', 'title status goalAmount raisedAmount').sort({ createdAt: -1 })
    ]);

    const roleCounts = users.reduce((acc, user) => {
      const role = user.role || 'member';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    const statusCounts = users.reduce((acc, user) => {
      const status = user.status || 'active';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const monthlyMap = users.reduce((acc, user) => {
      const rawDate = user.createdAt || user.joinedAt;
      if (!rawDate) return acc;
      const date = new Date(rawDate);
      if (Number.isNaN(date.getTime())) return acc;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[key]) {
        acc[key] = { key, month: date.toLocaleString('en-IN', { month: 'short', year: '2-digit' }), members: 0, active: 0 };
      }
      acc[key].members += 1;
      if ((user.status || 'active') === 'active') acc[key].active += 1;
      return acc;
    }, {});

    const growthData = Object.values(monthlyMap)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6)
      .map(({ key, ...item }) => item);

    const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

    res.json({
      success: true,
      reports: {
        totalMembers: users.length,
        activeMembers: statusCounts.active || 0,
        inactiveMembers: statusCounts.inactive || 0,
        admins: roleCounts.admin || 0,
        interns: roleCounts.intern || 0,
        volunteers: roleCounts.volunteer || 0,
        memberRoleCount: roleCounts.member || 0,
        roleCounts,
        statusCounts,
        growthData,
        recentMembers: users.slice(0, 10),
        totalCandidates: candidates,
        totalDonations,
        totalTransactions: donations.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/me
export const updateMe = async (req, res) => {
  try {
    const { name, phone, department, profileImage } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const updateData = {
      name: name.trim(),
      phone: phone?.trim() || '',
      department: department?.trim() || ''
    };

    if (typeof profileImage === 'string' && profileImage.startsWith('data:image/')) {
      updateData.profileImage = profileImage;
    }

    const member = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user: member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
