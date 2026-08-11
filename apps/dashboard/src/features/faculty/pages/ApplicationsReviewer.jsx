import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  CheckSquare,
  Square,
  Sparkles,
  Users,
  Award,
  BookOpen,
} from 'lucide-react';
import ApplicationDrawer from '../components/ApplicationDrawer';
import { fetchApplications, updateApplicationStatus } from '../services/applicationsApi';
import toast from 'react-hot-toast';

export default function ApplicationsReviewer() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDrawerApp, setActiveDrawerApp] = useState(null);
  const [selectedAppIds, setSelectedAppIds] = useState([]);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await fetchApplications();
      if (res.success && res.applications) {
        setApplications(res.applications);
      }
    } catch (err) {
      toast.error('Failed to load candidate applications.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, status, notes = '') => {
    try {
      const res = await updateApplicationStatus(appId, status, notes);
      if (res.success) {
        toast.success(`Application updated to ${status.toUpperCase()}!`);
        setApplications((prev) =>
          prev.map((a) =>
            (a._id || a.id) === appId ? { ...a, status, notes } : a
          )
        );
        if (activeDrawerApp && (activeDrawerApp._id || activeDrawerApp.id) === appId) {
          setActiveDrawerApp((prev) => (prev ? { ...prev, status, notes } : null));
        }
      }
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAppIds(filteredApps.map((a) => a._id || a.id));
    } else {
      setSelectedAppIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedAppIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchStatus = async (newStatus) => {
    if (selectedAppIds.length === 0) return;
    try {
      await Promise.all(
        selectedAppIds.map((id) => updateApplicationStatus(id, newStatus))
      );
      toast.success(`Batch updated ${selectedAppIds.length} application(s) to ${newStatus.toUpperCase()}`);
      setApplications((prev) =>
        prev.map((a) =>
          selectedAppIds.includes(a._id || a.id) ? { ...a, status: newStatus } : a
        )
      );
      setSelectedAppIds([]);
    } catch (err) {
      toast.error('Batch status update failed.');
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesStatus =
      selectedStatus === 'all' || app.status?.toLowerCase() === selectedStatus.toLowerCase();
    const matchesType =
      selectedType === 'all' || app.type?.toLowerCase() === selectedType.toLowerCase();
    const matchesSearch =
      app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.target?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.institution?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  const counts = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    interviewing: applications.filter((a) => a.status === 'interviewing').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-fade-in text-gray-900">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5d0f2d]/10 text-[#5d0f2d] border border-[#8a164b]/20 text-xs font-bold mb-2">
            <UserCheck className="w-4 h-4 text-[#8a164b]" />
            <span>Academic Admissions & Intern Reviewer</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Applications Review</h2>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Evaluate student course requests, teaching assistant candidacies, and research intern applications.
          </p>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Received</span>
          <h3 className="text-3xl font-black text-[#5d0f2d] mt-2">{counts.total}</h3>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">Across all programs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Pending Review</span>
          <h3 className="text-3xl font-black text-sky-700 mt-2">{counts.pending}</h3>
          <p className="text-[11px] text-sky-600 font-medium mt-0.5">Awaiting action</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Interviewing</span>
          <h3 className="text-3xl font-black text-amber-700 mt-2">{counts.interviewing}</h3>
          <p className="text-[11px] text-amber-600 font-medium mt-0.5">Slots scheduled</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Approved</span>
          <h3 className="text-3xl font-black text-emerald-700 mt-2">{counts.approved}</h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Accepted candidates</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-rose-100 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: `All (${counts.total})` },
            { id: 'pending', label: `Pending (${counts.pending})` },
            { id: 'interviewing', label: `Interviewing (${counts.interviewing})` },
            { id: 'approved', label: `Approved (${counts.approved})` },
            { id: 'rejected', label: `Rejected (${counts.rejected})` },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedStatus(pill.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                selectedStatus === pill.id
                  ? 'bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white shadow-md'
                  : 'bg-gray-100/80 text-gray-600 hover:bg-rose-50'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search & Type Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#8a164b]"
          >
            <option value="all">All Application Types</option>
            <option value="course admission">Course Admission</option>
            <option value="teaching assistant">Teaching Assistant</option>
            <option value="research intern">Research Intern</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidate name, college, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#8a164b] font-medium"
            />
          </div>
        </div>
      </div>

      {/* Batch Actions Toolbar */}
      {selectedAppIds.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-[#5d0f2d] to-[#8a164b] text-white rounded-2xl shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckSquare className="w-4 h-4 text-[#d4af37]" />
            <span>{selectedAppIds.length} candidate(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBatchStatus('approved')}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-sm transition-all"
            >
              Approve Selected
            </button>
            <button
              onClick={() => handleBatchStatus('rejected')}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm transition-all"
            >
              Reject Selected
            </button>
          </div>
        </div>
      )}

      {/* Main Table / Grid Container */}
      <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#8a164b]/20 border-t-[#8a164b] rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-medium">Fetching candidates database...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <UserCheck className="w-12 h-12 mx-auto text-gray-300" />
            <h4 className="font-bold text-gray-800 text-base">No Applications Found</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No candidate submissions match your current search or status filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#5d0f2d]/5 via-[#8a164b]/5 to-transparent border-b border-rose-100 text-[#5d0f2d] font-black uppercase tracking-wider">
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        filteredApps.length > 0 &&
                        selectedAppIds.length === filteredApps.length
                      }
                      className="rounded border-gray-300 text-[#8a164b] focus:ring-[#8a164b]"
                    />
                  </th>
                  <th className="p-4">Applicant</th>
                  <th className="p-4">Program / Role</th>
                  <th className="p-4">Institution & GPA</th>
                  <th className="p-4">Applied Date</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {filteredApps.map((app) => {
                  const appId = app._id || app.id;
                  const isSelected = selectedAppIds.includes(appId);
                  return (
                    <tr
                      key={appId}
                      className={`hover:bg-rose-50/40 transition-colors ${
                        isSelected ? 'bg-rose-50/60' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(appId)}
                          className="rounded border-gray-300 text-[#8a164b] focus:ring-[#8a164b]"
                        />
                      </td>

                      {/* Candidate Column */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5d0f2d] to-[#8a164b] text-white flex items-center justify-center font-black text-xs shadow-sm">
                            {app.name?.[0] || 'A'}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-gray-900 text-xs">{app.name}</h4>
                            <p className="text-[11px] text-gray-500 font-medium">{app.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Target Program Column */}
                      <td className="p-4">
                        <div>
                          <span className="text-[10px] font-extrabold text-[#8a164b] px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
                            {app.type}
                          </span>
                          <p className="font-bold text-gray-800 text-xs mt-1">{app.target}</p>
                        </div>
                      </td>

                      {/* Institution Column */}
                      <td className="p-4">
                        <p className="font-bold text-gray-800">{app.institution || 'N/A'}</p>
                        <p className="text-[11px] text-gray-500">{app.qualification} ({app.gpa})</p>
                      </td>

                      {/* Applied Date */}
                      <td className="p-4 text-gray-600 font-medium">
                        {app.appliedDate}
                      </td>

                      {/* Status Badge */}
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                            app.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : app.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : app.status === 'interviewing'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      {/* Action Controls */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveDrawerApp(app)}
                            className="p-2 rounded-xl bg-gray-100 hover:bg-[#5d0f2d] hover:text-white text-gray-700 font-bold transition-all"
                            title="Inspect Application Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(appId, 'approved')}
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 transition-all border border-emerald-200"
                            title="Approve Candidate"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(appId, 'rejected')}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 transition-all border border-rose-200"
                            title="Reject Candidate"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over evaluation drawer */}
      <ApplicationDrawer
        application={activeDrawerApp}
        isOpen={!!activeDrawerApp}
        onClose={() => setActiveDrawerApp(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
