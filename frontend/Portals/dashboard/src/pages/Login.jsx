import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [orgName, setOrgName] = useState('Amaanitvam Foundation');

  const [is2FARequired, setIs2FARequired] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [code2fa, setCode2fa] = useState('');
  const [tempCredentials, setTempCredentials] = useState(null);

  const { user, login, resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${baseURL}/public/settings`);

        if (res.data.settings) {
          setIs2FARequired(Boolean(res.data.settings.enable2FA));
          if (res.data.settings.orgName) setOrgName(res.data.settings.orgName);
        }
      } catch (err) {
        console.error('Could not fetch public settings:', err);
      }
    };

    fetchSettings();
  }, []);

  if (user && !show2FA) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setResetSuccess('');

    if (is2FARequired) {
      setTempCredentials({ email, password });
      setShow2FA(true);
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (code2fa === '123456') {
        await login(tempCredentials.email, tempCredentials.password);
        navigate('/dashboard');
      } else {
        setError('Invalid verification code.');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setResetSuccess('');

    try {
      await resetPassword(resetEmail);
      setResetSuccess('Password reset email sent. Check your inbox.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(216,161,95,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(93,15,45,0.22),transparent_35%)]" />

      <div className="relative w-full max-w-md card-premium shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            {show2FA ? (
              <ShieldCheck className="w-8 h-8 text-gold" />
            ) : (
              <LayoutDashboard className="w-8 h-8 text-gold" />
            )}
          </div>

          <p className="text-xs font-ui font-bold uppercase tracking-[0.22em] text-gold">
            Dashboard Panel
          </p>

          <h1 className="mt-2 text-3xl font-heading font-bold text-primary">
            {orgName}
          </h1>

          <p className="text-sm text-text-muted mt-1">
            {show2FA ? 'Two-Factor Authentication' : 'Team Dashboard Login'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 mb-4">
            {error}
          </div>
        )}

        {resetSuccess && (
          <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl border border-green-100 mb-4">
            {resetSuccess}
          </div>
        )}

        {show2FA ? (
          <form onSubmit={handleVerify2FA} className="space-y-5 animate-fade-in">
            <p className="text-sm text-text-muted text-center">
              Enter the verification code sent to your registered device.
              <br />
              <span className="text-xs text-text-muted/70">
                Demo code: 123456
              </span>
            </p>

            <div>
              <label className="block text-sm font-ui font-semibold text-primary mb-1.5">
                Verification Code
              </label>
              <input
                type="text"
                required
                value={code2fa}
                onChange={(e) => setCode2fa(e.target.value)}
                className="input-premium w-full text-center text-xl tracking-widest font-semibold"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <button type="submit" disabled={isLoading} className="w-full btn-maroon">
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShow2FA(false);
                setTempCredentials(null);
                setCode2fa('');
              }}
              className="w-full flex items-center justify-center gap-2 text-sm font-ui font-semibold text-primary hover:text-gold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </form>
        ) : !showReset ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-ui font-semibold text-primary mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@amaanitvam.org"
                required
                className="input-premium w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-ui font-semibold text-primary mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="input-premium w-full"
              />
            </div>

            <button type="submit" disabled={isLoading} className="w-full btn-maroon">
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowReset(true);
                  setError('');
                }}
                className="text-sm text-primary font-ui font-semibold hover:text-gold"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-ui font-semibold text-primary mb-1.5">
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="you@amaanitvam.org"
                required
                className="input-premium w-full"
              />
            </div>

            <button type="submit" className="w-full btn-maroon">
              Send Reset Link
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowReset(false);
                  setError('');
                  setResetSuccess('');
                }}
                className="text-sm text-primary font-ui font-semibold hover:text-gold"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
