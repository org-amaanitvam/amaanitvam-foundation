import { useState, useEffect, useCallback } from 'react';
import { Users, Search, Mail, Filter, Eye } from 'lucide-react'; // Added Eye icon
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseConfig } from '../../../config/firebase.js';
import api from '../../../config/api.js';
import toast from 'react-hot-toast';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [domains, setDomains] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (domainFilter) params.domain = domainFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/admin/candidates', { params });
      setCandidates(res.data.candidates || res.data || []);
      setDomains(res.data.domains || []);
    } catch (err) {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, [search, domainFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCandidates();
    }, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchCandidates]);

  const handleStatusChange = async (candidate, status) => {
    const id = candidate._id || candidate.id;
    setActionLoading(id);
    try {
      if (status === 'shortlisted') {
        const secondaryApp = initializeApp(firebaseConfig, `SecondaryApp_${Date.now()}`);
        const secondaryAuth = getAuth(secondaryApp);
        try {
          await createUserWithEmailAndPassword(secondaryAuth, candidate.email, 'Password123!');
        } catch (fbError) {
          if (fbError.code !== 'auth/email-already-in-use') {
             throw new Error(fbError.message);
          }
        } finally {
          await signOut(secondaryAuth);
        }
      }

      await api.put(`/admin/candidates/${id}/status`, { status });
      toast.success(status === 'shortlisted' ? 'Candidate shortlisted and synced with Firebase!' : 'Candidate rejected');
      fetchCandidates();
    } catch (err) {
      toast.error(err.message || err.response?.data?.message || `Failed to ${status} candidate`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-700',
      shortlisted: 'bg-emerald-50 text-emerald-700',
      rejected: 'bg-red-50 text-red-700',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const SkeletonRow = () => (
    <tr className="border-b border-slate-50">
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">Candidate Management</h1>
          <span className="bg-[#56051a]/10 text-[#56051a] text-sm px-3 py-1 rounded-full font-semibold">
            {candidates.length}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-72 text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30 transition-colors"
          />
        </div>
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30 transition-colors text-slate-600"
        >
          <option value="">All Domains</option>
          {domains.map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30 transition-colors text-slate-600"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Domain</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">CV</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Applied On</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-medium">No candidates found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter criteria.</p>
                  </td>
                </tr>
              ) : (
                candidates.map((candidate) => (
                  <tr key={candidate._id || candidate.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{candidate.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{candidate.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{candidate.phone || '—'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${candidate.applicationType === 'volunteer' ? 'bg-sky-50 text-sky-700' : 'bg-violet-50 text-violet-700'}`}>
                        {candidate.applicationType === 'volunteer' ? 'Volunteer' : 'Internship'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{candidate.track || candidate.role || '—'}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(candidate.status)}</td>
                    
                    {/* NEW CV COLUMN */}
<td className="px-6 py-4 text-sm">
  {(() => {
    let cvLink = candidate.resumeUrl || candidate.resume || candidate.cv_link || candidate.cv || candidate.documentUrl;
    
    if (cvLink) {
      // 1. Fix old database entries that accidentally saved 'localhost'
      if (cvLink.includes('localhost:5000')) {
        cvLink = cvLink.replace('http://localhost:5000', 'https://amaanitvam-foundation.onrender.com');
      } 
      // 2. If it's just a relative path like '/uploads/file.pdf', point it to the live server
      else if (!cvLink.startsWith('http')) {
        cvLink = `https://amaanitvam-foundation.onrender.com${cvLink.startsWith('/') ? '' : '/'}${cvLink}`;
      }
    }

    return cvLink ? (
      <a 
        href={cvLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-[#56051a] hover:text-[#7a1e3a] transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#56051a]/10"
        title="View Resume"
      >
        <Eye className="w-5 h-5" />
      </a>
    ) : (
      <span className="text-slate-400 text-xs font-medium">No CV</span>
    );
  })()}
</td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {candidate.status !== 'shortlisted' && (
                          <button
                            onClick={() => handleStatusChange(candidate, 'shortlisted')}
                            disabled={actionLoading === (candidate._id || candidate.id)}
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            Shortlist
                          </button>
                        )}
                        {candidate.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(candidate, 'rejected')}
                            disabled={actionLoading === (candidate._id || candidate.id)}
                            className="bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}