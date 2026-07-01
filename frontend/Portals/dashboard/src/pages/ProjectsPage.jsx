import { useState, useEffect, useCallback } from 'react';
import { FolderKanban, Loader2, Plus, Edit2 } from 'lucide-react';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import FilterBar from '../components/Filters/FilterBar';

const initialFormData = {
  title: '',
  description: '',
  progress: 0,
  assignedMembers: [],
  startDate: '',
  endDate: '',
};

export default function ProjectsPage() {
  const { userProfile } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({});

  const isAdmin =
    userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get('/projects');
      setProjects(data.projects || []);

      if (isAdmin) {
        const res = await api.get('/admin/members');
        setUsers(res.data.members || []);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const resetForm = () => {
    setShowCreate(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        progress: Number(formData.progress || 0),
      };

      if (editingId) {
        await api.put(`/projects/${editingId}`, payload);
        toast.success('Project updated');
      } else {
        await api.post('/projects/create', payload);
        toast.success('Project created');
      }

      resetForm();
      await fetchProjects();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
        (editingId ? 'Failed to update project' : 'Failed to create project')
      );
    }
  };

  const openEdit = (project) => {
    setFormData({
      title: project.title || project.name || '',
      description: project.description || '',
      progress: Number(project.progress || 0),
      startDate: project.startDate
        ? new Date(project.startDate).toISOString().split('T')[0]
        : '',
      endDate: project.endDate
        ? new Date(project.endDate).toISOString().split('T')[0]
        : '',
      assignedMembers:
        project.assignedMembers?.map((member) => member._id || member) || [],
    });

    setEditingId(project._id);
    setShowCreate(true);
  };

  const toggleMember = (userId) => {
    setFormData((prev) => ({
      ...prev,
      assignedMembers: prev.assignedMembers?.includes(userId)
        ? prev.assignedMembers.filter((id) => id !== userId)
        : [...(prev.assignedMembers || []), userId],
    }));
  };

  const handleApproveProject = async (projectId) => {
    try {
      await api.put(`/projects/${projectId}`, {
        status: 'completed',
        progress: 100,
      });

      toast.success('Project approved');
      await fetchProjects();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error approving project');
    }
  };

  const handleRejectProject = async (projectId) => {
    try {
      await api.put(`/projects/${projectId}`, {
        status: 'ongoing',
        progress: 90,
      });

      toast.success('Project rejected');
      await fetchProjects();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error rejecting project');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-[#56051a] animate-spin" />
      </div>
    );
  }

  const filtered = projects.filter((project) => {
    let match = true;

    if (
      filters.status &&
      filters.status !== 'all' &&
      project.status !== filters.status
    ) {
      match = false;
    }

    if (filters.startDate?.start && project.startDate) {
      if (new Date(project.startDate) < new Date(filters.startDate.start)) {
        match = false;
      }
    }

    if (filters.startDate?.end && project.startDate) {
      const end = new Date(filters.startDate.end);
      end.setHours(23, 59, 59, 999);

      if (new Date(project.startDate) > end) {
        match = false;
      }
    }

    if (filters.endDate?.start && project.endDate) {
      if (new Date(project.endDate) < new Date(filters.endDate.start)) {
        match = false;
      }
    }

    if (filters.endDate?.end && project.endDate) {
      const end = new Date(filters.endDate.end);
      end.setHours(23, 59, 59, 999);

      if (new Date(project.endDate) > end) {
        match = false;
      }
    }

    if (filters.progress?.min !== undefined && filters.progress.min !== '') {
      if ((project.progress || 0) < Number(filters.progress.min)) {
        match = false;
      }
    }

    if (filters.progress?.max !== undefined && filters.progress.max !== '') {
      if ((project.progress || 0) > Number(filters.progress.max)) {
        match = false;
      }
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
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Pending Approval', value: 'pending_approval' },
      ],
    },
    {
      name: 'startDate',
      label: 'Start Date Range',
      type: 'dateRange',
    },
    {
      name: 'endDate',
      label: 'End Date Range',
      type: 'dateRange',
    },
    {
      name: 'progress',
      label: 'Progress (%)',
      type: 'numberRange',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">Track project progress</p>
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
            New Project
          </button>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingId ? 'Edit Project' : 'Create Project'}
            </h2>

            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              {isAdmin ? (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <input
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              ) : (
                <div className="mb-2">
                  <h3 className="font-semibold text-slate-800">
                    {formData.title}
                  </h3>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Progress (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.progress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      progress: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              {isAdmin && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          startDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          endDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-xl text-sm"
                    />
                  </div>
                </div>
              )}

              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Assign Members (Private Project)
                  </label>

                  <div className="max-h-40 overflow-y-auto border rounded-xl p-2 space-y-1">
                    {users.map((user) => (
                      <label
                        key={user._id}
                        className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.assignedMembers?.includes(user._id)}
                          onChange={() => toggleMember(user._id)}
                          className="rounded text-[#56051a] focus:ring-[#56051a]"
                        />

                        <span className="text-sm">
                          {user.name}
                          <span className="text-xs text-slate-400">
                            {' '}
                            ({user.role})
                          </span>
                        </span>
                      </label>
                    ))}

                    {users.length === 0 && (
                      <p className="text-xs text-slate-500 text-center">
                        No members found
                      </p>
                    )}
                  </div>
                </div>
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
                  className="px-4 py-2 text-sm font-medium text-white bg-[#56051a] rounded-xl hover:bg-[#7a1e3a]"
                >
                  {editingId ? 'Save' : 'Create'}
                </button>
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
          {filtered.map((project) => (
            <div
              key={project._id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow relative"
            >
              {isAdmin && (
                <button
                  onClick={() => openEdit(project)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#56051a] hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}

              <div className="flex justify-between items-start mb-3 pr-10">
                <div>
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    {project.title || project.name}

                    {project.status === 'pending_approval' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-lg border bg-purple-100 text-purple-700 border-purple-200">
                        Pending Approval
                      </span>
                    )}
                  </h3>
                </div>

                <span className="text-sm font-bold text-[#56051a]">
                  {project.progress || 0}%
                </span>
              </div>

              {(project.startDate || project.endDate) && (
                <div className="text-xs text-slate-400 mb-2 flex items-center gap-2 font-medium">
                  {project.startDate && (
                    <span>
                      Starts:{' '}
                      {new Date(project.startDate).toLocaleDateString('en-IN')}
                    </span>
                  )}

                  {project.startDate && project.endDate && <span>•</span>}

                  {project.endDate && (
                    <span>
                      Ends:{' '}
                      {new Date(project.endDate).toLocaleDateString('en-IN')}
                    </span>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-500 mb-3">
                {project.description || 'No description'}
              </p>

              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3">
                <div
                  className="bg-[#56051a] h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(Number(project.progress || 0), 100)}%`,
                  }}
                />
              </div>

              {project.status === 'pending_approval' && isAdmin && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleApproveProject(project._id)}
                    className="px-3 py-1.5 flex-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-100 text-center"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleRejectProject(project._id)}
                    className="px-3 py-1.5 flex-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 text-center"
                  >
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
