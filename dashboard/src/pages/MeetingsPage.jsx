import { useState, useEffect } from 'react';
import { CalendarDays, Loader2, Plus } from 'lucide-react';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', meetingDate: '', attendees: [] });
  const [users, setUsers] = useState([]);
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

  useEffect(() => { fetchMeetings(); }, []);

  const fetchMeetings = async () => {
    try {
      const { data } = await api.get('/meetings');
      setMeetings(data.meetings || []);
      
      if (isAdmin) {
        const res = await api.get('/admin/members');
        setUsers(res.data.members || []);
      }
    } catch { toast.error('Failed to load meetings'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/meetings/create', formData);
      toast.success('Meeting created');
      setShowCreate(false);
      setFormData({ title: '', description: '', meetingDate: '', attendees: [] });
      fetchMeetings();
    } catch {
      toast.error('Failed to create meeting');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 text-[#56051a] animate-spin" /></div>;

  const upcoming = meetings.filter(m => new Date(m.meetingDate) >= new Date()).sort((a, b) => new Date(a.meetingDate) - new Date(b.meetingDate));
  const past = meetings.filter(m => new Date(m.meetingDate) < new Date()).sort((a, b) => new Date(b.meetingDate) - new Date(a.meetingDate));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meetings</h1>
          <p className="text-sm text-slate-500 mt-1">View all scheduled meetings</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-[#56051a] text-white rounded-xl font-medium text-sm hover:bg-[#7a1e3a] transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Schedule Meeting
          </button>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Schedule Meeting</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Title</label><input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Date & Time</label><input type="datetime-local" required value={formData.meetingDate} onChange={e => setFormData({...formData, meetingDate: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>
              <div>
                <label className="block text-sm font-medium mb-1">Attendees (Leave empty for everyone)</label>
                <select multiple value={formData.attendees} onChange={e => setFormData({...formData, attendees: Array.from(e.target.selectedOptions, option => option.value)})} className="w-full px-3 py-2 border rounded-xl text-sm h-24">
                  {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                </select>
                <p className="text-xs text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
              <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" rows="3"></textarea></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#56051a] rounded-xl hover:bg-[#7a1e3a]">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No upcoming meetings</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {upcoming.map(m => (
              <div key={m._id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                <div className="w-14 h-14 bg-[#56051a]/10 rounded-xl flex flex-col items-center justify-center text-[#56051a] flex-shrink-0">
                  <span className="text-[10px] font-bold uppercase">{new Date(m.meetingDate).toLocaleDateString('en', { month: 'short' })}</span>
                  <span className="text-lg font-bold leading-none">{new Date(m.meetingDate).getDate()}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{m.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{m.description || 'No description'}</p>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-full">Upcoming</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Past Meetings</h2>
          <div className="grid gap-3">
            {past.slice(0, 10).map(m => (
              <div key={m._id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 opacity-70">
                <div className="w-14 h-14 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-500 flex-shrink-0">
                  <span className="text-[10px] font-bold uppercase">{new Date(m.meetingDate).toLocaleDateString('en', { month: 'short' })}</span>
                  <span className="text-lg font-bold leading-none">{new Date(m.meetingDate).getDate()}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{m.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{m.description || 'No description'}</p>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-500 rounded-full">Past</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
