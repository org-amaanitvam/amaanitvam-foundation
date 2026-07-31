import { useState, useEffect, useMemo } from 'react';
import { FolderKanban, Loader2, Plus, Edit2, Trash2, CheckSquare, Square, Target } from 'lucide-react';
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { canAccessPermission } from "../../utils/accessControl";
import toast from 'react-hot-toast';
import FilterBar from "../../components/Filters/FilterBar";

const initialFormData = { 
  title: '', 
  description: '', 
  progress: 0, 
  startDate: '', 
  endDate: '', 
  assignedMembers: [], 
  department: '',
  milestones: [] 
};

export default function ProjectsPage() {
  const { userProfile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  
  const [newMilestone, setNewMilestone] = useState({ title: '', dueDate: '' }); 

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");

  const canManageProjects = canAccessPermission(
    userProfile,
    "projects.manage",
  );

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
    { name: "startDate", label: "Start Date Range", type: "dateRange" },
    { name: "endDate", label: "End Date Range", type: "dateRange" },
    { name: "progress", label: "Progress (%)", type: "numberRange" },
  ];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/projects");
      setProjects(data.projects || data.data || []);
    } catch (error) {
      console.error("Projects load failed:", error);
      toast.error(
        error.response?.data?.message ||
          `Failed to load projects${error.response?.status ? ` (HTTP ${error.response.status})` : ""}`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectOptions = async () => {
    if (!canManageProjects) {
      setUsers([]);
      setDepartments([]);
      return;
    }

    const [membersResult, departmentsResult] = await Promise.allSettled([
      api.get("/admin/members"),
      api.get("/departments"),
    ]);

    if (membersResult.status === "fulfilled") {
      setUsers(membersResult.value.data.members || membersResult.value.data.data || []);
    } else {
      setUsers([]);
      console.error("Project member options failed:", membersResult.reason);
    }

    if (departmentsResult.status === "fulfilled") {
      setDepartments(departmentsResult.value.data.departments || departmentsResult.value.data.data || []);
    } else {
      setDepartments([]);
      console.error("Project department options failed:", departmentsResult.reason);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchProjectOptions();
  }, [canManageProjects]);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const submissionData = {
        ...formData,
        milestones: (formData.milestones || []).map(m => ({
          title: m.title,
          due_date: m.dueDate || m.due_date, 
          completed: m.completed || false
        }))
      };

      if (editingId) {
        await api.put(`/projects/${editingId}`, submissionData);
        toast.success('Project updated');
      } else {
        await api.post("/projects", submissionData);
        toast.success('Project created');
      }
      setShowCreate(false);
      setEditingId(null);
      setFormData(initialFormData);
      setNewMilestone({ title: '', dueDate: '' });
      fetchProjects();
    } catch (error) {
      console.error('Project save failed:', error);
      toast.error(
        error.response?.data?.message ||
          (editingId ? 'Failed to update project' : 'Failed to create project')
      );
    }
  };

  const openEdit = (p) => {
    setFormData({
      title: p.title || p.name,
      description: p.description || '',
      progress: p.progress || 0,
      startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '',
      endDate: p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : '',
      assignedMembers: p.assignedMembers?.map(m => m._id) || [],
      department: p.department?._id || p.department || '',
      milestones: p.milestones || []
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

  const handleAddMilestone = () => {
    if (!newMilestone.title.trim()) return;
    setFormData(prev => ({
      ...prev,
      milestones: [...(prev.milestones || []), { ...newMilestone, completed: false }]
    }));
    setNewMilestone({ title: '', dueDate: '' });
  };

  const handleRemoveMilestone = (index) => {
    setFormData(prev => {
      const updated = [...prev.milestones];
      updated.splice(index, 1);
      return { ...prev, milestones: updated };
    });
  };

  const toggleMilestoneStatus = (index) => {
    setFormData(prev => {
      const updated = [...prev.milestones];
      updated[index].completed = !updated[index].completed;
      return { ...prev, milestones: updated };
    });
  };

  const filtered = useMemo(() => projects.filter((p) => {
    let match = true;
    if (search && !(p.title || p.name || "").toLowerCase().includes(search.toLowerCase())) match = false;
    if (filters.status && filters.status !== "all" && p.status !== filters.status) match = false;
    if (filters.startDate?.start && p.startDate && new Date(p.startDate) < new Date(filters.startDate.start)) match = false;
    
    if (filters.startDate?.end && p.startDate) {
      const end = new Date(filters.startDate.end);
      end.setHours(23, 59, 59, 999);
      if (new Date(p.startDate) > end) match = false;
    }
    if (filters.endDate?.start && p.endDate && new Date(p.endDate) < new Date(filters.endDate.start)) match = false;
    if (filters.endDate?.end && p.endDate) {
      const end = new Date(filters.endDate.end);
      end.setHours(23, 59, 59, 999);
      if (new Date(p.endDate) > end) match = false;
    }
    if (filters.progress?.min !== undefined && filters.progress.min !== "" && (p.progress || 0) < Number(filters.progress.min)) match = false;
    if (filters.progress?.max !== undefined && filters.progress.max !== "" && (p.progress || 0) > Number(filters.progress.max)) match = false;
    return match;
  }), [projects, filters, search]);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 text-[#56051a] animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border p-5">
          <p className="text-sm text-slate-500">Total Projects</p>
          <h2 className="text-3xl font-bold mt-2">{projects.length}</h2>
        </div>
        <div className="bg-white rounded-2xl border p-5">
          <p className="text-sm text-slate-500">Completed</p>
          <h2 className="text-3xl font-bold text-green-600 mt-2">{projects.filter(p=>p.status==="completed").length}</h2>
        </div>
        <div className="bg-white rounded-2xl border p-5">
          <p className="text-sm text-slate-500">Ongoing</p>
          <h2 className="text-3xl font-bold text-blue-600 mt-2">{projects.filter(p=>p.status==="ongoing").length}</h2>
        </div>
        <div className="bg-white rounded-2xl border p-5">
          <p className="text-sm text-slate-500">Pending</p>
          <h2 className="text-3xl font-bold text-amber-600 mt-2">{projects.filter(p=>p.status==="pending_approval").length}</h2>
        </div>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">Track project progress</p>
        </div>
        {canManageProjects && (
          <button onClick={() => { setEditingId(null); setFormData(initialFormData); setShowCreate(true); }} className="px-4 py-2 bg-[#56051a] text-white rounded-xl font-medium text-sm hover:bg-[#7a1e3a] transition-colors flex items-center gap-2">
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <h2 className="text-xl font-bold text-slate-900 mb-6">{editingId ? 'Edit Project' : 'Create Project'}</h2>
            <form onSubmit={handleCreateOrUpdate} className="space-y-5">
              {canManageProjects ? (
                <div><label className="block text-sm font-medium mb-1">Title</label><input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>
              ) : (
                <div className="mb-2"><h3 className="font-semibold text-slate-800">{formData.title}</h3></div>
              )}

              <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" rows="3"></textarea></div>
              <div><label className="block text-sm font-medium mb-1">Progress (%)</label><input type="number" min="0" max="100" required value={formData.progress} onChange={e => setFormData({...formData, progress: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>

              {canManageProjects && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Department (Domain)</label>
                    <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm">
                      <option value="">No Department</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.departmentName}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1">Start Date</label><input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>
                    <div><label className="block text-sm font-medium mb-1">End Date</label><input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Target className="w-4 h-4"/> Project Milestones</label>
                    
                    <div className="space-y-2 mb-4">
                      {formData.milestones?.map((m, i) => (
                        <div key={i} className="flex items-center justify-between bg-white p-2.5 rounded-lg border shadow-sm">
                          <div className="flex items-center gap-3">
                            <button type="button" onClick={() => toggleMilestoneStatus(i)} className="text-slate-400 hover:text-[#56051a] transition-colors">
                              {m.completed ? <CheckSquare className="w-5 h-5 text-green-600"/> : <Square className="w-5 h-5"/>}
                            </button>
                            <span className={`text-sm font-medium ${m.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{m.title}</span>
                            {m.dueDate && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{new Date(m.dueDate).toLocaleDateString()}</span>}
                          </div>
                          <button type="button" onClick={() => handleRemoveMilestone(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                      ))}
                      {(!formData.milestones || formData.milestones.length === 0) && <p className="text-xs text-slate-500 italic">No milestones added yet.</p>}
                    </div>

                    <div className="flex gap-2">
                      <input 
                        placeholder="New Milestone Title..." 
                        value={newMilestone.title} 
                        onChange={e => setNewMilestone({...newMilestone, title: e.target.value})} 
                        className="flex-1 px-3 py-2 border rounded-lg text-sm" 
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMilestone())}
                      />
                      <input 
                        type="date" 
                        value={newMilestone.dueDate} 
                        onChange={e => setNewMilestone({...newMilestone, dueDate: e.target.value})} 
                        className="w-36 px-3 py-2 border rounded-lg text-sm text-slate-600" 
                      />
                      <button type="button" onClick={handleAddMilestone} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors">Add</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Assign Members (Private Project)</label>
                    <div className="max-h-40 overflow-y-auto border rounded-xl p-2 space-y-1">
                      {users.map(u => (
                        <label key={u._id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                          <input type="checkbox" checked={formData.assignedMembers?.includes(u._id)} onChange={() => toggleMember(u._id)} className="rounded text-[#56051a] focus:ring-[#56051a]"/>
                          <span className="text-sm">{u.name} <span className="text-xs text-slate-400">({u.role})</span></span>
                        </label>
                      ))}
                      {users.length === 0 && <p className="text-xs text-slate-500 text-center">No members found</p>}
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#56051a] rounded-xl hover:bg-[#7a1e3a]">{editingId ? 'Save Changes' : 'Create Project'}</button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(p => (
            <div key={p._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col justify-between">
              <button onClick={() => openEdit(p)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-[#56051a] hover:text-white transition-all duration-300 shadow-sm border border-slate-100">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <div className="mb-3 pr-10">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex flex-wrap items-center gap-2">
                    {p.title || p.name}
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${p.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : p.status === "ongoing" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}`}>
                      {p.status === "completed" ? "Completed" : p.status === "ongoing" ? "Ongoing" : "Pending"}
                    </span>
                  </h3>
                  {p.department?.departmentName && (
                    <span className="inline-flex items-center px-2.5 py-0.5 mt-2 rounded-md bg-[#56051a]/5 text-[#56051a] text-[11px] font-bold border border-[#56051a]/10">
                      {p.department.departmentName}
                    </span>
                  )}
                </div>
              </div>

              {(p.startDate || p.endDate) && (
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100 inline-block w-fit">
                  {p.startDate && <span>{new Date(p.startDate).toLocaleDateString()}</span>}
                  {p.startDate && p.endDate && <span className="text-slate-300">→</span>}
                  {p.endDate && <span>{new Date(p.endDate).toLocaleDateString()}</span>}
                </div>
              )}

              <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">{p.description || 'No description provided.'}</p>
              
              {p.milestones && p.milestones.length > 0 && (
                <div className="mb-5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Target className="w-3 h-3"/> Key Milestones</p>
                  <div className="space-y-1.5">
                    {p.milestones.slice(0, 3).map((m, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${m.completed ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.4)]' : 'border-2 border-slate-300'}`}></span>
                        <span className={`truncate font-medium ${m.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{m.title}</span>
                      </div>
                    ))}
                    {p.milestones.length > 3 && <p className="text-[10px] text-slate-500 font-medium pl-4 pt-1">+{p.milestones.length - 3} more goals</p>}
                  </div>
                </div>
              )}

              <div className="space-y-3 mt-auto pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                  <span>Progress Overview</span>
                  <span className="text-[#56051a]">{p.progress || 0}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#56051a] via-[#8b1238] to-[#d8a15f] transition-all duration-700 relative" style={{width:`${p.progress || 0}%`}}>
                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {p.status === 'pending_approval' && canManageProjects && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button onClick={async () => {
                    try {
                      await api.put(`/projects/${p._id}`, { status: 'completed', progress: 100 });
                      fetchProjects();
                    } catch { toast.error('Error approving project'); }
                  }} className="px-4 py-2 flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors text-center">
                    Approve
                  </button>
                  <button onClick={async () => {
                    try {
                      await api.put(`/projects/${p._id}`, { status: 'ongoing', progress: 90 });
                      fetchProjects();
                    } catch { toast.error('Error rejecting project'); }
                  }} className="px-4 py-2 flex-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors text-center">
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