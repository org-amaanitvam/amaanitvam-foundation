import { useState, useEffect } from 'react';
import { Users, UserCog, Heart, Award } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({ totalCandidates: 0, totalMembers: 0, totalDonations: 0, totalCertificates: 0 });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(true);

  useEffect(() => {
    fetchStats();
    if (userProfile?.role === 'admin' || userProfile?.role === 'super_admin') {
      fetchRecentApplications();
      fetchRecentDonations();
    }
  }, [userProfile?.role]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.stats || res.data);
    } catch (err) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRecentApplications = async () => {
    try {
      const res = await api.get('/admin/candidates?limit=5');
      setRecentApplications(res.data.candidates || res.data || []);
    } catch (err) {
      toast.error('Failed to load recent applications');
    } finally {
      setLoadingApplications(false);
    }
  };

  const fetchRecentDonations = async () => {
    try {
      const res = await api.get('/admin/donations');
      const donations = res.data.donations || res.data || [];
      setRecentDonations(donations.slice(0, 5));
    } catch (err) {
      toast.error('Failed to load recent donations');
    } finally {
      setLoadingDonations(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-700',
      shortlisted: 'bg-emerald-50 text-emerald-700',
      rejected: 'bg-red-50 text-red-700',
      paid: 'bg-emerald-50 text-emerald-700',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const statCards = [
    { title: 'Total Candidates', value: stats.totalCandidates, icon: Users, bgColor: 'bg-[#56051a]/10', textColor: 'text-[#56051a]' },
    { title: 'Total Members', value: stats.activeMembers || stats.totalMembers, icon: UserCog, bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { title: 'Total Donations', value: stats.totalDonations, icon: Heart, bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
    { title: 'Certificates Issued', value: stats.certificatesIssued || stats.totalCertificates, icon: Award, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
  ];

  const SkeletonRow = ({ cols = 5 }) => (
    <tr className="border-b border-slate-50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );

  return (
    <div>
      {/* Topbar */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, {userProfile?.name || 'Admin'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between">
              <p className="text-sm font-medium text-slate-500">{card.title}</p>
              <div className={`${card.bgColor} ${card.textColor} rounded-lg w-10 h-10 flex items-center justify-center`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            {loadingStats ? (
              <div className="h-9 bg-slate-200 rounded animate-pulse w-20 mt-3" />
            ) : (
              <p className="text-3xl font-bold text-slate-800 mt-3">{card.value ?? 0}</p>
            )}
          </div>
        ))}
      </div>

      {/* Admin Only: Recent Applications & Donations */}
      {(userProfile?.role === 'admin' || userProfile?.role === 'super_admin') && (
        <>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm mb-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">Recent Applications</h2>
              <span className="text-sm text-slate-400">{recentApplications.length} shown</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Domain</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingApplications ? (
                    Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                  ) : recentApplications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400">
                        <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                        <p className="text-sm">No recent applications found.</p>
                      </td>
                    </tr>
                  ) : (
                    recentApplications.map((app) => (
                      <tr key={app._id || app.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{app.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{app.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{app.domain || app.track}</td>
                        <td className="px-6 py-4 text-sm">{getStatusBadge(app.status)}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN') : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm mb-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-800">Recent Donations</h2>
              <span className="text-sm text-slate-400">{recentDonations.length} shown</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Donor</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingDonations ? (
                    Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={4} />)
                  ) : recentDonations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-slate-400">
                        <Heart className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                        <p className="text-sm">No recent donations found.</p>
                      </td>
                    </tr>
                  ) : (
                    recentDonations.map((donation) => (
                      <tr key={donation._id || donation.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{donation.name || donation.donorName || 'Anonymous'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-semibold">
                          ₹{(donation.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {donation.createdAt ? new Date(donation.createdAt).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm">{getStatusBadge(donation.status || 'paid')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
