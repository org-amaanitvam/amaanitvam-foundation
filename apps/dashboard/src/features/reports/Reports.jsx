import { useEffect, useState } from 'react';
import { BarChart, CheckCircle, Calendar, Activity, Loader2 } from 'lucide-react';
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from 'react-hot-toast';

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const authContext = useAuth(); 
  const user = authContext?.userProfile || authContext?.user;
  const userId = user?.uid || user?._id || user?.id; 

  useEffect(() => {
    if (authContext?.loading) return;
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/reports/member/${userId}`);
        if (data.success) {
          setReportData(data.data);
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
        toast.error('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [authContext?.loading, userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin w-10 h-10 text-[#56051a]" />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-slate-500">
        No report data available.
      </div>
    );
  }

  const { basicDetails, metrics, appraisalSummary, timeline } = reportData;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart className="w-6 h-6 text-[#56051a]" />
          My Performance Report
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Analytics and activity summary for {basicDetails.name} ({basicDetails.memberId})
        </p>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Attendance Rate</p>
            <h3 className="text-3xl font-bold text-slate-800">{metrics.attendanceRate}%</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Task Completion</p>
            <h3 className="text-3xl font-bold text-slate-800">{metrics.taskCompletionRate}%</h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-full">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Appraisal Summary Grid */}
      <h2 className="text-lg font-bold text-slate-800 mt-8 mb-4">Appraisal Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-2xl font-bold text-[#56051a]">{appraisalSummary.meetingsAttended}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">Meetings</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-2xl font-bold text-[#56051a]">{appraisalSummary.projectsWorkedOn}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">Projects</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-2xl font-bold text-[#56051a]">{appraisalSummary.certificatesEarned}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">Certificates</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <p className="text-2xl font-bold text-[#56051a]">{appraisalSummary.workUpdatesCount}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">Tasks Assigned</p>
        </div>
      </div>

      {/* Task Breakdown Details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Task Breakdown
          </h3>
        </div>
        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
           <div>
             <p className="text-xl font-semibold text-slate-700">{metrics.taskBreakdown.completed}</p>
             <p className="text-xs text-slate-500">Completed</p>
           </div>
           <div>
             <p className="text-xl font-semibold text-blue-600">{metrics.taskBreakdown.inProgress}</p>
             <p className="text-xs text-slate-500">In Progress</p>
           </div>
           <div>
             <p className="text-xl font-semibold text-orange-500">{metrics.taskBreakdown.pendingApproval}</p>
             <p className="text-xs text-slate-500">Pending Review</p>
           </div>
           <div>
             <p className="text-xl font-semibold text-red-600">{metrics.taskBreakdown.overdue}</p>
             <p className="text-xs text-slate-500">Overdue</p>
           </div>
        </div>
      </div>

      {/* Timeline Section */}
      <h2 className="text-lg font-bold text-slate-800 mt-8 mb-4">Recent Activity Timeline</h2>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {timeline && timeline.length > 0 ? (
          <div className="space-y-6">
            {/* Reversing to show newest first */}
            {[...timeline].reverse().slice(0, 10).map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="mt-1">
                  <div className="w-3 h-3 rounded-full bg-[#56051a]"></div>
                  {index !== timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-slate-200 mx-auto mt-2"></div>
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-semibold text-slate-800">{event.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{event.description}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(event.date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No recent activity recorded.</p>
        )}
      </div>
    </div>
  );
}