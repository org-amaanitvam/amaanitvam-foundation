import { useState, useEffect } from 'react';
import { Save, Loader2, Server, Shield, Mail, CreditCard, Building2, Eye, EyeOff } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const [settings, setSettings] = useState({
    orgName: '',
    orgEmail: '',
    orgPhone: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    paymentGatewayKey: '',
    paymentGatewaySecret: '',
    enable2FA: false,
    maintenanceMode: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      if (res.data.settings) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-[#56051a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage global configuration for the NGO portals</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[#56051a] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#7a1e3a] transition-colors flex items-center gap-2 disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid gap-6">
        {/* Organization Details */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Organization Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
              <input type="text" name="orgName" value={settings.orgName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#56051a]/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
              <input type="email" name="orgEmail" value={settings.orgEmail} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#56051a]/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
              <input type="text" name="orgPhone" value={settings.orgPhone} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#56051a]/20" />
            </div>
          </div>
        </section>

        {/* Email & SMTP */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
            <Mail className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Email (SMTP) Settings</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Host</label>
              <input type="text" name="smtpHost" value={settings.smtpHost} onChange={handleChange} placeholder="smtp.gmail.com" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#56051a]/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Port</label>
              <input type="number" name="smtpPort" value={settings.smtpPort} onChange={handleChange} placeholder="587" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#56051a]/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Username</label>
              <input type="text" name="smtpUser" value={settings.smtpUser} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#56051a]/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Password (App Password)</label>
              <div className="relative">
                <input type={showPasswords.smtp ? "text" : "password"} name="smtpPass" value={settings.smtpPass} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#56051a]/20 pr-10" />
                <button type="button" onClick={() => togglePasswordVisibility('smtp')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPasswords.smtp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Gateway */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Payment Gateway (Razorpay)</h2>
          </div>
          <div className="p-6 grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Key ID</label>
              <input type="text" name="paymentGatewayKey" value={settings.paymentGatewayKey} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#56051a]/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Key Secret</label>
              <div className="relative">
                <input type={showPasswords.razorpay ? "text" : "password"} name="paymentGatewaySecret" value={settings.paymentGatewaySecret} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#56051a]/20 pr-10" />
                <button type="button" onClick={() => togglePasswordVisibility('razorpay')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPasswords.razorpay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Security Settings */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Security & Authentication</h2>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input type="checkbox" name="enable2FA" checked={settings.enable2FA} onChange={handleChange} className="w-5 h-5 text-[#56051a] rounded focus:ring-[#56051a]/20" />
              <div>
                <p className="font-medium text-slate-800">Enforce Two-Factor Authentication (2FA)</p>
                <p className="text-sm text-slate-500">Require all admins to set up 2FA for access</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-4 border border-rose-200 bg-rose-50 rounded-xl cursor-pointer hover:bg-rose-100 transition-colors">
              <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} className="w-5 h-5 text-rose-600 rounded focus:ring-rose-200" />
              <div>
                <p className="font-medium text-rose-900">Maintenance Mode</p>
                <p className="text-sm text-rose-700">Disable candidate applications and member portal access temporarily</p>
              </div>
            </label>
          </div>
        </section>

        <div className="text-center mt-8">
          <p className="text-sm text-slate-400">Settings changes are logged for security auditing purposes.</p>
        </div>
      </div>
    </div>
  );
}
