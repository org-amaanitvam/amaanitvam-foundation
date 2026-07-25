import { useState, useEffect } from 'react';
import {
  BookOpen,
  Loader2,
  Calendar,
  Phone,
  Mail,
  Building,
} from 'lucide-react';
import api from '../../../config/api.js';
import toast from 'react-hot-toast';

export default function LearningHub() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const { data } = await api.get(
          '/public-forms/event-registrations',
        );

        setRegistrations(
          data?.registrations ||
            data?.data ||
            [],
        );
      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message ||
            'Failed to load webinar and competition registrations.',
        );
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-[#56051a]" />
            Learning Hub Registrations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage attendees for webinars and competitions
          </p>
        </div>

        <span className="bg-[#56051a]/10 text-[#56051a] px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
          {registrations.length} Total
        </span>
      </div>

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
                registrations.map((registration) => {
                  const registeredAt =
                    registration.registrationDate ||
                    registration.createdAt ||
                    registration.updatedAt;

                  return (
                    <tr
                      key={registration._id || registration.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">
                          {registration.name}
                        </p>
                        <div className="flex flex-col gap-1 mt-1">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {registration.email}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {registration.phone}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-block whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 bg-blue-50 text-blue-700 border border-blue-200">
                          {registration.type ||
                            'Webinar / Competition'}
                        </span>
                        <p className="text-sm font-medium text-slate-700">
                          {registration.event}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        {registration.organization ? (
                          <span className="text-sm text-slate-600 flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            {registration.organization}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Not provided
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {registration.message ? (
                          <p
                            className="text-sm text-slate-600 max-w-[240px] whitespace-pre-wrap break-words"
                            title={registration.message}
                          >
                            {registration.message}
                          </p>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            No message
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {registeredAt
                            ? new Date(
                                registeredAt,
                              ).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No webinar or competition registrations found yet.
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
