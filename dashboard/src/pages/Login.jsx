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
  
  // 2FA states
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [code2fa, setCode2fa] = useState('');
  const [tempCredentials, setTempCredentials] = useState(null);

  const { user, login, resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch public settings for 2FA flag and org name
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/public/settings`);
        if (res.data.settings) {
          setIs2FARequired(res.data.settings.enable2FA);
          if (res.data.settings.orgName) setOrgName(res.data.settings.orgName);
        }
      } catch (err) {
        console.error('Could not fetch public settings', err);
      }
    };
    fetchSettings();
  }, []);

  if (user && !show2FA) return <Navigate to="/" replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (is2FARequired) {
      setTempCredentials({ email, password });
      setShow2FA(true);
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
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
      if (code2fa === '123456') { // Mock SMS verification code
        await login(tempCredentials.email, tempCredentials.password);
        navigate('/');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#1a1a2e] to-[#56051a] px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-[#56051a] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#56051a]/30">
            {show2FA ? <ShieldCheck className="w-7 h-7 text-white" /> : <LayoutDashboard className="w-7 h-7 text-white" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{orgName}</h1>
          <p className="text-sm text-slate-500 mt-1">{show2FA ? 'Two-Factor Authentication' : 'Team Dashboard'}</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 mb-4">{error}</div>}
        {resetSuccess && <div className="bg-green-50 text-green-600 text-sm p-3 rounded-xl border border-green-100 mb-4">{resetSuccess}</div>}

        {show2FA ? (
          <form onSubmit={handleVerify2FA} className="space-y-4 animate-fade-in">
            <p className="text-sm text-slate-600 text-center mb-6">
              Enter the verification code sent to your registered device. <br/>
              <span className="text-xs text-slate-400">(For demo purposes, enter: 123456)</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Verification Code</label>
              <input
                type="text"
                required
                value={code2fa}
                onChange={(e) => setCode2fa(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#56051a] focus:border-transparent transition-all tracking-widest text-center text-xl font-semibold"
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#56051a] text-white py-3 rounded-xl font-semibold hover:bg-[#7a1e3a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#56051a] transition-all disabled:opacity-50 mt-4"
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
            <button
              type="button"
              onClick={() => { setShow2FA(false); setTempCredentials(null); setCode2fa(''); }}
              className="w-full mt-4 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </button>
          </form>
        ) : !showReset ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@amaanitvam.org" required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a] transition-all" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a] transition-all" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#56051a] hover:bg-[#7a1e3a] text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
            <div className="text-center pt-1">
              <button type="button" onClick={() => { setShowReset(true); setError(''); }} className="text-sm text-[#56051a] font-semibold hover:underline bg-transparent border-none cursor-pointer">Forgot Password?</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input id="reset-email" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="you@amaanitvam.org" required className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#56051a]/20 focus:border-[#56051a] transition-all" />
            </div>
            <button type="submit" className="w-full py-3 bg-[#56051a] hover:bg-[#7a1e3a] text-white font-semibold rounded-xl transition-all duration-200">Send Reset Link</button>
            <div className="text-center pt-1">
              <button type="button" onClick={() => { setShowReset(false); setError(''); setResetSuccess(''); }} className="text-sm text-[#56051a] font-semibold hover:underline bg-transparent border-none cursor-pointer">Back to Sign In</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
