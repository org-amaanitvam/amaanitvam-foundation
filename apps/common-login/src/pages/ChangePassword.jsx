import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import toast from 'react-hot-toast';
import api from '../config/api.js';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';

const PASSWORD_RULES = [
  { test: (v) => v.length >= 10, label: 'At least 10 characters' },
  { test: (v) => /[A-Z]/.test(v), label: 'One uppercase letter' },
  { test: (v) => /[a-z]/.test(v), label: 'One lowercase letter' },
  { test: (v) => /\d/.test(v), label: 'One number' },
  { test: (v) => /[^A-Za-z0-9]/.test(v), label: 'One special character' },
];

export default function ChangePassword({ user }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const allPassed = PASSWORD_RULES.every((r) => r.test(newPassword));
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!allPassed) {
      setError('Password does not meet all requirements.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Try the backend endpoint first (updates mustChangePassword flag)
      try {
        await api.post('/auth/change-password', { newPassword });
      } catch {
        // Fallback to direct Firebase password update
        await updatePassword(user, newPassword);
      }

      toast.success('Password changed successfully! Please sign in again.');
      navigate('/login');
    } catch (err) {
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        setError('Current password is incorrect.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to change password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-brand-deep)] px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(216,161,95,0.15),transparent_50%)]" />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-brand-gold)]/20 to-[var(--color-brand-maroon)]/20 border border-white/10 mb-4">
            <ShieldCheck className="w-7 h-7 text-[var(--color-brand-gold)]" />
          </div>
          <h1 className="text-white text-2xl font-[family-name:var(--font-heading)] font-bold">
            Change Password
          </h1>
          <p className="text-white/50 text-sm mt-2">
            {user?.email ? `Signed in as ${user.email}` : 'Update your password to continue'}
          </p>
        </div>

        {/* Form card */}
        <div className="bg-[var(--color-brand-cream)] rounded-2xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 mb-5 flex items-start gap-2 animate-slide-down">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-brand-deep)] mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-brand-muted)]" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-[var(--color-brand-border)] py-2.5 pl-10 pr-11 text-sm text-[var(--color-brand-text)] outline-none focus:border-[var(--color-brand-maroon)] focus:ring-2 focus:ring-[var(--color-brand-maroon)]/10 transition-all bg-white placeholder-[#b3a297]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-deep)] transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-brand-deep)] mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-brand-muted)]" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-[var(--color-brand-border)] py-2.5 pl-10 pr-11 text-sm text-[var(--color-brand-text)] outline-none focus:border-[var(--color-brand-maroon)] focus:ring-2 focus:ring-[var(--color-brand-maroon)]/10 transition-all bg-white placeholder-[#b3a297]"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-deep)] transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength indicators */}
              {newPassword && (
                <div className="mt-3 space-y-1.5">
                  {PASSWORD_RULES.map((rule) => (
                    <div key={rule.label} className="flex items-center gap-2">
                      {rule.test(newPassword) ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span className={`text-[11px] ${rule.test(newPassword) ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-brand-deep)] mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-brand-muted)]" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-[var(--color-brand-text)] outline-none transition-all bg-white placeholder-[#b3a297] ${
                    confirmPassword
                      ? passwordsMatch
                        ? 'border-emerald-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                        : 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                      : 'border-[var(--color-brand-border)] focus:border-[var(--color-brand-maroon)] focus:ring-2 focus:ring-[var(--color-brand-maroon)]/10'
                  }`}
                />
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-red-500 text-[11px] mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/select-portal')}
                className="text-xs text-[var(--color-brand-muted)] hover:text-[var(--color-brand-deep)] bg-transparent transition-colors cursor-pointer flex items-center justify-center sm:justify-start gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Portals
              </button>

              <button
                type="submit"
                disabled={loading || !allPassed || !passwordsMatch}
                className="w-full sm:w-auto bg-[var(--color-brand-deep)] text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-full shadow-md hover:opacity-90 transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Updating…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
