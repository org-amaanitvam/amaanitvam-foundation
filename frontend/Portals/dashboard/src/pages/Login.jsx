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
    <div className="min-h-screen flex items-center justify-center bg-[#6b1d44] px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(216,161,95,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(93,15,45,0.22),transparent_35%)]" />

      {/* Transparent Wrapper Container for alignment */}
      <div className="w-full max-w-220 h-auto md:h-130 bg-transparent rounded-2xl flex flex-col md:flex-row overflow-hidden relative z-10 shadow-2xl">
        
        {/* Left Sidebar Accent Panel with Increased Branding Size & Tagline */}
        <div className="w-full md:w-[42%] bg-linear-to-br from-[#8a164b] to-[#690b31] relative flex flex-col justify-between overflow-hidden p-6 md:p-8 rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl">
          <div className="absolute inset-0 bg-white/10 rotate-45 -top-1/2 -left-1/2 w-[200%] h-[200%] pointer-events-none"></div>
          <div className="absolute inset-0 bg-black/5 rotate-30 -top-1/2 left-[-80%] w-[200%] h-[200%] pointer-events-none"></div>
          
          {/* Brand Header Container */}
          <div className="z-10 w-full border-b border-white/10 pb-6">
            <div className="flex flex-row items-center gap-4">
              {/* Increased logo size from h-12 w-12 to h-16 w-16 */}
              <img 
                alt="Amaanitvam Foundation" 
                className="brand-logo h-16 w-16 object-contain bg-white p-1.5 rounded-xl shadow-md shrink-0" 
                src="assets/images/logo.jpg" 
              />
              <div className="flex flex-col justify-center">
                {/* Increased typography size from text-xl to text-2xl */}
                <h1 className="text-4xl font-heading font-black text-white tracking-tight leading-none uppercase">
                  {orgName.split(' ')[0] || 'Amaanitvam'}
                </h1>
                {/* Increased tracking size and layout scale from text-[10px] to text-xs */}
                <p className="text-xl font-ui text-yellow-500 uppercase tracking-[0.2em] font-bold mt-1.5 leading-none">
                  {orgName.split(' ').slice(1).join(' ') || 'Foundation'}
                </p>
              </div>
            </div>
          </div>

          {/* Tagline Section */}
          <div className="z-10 my-auto py-6">
            <p className="text-white text-xl md:text-base leading-relaxed font-light font-sans tracking-wide">
              Empowering Lives Through Education, Compassion, and Collective Action. A student-led movement inspiring learning, responsibility, and positive change for a stronger society.
            </p>
          </div>
          
          <div className="hidden md:block h-6" />
        </div>

        {/* Right Form Component Body - Solid White Background */}
        <div className="flex-1 flex flex-col justify-center p-8 md:p-10 bg-white rounded-b-2xl md:rounded-bl-none md:rounded-r-2xl">
          <div className="w-full flex flex-col items-center">
            
            

            {/* Upper Tab Toggles Integration */}
            <div className="flex justify-center gap-6 mb-6 w-full max-w-[320px] border-b border-gray-200 pb-3">
              <button
                type="button"
                disabled={show2FA}
                onClick={() => { setShowReset(false); setError(''); setResetSuccess(''); }}
                className={`text-sm font-bold uppercase tracking-widest pb-1 cursor-pointer transition-all duration-200 disabled:opacity-40 ${
                  !showReset && !show2FA
                    ? 'text-[#6b1d44] border-b-2 border-[#6b1d44] font-black'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                disabled={show2FA}
                onClick={() => { setShowReset(true); setError(''); }}
                className={`text-sm font-bold uppercase tracking-widest pb-1 cursor-pointer transition-all duration-200 disabled:opacity-40 ${
                  showReset && !show2FA
                    ? 'text-[#6b1d44] border-b-2 border-[#6b1d44] font-black'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                Reset
              </button>
            </div>

            {/* Form Details Header Block */}
            <div className="text-center mb-6 w-full max-w-[320px]">
              <h2 className="text-gray-800 text-2xl font-black tracking-widest uppercase">
                {show2FA ? 'Two-Factor Authentication' : !showReset ? 'Dashboard Login' : 'Reset Password'}
              </h2>
            </div>

            {error && (
              <div className="w-full max-w-[320px] bg-red-50 text-red-700 text-xs p-2.5 rounded-lg border border-red-200 mb-4 text-center">
                {error}
              </div>
            )}
            
            {resetSuccess && (
              <div className="w-full max-w-[320px] bg-green-50 text-green-700 text-xs p-2.5 rounded-lg border border-green-200 mb-4 text-center">
                {resetSuccess}
              </div>
            )}

            {show2FA ? (
              /* Two-Factor Authentication View Form */
              <form onSubmit={handleVerify2FA} className="w-full max-w-[320px] flex flex-col items-center">
                <p className="text-xs text-gray-500 text-center mb-4 leading-relaxed">
                  Enter the verification code sent to your registered device.
                  <br />
                  <span className="text-[10px] text-gray-400 font-medium">
                    Demo code: 123456
                  </span>
                </p>
                
                <div className="w-full relative mb-6">
                  <input
                    type="text"
                    required
                    value={code2fa}
                    onChange={(e) => setCode2fa(e.target.value)}
                    className="w-full border-b border-gray-300 py-2 text-center text-xl tracking-[0.3em] font-bold text-gray-800 outline-none focus:border-[#6b1d44] transition-colors bg-transparent"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>

                <div className="w-full flex justify-between items-center mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShow2FA(false);
                      setTempCredentials(null);
                      setCode2fa('');
                      setError('');
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 bg-transparent transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Back to Login
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#6b1d44] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-full shadow-md hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                </div>
              </form>
            ) : !showReset ? (
              /* Standard Login Sign In View Form */
              <form onSubmit={handleLogin} className="w-full max-w-[320px] flex flex-col items-center">
                <div className="w-full relative mb-5">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@amaanitvam.org"
                    required
                    className="w-full border-b border-gray-300 py-2 text-sm text-gray-800 outline-none focus:border-[#6b1d44] transition-colors bg-transparent placeholder-gray-400"
                  />
                </div>

                <div className="w-full relative mb-6">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full border-b border-gray-300 py-2 text-sm text-gray-800 outline-none focus:border-[#6b1d44] transition-colors bg-transparent placeholder-gray-400"
                  />
                </div>

                <div className="w-full flex justify-between items-center mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReset(true);
                      setError('');
                    }}
                    className="text-xs text-gray-400 hover:text-[#6b1d44] bg-transparent transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#6b1d44] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-full shadow-md hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? 'Signing in…' : 'Sign In'}
                  </button>
                </div>
              </form>
            ) : (
              /* Password Reset Link View Form */
              <form onSubmit={handleResetPassword} className="w-full max-w-[320px] flex flex-col items-center">
                <div className="w-full relative mb-6">
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@amaanitvam.org"
                    required
                    className="w-full border-b border-gray-300 py-2 text-sm text-gray-800 outline-none focus:border-[#6b1d44] transition-colors bg-transparent placeholder-gray-400"
                  />
                </div>

                <div className="w-full flex justify-between items-center mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReset(false);
                      setError('');
                      setResetSuccess('');
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 bg-transparent transition-colors cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                  
                  <button
                    type="submit"
                    className="bg-[#6b1d44] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-full shadow-md hover:opacity-90 transition-all cursor-pointer"
                  >
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