import { useState, useEffect, useMemo } from 'react';
import { FolderKanban, Loader2, Plus, Edit2 } from 'lucide-react';
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from 'react-hot-toast';
import FilterBar from "../../components/Filters/FilterBar";

export default function ProjectsPage() {
  const { userProfile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', progress: 0, startDate: '', endDate: '', assignedMembers: [], department: '' });
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
  const filterConfig = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "All Statuses", value: "all" },
      { label: "Ongoing", value: "ongoing" },
      { label: "Completed", value: "completed" },
      { label: "Pending Approval", value: "pending_approval" },
    ],
  },
  {
    name: "startDate",
    label: "Start Date Range",
    type: "dateRange",
  },
  {
    name: "endDate",
    label: "End Date Range",
    type: "dateRange",
  },
  {
    name: "progress",
    label: "Progress (%)",
    type: "numberRange",
  },
];

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.projects || []);
      if (isAdmin) {
        const res = await api.get('/admin/members');
        setUsers(res.data.members || []);
        const deptRes = await api.get('/departments');
        setDepartments(deptRes.data.departments || []);
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, formData);
        toast.success('Project updated');
      } else {
        await api.post('/projects/create', formData);
        toast.success('Project created');
      }
      setShowCreate(false);
      setEditingId(null);
      setFormData({ title: '', description: '', progress: 0, assignedMembers: [], startDate: '', endDate: '', department: '' });
      fetchProjects();
    } catch { toast.error(editingId ? 'Failed to update project' : 'Failed to create project'); }
  };

  const openEdit = (p) => {
    setFormData({
      title: p.title || p.name,
      description: p.description || '',
      progress: p.progress || 0,
      startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '',
      endDate: p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : '',
      assignedMembers: p.assignedMembers?.map(m => m._id) || [],
      department: p.department?._id || p.department || ''
    });
    setEditingId(p._id);
    setShowCreate(true);
  };

  const toggleMember = (userId) => {
    setFormData(prev => ({
      ...prev,
      assignedMembers: prev.assignedMembers.includes(userId)
        ? prev.assignedMembers.filter(id => id !== userId)
        : [...(prev.assignedMembers || []), userId]
    }));
  };

  const filtered = useMemo(() => projects.filter((p) => {
    let match = true;

    // Search
    if (
      search &&
      !(p.title || p.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    ) {
      match = false;
    }

    // Status
    if (
      filters.status &&
      filters.status !== "all" &&
      p.status !== filters.status
    ) {
      match = false;
    }

    // Start Date
    if (filters.startDate?.start && p.startDate) {
      if (new Date(p.startDate) < new Date(filters.startDate.start))
        match = false;
    }

    if (filters.startDate?.end && p.startDate) {
      const end = new Date(filters.startDate.end);
      end.setHours(23, 59, 59, 999);

      if (new Date(p.startDate) > end)
        match = false;
    }

    // End Date
    if (filters.endDate?.start && p.endDate) {
      if (new Date(p.endDate) < new Date(filters.endDate.start))
        match = false;
    }

    if (filters.endDate?.end && p.endDate) {
      const end = new Date(filters.endDate.end);
      end.setHours(23, 59, 59, 999);

      if (new Date(p.endDate) > end)
        match = false;
    }

    // Progress
    if (
      filters.progress?.min !== undefined &&
      filters.progress.min !== ""
    ) {
      if ((p.progress || 0) < Number(filters.progress.min))
        match = false;
    }

    if (
      filters.progress?.max !== undefined &&
      filters.progress.max !== ""
    ) {
      if ((p.progress || 0) > Number(filters.progress.max))
        match = false;
    }

    return match;
  }), [projects, filters, search]);

if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 text-[#56051a] animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

  <div className="bg-white rounded-2xl border p-5">
    <p className="text-sm text-slate-500">Total Projects</p>
    <h2 className="text-3xl font-bold mt-2">
      {projects.length}
    </h2>
  </div>

  <div className="bg-white rounded-2xl border p-5">
    <p className="text-sm text-slate-500">Completed</p>
    <h2 className="text-3xl font-bold text-green-600 mt-2">
      {projects.filter(p=>p.status==="completed").length}
    </h2>
  </div>

  <div className="bg-white rounded-2xl border p-5">
    <p className="text-sm text-slate-500">Ongoing</p>
    <h2 className="text-3xl font-bold text-blue-600 mt-2">
      {projects.filter(p=>p.status==="ongoing").length}
    </h2>
  </div>

  <div className="bg-white rounded-2xl border p-5">
    <p className="text-sm text-slate-500">Pending</p>
    <h2 className="text-3xl font-bold text-amber-600 mt-2">
      {projects.filter(p=>p.status==="pending_approval").length}
    </h2>
  </div>

</div>
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">Track project progress</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditingId(null); setFormData({ title: '', description: '', progress: 0, assignedMembers: [], startDate: '', endDate: '', department: '' }); setShowCreate(true); }} className="px-4 py-2 bg-[#56051a] text-white rounded-xl font-medium text-sm hover:bg-[#7a1e3a] transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

<div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-8">
  <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="🔍 Search projects..."
    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#56051a] outline-none"
  />
</div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
            <h2 className="text-lg font-bold text-slate-900 mb-4">{editingId ? 'Edit Project' : 'Create Project'}</h2>
            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              {isAdmin ? (
                <div><label className="block text-sm font-medium mb-1">Title</label><input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>
              ) : (
                <div className="mb-2"><h3 className="font-semibold text-slate-800">{formData.title}</h3></div>
              )}

              <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" rows="3"></textarea></div>
              <div><label className="block text-sm font-medium mb-1">Progress (%)</label><input type="number" min="0" max="100" required value={formData.progress} onChange={e => setFormData({...formData, progress: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>

              {isAdmin && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Department (Domain)</label>
                    <select
                      value={formData.department}
                      onChange={e => setFormData({...formData, department: e.target.value})}
                      className="w-full px-3 py-2 border rounded-xl text-sm"
                    >
                      <option value="">No Department</option>
                      {departments.map(d => (
                        <option key={d._id} value={d._id}>{d.departmentName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1">Start Date</label><input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>
                    <div><label className="block text-sm font-medium mb-1">End Date</label><input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Assign Members (Private Project)</label>
                    <div className="max-h-40 overflow-y-auto border rounded-xl p-2 space-y-1">
                      {users.map(u => (
                        <label key={u._id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.assignedMembers?.includes(u._id)}
                            onChange={() => toggleMember(u._id)}
                            className="rounded text-[#56051a] focus:ring-[#56051a]"
                          />
                          <span className="text-sm">{u.name} <span className="text-xs text-slate-400">({u.role})</span></span>
                        </label>
                      ))}
                      {users.length === 0 && <p className="text-xs text-slate-500 text-center">No members found</p>}
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#56051a] rounded-xl hover:bg-[#7a1e3a]">{editingId ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <FilterBar config={filterConfig} filters={filters} setFilters={setFilters} />

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FolderKanban className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400">No projects match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => (
            <div key={p._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col justify-between">
              <button onClick={() => openEdit(p)} className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-[#56051a] hover:text-white transition-all duration-300">
                <Edit2 className="w-4 h-4" />
              </button>
              <div className="mb-3 pr-10">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    {p.title || p.name}
                    <span
  className={`px-3 py-1 text-[11px] font-semibold rounded-full ${
    p.status === "completed"
      ? "bg-green-100 text-green-700"
      : p.status === "ongoing"
      ? "bg-blue-100 text-blue-700"
      : "bg-purple-100 text-purple-700"
  }`}
>
  {p.status === "completed"
    ? "Completed"
    : p.status === "ongoing"
    ? "Ongoing"
    : "Pending Approval"}
</span>
                  </h3>
                  {p.department?.departmentName && (
                    <span className="inline-flex items-center px-3 py-1 mt-2 rounded-full bg-[#56051a]/10 text-[#56051a] text-xs font-semibold">
  {p.department.departmentName}
</span>
                  )}
                </div>
              </div>

              {(p.startDate || p.endDate) && (
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-4">
                  {p.startDate && <span>Starts: {new Date(p.startDate).toLocaleDateString()}</span>}
                  {p.startDate && p.endDate && <span>•</span>}
                  {p.endDate && <span>Ends: {new Date(p.endDate).toLocaleDateString()}</span>}
                </div>
              )}

              <p className="text-sm text-slate-600 leading-6 mt-4 mb-5 line-clamp-3">{p.description || 'No description'}</p>
<div className="space-y-3 mt-auto">
<div className="flex justify-between items-center text-sm font-semibold text-slate-700">
<span>Progress</span>
<span>{p.progress || 0}%</span>
</div>

<div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden shadow-inner">

<div
className="h-4 rounded-full bg-linear-to-r from-[#56051a] via-[#8b1238] to-[#d8a15f] transition-all duration-700"
style={{width:`${p.progress || 0}%`}}
/>

</div>
</div>

              {p.status === 'pending_approval' && isAdmin && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button onClick={async () => {
                    try {
                      await api.put(`/projects/${p._id}`, { status: 'completed', progress: 100 });
                      fetchProjects();
                    } catch { toast.error('Error approving project'); }
                  }} className="px-4 py-2 flex-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-100 text-center">
                    Approve
                  </button>
                  <button onClick={async () => {
                    try {
                      await api.put(`/projects/${p._id}`, { status: 'ongoing', progress: 90 });
                      fetchProjects();
                    } catch { toast.error('Error rejecting project'); }
                  }} className="px-4 py-2 flex-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 text-center">
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
