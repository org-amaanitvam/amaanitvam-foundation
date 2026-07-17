import { useState, useEffect } from 'react';
import { BookOpen, Loader2, Calendar, Phone, Mail, Building } from 'lucide-react';
import api from '../../../config/api.js';
import toast from 'react-hot-toast';

export default function LearningHub() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const { data } = await api.get('/api/learning-hub');
        if (data.success) {
          setRegistrations(data.data);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load Learning Hub registrations');
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-[#56051a]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-[#56051a]" /> Learning Hub Registrations
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage attendees for Webinars & Competitions</p>
        </div>
        <span className="bg-[#56051a]/10 text-[#56051a] px-3 py-1 rounded-full text-sm font-semibold">
          {registrations.length} Total
        </span>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Participant Details</th>
                <th className="px-6 py-4">Event Info</th>
                <th className="px-6 py-4">Organization</th>
                <th className="px-6 py-4">Message / Query</th>
                <th className="px-6 py-4">Registered On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrations.length > 0 ? (
                registrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Participant Details */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{reg.name}</p>
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {reg.email}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {reg.phone}
                        </span>
                      </div>
                    </td>

                    {/* Event Info */}
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 ${
                        reg.type === 'Webinar' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {reg.type}
                      </span>
                      <p className="text-sm font-medium text-slate-700">{reg.event}</p>
                    </td>

                    {/* Organization */}
                    <td className="px-6 py-4">
                      {reg.organization ? (
                        <span className="text-sm text-slate-600 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {reg.organization}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not provided</span>
                      )}
                    </td>

                    {/* Message */}
                    <td className="px-6 py-4">
                      {reg.message ? (
                        <p className="text-sm text-slate-600 max-w-[200px] truncate" title={reg.message}>
                          {reg.message}
                        </p>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No message</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> 
                        {new Date(reg.registrationDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No registrations found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}