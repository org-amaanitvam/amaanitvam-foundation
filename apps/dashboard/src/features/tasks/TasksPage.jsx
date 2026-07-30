import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Loader2, Plus, Edit2, Paperclip } from 'lucide-react';
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from 'react-hot-toast';
import FilterBar from "../../components/Filters/FilterBar";

const initialFormData = {
  title: '',
  description: '',
  assignedTo: '',
  category: 'General', 
  deadline: '',
  status: 'open',
  priority: 'medium',
  progress: 0,
  attachmentUrl: '', 
  newComment: '',
};

export default function TasksPage() {
  const { userProfile } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [users, setUsers] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Keeping your hardcoded bypass for testing
  const isAdmin = true; 
  // const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/tasks');
      
      const taskList = Array.isArray(data) ? data
                     : Array.isArray(data.tasks) ? data.tasks
                     : Array.isArray(data.data) ? data.data
                     : [];
const normalizedTasks = taskList.map(t => ({
        ...t,
        assignedTo: t.assignedTo || t.assigned_to_id
      }));

      setTasks(normalizedTasks);

      if (isAdmin) {
        const res = await api.get('/admin/members');
        setUsers(res.data.members || []);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const resetForm = () => {
    setShowCreate(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingFile(true);
    try {
      // 1. Create a dynamic folder for this specific task's attachments
      const folderRes = await api.post('/gallery/folders', {
        name: `Task Attachment: ${formData.title || 'Untitled Task'}`,
        description: "Auto-generated folder for task attachments"
      });
      const newFolderId = folderRes.data.folder._id;

      // 2. Upload the image and attach it to the new folder
      const uploadData = new FormData();
      uploadData.append("image", file);
      uploadData.append("folderId", newFolderId); 
      uploadData.append("title", file.name);
      
      const res = await api.post('/gallery/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData({ ...formData, attachmentUrl: res.data.media.secure_url });
      toast.success("File attached successfully!");
    } catch (err) {
      console.error(err);
      toast.error("File upload failed. Check backend connection.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    try {
      const submissionData = {
        title: formData.title,
        description: formData.description,
        assigned_to_id: formData.assignedTo, // Always send the ID
        category: formData.category,
        deadline: formData.deadline,
        status: formData.status,
        priority: formData.priority.toLowerCase(),
        progress: formData.progress,
        attachmentUrl: formData.attachmentUrl,
        comment: formData.newComment 
      };

      // ONLY delete deadline if it's empty. Do NOT delete assigned_to_id.
      if (!submissionData.deadline) delete submissionData.deadline;

      if (editingId) {
        await api.put(`/tasks/${editingId}`, submissionData);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', submissionData);
        toast.success('Task assigned successfully!');
      }

      resetForm();
      fetchTasks(); 
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
        (editingId ? 'Failed to update task' : 'Failed to create task')
      );
    }
  };

  const openEdit = (task) => {
    setFormData({
      title: task.title || '',
      description: task.description || '',
      assignedTo: task.assignedTo?._id || task.assignedTo || '',
      category: task.category || 'General',
      deadline: task.deadline
        ? new Date(task.deadline).toISOString().split('T')[0]
        : '',
      status: task.status || 'open',
      priority: (task.priority || 'medium').toLowerCase(), 
      progress: Number(task.progress || 0),
      attachmentUrl: task.attachmentUrl || '',
      newComment: '',
    });

    setEditingId(task._id);
    setShowCreate(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-[#56051a] animate-spin" />
      </div>
    );
  }

  const myTasks = isAdmin
    ? tasks
    : tasks.filter(
      (t) =>
        t.assignedTo?._id === userProfile?._id ||
        t.assignedTo?.email === userProfile?.email
    );

  const filtered = myTasks.filter((t) => {
    let match = true;
    if (filters.status && filters.status !== 'all' && t.status !== filters.status) match = false;
    if (filters.category && filters.category !== 'all' && t.category !== filters.category) match = false;
    
    const taskPriority = (t.priority || 'medium').toLowerCase();
    if (filters.priority && filters.priority !== 'all' && taskPriority !== filters.priority) match = false;

    if (filters.assignedTo && filters.assignedTo !== 'all') {
      const assignedId = t.assignedTo?._id || t.assignedTo;
      if (assignedId !== filters.assignedTo) match = false;
    }

    if (filters.deadline?.start && t.deadline) {
      if (new Date(t.deadline) < new Date(filters.deadline.start)) match = false;
    }

    if (filters.deadline?.end && t.deadline) {
      const end = new Date(filters.deadline.end);
      end.setHours(23, 59, 59, 999);
      if (new Date(t.deadline) > end) match = false;
    }

    return match;
  });

  const filterConfig = [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Open', value: 'open' },
        { label: 'In Progress', value: 'inProgress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Pending Approval', value: 'pending_approval' },
      ],
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { label: 'All Priorities', value: 'all' },
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { label: 'All Categories', value: 'all' },
        { label: 'General', value: 'General' },
        { label: 'Development', value: 'Development' },
        { label: 'Design', value: 'Design' },
        { label: 'Marketing', value: 'Marketing' },
      ],
    },
    ...(isAdmin
      ? [
        {
          name: 'assignedTo',
          label: 'Assigned To',
          type: 'select',
          options: [
            { label: 'All Members', value: 'all' },
            ...users.map((u) => ({
              label: u.name,
              value: u._id,
            })),
          ],
        },
      ]
      : []),
    {
      name: 'deadline',
      label: 'Deadline Range',
      type: 'dateRange',
    },
  ];

  const statusColors = {
    open: 'bg-amber-100 text-amber-700 border-amber-200',
    inProgress: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending_approval: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  const getStatusLabel = (status) => {
    if (status === 'inProgress') return 'In Progress';
    if (status === 'pending_approval') return 'Pending Approval';
    return status || 'Open';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isAdmin ? 'All Tasks' : 'My Tasks'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track tasks and deadlines
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingId(null);
              setFormData(initialFormData);
              setShowCreate(true);
            }}
            className="px-4 py-2 bg-[#56051a] text-white rounded-xl font-medium text-sm hover:bg-[#7a1e3a] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingId
                ? isAdmin
                  ? 'Edit Task'
                  : 'Update Task Progress'
                : 'Create New Task'}
            </h2>

            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              {isAdmin && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value }) }
                      className="w-full px-3 py-2 border rounded-xl text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Assign To</label>
                      <select
                        required
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value }) }
                        className="w-full px-3 py-2 border rounded-xl text-sm"
                      >
                        <option value="" disabled>Select a Member</option>
                        {users.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value }) }
                        className="w-full px-3 py-2 border rounded-xl text-sm"
                      >
                        <option value="General">General</option>
                        <option value="Development">Development</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Priority</label>
                      <select
                        required
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value }) }
                        className="w-full px-3 py-2 border rounded-xl text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value }) }
                        className="w-full px-3 py-2 border rounded-xl text-sm"
                      >
                        <option value="open">Open</option>
                        <option value="inProgress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="pending_approval">Pending Approval</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Deadline</label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value }) }
                      className="w-full px-3 py-2 border rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value }) }
                      className="w-full px-3 py-2 border rounded-xl text-sm"
                      rows="3"
                    />
                  </div>
                </>
              )}

              {/* NEW: Attachment Upload Section */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Paperclip className="w-4 h-4"/> Task Attachment
                </label>
                
                {formData.attachmentUrl ? (
                  <div className="flex items-center justify-between">
                    <a href={formData.attachmentUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-sm font-medium hover:underline truncate">
                      View Uploaded File
                    </a>
                    <button type="button" onClick={() => setFormData({...formData, attachmentUrl: ''})} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                ) : (
                  <div>
                    <input 
                      type="file" 
                      onChange={handleFileUpload} 
                      disabled={uploadingFile}
                      className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#56051a]/10 file:text-[#56051a] hover:file:bg-[#56051a]/20 cursor-pointer w-full"
                    />
                    {uploadingFile && <p className="text-xs text-slate-500 mt-2 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Uploading to cloud...</p>}
                  </div>
                )}
              </div>

              {!isAdmin && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                  <h3 className="font-semibold text-slate-800">{formData.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{formData.description}</p>
                </div>
              )}

              {editingId && (
                <>
                  {!isAdmin && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          setFormData({
                            ...formData,
                            status: newStatus,
                            progress: newStatus === 'completed' ? 100 : Number(formData.progress || 0),
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-xl text-sm"
                      >
                        <option value="open">Open</option>
                        <option value="inProgress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1 flex justify-between">
                      <span>Progress</span>
                      <span className="text-[#56051a] font-bold">{formData.progress || 0}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.progress || 0}
                      onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) }) }
                      className="w-full accent-[#56051a]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Add Update Comment</label>
                    <input
                      type="text"
                      placeholder="e.g. Task has been started"
                      value={formData.newComment || ''}
                      onChange={(e) => setFormData({ ...formData, newComment: e.target.value }) }
                      className="w-full px-3 py-2 border rounded-xl text-sm"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingFile}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#56051a] rounded-xl hover:bg-[#7a1e3a] disabled:opacity-50"
                >
                  {editingId ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <FilterBar config={filterConfig} filters={filters} setFilters={setFilters} />

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400">No tasks found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((t) => {
            const safePriority = (t.priority || 'medium').toLowerCase();
            return (
              <div
                key={t._id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
              >
                <span
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border ${statusColors[t.status] || 'bg-slate-100 text-slate-600'}`}
                >
                  {getStatusLabel(t.status)}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-800 truncate">{t.title}</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                      {t.progress || 0}%
                    </span>
                    
                    {/* NEW: Category Badge */}
                    {t.category && t.category !== 'General' && (
                      <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                        {t.category}
                      </span>
                    )}
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 mb-1 max-w-[200px]">
                    <div
                      className="bg-[#56051a] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${t.progress || 0}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>Assigned to: <span className="font-medium text-slate-700">{t.assignedTo?.name || 'Unassigned'}</span></span>
                    {t.deadline && <span>• Due: {new Date(t.deadline).toLocaleDateString()}</span>}
                  </p>

                  {/* NEW: Attachment Link rendering */}
                  {t.attachmentUrl && (
                    <a href={t.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded transition-colors">
                      <Paperclip className="w-3 h-3"/> View Attachment
                    </a>
                  )}

                  {t.comments && t.comments.length > 0 && (
                    <p className="text-xs text-slate-500 mt-1.5 italic border-l-2 border-slate-200 pl-2">
                      Latest: {t.comments[t.comments.length - 1].text}
                    </p>
                  )}

                  {safePriority && (
                    <p className="text-xs mt-1.5">
                      <span className="text-slate-400">Priority: </span>
                      <span
                        className={`font-medium ${
                          safePriority === 'high' ? 'text-rose-500' : safePriority === 'low' ? 'text-slate-500' : 'text-amber-500'
                        }`}
                      >
                        {safePriority.charAt(0).toUpperCase() + safePriority.slice(1)}
                      </span>
                    </p>
                  )}
                </div>

                <button
                  onClick={() => openEdit(t)}
                  className="p-2 text-slate-400 hover:text-[#56051a] hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  {!isAdmin && <span>Update</span>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 