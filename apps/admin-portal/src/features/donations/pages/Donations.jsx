import { useEffect, useMemo, useState } from 'react';
import {
  Heart,
  Download,
  IndianRupee,
  CalendarDays,
  Target,
  Plus,
  Edit3,
  Trash2,
  X,
} from 'lucide-react';
import api from '../../../config/api.js';
import toast from 'react-hot-toast';

const emptyCampaignForm = {
  title: '',
  description: '',
  goalAmount: '',
  raisedAmount: 0,
  status: 'active',
  category: 'General',
};

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function Donations() {
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [campaignForm, setCampaignForm] = useState(emptyCampaignForm);

  useEffect(() => {
    fetchDonations();
    fetchCampaigns();
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/donations');
      setDonations(res.data.donations || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setCampaignLoading(true);
    try {
      const res = await api.get('/admin/campaigns');
      setCampaigns(res.data.campaigns || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load campaigns');
    } finally {
      setCampaignLoading(false);
    }
  };

  const openCreateCampaign = () => {
    setEditingCampaign(null);
    setCampaignForm(emptyCampaignForm);
    setShowCampaignModal(true);
  };

  const openEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    setCampaignForm({
      title: campaign.title || '',
      description: campaign.description || '',
      goalAmount: campaign.goalAmount || '',
      raisedAmount: campaign.raisedAmount || 0,
      status: campaign.status || 'active',
      category: campaign.category || 'General',
    });
    setShowCampaignModal(true);
  };

  const saveCampaign = async (e) => {
    e.preventDefault();

    const payload = {
      ...campaignForm,
      goalAmount: Number(campaignForm.goalAmount),
      raisedAmount: Number(campaignForm.raisedAmount || 0),
    };

    try {
      if (editingCampaign?._id) {
        const res = await api.put(`/admin/campaigns/${editingCampaign._id}`, payload);
        setCampaigns((prev) => prev.map((item) => (item._id === editingCampaign._id ? res.data.campaign : item)));
        toast.success('Campaign updated');
      } else {
        const res = await api.post('/admin/campaigns', payload);
        setCampaigns((prev) => [res.data.campaign, ...prev]);
        toast.success('Campaign created');
      }

      setShowCampaignModal(false);
      setEditingCampaign(null);
      setCampaignForm(emptyCampaignForm);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save campaign');
    }
  };

  const deleteCampaign = async (campaign) => {
    const confirmed = window.confirm(`Delete or deactivate campaign "${campaign.title}"?`);
    if (!confirmed) return;

    try {
      const res = await api.delete(`/admin/campaigns/${campaign._id}`);
      if (res.data.campaign) {
        setCampaigns((prev) => prev.map((item) => (item._id === campaign._id ? res.data.campaign : item)));
      } else {
        setCampaigns((prev) => prev.filter((item) => item._id !== campaign._id));
      }
      toast.success(res.data.message || 'Campaign removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove campaign');
    }
  };

  const totals = useMemo(() => {
    const paid = donations.filter((d) => (d.status || 'paid') === 'paid');
    const totalAmount = paid.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const campaignAmount = paid
      .filter((d) => d.campaign || d.donationType === 'campaign')
      .reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const organizationAmount = totalAmount - campaignAmount;
    const now = new Date();
    const thisMonthAmount = paid
      .filter((d) => {
        const dateValue = d.createdAt || d.submissionTimestamp;
        if (!dateValue) return false;
        const date = new Date(dateValue);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, d) => sum + Number(d.amount || 0), 0);

    return { totalAmount, campaignAmount, organizationAmount, thisMonthAmount, totalTransactions: paid.length };
  }, [donations]);

  const exportCSV = () => {
    if (donations.length === 0) {
      toast.error('No donations to export');
      return;
    }

    const headers = ['Donor Name', 'Email', 'Amount', 'Donation Type', 'Campaign', 'Payment ID', 'Date', 'Status'];
    const rows = donations.map((d) => [
      d.name || d.donorName || 'Anonymous',
      d.email || '',
      d.amount || 0,
      d.donationType || (d.campaign ? 'campaign' : 'organization'),
      d.campaign?.title || d.campaignTitleSnapshot || 'Organization',
      d.razorpayPaymentId || d.paymentId || d.razorpay_payment_id || '',
      d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-IN') : '',
      d.status || 'paid',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `donations_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-emerald-50 text-emerald-700',
      created: 'bg-amber-50 text-amber-700',
      pending: 'bg-amber-50 text-amber-700',
      failed: 'bg-red-50 text-red-700',
      active: 'bg-emerald-50 text-emerald-700',
      completed: 'bg-blue-50 text-blue-700',
      inactive: 'bg-gray-100 text-gray-700',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
  };

  const statCards = [
    { title: 'Total Donations', value: formatCurrency(totals.totalAmount), icon: IndianRupee, bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { title: 'This Month', value: formatCurrency(totals.thisMonthAmount), icon: CalendarDays, bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
    { title: 'Organization Direct', value: formatCurrency(totals.organizationAmount), icon: Heart, bgColor: 'bg-rose-50', textColor: 'text-rose-600' },
    { title: 'Campaign Donations', value: formatCurrency(totals.campaignAmount), icon: Target, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donations & Campaigns</h1>
          <p className="text-sm text-gray-500">Track direct organization donations and active campaign donations separately.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={openCreateCampaign} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
            <Plus size={16} /> Add Campaign
          </button>
          <button onClick={exportCSV} className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-semibold">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '...' : card.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                  <Icon className={card.textColor} size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Fundraising Campaigns</h2>
            <p className="text-sm text-gray-500">Only campaigns marked active will be visible on the public donation form.</p>
          </div>
          <span className="text-sm font-semibold text-gray-600">{campaigns.length} Campaigns</span>
        </div>

        {campaignLoading ? (
          <div className="text-sm text-gray-500">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No campaigns yet. Create one to accept campaign-specific donations.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {campaigns.map((campaign) => {
              const progress = campaign.goalAmount > 0 ? Math.min(100, (Number(campaign.raisedAmount || 0) / Number(campaign.goalAmount)) * 100) : 0;
              return (
                <div key={campaign._id} className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{campaign.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{campaign.description || 'No description added.'}</p>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                      <span>{formatCurrency(campaign.raisedAmount)} raised</span>
                      <span>{formatCurrency(campaign.goalAmount)} goal</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white overflow-hidden">
                      <div className="h-full bg-[#56051a] rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{Math.round(progress)}% funded</p>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => openEditCampaign(campaign)} className="inline-flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-white">
                      <Edit3 size={14} /> Edit
                    </button>
                    <button onClick={() => deleteCampaign(campaign)} className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-red-100 text-red-600 rounded-lg hover:bg-red-50">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Recent Donations</h2>
          <p className="text-sm text-gray-500">Campaign column shows whether money went directly to the organization or a specific campaign.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-4">Donor</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Campaign</th>
                <th className="text-left p-4">Payment ID</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="p-6 text-center text-gray-500">Loading donations...</td></tr>
              ) : donations.length === 0 ? (
                <tr><td colSpan="7" className="p-10 text-center text-gray-500">No donations found.</td></tr>
              ) : (
                donations.map((donation) => (
                  <tr key={donation._id || donation.razorpayOrderId} className="border-t border-gray-100">
                    <td className="p-4 font-semibold text-gray-900">{donation.name || donation.donorName || 'Anonymous'}</td>
                    <td className="p-4 text-gray-600">{donation.email || '—'}</td>
                    <td className="p-4 font-bold text-gray-900">{formatCurrency(donation.amount)}</td>
                    <td className="p-4 text-gray-600">{donation.campaign?.title || donation.campaignTitleSnapshot || 'Organization Direct'}</td>
                    <td className="p-4 text-gray-600">{donation.razorpayPaymentId || donation.paymentId || donation.razorpay_payment_id || '—'}</td>
                    <td className="p-4 text-gray-600">{donation.createdAt ? new Date(donation.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="p-4">{getStatusBadge(donation.status || 'paid')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold">{editingCampaign ? 'Edit Campaign' : 'Add Campaign'}</h2>
              <button onClick={() => setShowCampaignModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>

            <form onSubmit={saveCampaign} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required value={campaignForm.title} onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea rows="3" value={campaignForm.description} onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Goal Amount</label>
                  <input type="number" min="1" required value={campaignForm.goalAmount} onChange={(e) => setCampaignForm({ ...campaignForm, goalAmount: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Raised Amount</label>
                  <input type="number" min="0" value={campaignForm.raisedAmount} onChange={(e) => setCampaignForm({ ...campaignForm, raisedAmount: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input value={campaignForm.category} onChange={(e) => setCampaignForm({ ...campaignForm, category: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={campaignForm.status} onChange={(e) => setCampaignForm({ ...campaignForm, status: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowCampaignModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="bg-[#56051a] text-white px-5 py-2 rounded-lg">{editingCampaign ? 'Save Changes' : 'Create Campaign'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
