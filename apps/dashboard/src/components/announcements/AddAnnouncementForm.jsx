import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Megaphone } from 'lucide-react';

export default function AddAnnouncementForm({ onAnnouncementAdded }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/announcements', formData);
      toast.success('Announcement broadcasted! 📢');
      
      setFormData({ title: '', message: '' });
      
      // Trigger the dashboard refresh
      if (onAnnouncementAdded) onAnnouncementAdded();
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-premium p-6 h-full">
      <div className="flex items-center gap-2 mb-6 border-b border-border-custom pb-4">
        <Megaphone className="w-5 h-5 text-gold" />
        <h2 className="font-heading text-xl font-bold text-primary">New Announcement</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-ui font-semibold text-primary mb-1">Title</label>
          <input 
            type="text" 
            name="title"
            value={formData.title} 
            onChange={handleChange} 
            required
            className="w-full p-2 border border-border-custom rounded-lg bg-background text-primary"
            placeholder="e.g., Office closed for Holiday"
          />
        </div>

        <div>
          <label className="block text-sm font-ui font-semibold text-primary mb-1">Message</label>
          <textarea 
            name="message"
            value={formData.message} 
            onChange={handleChange} 
            required
            rows="3"
            className="w-full p-2 border border-border-custom rounded-lg bg-background text-primary"
            placeholder="Type your announcement here..."
          />
        </div>

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={loading}
            style={{ backgroundColor: '#7a1921', color: 'white' }} 
            className="px-6 py-2 w-full font-ui font-bold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Broadcasting...' : 'Broadcast Message'}
          </button>
        </div>
      </form>
    </div>
  );
}