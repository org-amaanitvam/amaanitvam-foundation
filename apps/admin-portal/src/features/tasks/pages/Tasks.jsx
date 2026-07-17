import { useState, useEffect } from 'react';
import { ClipboardList, Loader2, Plus, Edit2 } from 'lucide-react';
import api from '../../../config/api.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function Tasks() {
  const { userProfile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', assignedTo: '', deadline: '', status: 'open' });
  const [users, setUsers] = useState([]);
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data.tasks || []);
      if (isAdmin) {
        const res = await api.get('/admin/members');
        setUsers(res.data.members || []);
      }
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/tasks/${editingId}`, formData);
        toast.success('Task updated');
      } else {
        await api.post('/tasks/create', formData);
        toast.success('Task created');
      }
      setShowCreate(false);
      setEditingId(null);
      setFormData({ title: '', description: '', assignedTo: '', deadline: '', status: 'open' });
      fetchTasks();
    } catch { toast.error(editingId ? 'Failed to update task' : 'Failed to create task'); }
  };

    const openEdit = (task) => {
    setFormData({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo?._id || task.assignedTo || '',
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
      status: task.status,
      progress: task.progress || 0,
      newComment: ''
    });
    setEditingId(task._id);
    setShowCreate(true);
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 text-[#56051a] animate-spin" /></div>;

  const myTasks = isAdmin ? tasks : tasks.filter(t => t.assignedTo?._id === userProfile?._id || t.assignedTo?.email === userProfile?.email);
  const filtered = filter === 'all' ? myTasks : myTasks.filter(t => t.status === filter);

  const statusColors = {
    open: 'bg-amber-100 text-amber-700 border-amber-200',
    inProgress: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending_approval: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isAdmin ? 'All Tasks' : 'My Tasks'}</h1>
          <p className="text-sm text-slate-500 mt-1">Track tasks and deadlines</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditingId(null); setFormData({ title: '', description: '', assignedTo: '', deadline: '', status: 'open', progress: 0, newComment: '' }); setShowCreate(true); }} className="px-4 py-2 bg-[#56051a] text-white rounded-xl font-medium text-sm hover:bg-[#7a1e3a] transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Task
          </button>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
            <h2 className="text-lg font-bold text-slate-900 mb-4">{editingId ? (isAdmin ? 'Edit Task' : 'Update Task Progress') : 'Create New Task'}</h2>
            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              {isAdmin && (
                <>
                  <div><label className="block text-sm font-medium mb-1">Title</label><input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>
                  <div><label className="block text-sm font-medium mb-1">Assign To</label>
                    <select required value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm">
                      <option value="">Select Member</option>
                      {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium mb-1">Deadline</label><input type="date" required value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>
                  <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" rows="3"></textarea></div>
                </>
              )}
              {!isAdmin && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                  <h3 className="font-semibold text-slate-800">{formData.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{formData.description}</p>
                </div>
              )}
              
              {editingId && (
                <>
                  <div><label className="block text-sm font-medium mb-1">Status</label>
                    <select required value={formData.status} onChange={e => {
                      const newStatus = e.target.value;
                      setFormData({
                        ...formData, 
                        status: newStatus,
                        progress: newStatus === 'completed' ? 100 : formData.progress
                      });
                    }} className="w-full px-3 py-2 border rounded-xl text-sm">
                      <option value="open">Open</option>
                      <option value="inProgress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 flex justify-between">
                      <span>Progress</span>
                      <span className="text-[#56051a] font-bold">{formData.progress || 0}%</span>
                    </label>
                    <input type="range" min="0" max="100" value={formData.progress || 0} onChange={e => setFormData({...formData, progress: e.target.value})} className="w-full accent-[#56051a]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Add Update Comment</label>
                    <input type="text" placeholder="e.g. Task has been started" value={formData.newComment || ''} onChange={e => setFormData({...formData, newComment: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#56051a] rounded-xl hover:bg-[#7a1e3a]">{editingId ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {['all', 'open', 'inProgress', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
              filter === f ? 'bg-[#56051a] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}>
            {f === 'inProgress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400">No tasks found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(t => (
            <div key={t._id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border ${statusColors[t.status] || 'bg-slate-100 text-slate-600'}`}>
                {t.status === 'inProgress' ? 'In Progress' : (t.status === 'pending_approval' ? 'Pending Approval' : t.status)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800 truncate">{t.title}</h3>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{t.progress || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 mb-1 max-w-[200px]">
                  <div className="bg-[#56051a] h-1.5 rounded-full" style={{ width: `${t.progress || 0}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assigned to: {t.assignedTo?.name || 'Unassigned'}
                  {t.deadline && ` • Due: ${new Date(t.deadline).toLocaleDateString()}`}
                </p>
                {t.comments && t.comments.length > 0 && (
                  <p className="text-xs text-slate-400 mt-1 italic line-clamp-1">
                    Latest: {t.comments[t.comments.length - 1].text}
                  </p>
                )}
              </div>
              
              {t.status === 'pending_approval' && isAdmin && (
                <div className="flex items-center gap-2 mr-2 border-r pr-4 border-slate-200">
                  <button onClick={async () => {
                    try {
                      await api.put(`/tasks/${t._id}`, { status: 'completed', progress: 100 });
                      fetchTasks();
                    } catch { toast.error('Error approving task'); }
                  }} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-100">
                    Approve
                  </button>
                  <button onClick={async () => {
                    try {
                      await api.put(`/tasks/${t._id}`, { status: 'inProgress' });
                      fetchTasks();
                    } catch { toast.error('Error rejecting task'); }
                  }} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">
                    Reject
                  </button>
                </div>
              )}

              <button onClick={() => openEdit(t)} className="p-2 text-slate-400 hover:text-[#56051a] hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
