import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase.js';
import api from '../config/api.js';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

export default function LoginPage() {
  const [step, setStep] = useState('credentials'); // credentials | reset
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [orgName, setOrgName] = useState('Amaanitvam Foundation');
  const [logoFailed, setLogoFailed] = useState(false);
  const emailRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/public/settings');
        if (res.data?.settings?.orgName) setOrgName(res.data.settings.orgName);
      } catch {
        /* silent */
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    emailRef.current?.focus();
  }, [step]);

  const resolveEmail = async (value) => {
    const trimmed = String(value || '').trim();
    if (trimmed.includes('@')) return trimmed.toLowerCase();
    try {
      const res = await api.post('/auth/resolve-identifier', { identifier: trimmed });
      if (res.data?.success && res.data?.email) return res.data.email;
    } catch {
      /* fall through */
    }
    return trimmed.toLowerCase();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!identifier.trim()) {
      setError('Email or Unique ID is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      const email = await resolveEmail(identifier);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully!');
      navigate('/select-portal');
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else {
        setError(err.message || 'Failed to sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!identifier.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      const email = await resolveEmail(identifier);
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent. Check your inbox.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const orgFirst = orgName.split(' ')[0] || 'Amaanitvam';
  const orgRest = orgName.split(' ').slice(1).join(' ') || 'Foundation';

  return (
    <div className="af-shell">
      <div className="af-glow" />

      <div className="af-card">
        {/* ─── Brand panel (mirrors Dashboard / Admin auth screens) ─── */}
        <div className="af-brand">
          <img className="af-brand-photo" src="/assets/images/hero.jpg" alt="" aria-hidden="true"
               onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div className="af-brand-veil" />
          <div className="af-brand-dots" />

          <div className="af-brand-head">
            <div className="af-logo">
              {logoFailed ? (
                'AF'
              ) : (
                <img
                  src="/assets/images/logo.jpg"
                  alt={`${orgName} logo`}
                  onError={() => setLogoFailed(true)}
                />
              )}
            </div>
            <div>
              <div className="af-org">{orgFirst}</div>
              <div className="af-org-sub">{orgRest}</div>
            </div>
          </div>

          <div className="af-tagline">
            <h1>Welcome Back</h1>
            <p>
              Empowering Lives Through Education, Compassion, and Collective Action.
              Sign in once and open any Amaanitvam workspace.
            </p>
            <div className="af-chip-row">
              {['Admin Portal', 'Dashboard', 'Learning Portal'].map((label) => (
                <span className="af-chip" key={label}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="af-brand-foot">
            Empowering Communities &middot; Transparent Initiatives
          </div>
        </div>

        {/* ─── Form panel ─── */}
        <div className="af-panel">
          <div className="af-form-wrap">
            <div className="af-eyebrow">
              <span />
              <span>Unified Access</span>
            </div>
            <h2 className="af-title">
              {step === 'credentials' ? 'Sign In' : 'Reset Password'}
            </h2>

            <div className="af-tabs">
              {[
                { key: 'credentials', label: 'Sign In' },
                { key: 'reset', label: 'Reset' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  className={`af-tab${step === key ? ' is-active' : ''}`}
                  onClick={() => {
                    setStep(key);
                    setError('');
                    setSuccess('');
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {error && (
              <div className="af-alert is-error">
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="af-alert is-success">
                <CheckCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{success}</span>
              </div>
            )}

            {step === 'credentials' ? (
              <form className="af-form" onSubmit={handleLogin}>
                <div>
                  <label className="af-label" htmlFor="login-identifier">
                    Email or Unique ID
                  </label>
                  <div className="af-field">
                    <Mail className="af-icon" size={16} />
                    <input
                      ref={emailRef}
                      id="login-identifier"
                      name="identifier"
                      type="text"
                      autoComplete="username"
                      className="af-input"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="you@amaanitvam.org or JOHN001"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="af-label" htmlFor="login-password">
                    Password
                  </label>
                  <div className="af-field">
                    <Lock className="af-icon" size={16} />
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="af-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="af-toggle"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="af-row">
                  <label className="af-check">
                    <input type="checkbox" defaultChecked />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="af-link"
                    onClick={() => {
                      setStep('reset');
                      setError('');
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button type="submit" className="af-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Signing in…
                    </>
                  ) : (
                    <>
                      <LogIn size={16} /> Sign In
                    </>
                  )}
                </button>

                <p className="af-note">
                  One account, all portals. You will not be asked to sign in again
                  inside the portal you open.
                </p>
              </form>
            ) : (
              <form className="af-form" onSubmit={handleResetPassword}>
                <div>
                  <label className="af-label" htmlFor="reset-email">
                    Email Address
                  </label>
                  <div className="af-field">
                    <Mail className="af-icon" size={16} />
                    <input
                      ref={emailRef}
                      id="reset-email"
                      name="reset-email"
                      type="email"
                      className="af-input"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="you@amaanitvam.org"
                      required
                    />
                  </div>
                </div>

                <div className="af-row">
                  <button
                    type="button"
                    className="af-btn af-btn-ghost"
                    onClick={() => {
                      setStep('credentials');
                      setError('');
                      setSuccess('');
                    }}
                  >
                    <ArrowLeft size={14} /> Back to Sign In
                  </button>
                  <button
                    type="submit"
                    className="af-btn"
                    style={{ width: 'auto' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Mail size={14} />
                    )}
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
