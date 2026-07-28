import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Loader2, Plus, Clock3, LoaderCircle, CheckCircle2, AlertTriangle, Edit2 } from 'lucide-react';
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { canAccessPermission } from "../../utils/accessControl";
import toast from 'react-hot-toast';
import FilterBar from "../../components/Filters/FilterBar";

const initialFormData = {
  title: '',
  description: '',
  assignedTo: '',
  deadline: '',
  status: 'open',
  priority: 'medium',
  progress: 0,
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

  const canManageTasks = canAccessPermission(
    userProfile,
    "tasks.manage",
  );

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/tasks");
      const taskList = Array.isArray(data)
        ? data
        : Array.isArray(data.tasks)
          ? data.tasks
          : Array.isArray(data.data)
            ? data.data
            : [];

      setTasks(taskList);
    } catch (error) {
      console.error("Tasks load failed:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to load tasks",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (!canManageTasks) {
      setUsers([]);
      return;
    }

    api.get("/admin/members")
      .then((response) => {
        setUsers(response.data.members || []);
      })
      .catch((error) => {
        console.error(
          "Task member options failed:",
          error,
        );
      });
  }, [canManageTasks]);

  const resetForm = () => {
    setShowCreate(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    try {
      const submissionData = {
        ...formData,
        priority: formData.priority.toLowerCase()
      };

      if (editingId) {
        await api.put(`/tasks/${editingId}`, submissionData);
        toast.success('Task updated');
      } else {
        // THE FIX: Changed from '/tasks/create' to '/tasks' to match the backend router exactly!
        await api.post('/tasks', submissionData);
        toast.success('Task assigned successfully!');
      }

      resetForm();
      fetchTasks(); // Refreshes the list instantly so the new task appears
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
      deadline: task.deadline
        ? new Date(task.deadline).toISOString().split('T')[0]
        : '',
      status: task.status || 'open',
      priority: (task.priority || 'medium').toLowerCase(),
      progress: Number(task.progress || 0),
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

  const myTasks = canManageTasks
    ? tasks
    : tasks.filter(
      (t) =>
        t.assignedTo?._id === userProfile?._id ||
        t.assignedTo?.email === userProfile?.email
    );

  const filtered = myTasks.filter((t) => {
    let match = true;






    if (filters.status && filters.status !== 'all' && t.status !== filters.status) {
      match = false;
    }

    const taskPriority = (t.priority || 'medium').toLowerCase();
    if (
      filters.priority &&
      filters.priority !== 'all' &&
      taskPriority !== filters.priority
    ) {
      match = false;
    }

    if (filters.assignedTo && filters.assignedTo !== 'all') {
      const assignedId = t.assignedTo?._id || t.assignedTo;
      if (assignedId !== filters.assignedTo) {
        match = false;
      }
    }

    if (filters.deadline?.start && t.deadline) {
      if (new Date(t.deadline) < new Date(filters.deadline.start)) {
        match = false;
      }
    }

    if (filters.deadline?.end && t.deadline) {
      const end = new Date(filters.deadline.end);
      end.setHours(23, 59, 59, 999);
      if (new Date(t.deadline) > end) {
        match = false;
      }
    }

    return match;
  });


  // ================= TASK STATS =================
  // Dashboard Statistics
  const stats = {
    total: filtered.length,

    open: filtered.filter((t) => t.status === "open").length,

    inProgress: filtered.filter(
      (t) => t.status === "inProgress"
    ).length,

    completed: filtered.filter(
      (t) => t.status === "completed"
    ).length,

    overdue: filtered.filter(
      (t) =>
        t.deadline &&
        new Date(t.deadline) < new Date() &&
        t.status !== "completed"
    ).length,
  };


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
    ...(canManageTasks
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
      {/* <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {canManageTasks ? 'All Tasks' : 'My Tasks'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track tasks and deadlines
          </p>
        </div>

        {canManageTasks && (
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
      </div> */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {canManageTasks ? "All Tasks" : "My Tasks"}
          </h1>

          <p className="text-slate-500 mt-2">
            Organize, assign and monitor tasks across your team.
          </p>
        </div>

        {canManageTasks && (
          <button
            onClick={() => {
              setEditingId(null);
              setFormData(initialFormData);
              setShowCreate(true);
            }}
            className="flex items-center gap-2 bg-[#56051a] text-white px-5 py-3 rounded-xl shadow-md hover:bg-[#6b0d24] hover:shadow-lg transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Create Task
          </button>
        )}

      </div>



      {/* 
-------------------------------------------------------------------- */}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
          {/* <p className="text-sm text-slate-500">Total Tasks</p>
          <h2 className="text-3xl font-bold text-slate-800 mt-2">
            {stats.total}
          </h2> */}


          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Tasks
              </p>

              <h2 className="text-4xl font-bold text-slate-900 mt-2">
                {stats.total}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-[#56051a]/10 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-[#56051a]" />
            </div>
          </div>





        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          {/* <p className="text-sm text-yellow-700">Open</p>
          <h2 className="text-3xl font-bold text-yellow-700 mt-2">
            {stats.open}
          </h2> */}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">
                Open
              </p>

              <h2 className="text-4xl font-bold text-yellow-700 mt-2">
                {stats.open}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center">
              <Clock3 className="w-6 h-6 text-yellow-700" />
            </div>
          </div>




        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-blue-700 font-medium">
                In Progress
              </p>

              <h2 className="text-4xl font-bold text-blue-700 mt-2">
                {stats.inProgress}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <LoaderCircle className="w-6 h-6 text-blue-700" />
            </div>

          </div>

        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-green-700 font-medium">
                Completed
              </p>

              <h2 className="text-4xl font-bold text-green-700 mt-2">
                {stats.completed}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-700" />
            </div>

          </div>

        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-red-700 font-medium">
                Overdue
              </p>

              <h2 className="text-4xl font-bold text-red-700 mt-2">
                {stats.overdue}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-700" />
            </div>

          </div>

        </div>

      </div>







      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingId
                ? canManageTasks
                  ? 'Edit Task'
                  : 'Update Task Progress'
                : 'Create New Task'}
            </h2>

            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              {canManageTasks && (
                <>
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

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Assign To
                    </label>
                    <select
                      required
                      value={formData.assignedTo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assignedTo: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-xl text-sm"
                    >
                      <option value="">Select Member</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Priority
                    </label>
                    <select
                      required
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-xl text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Deadline
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deadline: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-xl text-sm"
                    />
                  </div>

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
                </>
              )}

              {!canManageTasks && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                  <h3 className="font-semibold text-slate-800">
                    {formData.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.description}
                  </p>
                </div>
              )}

              {editingId && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;

                        setFormData({
                          ...formData,
                          status: newStatus,
                          progress:
                            newStatus === 'completed'
                              ? 100
                              : Number(formData.progress || 0),
                        });
                      }}
                      className="w-full px-3 py-2 border rounded-xl text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="inProgress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 flex justify-between">
                      <span>Progress</span>
                      <span className="text-[#56051a] font-bold">
                        {formData.progress || 0}%
                      </span>
                    </label>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.progress || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          progress: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#56051a]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Add Update Comment
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Task has been started"
                      value={formData.newComment || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newComment: e.target.value,
                        })
                      }
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
                  className="px-4 py-2 text-sm font-medium text-white bg-[#56051a] rounded-xl hover:bg-[#7a1e3a]"
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
                className={`bg-white rounded-2xl border-l-4 ${t.status === "completed"
                  ? "border-l-green-500"
                  : t.status === "inProgress"
                    ? "border-l-blue-500"
                    : t.status === "open"
                      ? "border-l-yellow-500"
                      : "border-l-slate-300"
                  } border-t border-r border-b border-slate-200 p-6 flex items-start gap-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
              >
                <span
                  className={`px-3 py-1.5 text-xs font-semibold uppercase rounded-full border whitespace-nowrap ${statusColors[t.status] || 'bg-slate-100 text-slate-600'
                    }`}
                >
                  {getStatusLabel(t.status)}
                </span>

                <div className="flex-1 min-w-0">
                  {/* <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-800">
                      {t.title}
                    </h3>

                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                      {t.progress || 0}%
                    </span>
                  </div> */}


                  <div className="flex justify-between items-center w-full">

                    <h3 className="text-xl font-bold text-slate-900 leading-tight">
                      {t.title}
                    </h3>
                    <span className="px-3 py-1 rounded-full bg-[#56051a]/10 text-[#56051a] text-xs font-bold">
                      {t.progress || 0}% Complete
                    </span>

                  </div>


                  <div className="w-full bg-slate-200 rounded-full h-3 mt-3 mb-3 overflow-hidden max-w-sm">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-[#56051a] to-[#8c1735] transition-all duration-500"
                      style={{ width: `${t.progress || 0}%` }}
                    />
                  </div>

                  {/* <p className="text-xs text-slate-500 mt-0.5">
                    Assigned to: {t.assignedTo?.name || 'Unassigned'}
                    {t.deadline &&
                      ` • Due: ${new Date(t.deadline).toLocaleDateString()}`}
                  </p> */}

                  <div className="flex flex-wrap items-center gap-3 mt-3">

                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                      <div className="w-8 h-8 rounded-full bg-[#56051a] text-white flex items-center justify-center text-xs font-bold">
                        {(t.assignedTo?.name || "U").charAt(0).toUpperCase()}
                      </div>

                      <span className="text-sm font-medium text-slate-700">
                        {t.assignedTo?.name || "Unassigned"}
                      </span>
                    </div>

                    {t.deadline && (
                      <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        📅 {new Date(t.deadline).toLocaleDateString()}
                      </span>
                    )}

                  </div>








                  {t.comments && t.comments.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1 italic line-clamp-1">
                      Latest: {t.comments[t.comments.length - 1].text}
                    </p>
                  )}

                  {safePriority && (
                    // <p className="text-xs mt-1">
                    //   <span className="text-slate-500">Priority: </span>
                    //   <span
                    //     className={`font-medium ${safePriority === 'high'
                    //       ? 'text-rose-500'
                    //       : safePriority === 'low'
                    //         ? 'text-slate-500'
                    //         : 'text-amber-500'
                    //       }`}
                    //   >
                    //     {safePriority.charAt(0).toUpperCase() + safePriority.slice(1)}
                    //   </span>
                    // </p>


                    <div className="mt-3">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
      ${safePriority === "high"
                            ? "bg-red-100 text-red-700"
                            : safePriority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                      >
                        {safePriority.toUpperCase()} PRIORITY
                      </span>

                    </div>




                  )}
                </div>

                <button
                  onClick={() => openEdit(t)}
                  className="p-2 text-slate-400 hover:text-[#56051a] hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  {!canManageTasks && <span>Update</span>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}