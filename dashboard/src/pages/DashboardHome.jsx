import { useState, useEffect } from 'react';
import { Users, UserCheck, FileText, ClipboardList, Calendar, Megaphone, FolderKanban, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import ActivityFeed from '../components/ActivityFeed/ActivityFeed';

export default function DashboardHome() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, meetingsRes, tasksRes, announcementsRes, projectsRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/meetings'),
        api.get('/tasks'),
        api.get('/announcements'),
        api.get('/projects'),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.stats || statsRes.value.data);
      if (meetingsRes.status === 'fulfilled') setMeetings(meetingsRes.value.data.meetings || []);
      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value.data.tasks || []);
      if (announcementsRes.status === 'fulfilled') setAnnouncements(announcementsRes.value.data.announcements || []);
      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value.data.projects || []);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><div className="spinner"></div></div>;
  }

  const myTasks = isAdmin ? tasks : tasks.filter(t => t.assignedTo?._id === userProfile?._id || t.assignedTo?.email === userProfile?.email);
  const openTasks = myTasks.filter(t => t.status === 'open').length;
  const inProgressTasks = myTasks.filter(t => t.status === 'inProgress').length;
  const completedTasks = myTasks.filter(t => t.status === 'completed').length;
  const upcomingMeetings = meetings.filter(m => new Date(m.meetingDate) >= new Date()).sort((a, b) => new Date(a.meetingDate) - new Date(b.meetingDate)).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {isAdmin ? 'Team Dashboard' : `Welcome, ${userProfile?.name?.split(' ')[0] || 'User'}`}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isAdmin ? "Overview of your organization's activity" : "Here's your workspace overview"}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdmin && stats ? (
          <>
            <StatCard icon={Users} label="Total Members" value={stats.activeMembers || 0} color="bg-blue-500" />
            <StatCard icon={FileText} label="Pending Applications" value={stats.totalCandidates || 0} color="bg-amber-500" />
            <StatCard icon={ClipboardList} label="Open Tasks" value={openTasks} color="bg-purple-500" />
            <StatCard icon={TrendingUp} label="Completed Tasks" value={completedTasks} color="bg-emerald-500" />
          </>
        ) : (
          <>
            <StatCard icon={ClipboardList} label="Open Tasks" value={openTasks} color="bg-amber-500" />
            <StatCard icon={TrendingUp} label="In Progress" value={inProgressTasks} color="bg-blue-500" />
            <StatCard icon={UserCheck} label="Completed" value={completedTasks} color="bg-emerald-500" />
            <StatCard icon={Calendar} label="Upcoming Meetings" value={upcomingMeetings.length} color="bg-purple-500" />
          </>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Meetings */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#56051a]" />
            <h2 className="font-semibold text-slate-900">Upcoming Meetings</h2>
          </div>
          <div className="p-4 space-y-3">
            {upcomingMeetings.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No upcoming meetings scheduled</p>
            ) : (
              upcomingMeetings.map((m) => (
                <div key={m._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 bg-[#56051a]/10 text-[#56051a] rounded-lg flex items-center justify-center flex-shrink-0">
                    <CalendarIcon date={m.meetingDate} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{m.title}</p>
                    <p className="text-xs text-slate-500">{new Date(m.meetingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#56051a]" />
            <h2 className="font-semibold text-slate-900">Announcements</h2>
          </div>
          <div className="p-4 space-y-3">
            {announcements.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No announcements yet</p>
            ) : (
              announcements.slice(0, 5).map((a) => (
                <Link to="/announcements" key={a._id} className="block p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-slate-800">{a.title}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.message || a.description || ''}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(a.createdAt).toLocaleDateString()}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#56051a]" />
            <h2 className="font-semibold text-slate-900">{isAdmin ? 'All Tasks' : 'My Tasks'}</h2>
          </div>
          <div className="p-4 space-y-3">
            {myTasks.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No tasks found</p>
            ) : (
              myTasks.slice(0, 5).map((t) => (
                <Link to="/tasks" key={t._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <StatusBadge status={t.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                    <p className="text-xs text-slate-500">
                      {t.assignedTo?.name || 'Unassigned'}
                      {t.deadline && ` • Due: ${new Date(t.deadline).toLocaleDateString()}`}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-[#56051a]" />
            <h2 className="font-semibold text-slate-900">Project Progress</h2>
          </div>
          <div className="p-4 space-y-3">
            {projects.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No projects yet</p>
            ) : (
              projects.slice(0, 5).map((p) => (
                <Link to="/projects" key={p._id} className="block p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.title || p.name}</p>
                    <span className="text-xs font-medium text-[#56051a]">{p.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-[#56051a] h-2 rounded-full transition-all" style={{ width: `${p.progress || 0}%` }}></div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
        </div>

        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = { open: 'bg-amber-100 text-amber-700', inProgress: 'bg-blue-100 text-blue-700', completed: 'bg-emerald-100 text-emerald-700', pending_approval: 'bg-purple-100 text-purple-700' };
  return (
    <span className={`px-2 py-1 text-[10px] font-semibold uppercase rounded-md ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
      {status === 'inProgress' ? 'In Progress' : (status === 'pending_approval' ? 'Pending Approval' : status)}
    </span>
  );
}

function CalendarIcon({ date }) {
  const d = new Date(date);
  return (
    <div className="text-center leading-none">
      <p className="text-[10px] font-bold uppercase">{d.toLocaleDateString('en', { month: 'short' })}</p>
      <p className="text-sm font-bold">{d.getDate()}</p>
    </div>
  );
}
