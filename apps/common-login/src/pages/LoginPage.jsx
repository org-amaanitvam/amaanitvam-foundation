import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase.js';
import api from '../config/api.js';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
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
    <div className="login-page-wrapper">
      {/* Viewport ambient glowing orbs */}
      <div className="page-ambient-glow page-glow--1" aria-hidden="true" />
      <div className="page-ambient-glow page-glow--2" aria-hidden="true" />

      <main className="login-card-container">
      {/* ─── LEFT SIDE: DYNAMIC HERO SECTION ─── */}
      <div className="login-brand-side">
        {/* Ambient Drifting Glow Orbs */}
        <div className="brand-ambient-glow glow--1" aria-hidden="true" />
        <div className="brand-ambient-glow glow--2" aria-hidden="true" />

        <div className="brand-content-wrap">
          {/* Header Logo & Kicker */}
          <a href="https://amaanitvam.org" className="brand-logo-link">
            {logoFailed ? (
              <div className="brand-logo-fallback">AF</div>
            ) : (
              <img
                src="/assets/images/logo.jpg"
                alt={`${orgName} Logo`}
                className="brand-logo-img"
                onError={() => setLogoFailed(true)}
              />
            )}
            <div className="brand-logo-text">
              <span className="logo-title">{orgFirst}</span>
              <span className="logo-sub">{orgRest}</span>
            </div>
          </a>

          <div className="brand-kicker">
            <span className="kicker-pulse-dot" aria-hidden="true" />
            Section 8 Registered · NITI Aayog DARPAN Listed
          </div>

          {/* Dynamic Hero Content Pane */}
          <div className="hero-dynamic-pane">
            <h1 className="brand-portal-title">
              Unified Access <span className="title-gradient">Portal</span>
            </h1>

            <p className="brand-portal-subtitle">
              Empowering Lives Through Education, Compassion, and Collective Action.
              Sign in once to access all Amaanitvam workspaces.
            </p>

            {/* Accent Graphic Illustration */}
            <div className="portal-illustration-wrapper">
              <div className="illustration-glass-badge">
                <span className="material-symbols-outlined illustration-icon">shield_lock</span>
                <div className="illustration-halo" aria-hidden="true" />
              </div>
            </div>

            {/* Feature Cards (3 Cards) */}
            <div className="portal-feature-grid">
              <div className="portal-feature-card">
                <div className="feature-icon-box">
                  <span className="material-symbols-outlined">dashboard</span>
                </div>
                <div className="feature-text-box">
                  <span className="feature-title">Single Sign-On</span>
                  <span className="feature-desc">One account for Admin, Dashboard &amp; LMS</span>
                </div>
              </div>

              <div className="portal-feature-card">
                <div className="feature-icon-box">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <div className="feature-text-box">
                  <span className="feature-title">Role-Based Access</span>
                  <span className="feature-desc">Automatic routing to your assigned portal</span>
                </div>
              </div>

              <div className="portal-feature-card">
                <div className="feature-icon-box">
                  <span className="material-symbols-outlined">insights</span>
                </div>
                <div className="feature-text-box">
                  <span className="feature-title">Secure &amp; Transparent</span>
                  <span className="feature-desc">Protected sessions across all applications</span>
                </div>
              </div>
            </div>
          </div>

          <div className="brand-footer-note">
            <a href="https://amaanitvam.org" className="back-home-link">
              <ArrowLeft size={16} aria-hidden="true" />
              Return to Main Website
            </a>
          </div>
        </div>
      </div>

      {/* ─── RIGHT SIDE: GLASSMORPHISM LOGIN CARD ─── */}
      <div className="login-form-side">
        {/* Right side ambient background glow orbs */}
        <div className="form-ambient-glow glow--right-1" aria-hidden="true" />
        <div className="form-ambient-glow glow--right-2" aria-hidden="true" />

        <div className="login-card-glass">
          {/* Top Gold/Maroon Accent Line */}
          <div className="login-card-top-accent" aria-hidden="true" />

          {/* Header */}
          <div className="login-card-header">
            <span className="role-badge">
              <span className="role-badge-dot" aria-hidden="true" />
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>lock</span>
              <span>Unified Access</span>
            </span>
            <h2 className="login-card-title">
              {step === 'credentials' ? 'Welcome Back' : 'Reset Password'}
            </h2>
            <p className="login-card-desc">
              {step === 'credentials'
                ? 'Sign in with your email or Unique ID to access your portal.'
                : 'Enter your email address to receive a password reset link.'}
            </p>
          </div>

          {/* 2-Mode Switcher Tabs */}
          <div
            className="role-switcher-wrap"
            data-active-tab={step === 'credentials' ? '0' : '1'}
            role="tablist"
            aria-label="Auth Mode"
          >
            <button
              type="button"
              className={`role-tab ${step === 'credentials' ? 'active' : ''}`}
              role="tab"
              aria-selected={step === 'credentials'}
              onClick={() => {
                setStep('credentials');
                setError('');
                setSuccess('');
              }}
            >
              <span className="material-symbols-outlined">login</span>
              <span>Sign In</span>
            </button>

            <button
              type="button"
              className={`role-tab ${step === 'reset' ? 'active' : ''}`}
              role="tab"
              aria-selected={step === 'reset'}
              onClick={() => {
                setStep('reset');
                setError('');
                setSuccess('');
              }}
            >
              <span className="material-symbols-outlined">lock_reset</span>
              <span>Reset</span>
            </button>

            {/* Animated Tab Indicator Slider */}
            <div className="tab-indicator-slider-2" aria-hidden="true" />
          </div>

          {/* Alert Banner */}
          {error && (
            <div className="login-alert login-alert--error" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="login-alert login-alert--info" role="alert">
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          {step === 'credentials' ? (
            <form className="login-form" onSubmit={handleLogin} noValidate>
              {/* Input Group: Email / Identifier */}
              <div className="form-group">
                <label className="form-label" htmlFor="loginIdentifier">
                  Email or Unique ID
                </label>
                <div className="input-input-wrap">
                  <div className="input-icon-box" aria-hidden="true">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <input
                    ref={emailRef}
                    id="loginIdentifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    className="form-input"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@amaanitvam.org or JOHN001"
                    required
                  />
                </div>
              </div>

              {/* Input Group: Password */}
              <div className="form-group">
                <div className="label-row">
                  <label className="form-label" htmlFor="loginPassword">
                    Password
                  </label>
                  <button
                    type="button"
                    className="forgot-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onClick={() => {
                      setStep('reset');
                      setError('');
                      setSuccess('');
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="input-input-wrap">
                  <div className="input-icon-box" aria-hidden="true">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                  <input
                    id="loginPassword"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="pwd-toggle-btn"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Options Row: Remember Me */}
              <div className="form-options-row">
                <label className="custom-checkbox-label">
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    defaultChecked
                  />
                  <span className="checkbox-custom-box">
                    <span className="material-symbols-outlined">check</span>
                  </span>
                  <span className="checkbox-text">Keep me logged in</span>
                </label>
              </div>

              {/* Submit Button */}
              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-loader" aria-hidden="true" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span className="btn-text">Sign In</span>
                    <span className="material-symbols-outlined btn-icon" aria-hidden="true">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleResetPassword} noValidate>
              {/* Input Group: Reset Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="resetEmail">
                  Email Address
                </label>
                <div className="input-input-wrap">
                  <div className="input-icon-box" aria-hidden="true">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <input
                    ref={emailRef}
                    id="resetEmail"
                    name="reset-email"
                    type="email"
                    className="form-input"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@amaanitvam.org"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <button
                  type="button"
                  className="login-submit-btn"
                  style={{
                    background: 'rgba(93, 15, 45, 0.08)',
                    color: 'var(--portal-primary)',
                    boxShadow: 'none',
                    flex: 1,
                  }}
                  onClick={() => {
                    setStep('credentials');
                    setError('');
                    setSuccess('');
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <button
                  type="submit"
                  className="login-submit-btn"
                  style={{ flex: 2 }}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-loader" aria-hidden="true" />
                  ) : (
                    <>
                      <span className="btn-text">Send Reset Link</span>
                      <span className="material-symbols-outlined btn-icon" aria-hidden="true">
                        mail
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer Assistance */}
          <div className="login-card-footer">
            <p>
              One account, all portals. Need assistance?{' '}
              <a href="https://amaanitvam.org/contact" className="portal-link">
                Contact Administrator
              </a>
            </p>
          </div>

          {/* Security Trust Badges */}
          <div className="trust-badges-row">
            <span className="trust-chip">
              <span className="material-symbols-outlined">verified</span> 256-Bit SSL
            </span>
            <span className="trust-chip">
              <span className="material-symbols-outlined">shield</span> Single Sign-On
            </span>
            <span className="trust-chip">
              <span className="material-symbols-outlined">lock</span> Protected Session
            </span>
          </div>
        </div>
      </div>
    </main>
    </div>
  );
}
