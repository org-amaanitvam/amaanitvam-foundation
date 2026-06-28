import { useState, useEffect } from 'react';
import { CalendarDays, Loader2, Plus, LayoutList, Calendar as CalendarIcon, X, FileText, UploadCloud, Download } from 'lucide-react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import FilterBar from '../components/Filters/FilterBar';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedMeeting, setSelectedMeeting] = useState(null); // For details modal
  const [minutesFile, setMinutesFile] = useState(null);
  const [uploadingMinutes, setUploadingMinutes] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', meetingDate: '', attendees: [] });
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({});
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

  const handleUploadMinutes = async (e) => {
    e.preventDefault();
    if (!minutesFile) return;
    
    setUploadingMinutes(true);
    const uploadData = new FormData();
    uploadData.append('minutes', minutesFile);
    
    try {
      const { data } = await api.post(`/meetings/${selectedMeeting._id}/minutes`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Minutes uploaded successfully');
      setSelectedMeeting(data.meeting);
      setMinutesFile(null);
      fetchMeetings();
    } catch {
      toast.error('Failed to upload minutes');
    } finally {
      setUploadingMinutes(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 text-[#56051a] animate-spin" /></div>;

  const filteredMeetings = meetings.filter(m => {
    let match = true;
    if (filters.status && filters.status !== 'all') {
      const isPast = new Date(m.meetingDate) < new Date();
      if (filters.status === 'upcoming' && isPast) match = false;
      if (filters.status === 'past' && !isPast) match = false;
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!m.title.toLowerCase().includes(search) && !(m.description || '').toLowerCase().includes(search)) match = false;
    }

    if (filters.attendee && filters.attendee !== 'all') {
      if (!m.attendees || !m.attendees.some(a => (a._id || a) === filters.attendee)) match = false;
    }

    if (filters.dateRange?.start && m.meetingDate) {
      if (new Date(m.meetingDate) < new Date(filters.dateRange.start)) match = false;
    }
    if (filters.dateRange?.end && m.meetingDate) {
      const end = new Date(filters.dateRange.end);
      end.setHours(23, 59, 59, 999);
      if (new Date(m.meetingDate) > end) match = false;
    }
    return match;
  });

  const upcoming = filteredMeetings.filter(m => new Date(m.meetingDate) >= new Date()).sort((a, b) => new Date(a.meetingDate) - new Date(b.meetingDate));
  const past = filteredMeetings.filter(m => new Date(m.meetingDate) < new Date()).sort((a, b) => new Date(b.meetingDate) - new Date(a.meetingDate));

  // Calendar events map
  const calendarEvents = filteredMeetings.map(m => {
    const start = new Date(m.meetingDate);
    // Approximate duration of 1 hour for the calendar view if end time isn't in model
    const end = new Date(start.getTime() + 60 * 60 * 1000); 
    return {
      id: m._id,
      title: m.title,
      start,
      end,
      resource: m
    };
  });

  const filterConfig = [
    { name: 'status', label: 'Status', type: 'select', options: [
      { label: 'All', value: 'all' },
      { label: 'Upcoming', value: 'upcoming' },
      { label: 'Past', value: 'past' }
    ]},
    { name: 'dateRange', label: 'Date Range', type: 'dateRange' },
    { name: 'attendee', label: 'Attendee', type: 'select', options: [
      { label: 'All Attendees', value: 'all' },
      ...users.map(u => ({ label: u.name, value: u._id }))
    ]},
    { name: 'search', label: 'Meeting Title', type: 'text', placeholder: 'Search meetings...' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meetings</h1>
          <p className="text-sm text-slate-500 mt-1">View all scheduled meetings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow text-[#56051a]' : 'text-slate-500 hover:text-slate-700'}`}
              title="List View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-white shadow text-[#56051a]' : 'text-slate-500 hover:text-slate-700'}`}
              title="Calendar View"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>
          {isAdmin && (
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-[#56051a] text-white rounded-xl font-medium text-sm hover:bg-[#7a1e3a] transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Schedule Meeting
            </button>
          )}
        </div>
      </div>
      
      <FilterBar config={filterConfig} filters={filters} setFilters={setFilters} />

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Schedule Meeting</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Title</label><input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Date & Time</label><input type="datetime-local" required value={formData.meetingDate} onChange={e => setFormData({...formData, meetingDate: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>
              <div>
                <label className="block text-sm font-medium mb-2">Attendees (Leave empty for everyone)</label>
                <div className="max-h-40 overflow-y-auto border rounded-xl p-2 space-y-1">
                  {users.map(u => (
                    <label key={u._id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.attendees?.includes(u._id)}
                        onChange={() => {
                          setFormData(prev => ({
                            ...prev,
                            attendees: prev.attendees.includes(u._id)
                              ? prev.attendees.filter(id => id !== u._id)
                              : [...(prev.attendees || []), u._id]
                          }));
                        }}
                        className="rounded text-[#56051a] focus:ring-[#56051a]"
                      />
                      <span className="text-sm">{u.name} <span className="text-xs text-slate-400">({u.role})</span></span>
                    </label>
                  ))}
                  {users.length === 0 && <p className="text-xs text-slate-500 text-center">No members found</p>}
                </div>
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

      {selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in relative">
            <button onClick={() => setSelectedMeeting(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedMeeting.title}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 border-b pb-4">
              <CalendarIcon className="w-4 h-4" />
              <span>{new Date(selectedMeeting.meetingDate).toLocaleString()}</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-1">Description</h3>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                  {selectedMeeting.description || 'No description provided.'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Meeting Minutes
                </h3>
                
                {selectedMeeting.minutesUrl ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" /> Minutes Available
                    </span>
                    <a href={`http://localhost:5000${selectedMeeting.minutesUrl}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-3">No minutes uploaded for this meeting yet.</p>
                    {isAdmin && (
                      <form onSubmit={handleUploadMinutes} className="flex gap-2">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setMinutesFile(e.target.files[0])}
                          className="flex-1 text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#56051a]/10 file:text-[#56051a] hover:file:bg-[#56051a]/20 transition-colors cursor-pointer"
                        />
                        <button
                          type="submit"
                          disabled={!minutesFile || uploadingMinutes}
                          className="px-3 py-1.5 bg-[#56051a] text-white text-xs font-medium rounded-lg hover:bg-[#7a1e3a] transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
                        >
                          {uploadingMinutes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                          Upload
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'calendar' ? (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 h-[600px] overflow-auto">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ minHeight: '500px' }}
            onSelectEvent={(event) => setSelectedMeeting(event.resource)}
            views={['month', 'week', 'day']}
            defaultView="month"
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: '#56051a',
                borderRadius: '4px',
                color: 'white',
                border: 'none',
                display: 'block',
                fontSize: '12px',
                padding: '2px 5px'
              }
            })}
          />
        </div>
      ) : (
        <>
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
                  <div key={m._id} onClick={() => setSelectedMeeting(m)} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer">
                    <div className="w-14 h-14 bg-[#56051a]/10 rounded-xl flex flex-col items-center justify-center text-[#56051a] flex-shrink-0">
                      <span className="text-[10px] font-bold uppercase">{new Date(m.meetingDate).toLocaleDateString('en', { month: 'short' })}</span>
                      <span className="text-lg font-bold leading-none">{new Date(m.meetingDate).getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{m.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{m.description || 'No description'}</p>
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
                  <div key={m._id} onClick={() => setSelectedMeeting(m)} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 opacity-70 cursor-pointer hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-500 flex-shrink-0">
                      <span className="text-[10px] font-bold uppercase">{new Date(m.meetingDate).toLocaleDateString('en', { month: 'short' })}</span>
                      <span className="text-lg font-bold leading-none">{new Date(m.meetingDate).getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{m.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{m.description || 'No description'}</p>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium bg-slate-100 text-slate-500 rounded-full">Past</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
