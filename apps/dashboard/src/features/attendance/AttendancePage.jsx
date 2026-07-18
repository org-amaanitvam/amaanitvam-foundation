import { useEffect, useState, useCallback } from 'react';
import { CalendarCheck, Clock, Loader2, LogIn, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function AttendancePage() {
  const { userProfile, user, loading: authLoading } = useAuth();
  
  // Safely grab the ID depending on how your auth context stores it
  const userId = userProfile?._id || userProfile?.uid || user?.uid || user?._id;

  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);

  const fetchAttendance = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      // Calls the history route we just built!
      const { data } = await api.get(`/attendance/member/${userId}`);
      
      const records = data.history || [];
      setHistory(records);

      // Check if we already punched in today
      const todayString = new Date().toISOString().split('T')[0];
      const todayData = records.find(r => r.date === todayString);
      setTodayRecord(todayData || null);

    } catch (error) {
      console.error(error);
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!authLoading) {
      fetchAttendance();
    }
  }, [authLoading, fetchAttendance]);

  const handlePunchIn = async () => {
    try {
      setLoading(true);
      await api.post('/attendance/punch-in', { userId });
      toast.success('Punched in successfully! Have a great shift! 🚀');
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to punch in');
    } finally {
      setLoading(false);
    }
  };

  const handlePunchOut = async () => {
    try {
      setLoading(true);
      await api.post('/attendance/punch-out', { userId });
      toast.success('Punched out successfully! Great work today! 🌟');
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to punch out');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (loading && history.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#56051a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#56051a]" />
            Time & Attendance
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Log your daily hours and view your attendance history.
          </p>
        </div>

        {/* Punch In / Out Controls */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
          {!todayRecord ? (
            <button
              onClick={handlePunchIn}
              disabled={loading}
              className="flex items-center gap-2 bg-[#56051a] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#7a0622] transition-colors disabled:opacity-70"
            >
              <LogIn className="w-4 h-4" />
              Punch In
            </button>
          ) : !todayRecord.punchOut ? (
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                Currently Clocked In
              </div>
              <button
                onClick={handlePunchOut}
                disabled={loading}
                className="flex items-center gap-2 bg-slate-800 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-700 transition-colors disabled:opacity-70"
              >
                <LogOut className="w-4 h-4" />
                Punch Out
              </button>
            </div>
          ) : (
            <div className="text-sm font-medium text-slate-600 bg-slate-200 px-4 py-2 rounded-lg">
              Shift Completed ({todayRecord.totalHours} hrs)
            </div>
          )}
        </div>
      </div>

      {/* History Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-[#56051a]" />
          <h2 className="text-lg font-bold text-slate-800">My Attendance History</h2>
        </div>

        {history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
            You don't have any attendance records yet. Punch in to get started!
          </div>
        ) : (
          <div className="grid gap-3">
            {history.map((record) => (
              <div key={record._id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-colors gap-4">
                
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-center min-w-[70px]">
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      {new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className="text-lg font-black text-[#56051a]">
                      {new Date(record.date).toLocaleDateString('en-US', { day: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border bg-emerald-100 text-emerald-700 border-emerald-200">
                      {record.status}
                    </span>
                    <p className="text-sm text-slate-500 mt-2 font-medium">
                      Punched In: {new Date(record.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  {record.punchOut ? (
                    <>
                      <p className="text-lg font-bold text-slate-800">{record.totalHours} Hours</p>
                      <p className="text-xs text-slate-400">
                        Out: {new Date(record.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-medium text-amber-600 animate-pulse">Shift in progress...</p>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 