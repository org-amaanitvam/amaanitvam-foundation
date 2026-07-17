import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  BarChart3, Loader2, User, Calendar, Briefcase, 
  CheckCircle2, AlertCircle, Clock, Mail, Award, FileText, Users 
} from 'lucide-react';
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from 'react-hot-toast';

export default function MemberReportsPage() {
  const { userId } = useParams();
  const targetId = userId || '6a3fd53dde88c69c8011f90e';

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchJourneyReport = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/reports/member/${targetId}`);
      if (data.success) {
        setReport(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate member summary report');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJourneyReport(); }, [targetId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-10 h-10 text-[#56051a] animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">No performance data found for this member.</p>
      </div>
    );
  }

  const { basicDetails, metrics, timeline, appraisalSummary } = report;

  return (
    <div className="space-y-6">
      {/* 1. Module Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All Member Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Automated performance aggregation tracker.</p>
      </div>

      {/* 2. Core Member Meta Profile Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{basicDetails.name}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-0.5">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {basicDetails.email}</span>
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">ID: {basicDetails.memberId}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full uppercase tracking-wider border border-emerald-200">{basicDetails.status}</span>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full uppercase tracking-wider border border-purple-200">{basicDetails.role}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Department</span>
            <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-slate-400" /> {basicDetails.department || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Joining Date Milestone</span>
            <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" />{new Date(basicDetails.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* 3. New Manager Criteria Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <Users className="w-6 h-6 text-blue-500 mb-2"/><h4 className="text-xs font-semibold text-slate-400 uppercase">Meetings</h4>
          <p className="text-2xl font-bold text-slate-800">{appraisalSummary.meetingsAttended}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <FileText className="w-6 h-6 text-amber-500 mb-2"/><h4 className="text-xs font-semibold text-slate-400 uppercase">Projects</h4>
          <p className="text-2xl font-bold text-slate-800">{appraisalSummary.projectsWorkedOn}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <Award className="w-6 h-6 text-emerald-500 mb-2"/><h4 className="text-xs font-semibold text-slate-400 uppercase">Certificates</h4>
          <p className="text-2xl font-bold text-slate-800">{appraisalSummary.certificatesEarned}</p>
        </div>
      </div>

      {/* 4. Statistical Performance Metrics Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center"><h3 className="font-bold text-slate-800">Attendance Tracker</h3><span className="text-2xl font-black text-emerald-600 font-mono">{metrics.attendanceRate}%</span></div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium">
            <div className="bg-slate-50 p-2.5 rounded-xl border"><span className="text-slate-400 block mb-0.5">Total</span><span className="text-slate-800 text-base font-bold">{metrics.attendanceBreakdown.totalLogs}</span></div>
            <div className="bg-emerald-50/50 p-2.5 rounded-xl border"><span className="text-emerald-500 block mb-0.5">Present</span><span className="text-emerald-700 text-base font-bold">{metrics.attendanceBreakdown.present}</span></div>
            <div className="bg-amber-50/50 p-2.5 rounded-xl border"><span className="text-amber-500 block mb-0.5">Late</span><span className="text-amber-700 text-base font-bold">{metrics.attendanceBreakdown.late}</span></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center"><h3 className="font-bold text-slate-800">Task Performance</h3><span className="text-2xl font-black text-emerald-600 font-mono">{metrics.taskCompletionRate}%</span></div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium">
            <div className="bg-slate-50 p-2.5 rounded-xl border"><span className="text-slate-400 block mb-0.5">Total</span><span className="text-slate-800 text-base font-bold">{metrics.taskBreakdown.totalAssigned}</span></div>
            <div className="bg-emerald-50/50 p-2.5 rounded-xl border"><span className="text-emerald-500 block mb-0.5">Done</span><span className="text-emerald-700 text-base font-bold">{metrics.taskBreakdown.completed}</span></div>
            <div className="bg-rose-50/50 p-2.5 rounded-xl border"><span className="text-rose-500 block mb-0.5">Overdue</span><span className="text-rose-700 text-base font-bold">{metrics.taskBreakdown.overdue}</span></div>
          </div>
        </div>
      </div>

      {/* 5. Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 text-base mb-6">History Journey Log</h3>
        <div className="relative border-l-2 border-slate-100 ml-4 space-y-6">
          {timeline.map((event, index) => (
            <div key={index} className="relative pl-6">
              <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${event.type === 'milestone' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                {event.type === 'task_completed' ? <CheckCircle2 className="w-2.5 h-2.5 text-white" /> : <Clock className="w-2.5 h-2.5 text-white" />}
              </span>
              <div className="text-xs text-slate-400 font-mono">{new Date(event.date).toLocaleDateString()}</div>
              <h4 className="font-semibold text-sm text-slate-800">{event.title}</h4>
              <p className="text-sm text-slate-500">{event.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}