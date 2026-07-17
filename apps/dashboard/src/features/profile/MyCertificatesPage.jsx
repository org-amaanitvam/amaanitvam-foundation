import { useEffect, useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/certificates/my');
      setCertificates(data.certificates || []);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || 'Failed to load certificates'
      );
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
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
        <h1 className="text-2xl font-bold text-slate-900">
          My Certificates
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          View your earned certificates
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400">
            No certificates available yet.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Certificate Title</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Issued On</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {certificates.map((certificate) => (
                  <tr key={certificate._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#56051a]" />
                      {certificate.title || 'Certificate'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {certificate.description || 'Certificate issued successfully'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString(
                        'en-IN',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }
                      ) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {certificate.certificateUrl ? (
                        <a
                          href={certificate.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-2 bg-[#56051a] text-white rounded-lg text-xs font-semibold hover:bg-[#7a1e3a] transition-colors shadow-sm"
                        >
                          View Certificate
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}