import { useEffect, useState } from 'react';
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
  Pencil,
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

const certificateTypes = ['Internship', 'Volunteer', 'Appreciation', 'Achievement'];

const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const getCertDbId = (cert) => cert?._id || cert?.id;

export default function Certificates() {
  const [uploadingCertId, setUploadingCertId] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [verifyId, setVerifyId] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [certificateFile, setCertificateFile] = useState(null);
  const [domains, setDomains] = useState([]);

  useEffect(() => {
    fetchCertificates();
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const res = await api.get('/public/departments');
      if (res.data && res.data.departments) {
        setDomains(res.data.departments);
      }
    } catch (err) {
      console.error('Failed to load domains', err);
    }
  };

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/certificates');
      setCertificates(res.data.certificates || res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setCertificateFile(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (creating) return;
    setShowAddModal(false);
    resetForm();
  };

  const certificateToForm = (cert) => ({
    issuedTo: cert.issuedTo || '',
    email: cert.email || '',
    phone: cert.phone || '',
    type: cert.type || 'Internship',
    domain: cert.domain || '',
    duration: cert.duration || '',
    startDate: toDateInputValue(cert.startDate),
    endDate: toDateInputValue(cert.endDate),
    issueDate: toDateInputValue(cert.issueDate || cert.createdAt),
    isValid: cert.isValid === false ? 'false' : 'true',
  });

  const openEditModal = (cert) => {
    setEditingCertificate(cert);
    setForm(certificateToForm(cert));
    setCertificateFile(null);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    if (updating) return;
    setShowEditModal(false);
    setEditingCertificate(null);
    resetForm();
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
    const range = cert.startDate || cert.endDate ? `${formatDate(cert.startDate)} - ${formatDate(cert.endDate)}` : '';
    if (duration && range) return `${duration} (${range})`;
    return duration || range || '—';
  };

  const validateForm = ({ requirePdf }) => {
    if (!form.issuedTo.trim()) return 'Intern name is required';
    if (!form.email.trim()) return 'Intern email is required';
    if (!form.domain.trim()) return 'Internship domain is required';
    if (!form.startDate || !form.endDate) return 'Internship start and end dates are required';
    if (requirePdf && !certificateFile) return 'Please upload the certificate PDF';
    if (certificateFile && certificateFile.type !== 'application/pdf') return 'Only PDF certificate files are allowed';
    return '';
  };

  const buildCertificateFormData = () => {
    const autoDuration = calculateDuration(form.startDate, form.endDate);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value);
    });
    formData.set('duration', form.duration.trim() || autoDuration);
    if (certificateFile) formData.append('certificate', certificateFile);
    return formData;
  };

  const handleCreateCertificate = async (e) => {
    e.preventDefault();
    const errorMessage = validateForm({ requirePdf: true });
    if (errorMessage) return toast.error(errorMessage);

    setCreating(true);
    try {
      const res = await api.post('/admin/certificates', buildCertificateFormData(), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const certId = res.data?.certificate?.certificateId;
      toast.success(certId ? `Certificate added: ${certId}` : 'Certificate added successfully');
      setShowAddModal(false);
      resetForm();
      fetchCertificates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add certificate');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateCertificate = async (e) => {
    e.preventDefault();
    const id = getCertDbId(editingCertificate);
    if (!id) return toast.error('Certificate ID missing');

    const errorMessage = validateForm({ requirePdf: false });
    if (errorMessage) return toast.error(errorMessage);

    setUpdating(true);
    try {
      await api.put(`/admin/certificates/${id}`, buildCertificateFormData(), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Certificate updated successfully');
      setShowEditModal(false);
      setEditingCertificate(null);
      resetForm();
      fetchCertificates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update certificate');
    } finally {
      setUpdating(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyId.trim()) return toast.error('Please enter a certificate ID');

    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await api.get(`/certificates/verify/${verifyId.trim()}`);
      setVerifyResult(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setVerifyResult({ success: false, message: 'Certificate not found. This certificate ID is invalid.' });
      } else {
        toast.error(err.response?.data?.message || 'Verification failed');
      }
    } finally {
      setVerifying(false);
    }
  };

  const downloadCertificate = async (cert) => {
    try {
      const response = await api.get(`/admin/certificates/${getCertDbId(cert)}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cert.certificateId || getCertDbId(cert)}.pdf`;
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
    if (file.type !== 'application/pdf') return toast.error('Please upload a PDF file only');

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

  const CertificateForm = ({ mode }) => {
    const isEdit = mode === 'edit';
    const busy = isEdit ? updating : creating;

    return (
      <form onSubmit={isEdit ? handleUpdateCertificate : handleCreateCertificate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Intern Name *</span>
            <input name="issuedTo" value={form.issuedTo} onChange={handleFormChange} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email *</span>
            <input name="email" type="email" value={form.email} onChange={handleFormChange} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Phone</span>
            <input name="phone" value={form.phone} onChange={handleFormChange} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Certificate Type</span>
            <select name="type" value={form.type} onChange={handleFormChange} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20">
              {certificateTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Internship Domain *</span>
            <select name="domain" value={form.domain} onChange={handleFormChange} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20">
              <option value="" disabled>Select a domain</option>
              {domains.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Status</span>
            <select name="isValid" value={form.isValid} onChange={handleFormChange} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20">
              <option value="true">Valid</option>
              <option value="false">Revoked</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Issue Date</span>
            <input name="issueDate" type="date" value={form.issueDate} onChange={handleFormChange} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Start Date *</span>
            <input name="startDate" type="date" value={form.startDate} onChange={handleFormChange} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">End Date *</span>
            <input name="endDate" type="date" value={form.endDate} onChange={handleFormChange} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Tenure / Duration</span>
            <input name="duration" value={form.duration} onChange={handleFormChange} placeholder="Leave blank to auto-calculate" className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20" />
            <p className="text-xs text-slate-500 mt-1">Leave blank to auto-calculate from start/end date.</p>
          </label>
          <label className="block md:col-span-2 border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:border-[#56051a]/40 transition-colors">
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Upload className="w-4 h-4" /> {isEdit ? 'Replace Certificate PDF' : 'Upload Certificate PDF *'}</span>
            <span className="block text-sm text-slate-500 mt-2">{certificateFile ? certificateFile.name : isEdit ? 'Optional: choose a new PDF to replace existing file' : 'Click to upload PDF certificate'}</span>
            <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setCertificateFile(e.target.files?.[0] || null)} />
          </label>
        </div>
        <div className="flex justify-end gap-3 pt-3">
          <button type="button" onClick={isEdit ? closeEditModal : closeAddModal} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50" disabled={busy}>Cancel</button>
          <button type="submit" disabled={busy} className="bg-[#56051a] hover:bg-[#6f0a24] disabled:opacity-60 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? (busy ? 'Updating...' : 'Update Certificate') : (busy ? 'Adding...' : 'Add Certificate')}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Award className="w-7 h-7 text-[#56051a]" /> Certificate Management</h1>
          <p className="text-slate-500 mt-1">Upload, issue, verify, update, and download intern certificates with complete internship tenure details.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={openAddModal} className="bg-[#56051a] hover:bg-[#6f0a24] text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"><Plus className="w-4 h-4" /> Add Certificate</button>
          <button onClick={() => { setShowVerifyModal(true); setVerifyResult(null); setVerifyId(''); }} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"><ShieldCheck className="w-4 h-4" /> Verify Certificate</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Issued Certificates</h2>
          <p className="text-sm text-slate-500 mt-1">All certificates issued by Amaanitvam Foundation.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                {['Certificate ID', 'Intern Name', 'Domain', 'Tenure', 'Issue Date', 'Status', 'Actions'].map((head) => (
                  <th key={head} className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((__, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : certificates.length === 0 ? (
                <tr><td colSpan="7" className="px-5 py-10 text-center text-slate-500">No certificates issued yet</td></tr>
              ) : (
                certificates.map((cert) => (
                  <tr key={getCertDbId(cert)} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4 font-mono text-sm text-slate-800">{cert.certificateId || '—'}</td>
                    <td className="px-5 py-4"><div className="font-semibold text-slate-900">{cert.issuedTo || '—'}</div><div className="text-xs text-slate-500">{cert.email || '—'}</div></td>
                    <td className="px-5 py-4 text-sm text-slate-700">{cert.domain || '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{getTenure(cert)}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{formatDate(cert.issueDate || cert.createdAt)}</td>
                    <td className="px-5 py-4">
                      {cert.isValid !== false ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full"><CheckCircle className="w-3.5 h-3.5" /> Valid</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full"><XCircle className="w-3.5 h-3.5" /> Revoked</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => openEditModal(cert)} className="bg-[#56051a]/10 text-[#56051a] hover:bg-[#56051a]/15 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"><Pencil className="w-3.5 h-3.5" /> Update</button>
                        <button onClick={() => downloadCertificate(cert)} className="bg-slate-50 text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"><Download className="w-3.5 h-3.5" /> Download</button>
                        <label className="bg-slate-50 text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" /> {uploadingCertId === getCertDbId(cert) ? 'Uploading...' : 'Replace PDF'}
                          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => uploadCertificatePdf(getCertDbId(cert), e.target.files?.[0])} />
                        </label>
                      </div>
                      {cert.pdfUploadedAt && <p className="text-[11px] text-slate-400 mt-1">PDF uploaded {formatDate(cert.pdfUploadedAt)}</p>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-5">
              <div><h2 className="text-xl font-bold text-slate-900">Add New Certificate</h2><p className="text-sm text-slate-500 mt-1">A unique certificate ID will be generated automatically.</p></div>
              <button onClick={closeAddModal} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <CertificateForm mode="add" />
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-5">
              <div><h2 className="text-xl font-bold text-slate-900">Update Certificate</h2><p className="text-sm text-slate-500 mt-1">Editing: <span className="font-mono">{editingCertificate?.certificateId}</span></p></div>
              <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <CertificateForm mode="edit" />
          </div>
        </div>
      )}

      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-start justify-between mb-5">
              <div><h2 className="text-xl font-bold text-slate-900">Verify Certificate</h2><p className="text-sm text-slate-500 mt-1">Enter the certificate ID to check validity.</p></div>
              <button onClick={() => setShowVerifyModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleVerify} className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Certificate ID</span>
                <div className="relative mt-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input value={verifyId} onChange={(e) => setVerifyId(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30 font-mono uppercase" placeholder="e.g. AF-2026-0001" />
                </div>
              </label>
              <button type="submit" disabled={verifying} className="w-full bg-[#56051a] hover:bg-[#6f0a24] disabled:opacity-60 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2">
                {verifying && <Loader2 className="w-4 h-4 animate-spin" />} {verifying ? 'Verifying...' : 'Verify'}
              </button>
            </form>
            {verifyResult && (
              <div className={`mt-5 rounded-xl border p-4 ${verifyResult.success ? 'border-emerald-100 bg-emerald-50' : 'border-red-100 bg-red-50'}`}>
                {verifyResult.success ? (
                  <div className="space-y-1 text-sm text-emerald-900"><h3 className="font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Certificate Verified</h3><p>ID: {verifyResult.certificate.certificateId}</p><p>Issued To: {verifyResult.certificate.issuedTo}</p><p>Domain: {verifyResult.certificate.domain || '—'}</p><p>Tenure: {getTenure(verifyResult.certificate)}</p><p>Issue Date: {formatDate(verifyResult.certificate.issueDate)}</p><p>Status: {verifyResult.certificate.isValid ? '✅ Valid' : '❌ Revoked'}</p></div>
                ) : (
                  <div className="space-y-1 text-sm text-red-900"><h3 className="font-bold flex items-center gap-2"><XCircle className="w-4 h-4" /> Invalid Certificate</h3><p>{verifyResult.message}</p></div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
