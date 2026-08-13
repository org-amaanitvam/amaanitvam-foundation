import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserCheck,
  FileText,
  ClipboardList,
  CalendarDays,
  Calendar,
  Megaphone,
  FolderKanban,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from 'react-hot-toast';
import ActivityFeed from "../../components/ActivityFeed/ActivityFeed";
import AttendanceCard from "../attendance/AttendanceCard.jsx";
import DashboardStatCard from "../../components/common/DashboardStatCard";
import QuickActionButton from "../../components/common/QuickActionButton";
import GrowthAnalytics from "../../components/dashboard/GrowthAnalytics";

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

  const fetchDashboardData = useCallback(async () => {
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
        setStats(statsRes.value.data?.stats || statsRes.value.data);
      }

      if (meetingsRes.status === 'fulfilled') {
        setMeetings(meetingsRes.value.data.meetings || []);
      }

      if (tasksRes.status === 'fulfilled') {
        const taskData = tasksRes.value.data;
        const taskList = Array.isArray(taskData) ? taskData
          : Array.isArray(taskData.tasks) ? taskData.tasks
            : Array.isArray(taskData.data) ? taskData.data
              : [];
        setTasks(taskList);
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
  }, [userProfile?.role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  const myTasks = tasks;
  const openTasks = myTasks.filter((t) => t.status === 'open').length;
  const inProgressTasks = myTasks.filter((t) => t.status === 'inProgress').length;
  const completedTasks = myTasks.filter((t) => t.status === 'completed').length;
  const upcomingMeetings = meetings
    .filter((m) => new Date(m.meetingDate) >= new Date())
    .sort((a, b) => new Date(a.meetingDate) - new Date(b.meetingDate))
    .slice(0, 5);

  return (
    <div className="space-y-7 animate-fade-in">
      
      {/* Header Section */}
      <div className="rounded-3xl overflow-hidden bg-linear-to-r from-[#56051a] via-[#6f0b24] to-[#8b1730] text-white p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8">
          <div>
            <p className="uppercase tracking-[0.3em] text-[#d8a15f] text-xs font-bold">
              Dashboard Overview
            </p>
            <h1 className="mt-3 text-4xl lg:text-5xl font-extrabold text-white drop-shadow-lg">
              Good{" "}
              {new Date().getHours() < 12
                ? "Morning"
                : new Date().getHours() < 18
                  ? "Afternoon"
                  : "Evening"}
              , { "Member"} 👋
            </h1>
            <p className="mt-4 text-lg text-pink-100 max-w-xl leading-relaxed">
              Welcome back! Here's today's overview of your tasks, meetings and activities.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-md shadow-lg">
                <CalendarDays className="h-5 w-5 text-[#d8a15f]" />
                <span className="text-sm font-medium tracking-wide text-white">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <button
                className="rounded-xl border border-white/30 px-7 py-3 font-semibold text-white
               backdrop-blur-md transition-all duration-300
               hover:-translate-y-1 hover:border-white
               hover:bg-white hover:text-[#56051a]
               hover:shadow-xl active:scale-95"
              >
                View Tasks
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/15 hover:shadow-2xl">
              <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[#d8a15f]/10 blur-2xl"></div>
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/70">
                    Open Tasks
                  </p>
                  <h2 className="mt-3 text-5xl font-bold text-white">
                    {openTasks}
                  </h2>
                  <div className="mt-4 flex items-center gap-2 text-sm text-green-300">
                    <TrendingUp className="h-4 w-4" />
                    <span>+5% this week</span>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15">
                  <ClipboardList className="h-7 w-7 text-[#d8a15f]" />
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/15 hover:shadow-2xl">
              <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[#d8a15f]/10 blur-2xl"></div>
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/70">
                    Meetings
                  </p>
                  <h2 className="mt-3 text-5xl font-bold text-white">
                    {upcomingMeetings.length}
                  </h2>
                  <div className="mt-4 flex items-center gap-2 text-sm text-blue-300">
                    <CalendarDays className="h-4 w-4" />
                    <span>Upcoming</span>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15">
                  <CalendarDays className="h-7 w-7 text-[#d8a15f]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {isAdmin && stats ? (
          <>
            <DashboardStatCard
              title="Total Members"
              value={stats.activeMembers || 0}
              icon={Users}
              subtitle="Currently Active"
              trend="+12%"
              color="bg-[#56051a]"
            />
            <DashboardStatCard
              title="Applications"
              value={stats.totalCandidates || 0}
              icon={FileText}
              subtitle="Pending Review"
              trend="+4%"
              color="bg-[#d8a15f]"
            />
            <DashboardStatCard
              title="Open Tasks"
              value={openTasks}
              icon={ClipboardList}
              subtitle="Needs Attention"
              trend="+9%"
              color="bg-blue-600"
            />
            <DashboardStatCard
              title="Completed"
              value={completedTasks}
              icon={TrendingUp}
              subtitle="Finished Tasks"
              trend="+18%"
              color="bg-green-600"
            />
          </>
        ) : (
          <>
            <DashboardStatCard
              title="Open Tasks"
              value={openTasks}
              icon={ClipboardList}
              subtitle="Assigned"
              trend="+5%"
              color="bg-[#56051a]"
            />
            <DashboardStatCard
              title="In Progress"
              value={inProgressTasks}
              icon={TrendingUp}
              subtitle="Ongoing"
              trend="+2%"
              color="bg-blue-600"
            />
            <DashboardStatCard
              title="Completed"
              value={completedTasks}
              icon={UserCheck}
              subtitle="Finished"
              trend="+11%"
              color="bg-green-600"
            />
            <DashboardStatCard
              title="Meetings"
              value={upcomingMeetings.length}
              icon={Calendar}
              subtitle="Upcoming"
              trend="Today"
              color="bg-[#d8a15f]"
            />
          </>
        )}
      </div>

      {/* Middle Section (Attendance, Analytics, Quick Actions) */}
      <div className="space-y-8">
        <AttendanceCard />

        <GrowthAnalytics
          openTasks={openTasks}
          completedTasks={completedTasks}
          totalProjects={projects.length}
          totalMembers={stats?.activeMembers || 0}
        />

        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-md">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#8b1730]/5 blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-[#d8a15f]/10 blur-2xl"></div>

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8b1730]">
                Productivity
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Quick Actions
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-500">
                Access your most frequently used actions to manage projects,
                meetings and announcements faster.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-5">
            <QuickActionButton
              icon={FolderKanban}
              label="New Project"
              description="Create project"
              color="bg-blue-100 text-blue-600"
              onClick={() => {}}
              openLink="/tasks"
            />
            <QuickActionButton
              icon={ClipboardList}
              label="Assign Task"
              description="Manage tasks"
              color="bg-green-100 text-green-600"
              onClick={() => {}}
              openLink="/tasks"
            />
            <QuickActionButton
              icon={Megaphone}
              label="Announcement"
              description="Notify members"
              color="bg-orange-100 text-orange-600"
              onClick={() => {}}
              openLink="/announcements"
            />
            <QuickActionButton
              icon={Calendar}
              label="Meeting"
              description="Schedule meeting"
              color="bg-violet-100 text-violet-600"
              onClick={() => {}}
              openLink="/meetings"
            />
            <QuickActionButton
              icon={FileText}
              label="Reports"
              description="View analytics"
              color="bg-rose-100 text-rose-600"
              onClick={() => {}}
              openLink="/reports"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
