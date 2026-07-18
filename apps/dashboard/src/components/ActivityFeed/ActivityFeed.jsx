import { useState, useEffect } from 'react';
import { Activity, Clock, Loader2, Calendar, ClipboardList, CheckCircle, Megaphone, FolderKanban } from 'lucide-react';
import api from "../../services/api";
import toast from 'react-hot-toast';

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data } = await api.get('/activities');
      setActivities(data.activities || []);
      setError(false);
    } catch (err) {
      setError(true);
      //toast.error('Failed to load recent activity');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Meeting Scheduled':
      case 'Meeting Minutes Uploaded':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'Task Created':
        return <ClipboardList className="w-4 h-4 text-blue-600" />;
      case 'Task Completed':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'Announcement Created':
        return <Megaphone className="w-4 h-4 text-amber-600" />;
      case 'Project Updated':
        return <FolderKanban className="w-4 h-4 text-[#56051a]" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'Meeting Scheduled':
      case 'Meeting Minutes Uploaded':
        return 'bg-purple-100';
      case 'Task Created':
        return 'bg-blue-100';
      case 'Task Completed':
        return 'bg-emerald-100';
      case 'Announcement Created':
        return 'bg-amber-100';
      case 'Project Updated':
        return 'bg-[#56051a]/10';
      default:
        return 'bg-slate-100';
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    if (seconds < 30) return "Just now";
    return Math.floor(seconds) + " seconds ago";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 h-full min-h-[300px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#56051a] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 h-full min-h-[300px] flex flex-col items-center justify-center text-center">
        <Activity className="w-8 h-8 text-red-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-800">Could not load activity</p>
        <button onClick={fetchActivities} className="mt-2 text-xs text-[#56051a] font-semibold hover:underline">Try Again</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full max-h-[500px]">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 shrink-0">
        <Activity className="w-4 h-4 text-[#56051a]" />
        <h2 className="font-semibold text-slate-900">Recent Activity</h2>
      </div>
      
      <div className="p-4 overflow-y-auto flex-1 space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No recent activity</p>
        ) : (
          <div className="relative border-l border-slate-200 ml-3 space-y-6 pb-2">
            {activities.map((activity) => (
              <div key={activity._id} className="relative pl-6">
                <span className={`absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white ${getBgColor(activity.actionType)}`}>
                  {getIcon(activity.actionType)}
                </span>
                
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {activity.title}
                  </p>
                  
                  {activity.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {activity.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] font-medium text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{timeAgo(activity.createdAt)}</span>
                    {activity.performedBy && (
                      <>
                        <span>•</span>
                        <span>by {activity.performedBy.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
