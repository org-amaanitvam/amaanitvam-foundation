import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Mail,
  Phone,
  Building,
  Calendar,
  Edit2,
  Loader2,
} from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { userProfile, checkAuth } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleEditClick = () => {
    setFormData({
      name: userProfile?.name || '',
      phone: userProfile?.phone || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      phone: '',
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setLoading(true);

      await api.put('/admin/me', {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      });

      toast.success('Profile updated successfully');

      if (checkAuth) {
        await checkAuth();
      }

      handleCancel();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = () => {
    const department = userProfile?.department;

    if (!department) return 'Not assigned';

    if (typeof department === 'string') return department;

    return (
      department.departmentName ||
      department.name ||
      department.title ||
      'Not assigned'
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

        <button
          onClick={handleEditClick}
          disabled={loading || !userProfile}
          className="px-4 py-2 bg-[#56051a] text-white rounded-xl font-medium text-sm hover:bg-[#7a1e3a] transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-linear-to-r from-[#56051a] to-[#7a1e3a] px-6 py-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto text-white text-3xl font-bold">
            {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <h2 className="text-xl font-bold text-white mt-3">
            {userProfile?.name || 'User'}
          </h2>

          <span className="inline-block mt-1 px-3 py-1 text-xs font-medium uppercase tracking-wide bg-white/20 text-white rounded-full">
            {userProfile?.role || 'member'}
          </span>
        </div>

        <div className="p-6 space-y-4">
          <ProfileRow
            icon={Mail}
            label="Email"
            value={userProfile?.email || "N/A"}
          />

          <ProfileRow
            icon={Phone}
            label="Phone"
            value={userProfile?.phone || "Not set"}
          /> 

          <ProfileRow
            icon={Building}
            label="Designation"
            value={userProfile?.designation || "Not assigned"}
          />

          <ProfileRow
            icon={Building}
            label="Department"
            value={userProfile?.department || "Not assigned"}
          />

          <ProfileRow
            icon={Building}
            label="Domain"
            value={userProfile?.domain || "Not assigned"}
          />

          <ProfileRow
            icon={Building}
            label="Member ID"
            value={userProfile?.memberId || "Not assigned"}
          />

          <ProfileRow
            icon={Building}
            label="Designation"
            value={userProfile?.designation || "Not assigned"}
          />

  <ProfileRow
    icon={Building}
    label="Department"
    value={userProfile?.department || "Not assigned"}
  />

  <ProfileRow
    icon={Building}
    label="Domain"
    value={userProfile?.domain || "Not assigned"}
  />

  <ProfileRow
    icon={Building}
    label="Member ID"
    value={userProfile?.memberId || "Not assigned"}
  />

  <ProfileRow
    icon={Calendar}
    label="Joined"
    value={
      userProfile?.joinedAt
        ? new Date(userProfile.joinedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "N/A"
    }
  />

        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Edit Profile
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={userProfile?.email || ''}
                  disabled
                  readOnly
                  className="w-full px-3 py-2 border rounded-xl text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Email address cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#56051a] rounded-xl hover:bg-[#7a1e3a] flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
      <Icon className="w-5 h-5 text-slate-400 shrink-0" />

      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-sm text-slate-800 font-medium wrap-break-word">
          {value || 'N/A'}
        </p>
      </div>
    </div>
  );
}
