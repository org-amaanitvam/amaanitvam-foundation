import React from 'react';
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  Megaphone,
  Sparkles,
  ArrowRight,
  Video,
  CheckCircle2,
  ShieldCheck,
  Plus,
  UserCheck,
  LifeBuoy,
  Settings,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
  useUpcomingSessions,
  useTodayPunchStatus,
  useRecentAnnouncements,
} from '../hooks/useFacultyDashboardWidgets';

export default function FacultyDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { sessions, loading: loadingSessions } = useUpcomingSessions(userProfile?.uid);
  const { isPunchedIn } = useTodayPunchStatus(userProfile?.uid);
  const { announcements, loading: loadingAnnouncements } = useRecentAnnouncements();

  const handleLaunchMeeting = (meetingUrl) => {
    if (meetingUrl) {
      window.open(meetingUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-fade-in text-gray-900">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#5d0f2d] via-[#741339] via-[#8a164b] to-[#a11a58] rounded-3xl p-8 text-white shadow-2xl border border-rose-900/30">
        {/* Background Glowing Orbs */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-[#d4af37]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-16 w-64 h-64 bg-rose-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-extrabold text-rose-100 border border-white/20 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span>Faculty Command Center • Department of Engineering</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
              Welcome Back,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-100 to-white">
                {userProfile?.displayName || 'Prof. ABC'}!
              </span>
            </h1>

            <p className="text-sm sm:text-base text-rose-100/90 max-w-2xl font-medium leading-relaxed">
              Here is your daily academic overview. Review candidate applications, manage live classes, track attendance, and broadcast notices.
            </p>
          </div>

          {/* Quick Action Buttons on Hero */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/faculty/sessions')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#d4af37] hover:bg-[#b8952b] text-[#3d091d] font-black text-xs uppercase tracking-wider shadow-xl shadow-[#d4af37]/30 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Class</span>
            </button>

            <button
              onClick={() => navigate('/faculty/applications')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all duration-200"
            >
              <UserCheck className="w-4 h-4 text-[#d4af37]" />
              <span>Review Applications</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row (Vibrant Cards with Top Accent Line) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-3xl border border-rose-100/90 shadow-md hover:shadow-2xl hover:border-[#8a164b]/30 transition-all duration-300 group transform hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5d0f2d] to-[#8a164b]" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Applications</span>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5d0f2d]/10 to-[#8a164b]/20 text-[#5d0f2d] flex items-center justify-center font-bold border border-[#8a164b]/20 group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6 text-[#8a164b]" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-black text-gray-900 tracking-tight">3</h3>
            <p className="text-xs font-extrabold text-[#8a164b] mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#8a164b] animate-pulse" />
              Student & TA candidates
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-3xl border border-rose-100/90 shadow-md hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 group transform hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 to-indigo-600" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Enrolled</span>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500/10 to-indigo-500/20 text-indigo-700 flex items-center justify-center font-bold border border-indigo-200 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-black text-gray-900 tracking-tight">128</h3>
            <p className="text-xs font-extrabold text-indigo-600 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              98.2% Avg Attendance Rate
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-3xl border border-rose-100/90 shadow-md hover:shadow-2xl hover:border-amber-300 transition-all duration-300 group transform hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Live Classes Today</span>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/10 to-orange-500/20 text-amber-700 flex items-center justify-center font-bold border border-amber-200 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-black text-[#5d0f2d] tracking-tight">{sessions.length || 3}</h3>
            <p className="text-xs font-extrabold text-amber-600 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Next session in 2 hours
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-3xl border border-rose-100/90 shadow-md hover:shadow-2xl hover:border-emerald-300 transition-all duration-300 group transform hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Duty Status</span>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-transform group-hover:scale-110 ${
              isPunchedIn ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-black tracking-tight ${isPunchedIn ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isPunchedIn ? 'On Duty' : 'Off Duty'}
            </h3>
            <p className="text-xs font-extrabold text-gray-500 mt-1">
              {isPunchedIn ? 'Clocked in & active' : 'Click Attendance to Clock In'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Live Sessions & Announcements */}
        <div className="lg:col-span-2 space-y-8">
          {/* Live Sessions Widget */}
          <div className="bg-white/95 rounded-3xl border border-rose-100 shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-[#5d0f2d]/10 text-[#5d0f2d] border border-[#8a164b]/20">
                  <Video className="w-5 h-5 text-[#8a164b]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Upcoming Live Sessions</h3>
                  <p className="text-xs text-gray-500">Scheduled Google Meet & Zoom interactive classes</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/faculty/sessions')}
                className="flex items-center gap-1 text-xs font-extrabold text-[#8a164b] hover:text-[#5d0f2d] transition-colors"
              >
                <span>View Full Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loadingSessions ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-7 h-7 border-2 border-[#8a164b]/20 border-t-[#8a164b] rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-400">Loading schedule...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                No live sessions scheduled for today.
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((sess) => (
                  <div
                    key={sess._id || sess.id}
                    className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/40 to-white border border-rose-100 hover:border-[#8a164b]/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#8a164b]/10 text-[#8a164b] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#8a164b]/20">
                          {sess.courseName || 'Full Stack Web Dev'}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {sess.startTime ? new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#8a164b] transition-colors">
                        {sess.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleLaunchMeeting(sess.meetingUrl)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#5d0f2d] hover:bg-[#8a164b] text-white text-xs font-extrabold rounded-xl shadow-md shadow-[#5d0f2d]/20 transition-all self-end sm:self-center"
                    >
                      <Video className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Launch Class</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Broadcast Announcements Feed Widget */}
          <div className="bg-white/95 rounded-3xl border border-rose-100 shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-200">
                  <Megaphone className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Broadcast Notices Feed</h3>
                  <p className="text-xs text-gray-500">Recent announcements sent to enrolled student cohorts</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/faculty/announcements')}
                className="flex items-center gap-1 text-xs font-extrabold text-[#8a164b] hover:text-[#5d0f2d] transition-colors"
              >
                <span>Notice Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loadingAnnouncements ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-7 h-7 border-2 border-[#8a164b]/20 border-t-[#8a164b] rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-400">Loading notices...</p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                No active announcements found.
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann._id || ann.id}
                    className="p-4 rounded-2xl bg-white border border-rose-100 hover:border-rose-200 shadow-sm transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-[#8a164b] border border-rose-200">
                        {ann.category || 'Notice'}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">
                        {ann.created_at ? new Date(ann.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Today'}
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-900 text-sm">{ann.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{ann.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Workstation Shortcuts & Duty Control */}
        <div className="space-y-6">
          {/* Quick Workstation Duty Card */}
          <div className="bg-gradient-to-br from-[#5d0f2d] via-[#741339] to-[#8a164b] rounded-3xl p-6 text-white shadow-xl space-y-4 relative overflow-hidden border border-[#8a164b]/30">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#d4af37]/20 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37]">
              <Clock className="w-4 h-4 text-[#d4af37]" />
              <span>Shift Attendance Status</span>
            </div>

            <div>
              <h4 className="text-xl font-black text-white">
                {isPunchedIn ? 'Shift In Progress' : 'Ready to Start Duty?'}
              </h4>
              <p className="text-xs text-rose-100/80 mt-1">
                {isPunchedIn
                  ? 'Your active working hours are being logged for today.'
                  : 'Click Attendance Center to clock in for your shift.'}
              </p>
            </div>

            <button
              onClick={() => navigate('/faculty/attendance')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-[#3d091d] font-black text-xs transition-all shadow-md"
            >
              <span>Go to Attendance Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Links Navigation */}
          <div className="bg-white/95 rounded-3xl border border-rose-100 shadow-lg p-6 space-y-4">
            <h4 className="font-black text-[#5d0f2d] text-xs uppercase tracking-wider">
              Faculty Workstation Shortcuts
            </h4>

            <div className="space-y-2.5">
              <button
                onClick={() => navigate('/faculty/applications')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-rose-50/50 to-white hover:bg-rose-100/60 border border-rose-100 hover:border-[#8a164b]/30 transition-all text-left group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#5d0f2d]/10 text-[#5d0f2d] flex items-center justify-center font-bold">
                    <UserCheck className="w-4 h-4 text-[#8a164b]" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-xs group-hover:text-[#8a164b] transition-colors">
                      Applications Reviewer
                    </h5>
                    <p className="text-[11px] text-gray-500">Student & TA candidates</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#8a164b] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => navigate('/faculty/settings')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-rose-50/50 to-white hover:bg-rose-100/60 border border-rose-100 hover:border-[#8a164b]/30 transition-all text-left group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center font-bold">
                    <Settings className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-xs group-hover:text-[#8a164b] transition-colors">
                      Faculty Settings & Profile
                    </h5>
                    <p className="text-[11px] text-gray-500">Bio & office hours grid</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#8a164b] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => navigate('/faculty/help')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-rose-50/50 to-white hover:bg-rose-100/60 border border-rose-100 hover:border-[#8a164b]/30 transition-all text-left group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                    <LifeBuoy className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-xs group-hover:text-[#8a164b] transition-colors">
                      Help & Support Desk
                    </h5>
                    <p className="text-[11px] text-gray-500">FAQs & support tickets</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#8a164b] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => navigate('/faculty/attendance')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-rose-50/50 to-white hover:bg-rose-100/60 border border-rose-100 hover:border-[#8a164b]/30 transition-all text-left group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-xs group-hover:text-[#8a164b] transition-colors">
                      Student Attendance Roster
                    </h5>
                    <p className="text-[11px] text-gray-500">Class marking & CSV export</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#8a164b] group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
