import { useState, useEffect, useRef } from 'react';
import { User, Camera, Save, Loader2, Mail, Phone, Building, Shield } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import api from '../../../config/api.js';
import toast from 'react-hot-toast';

export default function Profile() {
  const { userProfile, setUserProfile } = useAuth();
  const [formData, setFormData] = useState({ name: '', phone: '', department: '', designation: '',
  department: '',
  domain: '', });
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        designation: userProfile?.designation || '',
        department: userProfile.department || '',
        domain: userProfile?.domain || '',
      });
      setPreviewUrl(userProfile.profileImage || '');
    }
  }, [userProfile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let base64Image = null;
      if (profileImage) {
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(profileImage);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      }

      const payload = {
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
      };

      if (base64Image) {
        payload.profileImage = base64Image;
      }

      const res = await api.put('/admin/me', payload);
      setUserProfile(res.data.user);
      toast.success('Profile updated successfully!');
      setProfileImage(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-indigo-100 text-indigo-800',
      member: 'bg-blue-100 text-blue-800',
      intern: 'bg-slate-100 text-slate-700',
      volunteer: 'bg-amber-100 text-amber-800'
    };
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold capitalize ${styles[role] || styles.intern}`}>
        <Shield className="w-3 h-3" />
        {role?.replace('_', ' ')}
      </span>
    );
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#56051a]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="bg-linear-to-r from-[#56051a] to-[#7a1e3a] px-6 py-8 flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/30">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-white/70" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-50 transition-colors"
            >
              <Camera className="w-4 h-4 text-[#56051a]" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{userProfile.name}</h2>
            <p className="text-white/70 text-sm">{userProfile.email}</p>
            <div className="mt-2">{getRoleBadge(userProfile.role)}</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <User className="w-4 h-4" /> Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <Mail className="w-4 h-4" /> Email Address
            </label>
            <input
              type="email"
              value={userProfile.email}
              disabled
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed as it is linked to your login</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <Phone className="w-4 h-4" /> Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <Building className="w-4 h-4" /> Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a]/30"
              placeholder="Enter department"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#56051a] hover:bg-[#7a1e3a] text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
