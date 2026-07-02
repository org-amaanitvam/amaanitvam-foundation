import { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  FileText,
  ClipboardList,
  Calendar,
  Megaphone,
  FolderKanban,
  TrendingUp,
} from 'lucide-react';
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

  const isAdmin =
    userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsReq = (userProfile?.role === 'admin' || userProfile?.role === 'super_admin')
        ? api.get('/admin/stats')
        : Promise.resolve({ data: null });

      const [
        statsRes,
        meetingsRes,
        tasksRes,
        announcementsRes,
        projectsRes,
      ] = await Promise.allSettled([
        statsReq,
        api.get('/meetings'),
        api.get('/tasks'),
        api.get('/announcements'),
        api.get('/projects'),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data.stats || statsRes.value.data);
      }

      if (meetingsRes.status === 'fulfilled') {
        setMeetings(meetingsRes.value.data.meetings || []);
      }

      if (tasksRes.status === 'fulfilled') {
        setTasks(tasksRes.value.data.tasks || []);
      }

      if (announcementsRes.status === 'fulfilled') {
        setAnnouncements(announcementsRes.value.data.announcements || []);
      }

      if (projectsRes.status === 'fulfilled') {
        setProjects(projectsRes.value.data.projects || []);
      }
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="spinner"></div>
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

  const openTasks = myTasks.filter((t) => t.status === 'open').length;
  const inProgressTasks = myTasks.filter(
    (t) => t.status === 'inProgress'
  ).length;
  const completedTasks = myTasks.filter((t) => t.status === 'completed').length;

  const upcomingMeetings = meetings
    .filter((m) => new Date(m.meetingDate) >= new Date())
    .sort((a, b) => new Date(a.meetingDate) - new Date(b.meetingDate))
    .slice(0, 5);

  return (
    <div className="space-y-7 animate-fade-in">
      <div>
        <p className="text-xs font-ui font-bold uppercase tracking-[0.22em] text-gold">
          Dashboard Panel
        </p>

        <h1 className="mt-2 text-4xl font-heading font-bold text-primary tracking-tight">
          {isAdmin
            ? 'Team Dashboard'
            : `Welcome, ${userProfile?.name?.split(' ')[0] || 'User'}`}
        </h1>

        <p className="text-text-muted mt-2 font-body">
          {isAdmin
            ? "Overview of your organization's activity"
            : "Here's your workspace overview"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {isAdmin && stats ? (
          <>
            <StatCard
              icon={Users}
              label="Total Members"
              value={stats.activeMembers || 0}
              tone="primary"
            />
            <StatCard
              icon={FileText}
              label="Pending Applications"
              value={stats.totalCandidates || 0}
              tone="gold"
            />
            <StatCard
              icon={ClipboardList}
              label="Open Tasks"
              value={openTasks}
              tone="secondary"
            />
            <StatCard
              icon={TrendingUp}
              label="Completed Tasks"
              value={completedTasks}
              tone="dark"
            />
          </>
        ) : (
          <>
            <StatCard
              icon={ClipboardList}
              label="Open Tasks"
              value={openTasks}
              tone="gold"
            />
            <StatCard
              icon={TrendingUp}
              label="In Progress"
              value={inProgressTasks}
              tone="primary"
            />
            <StatCard
              icon={UserCheck}
              label="Completed"
              value={completedTasks}
              tone="secondary"
            />
            <StatCard
              icon={Calendar}
              label="Upcoming Meetings"
              value={upcomingMeetings.length}
              tone="dark"
            />
          </>
        )}
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PanelCard
              icon={Calendar}
              title="Upcoming Meetings"
              emptyText="No upcoming meetings scheduled"
            >
              {upcomingMeetings.map((m) => (
                <div
                  key={m._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-gold/10 transition-colors"
                >
                  <div className="w-11 h-11 bg-gold/20 text-primary rounded-xl flex items-center justify-center shrink-0">
                    <CalendarIcon date={m.meetingDate} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-ui font-semibold text-primary truncate">
                      {m.title}
                    </p>
                    <p className="text-xs text-text-muted">
                      {new Date(m.meetingDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </PanelCard>

            <PanelCard
              icon={Megaphone}
              title="Announcements"
              emptyText="No announcements yet"
            >
              {announcements.slice(0, 5).map((a) => (
                <Link
                  to="/announcements"
                  key={a._id}
                  className="block p-3 rounded-xl bg-background hover:bg-gold/10 transition-colors"
                >
                  <p className="text-sm font-ui font-semibold text-primary">
                    {a.title}
                  </p>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">
                    {a.message || a.description || ''}
                  </p>
                  <p className="text-xs text-text-muted/70 mt-1">
                    {a.createdAt
                      ? new Date(a.createdAt).toLocaleDateString('en-IN')
                      : ''}
                  </p>
                </Link>
              ))}
            </PanelCard>

            <PanelCard
              icon={ClipboardList}
              title={isAdmin ? 'All Tasks' : 'My Tasks'}
              emptyText="No tasks found"
            >
              {myTasks.slice(0, 5).map((t) => (
                <Link
                  to="/tasks"
                  key={t._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background hover:bg-gold/10 transition-colors"
                >
                  <StatusBadge status={t.status} />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-ui font-semibold text-primary truncate">
                      {t.title}
                    </p>
                    <p className="text-xs text-text-muted">
                      {t.assignedTo?.name || 'Unassigned'}
                      {t.deadline &&
                        ` • Due: ${new Date(t.deadline).toLocaleDateString(
                          'en-IN'
                        )}`}
                    </p>
                  </div>
                </Link>
              ))}
            </PanelCard>

            <PanelCard
              icon={FolderKanban}
              title="Project Progress"
              emptyText="No projects yet"
            >
              {projects.slice(0, 5).map((p) => (
                <Link
                  to="/projects"
                  key={p._id}
                  className="block p-3 rounded-xl bg-background hover:bg-gold/10 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2 gap-3">
                    <p className="text-sm font-ui font-semibold text-primary truncate">
                      {p.title || p.name}
                    </p>

                    <span className="text-xs font-ui font-bold text-gold">
                      {p.progress || 0}%
                    </span>
                  </div>

                  <div className="w-full bg-border-custom/60 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gold h-2 rounded-full transition-all"
                      style={{ width: `${p.progress || 0}%` }}
                    ></div>
                  </div>
                </Link>
              ))}
            </PanelCard>
          </div>
        </div>

        <div className="w-full xl:w-96 shrink-0">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone = 'primary' }) {
  const tones = {
    primary: 'bg-primary text-white',
    gold: 'bg-gold text-primary-dark',
    secondary: 'bg-secondary text-white',
    dark: 'bg-primary-dark text-white',
  };

  return (
    <div className="card-premium flex items-center gap-4">
      <div
        className={`w-12 h-12 ${tones[tone]} rounded-xl flex items-center justify-center shadow-sm`}
      >
        <Icon className="w-6 h-6" />
      </div>

      <div>
        <p className="text-3xl font-heading font-bold text-primary leading-none">
          {value}
        </p>
        <p className="text-xs text-text-muted font-ui font-semibold mt-1">
          {label}
        </p>
      </div>
    </div>
  );
}

function PanelCard({ icon: Icon, title, emptyText, children }) {
  const hasContent = Array.isArray(children) ? children.length > 0 : !!children;

  return (
    <div className="card-premium overflow-hidden p-0">
      <div className="px-6 py-4 border-b border-border-custom flex items-center gap-2 bg-background/60">
        <Icon className="w-4 h-4 text-gold" />
        <h2 className="font-heading text-xl font-bold text-primary">
          {title}
        </h2>
      </div>

      <div className="p-4 space-y-3">
        {!hasContent ? (
          <p className="text-sm text-text-muted text-center py-6">
            {emptyText}
          </p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    open: 'bg-gold/20 text-primary',
    inProgress: 'bg-secondary/20 text-primary',
    completed: 'bg-green-100 text-green-700',
    pending_approval: 'bg-primary/15 text-primary',
  };

  const label =
    status === 'inProgress'
      ? 'In Progress'
      : status === 'pending_approval'
        ? 'Pending Approval'
        : status || 'Open';

  return (
    <span
      className={`px-2 py-1 text-[10px] font-ui font-bold uppercase rounded-md ${colors[status] || 'bg-background text-text-muted'
        }`}
    >
      {label}
    </span>
  );
}

function CalendarIcon({ date }) {
  const d = new Date(date);

  return (
    <div className="text-center leading-none">
      <p className="text-[10px] font-ui font-bold uppercase">
        {d.toLocaleDateString('en-IN', { month: 'short' })}
      </p>
      <p className="text-sm font-ui font-bold">{d.getDate()}</p>
    </div>
  );
} 