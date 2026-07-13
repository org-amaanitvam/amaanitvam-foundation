import { useState, useEffect } from 'react';
import { MessageSquare, Loader2, Calendar, Phone, Mail, User } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Fetching from the contact API route
        const { data } = await api.get('http://localhost:5000/api/contact');
        if (data.success) {
          setMessages(data.data);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load contact messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
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
            <MessageSquare className="text-[#56051a]" /> Contact Messages
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage inquiries from the public website</p>
        </div>
        <span className="bg-[#56051a]/10 text-[#56051a] px-3 py-1 rounded-full text-sm font-semibold">
          {messages.length} Total
        </span>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Sender Details</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">Received On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <tr key={msg._id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Sender Details */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> {msg.name}
                      </p>
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {msg.email}
                        </span>
                        {msg.phone && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {msg.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Subject (Optional fallback) */}
                    <td className="px-6 py-4">
                      {msg.subject ? (
                        <p className="text-sm font-medium text-slate-700">{msg.subject}</p>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No subject</span>
                      )}
                    </td>

                    {/* Message */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 max-w-[300px] whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> 
                        {new Date(msg.createdAt || msg.date || Date.now()).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    No messages found yet.
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