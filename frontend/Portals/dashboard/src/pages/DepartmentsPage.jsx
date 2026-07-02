import { useEffect, useMemo, useState } from 'react';
import { Building2, Plus, Pencil, Trash2, Save, Eye, TrendingUp, FileText, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';

export default function DepartmentsPage() {
  const { userProfile } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ departmentName: '', description: '', departmentHead: '', domain: '' });
  const [performanceDrafts, setPerformanceDrafts] = useState({});
  const [reportLoadingId, setReportLoadingId] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [memberUsers, setMemberUsers] = useState([]);
  const [domainOptions, setDomainOptions] = useState([]);

  const role = userProfile?.role;
  const isAdmin = role === 'admin' || role === 'super_admin';
  const currentUserId = userProfile?._id || userProfile?.id || userProfile?.uid;

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/departments');
      setDepartments(data.departments || []);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const { data } = await api.get('/admin/members');
      const members = (data.members || []).filter((user) => user.status !== 'inactive');
      setMemberUsers(members);
    } catch (error) {
      setMemberUsers([]);
    }
  };

  const loadDomains = async () => {
    try {
      const { data } = await api.get('/admin/candidates', { params: { limit: 100 } });
      const candidateList = data.candidates || [];
      const domainList = data.domains || [
        ...new Set(candidateList.map((candidate) => candidate.track).filter(Boolean)),
      ];
      setDomainOptions(domainList.filter(Boolean));
    } catch (error) {
      setDomainOptions([
        'Creative',
        'Graphics',
        'Social media',
        'Marketing',
        'Frontend',
        'Backend',
        'Full stack',
        'HR',
        'Project Manager',
        'Content',
      ]);
    }
  };

  useEffect(() => {
    loadDepartments();
    loadMembers();
    loadDomains();
  }, []);

  const resetForm = () => {
    setForm({ departmentName: '', description: '', departmentHead: '', domain: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (department) => {
    setEditingId(department._id);
    const matchedDomain = domainOptions.includes(department.departmentName) ? department.departmentName : '';
    setForm({
      departmentName: department.departmentName || '',
      description: department.description || '',
      departmentHead: department.departmentHead?._id || department.departmentHead || '',
      domain: matchedDomain,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedDepartmentName = (form.departmentName || form.domain).trim();
    if (!selectedDepartmentName) {
      toast.error('Department name is required');
      return;
    }

    try {
      const payload = {
        departmentName: selectedDepartmentName,
        description: form.description.trim(),
      };

      if (form.departmentHead.trim()) {
        payload.departmentHead = form.departmentHead.trim();
      }

      if (editingId) {
        await api.put(`/departments/${editingId}`, payload);
        toast.success('Department updated');
      } else {
        await api.post('/departments/create', payload);
        toast.success('Department created');
      }

      resetForm();
      await Promise.all([loadDepartments(), loadDomains()]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save department');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success('Department deleted');
      setActiveReport(null);
      await Promise.all([loadDepartments(), loadDomains()]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete department');
    }
  };

  const handlePerformanceUpdate = async (departmentId) => {
    const value = Number(performanceDrafts[departmentId]);
    if (Number.isNaN(value) || value < 0 || value > 100) {
      toast.error('Performance must be between 0 and 100');
      return;
    }

    try {
      await api.put(`/departments/${departmentId}/performance`, { performance: value });
      toast.success('Performance updated');
      loadDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update performance');
    }
  };

  const handleViewReport = async (departmentId) => {
    setReportLoadingId(departmentId);
    try {
      const { data } = await api.get(`/departments/${departmentId}/report`);
      setActiveReport(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load department report');
    } finally {
      setReportLoadingId(null);
    }
  };

  const canManageDepartment = (department) => {
    if (isAdmin) return true;
    return department.departmentHead?._id?.toString() === currentUserId?.toString();
  };

  const getHeadLabel = (department) => {
    const head = department.departmentHead || department.head;
    if (!head) return 'Unassigned';
    if (typeof head === 'string') return head;
    if (typeof head === 'object' && head !== null) {
      if (head.name || head.email) {
        return head.name || head.email;
      }
      if (head._id) {
        return head._id.toString();
      }
      if (head.toString) {
        return head.toString();
      }
    }
    return 'Unassigned';
  };

  const roleLabel = useMemo(() => {
    if (isAdmin) return 'Admin access';
    if (role === 'department_head') return 'Department head access';
    return 'Member access';
  }, [isAdmin, role]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Departments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage departments, inspect reports, and update performance using the connected API endpoints.
          </p>
          <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {roleLabel}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-[#56051a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7a0622]"
          >
            <Plus className="h-4 w-4" />
            Create Department
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">{editingId ? 'Edit Department' : 'Create Department'}</h2>
            <button onClick={resetForm} className="text-sm text-slate-500 hover:text-slate-700">
              Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-600">Domain</label>
              <select
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value, departmentName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#56051a]"
              >
                <option value="">Choose a domain from candidates</option>
                {domainOptions.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500">These values are pulled from the candidate domain list so departments stay consistent.</p>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-600">Custom Department Name (optional)</label>
              <input
                value={form.departmentName}
                onChange={(e) => setForm({ ...form, departmentName: e.target.value, domain: '' })}
                placeholder="Type a custom department name if needed"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#56051a]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-600">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows="3"
                placeholder="Add a short description"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#56051a]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-600">Department Head</label>
              <select
                value={form.departmentHead}
                onChange={(e) => setForm({ ...form, departmentHead: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#56051a]"
              >
                <option value="">No head assigned</option>
                {memberUsers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name || user.email} {user.email ? `(${user.email})` : ''}
                  </option>
                ))}
              </select>
              {memberUsers.length === 0 && (
                <p className="mt-2 text-xs text-slate-500">No member users were loaded yet. Add member accounts first to make them selectable.</p>
              )}
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button className="inline-flex items-center gap-2 rounded-lg bg-[#56051a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7a0622]">
                <Save className="h-4 w-4" />
                {editingId ? 'Save Changes' : 'Create Department'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading departments...</div>
      ) : departments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          No departments found yet.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="grid gap-4">
            {departments.map((department) => {
              const canManage = canManageDepartment(department);
              return (
                <div key={department._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-[#56051a]/10 p-2.5 text-[#56051a]">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">{department.departmentName}</h3>
                        <p className="mt-1 text-sm text-slate-500">{department.description || 'No description provided.'}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      {department.totalMembers || 0} members
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <div>
                      <p className="font-medium text-slate-500">Head</p>
                      <p className="mt-1 text-slate-700">{getHeadLabel(department)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-500">Performance</p>
                      <p className="mt-1 text-slate-700">{department.performance ?? 0}%</p>
                    </div>
                  </div>

                  {(canManage || isAdmin) && (
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => openEdit(department)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(department._id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleViewReport(department._id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <FileText className="h-4 w-4" />
                        {reportLoadingId === department._id ? 'Loading...' : 'View Report'}
                      </button>

                      {(canManage || isAdmin) && (
                        <div className="ml-auto flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-2">
                          <TrendingUp className="h-4 w-4 text-[#56051a]" />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={performanceDrafts[department._id] ?? department.performance ?? 0}
                            onChange={(e) => setPerformanceDrafts((prev) => ({ ...prev, [department._id]: e.target.value }))}
                            className="w-20 rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:border-[#56051a]"
                          />
                          <button
                            onClick={() => handlePerformanceUpdate(department._id)}
                            className="inline-flex items-center gap-1 rounded bg-[#56051a] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#7a0622]"
                          >
                            <Save className="h-4 w-4" />
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {!canManage && !isAdmin && (
                    <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                      <Eye className="h-4 w-4" />
                      View-only access for your current role.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Department Report</h2>
                <p className="text-sm text-slate-500">Detailed information from the report API.</p>
              </div>
              <button
                onClick={loadDepartments}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {!activeReport ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                Select a department to view its report.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Name</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">{activeReport.departmentName}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">Performance</p>
                    <p className="mt-1 text-lg font-semibold text-slate-800">{activeReport.performance ?? 0}%</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">Members</p>
                    <p className="mt-1 text-lg font-semibold text-slate-800">{activeReport.totalMembers ?? 0}</p>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Head</p>
                  <p className="mt-1 text-slate-700">{getHeadLabel(activeReport)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Description</p>
                  <p className="mt-1 text-slate-700">{activeReport.description || 'No description available.'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Members List</p>
                  <ul className="mt-2 space-y-2 text-sm text-slate-700">
                    {(activeReport.members || []).length === 0 ? (
                      <li>No members assigned.</li>
                    ) : (
                      activeReport.members.map((member) => (
                        <li key={member._id || member.user?._id} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                          {member.user?.name || member.user?.email || member.user || 'Member'}
                          <span className="ml-2 text-xs uppercase tracking-wide text-slate-500">{member.role || 'member'}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
