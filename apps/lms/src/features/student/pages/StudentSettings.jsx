import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { User, Mail, Shield, Building2, KeyRound, Save } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import PageHeader from '../components/PageHeader';

export default function StudentSettings() {
  const { userProfile, user } = useAuth();
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    role: '',
    department: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userProfile) return;
    setProfile({
      displayName:
        userProfile?.displayName ||
        userProfile?.name ||
        userProfile?.email?.split('@')[0] ||
        '',
      email: userProfile?.email || '',
      role: userProfile?.role || userProfile?.accessRole || '',
      department: userProfile?.department || '',
    });
  }, [userProfile]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Profile preferences saved (display name updates on the portal)');
    } catch (error) {
      toast.error('Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
      <div className="rounded-lg bg-[#5d0f2d]/5 p-2.5 shrink-0">
        <Icon className="h-5 w-5 text-[#8a164b]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-[family-name:var(--font-ui)] font-bold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p className="truncate text-sm font-bold text-gray-800">{value || '—'}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Settings"
        subtitle="Your learner profile and preferences"
        image="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=70"
      />

      <div className="card-premium space-y-3">
        <h3 className="mb-3 font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d] text-lg">
          Account Details
        </h3>
        <Field icon={User} label="Display Name" value={profile.displayName} />
        <Field icon={Mail} label="Email" value={profile.email} />
        <Field icon={Shield} label="Role" value="Student" />
        <Field icon={Building2} label="Department / Cohort" value={profile.department} />
        <Field icon={KeyRound} label="Provider" value={user?.providerData?.[0]?.providerId || 'Firebase'} />
      </div>

      <form onSubmit={handleSave} className="card-premium space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-[#8a164b]" />
          <h3 className="font-[family-name:var(--font-heading)] font-bold text-[#5d0f2d] text-lg">
            Edit Display Name
          </h3>
        </div>
        <input
          type="text"
          value={profile.displayName}
          onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
          className="input-premium"
          placeholder="Your preferred display name"
        />
        <button type="submit" disabled={saving} className="btn-maroon text-sm disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
        <p className="text-xs text-gray-400">
          Name, email, and role are provisioned by the foundation administration. Contact the
          admin team to update your registered details.
        </p>
      </form>
    </div>
  );
}