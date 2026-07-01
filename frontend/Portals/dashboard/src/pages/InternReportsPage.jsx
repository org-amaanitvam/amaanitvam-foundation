import { useEffect, useState } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

export default function InternReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const { data } = await api.get('/reports');

      setReports(data.reports || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-[#56051a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Intern Reports</h1>
        <p className="text-sm text-slate-500 mt-1">
          View and manage intern performance reports
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400">No reports found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow"
            >
              <h3 className="font-semibold text-slate-800">
                {report.title || report.internName || 'Intern Report'}
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                {report.description || report.summary || 'No summary available'}
              </p>

              {report.createdAt && (
                <p className="text-xs text-slate-400 mt-3">
                  {new Date(report.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
