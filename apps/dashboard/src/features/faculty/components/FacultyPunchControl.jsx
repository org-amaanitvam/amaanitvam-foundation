import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Calendar, ArrowRight, Play, Square, Award } from 'lucide-react';
import { punchInFaculty, punchOutFaculty, fetchFacultyPunchHistory } from '../services/attendanceApi';
import toast from 'react-hot-toast';

export default function FacultyPunchControl({ userProfile, isPunchedIn, onPunchToggle }) {
  const [loading, setLoading] = useState(false);
  const [punchLogs, setPunchLogs] = useState([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer effect when clocked in
  useEffect(() => {
    let interval = null;
    if (isPunchedIn) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isPunchedIn]);

  useEffect(() => {
    loadPunchHistory();
  }, [userProfile]);

  const loadPunchHistory = async () => {
    const userId = userProfile?.uid || userProfile?.id || 'faculty-current';
    const res = await fetchFacultyPunchHistory(userId);
    if (res.success && res.history) {
      setPunchLogs(res.history);
      const today = new Date().toISOString().split('T')[0];
      const todayLog = res.history.find((h) => h.date === today);
      if (todayLog && !todayLog.punchOut && !isPunchedIn) {
        onPunchToggle?.(true);
      }
    }
  };

  const handlePunchAction = async () => {
    setLoading(true);
    const userId = userProfile?.uid || userProfile?.id || 'faculty-current';
    try {
      if (isPunchedIn) {
        const res = await punchOutFaculty(userId);
        if (res.success) {
          toast.success('Clocked out successfully! Shift completed.');
          onPunchToggle?.(false);
          const now = new Date().toISOString();
          setPunchLogs((prev) =>
            prev.map((log) =>
              log.date === new Date().toISOString().split('T')[0] && !log.punchOut
                ? { ...log, punchOut: now, status: 'Completed' }
                : log
            )
          );
        } else {
          toast.error(res.message || 'Failed to clock out.');
        }
      } else {
        const res = await punchInFaculty(userId);
        if (res.success) {
          toast.success('Clocked in successfully! Have a productive shift.');
          onPunchToggle?.(true);
          const todayStr = new Date().toISOString().split('T')[0];
          const alreadyHasToday = punchLogs.some((l) => l.date === todayStr);
          if (!alreadyHasToday) {
            const newEntry = res.record || {
              _id: 'punch-' + Date.now(),
              date: todayStr,
              punchIn: new Date().toISOString(),
              punchOut: null,
              status: 'In Progress',
            };
            setPunchLogs((prev) => [newEntry, ...prev]);
          }
        } else {
          toast.error(res.message || 'Failed to clock in.');
        }
      }
    } catch (err) {
      toast.error('An error occurred during duty clock operation.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 text-gray-900">
      {/* Hero Work Duty Control Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#5d0f2d] via-[#741339] to-[#8a164b] rounded-3xl p-8 text-white shadow-2xl border border-rose-900/30">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#d4af37]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -top-12 w-48 h-48 bg-rose-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-extrabold text-rose-100 border border-white/20">
              <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Faculty Workstation Attendance</span>
            </div>
            <h3 className="text-3xl font-black text-white tracking-tight">
              {isPunchedIn ? 'Shift In Progress (On Duty)' : 'Ready to Start Duty?'}
            </h3>
            <p className="text-rose-100/90 text-sm max-w-md font-medium">
              Log your teaching hours, track session attendance, and manage academic workload seamlessly.
            </p>

            {isPunchedIn && (
              <div className="inline-block bg-black/25 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20">
                <p className="text-xs text-rose-200 uppercase tracking-wider font-extrabold">Active Shift Duration</p>
                <p className="text-2xl font-mono font-black text-[#d4af37]">{formatTimer(elapsedSeconds)}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handlePunchAction}
              disabled={loading}
              className={`group relative flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm tracking-wide shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 ${
                isPunchedIn
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-900/40 ring-4 ring-rose-500/20'
                  : 'bg-[#d4af37] hover:bg-[#b8952b] text-[#3d091d] shadow-[#d4af37]/30 ring-4 ring-[#d4af37]/30'
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isPunchedIn ? (
                <>
                  <Square className="w-5 h-5 fill-current" />
                  <span>{loading ? 'Processing...' : 'Clock Out Now'}</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>{loading ? 'Processing...' : 'Clock In Now'}</span>
                </>
              )}
            </button>
            <p className="text-xs text-rose-100/80 font-medium">
              {isPunchedIn ? 'Clocked in at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Click to start tracking your shift working hours'}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-md flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-extrabold uppercase">Days Present (This Month)</p>
            <h4 className="text-2xl font-black text-gray-900 mt-0.5">22 / 24 Days</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-md flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-extrabold uppercase">Avg Daily Shift Duration</p>
            <h4 className="text-2xl font-black text-[#5d0f2d] mt-0.5">7 hrs 45 mins</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-md flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8a164b]" />
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#8a164b] flex items-center justify-center font-bold border border-rose-100">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-extrabold uppercase">Punctuality Score</p>
            <h4 className="text-2xl font-black text-gray-900 mt-0.5">98.5% Excellent</h4>
          </div>
        </div>
      </div>

      {/* Shift Logs Table */}
      <div className="bg-white/95 rounded-3xl border border-rose-100 shadow-lg overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#8a164b]" />
            <h4 className="font-extrabold text-gray-900 text-sm">Faculty Work Hours & Shift Activity Log</h4>
          </div>
          <span className="text-xs text-[#8a164b] bg-rose-50 px-3 py-1 rounded-full font-bold border border-rose-200">
            Auto-synced with Server
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-rose-50/60 to-slate-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider font-extrabold">
                <th className="py-3.5 px-6 font-semibold">Date</th>
                <th className="py-3.5 px-6 font-semibold">Clock In</th>
                <th className="py-3.5 px-6 font-semibold">Clock Out</th>
                <th className="py-3.5 px-6 font-semibold">Total Hours</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {punchLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 text-xs font-medium">
                    No shift records found. Click 'Clock In Now' above to start tracking.
                  </td>
                </tr>
              ) : (
                punchLogs.map((log) => (
                  <tr key={log._id || log.date} className="hover:bg-rose-50/40 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-gray-900">{log.date}</td>
                    <td className="py-3.5 px-6 text-gray-600 font-medium">
                      {log.punchIn ? new Date(log.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="py-3.5 px-6 text-gray-600 font-medium">
                      {log.punchOut ? new Date(log.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'On Duty'}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-[#8a164b]">{log.totalHours ? `${log.totalHours} hrs` : 'Active'}</td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                          log.punchOut
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${log.punchOut ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {log.punchOut ? 'Completed' : 'On Duty'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
