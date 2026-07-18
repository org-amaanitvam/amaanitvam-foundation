import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ClipboardList } from 'lucide-react';

export default function AssignTaskForm({ onTaskAdded }) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    deadline: '',
    status: 'open',
    priority: 'Medium'
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        const data = response.data;
        const usersList = Array.isArray(data) ? data 
                        : Array.isArray(data.users) ? data.users 
                        : Array.isArray(data.data) ? data.data 
                        : Array.isArray(data.data?.users) ? data.data.users
                        : [];
        setUsers(usersList);
      } catch (error) {
        console.error("Failed to fetch users", error);
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/tasks', formData);
      toast.success('Task assigned successfully! ✅');
      
      setFormData({ title: '', description: '', assignedTo: '', deadline: '', status: 'open', priority: 'Medium' });
      if (onTaskAdded) onTaskAdded(response.data.task);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-premium p-6 h-full">
      <div className="flex items-center gap-2 mb-6 border-b border-border-custom pb-4">
        <ClipboardList className="w-5 h-5 text-gold" />
        <h2 className="font-heading text-xl font-bold text-primary">Assign Task</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-ui font-semibold text-primary mb-1">Task Title</label>
          <input 
            type="text" 
            name="title"
            value={formData.title} 
            onChange={handleChange} 
            required
            className="w-full p-2 border border-border-custom rounded-lg bg-background text-primary"
            placeholder="e.g., Set up Cisco Fire Detection system"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-ui font-semibold text-primary mb-1">Assign To</label>
            <select 
              name="assignedTo"
              value={formData.assignedTo} 
              onChange={handleChange}
              required
              className="w-full p-2 border border-border-custom rounded-lg bg-background text-primary"
            >
              <option value="">Select Team Member</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-ui font-semibold text-primary mb-1">Deadline</label>
            <input 
              type="date" 
              name="deadline"
              value={formData.deadline} 
              onChange={handleChange} 
              required
              className="w-full p-2 border border-border-custom rounded-lg bg-background text-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-ui font-semibold text-primary mb-1">Status</label>
            <select 
              name="status"
              value={formData.status} 
              onChange={handleChange}
              className="w-full p-2 border border-border-custom rounded-lg bg-background text-primary"
            >
              <option value="open">Open</option>
              <option value="inProgress">In Progress</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-ui font-semibold text-primary mb-1">Priority</label>
            <select 
              name="priority"
              value={formData.priority} 
              onChange={handleChange}
              className="w-full p-2 border border-border-custom rounded-lg bg-background text-primary"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={loading}
            style={{ backgroundColor: '#7a1921', color: 'white' }} 
            className="px-6 py-2 w-full font-ui font-bold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Assigning...' : 'Assign Task'}
          </button>
        </div>
      </form>
    </div>
  );
}