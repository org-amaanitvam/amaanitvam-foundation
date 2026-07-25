import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Eye,
  Trash2,
} from 'lucide-react';
import api from '../../../config/api.js';
import toast from 'react-hot-toast';

const INTERNSHIP_DOMAINS = [
  'FullStack',
  'Frontend',
  'Backend',
  'CSR',
  'Marketing',
  'Management',
  'Content',
  'Social media',
  'Graphics',
  'Fundraising executive',
  'HR',
  'Creative',
];

const candidateId = (candidate) => candidate?._id || candidate?.id;

const normalizedStatus = (candidate) =>
  String(candidate?.status || 'pending').trim().toLowerCase();

const candidateDomain = (candidate) =>
  candidate?.track || candidate?.role || candidate?.domain || '—';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [domains, setDomains] = useState(INTERNSHIP_DOMAINS);
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
      const rows =
        res.data?.candidates ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);

      setCandidates(rows);

      const returnedDomains = Array.isArray(res.data?.domains)
        ? res.data.domains
        : [];

      setDomains([
        ...new Set([
          ...INTERNSHIP_DOMAINS,
          ...returnedDomains,
          ...rows
            .map(candidateDomain)
            .filter((value) => value && value !== '—'),
        ]),
      ]);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          'Failed to load candidates.',
      );
    } finally {
      setLoading(false);
    }
  }, [search, domainFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(
      fetchCandidates,
      search ? 400 : 0,
    );

    return () => clearTimeout(timer);
  }, [fetchCandidates, search]);

  const emailAlreadyHasDashboardAccess = async (email) => {
    try {
      const response = await api.get('/admin/members');
      const members =
        response.data?.members ||
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);

      return members.some(
        (member) =>
          String(member?.email || '').trim().toLowerCase() ===
          String(email || '').trim().toLowerCase(),
      );
    } catch {
      return false;
    }
  };

  const provisionShortlistedCandidate = async (candidate) => {
    const existingAccount =
      await emailAlreadyHasDashboardAccess(candidate.email);

    if (existingAccount) {
      return {
        existing: true,
        message:
          'This email already has dashboard access, so the existing account was retained.',
      };
    }

    try {
      await api.post('/auth/users/provision', {
        name: candidate.name,
        email: candidate.email,
        role:
          candidate.applicationType === 'volunteer'
            ? 'volunteer'
            : 'intern',
        department:
          candidate.applicationType === 'internship'
            ? candidate.track || ''
            : '',
        team: '',
        permissions: [],
      });

      return {
        existing: false,
        message:
          'Secure dashboard credentials were generated and sent.',
      };
    } catch (error) {
      if (error.response?.status === 409) {
        return {
          existing: true,
          message:
            'This email already has dashboard access, so the existing account was retained.',
        };
      }

      throw error;
    }
  };

  const handleStatusChange = async (candidate, status) => {
    const id = candidateId(candidate);
    setActionLoading(id);

    try {
      let provisioningResult = null;

      if (status === 'shortlisted') {
        provisioningResult =
          await provisionShortlistedCandidate(candidate);
      }

      await api.put(
        `/admin/candidates/${id}/status`,
        {
          status,
          _sourceCollection: candidate._sourceCollection,
        },
      );

      setCandidates((current) =>
        current.map((item) =>
          candidateId(item) === id
            ? { ...item, status }
            : item,
        ),
      );

      if (status === 'shortlisted') {
        toast.success(
          `Candidate shortlisted successfully. ${provisioningResult?.message || ''}`,
          { duration: 5000 },
        );
      } else {
        toast.success('Candidate rejected successfully.');
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          `Failed to ${status} candidate.`,
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (candidate) => {
    const id = candidateId(candidate);

    if (
      !window.confirm(
        `Delete the rejected application from ${candidate.name}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setActionLoading(id);

    try {
      await api.delete(
        `/admin/candidates/${id}`,
        {
          data: {
            _sourceCollection: candidate._sourceCollection,
          },
        },
      );

      setCandidates((current) =>
        current.filter((item) => candidateId(item) !== id),
      );

      toast.success('Rejected candidate deleted permanently.');
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          'Failed to delete the rejected candidate.',
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const normalized = String(status || 'pending').toLowerCase();

    const styles = {
      pending: 'bg-amber-50 text-amber-700',
      shortlisted: 'bg-emerald-50 text-emerald-700',
      rejected: 'bg-red-50 text-red-700',
    };

    return (
      <span
        className={`inline-flex whitespace-nowrap items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          styles[normalized] || 'bg-slate-100 text-slate-600'
        }`}
      >
        {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
      </span>
    );
  };

  const SkeletonRow = () => (
    <tr className="border-b border-slate-50">
      {Array.from({ length: 9 }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">
            Candidate Management
          </h1>
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
            onChange={(event) => setSearch(event.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-72 text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30 transition-colors"
          />
        </div>

        <select
          value={domainFilter}
          onChange={(event) => setDomainFilter(event.target.value)}
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
          onChange={(event) => setStatusFilter(event.target.value)}
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
                {[
                  'Name',
                  'Email',
                  'Phone',
                  'Type',
                  'Domain',
                  'Status',
                  'CV',
                  'Applied On',
                  'Actions',
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonRow key={index} />
                ))
              ) : candidates.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-12 text-slate-400"
                  >
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-medium">
                      No candidates found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting your search or filter criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                candidates.map((candidate) => {
                  const id = candidateId(candidate);
                  const status = normalizedStatus(candidate);

                  let cvLink =
                    candidate.resumeUrl ||
                    candidate.resume ||
                    candidate.cv_link ||
                    candidate.cv ||
                    candidate.documentUrl;

                  if (cvLink?.includes('localhost:5000')) {
                    cvLink = cvLink.replace(
                      'http://localhost:5000',
                      'https://amaanitvam-foundation.onrender.com',
                    );
                  } else if (
                    cvLink &&
                    !cvLink.startsWith('http')
                  ) {
                    cvLink =
                      `https://amaanitvam-foundation.onrender.com${
                        cvLink.startsWith('/') ? '' : '/'
                      }${cvLink}`;
                  }

                  return (
                    <tr
                      key={id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {candidate.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {candidate.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {candidate.phone || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex whitespace-nowrap items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            candidate.applicationType === 'volunteer'
                              ? 'bg-sky-50 text-sky-700'
                              : 'bg-violet-50 text-violet-700'
                          }`}
                        >
                          {candidate.applicationType === 'volunteer'
                            ? 'Volunteer'
                            : 'Internship'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {candidateDomain(candidate)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getStatusBadge(status)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {cvLink ? (
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
                          <span className="text-slate-400 text-xs font-medium">
                            No CV
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {candidate.createdAt
                          ? new Date(candidate.createdAt).toLocaleDateString(
                              'en-IN',
                            )
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          {status === 'pending' && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    candidate,
                                    'shortlisted',
                                  )
                                }
                                disabled={actionLoading === id}
                                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                              >
                                Shortlist
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    candidate,
                                    'rejected',
                                  )
                                }
                                disabled={actionLoading === id}
                                className="bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {status === 'rejected' && (
                            <button
                              onClick={() => handleDelete(candidate)}
                              disabled={actionLoading === id}
                              className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          )}

                          {status === 'shortlisted' && (
                            <span className="text-xs font-medium text-emerald-700">
                              Access processed
                            </span>
                          )}
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
    </div>
  );
}
