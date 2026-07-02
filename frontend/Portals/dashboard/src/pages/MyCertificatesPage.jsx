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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {certificates.map((certificate) => (
            <div
              key={certificate._id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow"
            >
              <Shield className="w-8 h-8 text-[#56051a] mb-3" />

              <h3 className="font-semibold text-slate-800">
                {certificate.title || 'Certificate'}
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                {certificate.description || 'Certificate issued successfully'}
              </p>

              {certificate.issuedAt && (
                <p className="text-xs text-slate-400 mt-3">
                  Issued on{' '}
                  {new Date(certificate.issuedAt).toLocaleDateString(
                    'en-IN',
                    {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }
                  )}
                </p>
              )}

              {certificate.certificateUrl && (
                <a
                  href={certificate.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-4 py-2 bg-[#56051a] text-white rounded-lg text-sm hover:bg-[#7a1e3a] transition-colors"
                >
                  View Certificate
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
