import { useState, useEffect } from 'react';
import { Award, Plus, X, Download } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const DOMAIN_OPTIONS = ['Creative', 'Graphics', 'Social media', 'Marketing', 'Frontend', 'Backend', 'Full stack'];
const TYPE_OPTIONS = ['Internship', 'Volunteer', 'Appreciation', 'Achievement'];
const INITIAL_FORM = { issuedTo: '', email: '', type: 'Internship', domain: 'Creative' };

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

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

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.issuedTo || !formData.email) {
      toast.error('Name and email are required');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/admin/certificates', formData);
      toast.success('Certificate generated!');
      setShowGenerateModal(false);
      setFormData(INITIAL_FORM);
      fetchCertificates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate certificate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id) => {
    setActionLoading(id);
    try {
      await api.put(`/admin/certificates/${id}/revoke`, { reason: 'Revoked by admin' });
      toast.success('Certificate revoked');
      fetchCertificates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke certificate');
    } finally {
      setActionLoading(null);
    }
  };

  const SkeletonRow = () => (
    <tr className="border-b border-slate-50">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );

  return (
    <div>
      {/* Topbar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Certificate Management</h1>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="bg-[#56051a] hover:bg-[#7a1e3a] text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate Certificate
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Certificate ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Issued To</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Domain</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Issue Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Award className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-medium">No certificates found</p>
                    <p className="text-xs text-slate-400 mt-1">Generate your first certificate to get started.</p>
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => {
                  const certId = cert._id || cert.id;
                  return (
                    <tr key={certId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono text-xs">
                        {cert.certificateId || certId?.slice(-8)?.toUpperCase() || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{cert.issuedTo || cert.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{cert.type}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{cert.domain}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {cert.issuedAt || cert.createdAt
                          ? new Date(cert.issuedAt || cert.createdAt).toLocaleDateString('en-IN')
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {cert.isValid !== false ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                            Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                            Revoked
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          {cert.isValid !== false && (
                            <button
                              onClick={() => handleRevoke(certId)}
                              disabled={actionLoading === certId}
                              className="bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              Revoke
                            </button>
                          )}
                          <button
                            className="bg-slate-50 text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Certificate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-[slideUp_0.25s_ease-out]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-800">Generate Certificate</h2>
              <button
                onClick={() => { setShowGenerateModal(false); setFormData(INITIAL_FORM); }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Issued To <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.issuedTo}
                  onChange={(e) => setFormData({ ...formData, issuedTo: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
                  placeholder="Enter recipient name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Domain</label>
                <select
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
                >
                  {DOMAIN_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowGenerateModal(false); setFormData(INITIAL_FORM); }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#56051a] hover:bg-[#7a1e3a] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
