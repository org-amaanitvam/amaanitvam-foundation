import { useState, useEffect } from 'react';
import {
  Award,
  Search,
  Download,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Upload,
  Plus,
  X,
  Loader2,
} from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const initialForm = {
  issuedTo: '',
  email: '',
  phone: '',
  type: 'Internship',
  domain: '',
  duration: '',
  startDate: '',
  endDate: '',
  issueDate: '',
  isValid: 'true',
};

export default function Certificates() {
  const [uploadingCertId, setUploadingCertId] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [verifyId, setVerifyId] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [certificateFile, setCertificateFile] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/certificates');
      setCertificates(res.data.certificates || res.data || []);
    } catch (err) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const resetAddForm = () => {
    setForm(initialForm);
    setCertificateFile(null);
  };

  const openAddModal = () => {
    resetAddForm();
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (creating) return;
    setShowAddModal(false);
    resetAddForm();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-IN');
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return '';

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    if (totalDays >= 60) {
      const months = Math.max(1, Math.round(totalDays / 30));
      return `${months} Month${months > 1 ? 's' : ''}`;
    }
    return `${totalDays} Day${totalDays > 1 ? 's' : ''}`;
  };

  const getTenure = (cert) => {
    const duration = cert.duration || calculateDuration(cert.startDate, cert.endDate);
    const range = cert.startDate || cert.endDate
      ? `${formatDate(cert.startDate)} - ${formatDate(cert.endDate)}`
      : '';

    if (duration && range) return `${duration} (${range})`;
    return duration || range || '—';
  };

  const handleCreateCertificate = async (e) => {
    e.preventDefault();

    if (!form.issuedTo.trim()) return toast.error('Intern name is required');
    if (!form.email.trim()) return toast.error('Intern email is required');
    if (!form.domain.trim()) return toast.error('Internship domain is required');
    if (!form.startDate || !form.endDate) return toast.error('Internship start and end dates are required');
    if (!certificateFile) return toast.error('Please upload the certificate PDF');
    if (certificateFile.type !== 'application/pdf') return toast.error('Only PDF certificate files are allowed');

    const autoDuration = calculateDuration(form.startDate, form.endDate);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    formData.set('duration', form.duration.trim() || autoDuration);
    formData.append('certificate', certificateFile);

    setCreating(true);
    try {
      const res = await api.post('/admin/certificates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const certId = res.data?.certificate?.certificateId;
      toast.success(certId ? `Certificate added: ${certId}` : 'Certificate added successfully');
      setShowAddModal(false);
      resetAddForm();
      fetchCertificates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add certificate');
    } finally {
      setCreating(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyId.trim()) {
      toast.error('Please enter a certificate ID');
      return;
    }
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await api.get(`/certificates/verify/${verifyId.trim()}`);
      setVerifyResult(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setVerifyResult({
          success: false,
          message: 'Certificate not found. This certificate ID is invalid.',
        });
      } else {
        toast.error('Verification failed');
      }
    } finally {
      setVerifying(false);
    }
  };

  const downloadCertificate = async (cert) => {
    try {
      const response = await api.get(`/admin/certificates/${cert._id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cert.certificateId || cert._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download certificate');
    }
  };

  const uploadCertificatePdf = async (id, file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file only');
      return;
    }
    const formData = new FormData();
    formData.append('certificate', file);
    setUploadingCertId(id);
    try {
      await api.put(`/admin/certificates/${id}/file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Certificate PDF uploaded successfully');
      fetchCertificates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload certificate PDF');
    } finally {
      setUploadingCertId(null);
    }
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-200 rounded w-24" />
        </td>
      ))}
    </tr>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-[#56051a]" />
            Certificate Management
          </h1>
          <p className="text-slate-500 mt-1">
            Upload, issue, verify, and download intern certificates with complete internship tenure details.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={openAddModal}
            className="bg-[#56051a] hover:bg-[#7a1e3a] text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Certificate
          </button>
          <button
            onClick={() => {
              setShowVerifyModal(true);
              setVerifyResult(null);
              setVerifyId('');
            }}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            Verify Certificate
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Issued Certificates</h2>
          <p className="text-sm text-slate-500 mt-1">
            All certificates issued by Amaanitvam Foundation.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Certificate ID</th>
                <th className="px-6 py-4 text-left font-semibold">Intern Name</th>
                <th className="px-6 py-4 text-left font-semibold">Domain</th>
                <th className="px-6 py-4 text-left font-semibold">Tenure</th>
                <th className="px-6 py-4 text-left font-semibold">Issue Date</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No certificates issued yet
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => (
                  <tr key={cert._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-[#56051a]">
                      {cert.certificateId || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{cert.issuedTo || '—'}</div>
                      <div className="text-xs text-slate-500">{cert.email || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{cert.domain || '—'}</td>
                    <td className="px-6 py-4 text-slate-700 min-w-[190px]">{getTenure(cert)}</td>
                    <td className="px-6 py-4 text-slate-700">
                      {formatDate(cert.issueDate || cert.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      {cert.isValid !== false ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                          <XCircle className="w-3.5 h-3.5" />
                          Revoked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => downloadCertificate(cert)}
                          className="bg-slate-50 text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </button>
                        <label className="bg-[#56051a]/10 text-[#56051a] hover:bg-[#56051a]/15 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          {uploadingCertId === cert._id ? 'Uploading...' : 'Replace PDF'}
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => uploadCertificatePdf(cert._id, e.target.files?.[0])}
                          />
                        </label>
                      </div>
                      {cert.pdfUploadedAt && (
                        <div className="text-[11px] text-slate-400 mt-1">
                          PDF uploaded {formatDate(cert.pdfUploadedAt)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Add New Certificate</h2>
                <p className="text-sm text-slate-500 mt-1">
                  A unique certificate ID will be generated automatically.
                </p>
              </div>
              <button
                onClick={closeAddModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCertificate} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Intern Name *</label>
                  <input
                    name="issuedTo"
                    value={form.issuedTo}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
                    placeholder="Enter intern name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
                    placeholder="intern@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Certificate Type</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Volunteer">Volunteer</option>
                    <option value="Appreciation">Appreciation</option>
                    <option value="Achievement">Achievement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Internship Domain *</label>
                  <input
                    name="domain"
                    value={form.domain}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
                    placeholder="e.g. Web Development"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                  <select
                    name="isValid"
                    value={form.isValid}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
                  >
                    <option value="true">Valid</option>
                    <option value="false">Revoked</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date *</label>
                  <input
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date *</label>
                  <input
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tenure / Duration</label>
                  <input
                    name="duration"
                    value={form.duration}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
                    placeholder={calculateDuration(form.startDate, form.endDate) || 'e.g. 3 Months'}
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Leave blank to auto-calculate from start/end date.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Issue Date</label>
                  <input
                    name="issueDate"
                    type="date"
                    value={form.issueDate}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
                  />
                  <p className="text-xs text-slate-400 mt-1">Leave blank to use today's date.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Upload Certificate PDF *</label>
                <label className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors">
                  <Upload className="w-8 h-8 text-[#56051a] mb-2" />
                  <span className="text-sm font-semibold text-slate-700">
                    {certificateFile ? certificateFile.name : 'Click to upload PDF certificate'}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">PDF only, max 10MB</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-[#56051a] hover:bg-[#7a1e3a] disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {creating ? 'Adding...' : 'Add Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVerifyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">Verify Certificate</h2>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors text-xl"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Certificate ID</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={verifyId}
                    onChange={(e) => setVerifyId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30 font-mono uppercase"
                    placeholder="e.g. AF-2026-0001"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={verifying}
                className="w-full bg-[#56051a] hover:bg-[#7a1e3a] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {verifying ? 'Verifying...' : 'Verify'}
              </button>
            </form>

            {verifyResult && (
              <div className={`mt-5 p-4 rounded-xl ${verifyResult.success ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                {verifyResult.success ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold">
                      <CheckCircle className="w-5 h-5" />
                      Certificate Verified
                    </div>
                    <p className="text-sm text-slate-700">ID: {verifyResult.certificate.certificateId}</p>
                    <p className="text-sm text-slate-700">Issued To: {verifyResult.certificate.issuedTo}</p>
                    <p className="text-sm text-slate-700">Domain: {verifyResult.certificate.domain || '—'}</p>
                    <p className="text-sm text-slate-700">Tenure: {getTenure(verifyResult.certificate)}</p>
                    <p className="text-sm text-slate-700">Issue Date: {formatDate(verifyResult.certificate.issueDate)}</p>
                    <p className="text-sm text-slate-700">Status: {verifyResult.certificate.isValid ? '✅ Valid' : '❌ Revoked'}</p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-red-700">
                    <XCircle className="w-5 h-5 mt-0.5" />
                    <div>
                      <p className="font-bold">Invalid Certificate</p>
                      <p className="text-sm">{verifyResult.message}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
