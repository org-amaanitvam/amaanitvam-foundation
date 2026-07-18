import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FolderKanban } from 'lucide-react';

export default function AddProjectManagement({ onProjectAdded }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    progress: 0,
    status: 'ongoing',
    startDate: '',
    endDate: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/projects', formData);
      toast.success('Project created successfully! 🚀');
      
      // Reset form fields
      setFormData({ 
        title: '', 
        description: '', 
        progress: 0, 
        status: 'ongoing',
        startDate: '',
        endDate: ''
      });
      
      // Trigger the dashboard refresh
      if (onProjectAdded) onProjectAdded(response.data.project);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-premium p-6">
      <div className="flex items-center gap-2 mb-6 border-b border-border-custom pb-4">
        <FolderKanban className="w-5 h-5 text-gold" />
        <h2 className="font-heading text-xl font-bold text-primary">Add New Project</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-ui font-semibold text-primary mb-1">Project Title</label>
          <input 
            type="text" 
            name="title"
            value={formData.title} 
            onChange={handleChange} 
            required
            className="w-full p-2 border border-border-custom rounded-lg bg-background text-primary"
            placeholder="e.g., Q3 Marketing Campaign"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-ui font-semibold text-primary mb-1">Description</label>
          <textarea 
            name="description"
            value={formData.description} 
            onChange={handleChange} 
            rows="2"
            className="w-full p-2 border border-border-custom rounded-lg bg-background text-primary"
            placeholder="Brief overview of the project..."
          />
        </div>

        {/* Status & Progress Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-ui font-semibold text-primary mb-1">Status</label>
            <select 
              name="status"
              value={formData.status} 
              onChange={handleChange}
              className="w-full p-2 border border-border-custom rounded-lg bg-background text-primary"
            >
              <option value="planning">Planning</option>
              <option value="ongoing">Ongoing</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-ui font-semibold text-primary mb-1">Progress (%)</label>
            <input 
              type="number" 
              name="progress"
              min="0"
              max="100"
              value={formData.progress} 
              onChange={handleChange} 
              className="w-full p-2 border border-border-custom rounded-lg bg-background text-primary"
            />
          </div>
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-ui font-semibold text-primary mb-1">Start Date</label>
            <input 
              type="date" 
              name="startDate"
              value={formData.startDate} 
              onChange={handleChange} 
              required
              className="w-full p-2 border border-border-custom rounded-lg bg-background text-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-ui font-semibold text-primary mb-1">End Date</label>
            <input 
              type="date" 
              name="endDate"
              value={formData.endDate} 
              onChange={handleChange} 
              className="w-full p-2 border border-border-custom rounded-lg bg-background text-primary"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={loading}
            style={{ backgroundColor: '#7a1921', color: 'white' }} 
            className="px-6 py-2 w-full font-ui font-bold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}