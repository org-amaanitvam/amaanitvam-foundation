import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Shield, User, Lock, Mail } from 'lucide-react';
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

  if (user && !show2FA) {
    return <Navigate to="/" replace />;
  }

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
      setError(err.message || 'Failed to sign in. Please check your credentials.');
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
    <div className="min-h-screen flex items-center justify-center bg-[#6b1d44] px-4">
      {/* Container Box */}
      <div className="w-full max-w-195 h-auto md:h-120 bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Sidebar Accent Controls */}
        <div className="w-full md:w-[35%] bg-linear-to-br from-[#8a164b] to-[#690b31] relative flex flex-row md:flex-col justify-center items-center md:items-end overflow-hidden py-6 md:py-0">
          <div className="absolute inset-0 bg-white/10 rotate-45 -top-1/2 -left-1/2 w-[200%] h-[200%] pointer-events-none"></div>
          <div className="absolute inset-0 bg-black/5 rotate-30 -top-1/2 left-[-80%] w-[200%] h-[200%] pointer-events-none"></div>
          
          <div className="flex flex-row md:flex-col gap-4 md:gap-6 w-full z-10">
            <button
              type="button"
              onClick={() => { setShowReset(false); setError(''); setResetSuccess(''); }}
              className={`text-sm md:text-base font-bold uppercase tracking-wider py-3 px-6 text-center md:text-right w-full cursor-pointer transition-all duration-300 relative ${
                !showReset 
                  ? 'text-black bg-white rounded-xl md:rounded-l-full md:rounded-r-none md:w-[75%] md:ml-auto shadow-md' 
                  : 'text-white/70 hover:text-white bg-transparent'
              }`}
            >
              Login
              {!showReset && (
                <>
                  <div className="hidden md:block absolute -top-5 right-0 w-5 h-5 bg-transparent rounded-br-2xl shadow-[5px_5px_0_0_#fff]" />
                  <div className="hidden md:block absolute -bottom-5 right-0 w-5 h-5 bg-transparent rounded-tr-2xl shadow-[5px_-5px_0_0_#fff]" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setShowReset(true); setError(''); }}
              className={`text-sm md:text-base font-bold uppercase tracking-wider py-3 px-6 text-center md:text-right w-full cursor-pointer transition-all duration-300 relative ${
                showReset 
                  ? 'text-black bg-white rounded-xl md:rounded-l-full md:rounded-r-none md:w-[75%] md:ml-auto shadow-md' 
                  : 'text-white/70 hover:text-white bg-transparent'
              }`}
            >
              Reset
              {showReset && (
                <>
                  <div className="hidden md:block absolute -top-5 right-0 w-5 h-5 bg-transparent rounded-br-2xl shadow-[5px_5px_0_0_#fff]" />
                  <div className="hidden md:block absolute -bottom-5 right-0 w-5 h-5 bg-transparent rounded-tr-2xl shadow-[5px_-5px_0_0_#fff]" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Form Component Body */}
        <div className="flex-1 flex flex-col justify-between p-8 md:p-10">
          <div className="w-full flex flex-col items-center">
            <div className="w-16 h-16 bg-linear-to-b from-white to-slate-50 rounded-full flex items-center justify-center mb-3 shadow-lg border border-[#6b1d44]/10">
              <Shield className="w-7 h-7 text-[#8a164b]" />
            </div>
            
            <h2 className="text-[#6b1d44] text-xl font-extrabold tracking-widest uppercase mb-6">
              {!showReset ? 'Login' : 'Reset Password'}
            </h2>

            {error && (
              <div className="w-full max-w-[320px] bg-red-50 text-red-600 text-xs p-2.5 rounded-lg border border-red-100 mb-4 text-center">
                {error}
              </div>
            )}
            {resetSuccess && (
              <div className="w-full max-w-[320px] bg-green-50 text-green-600 text-xs p-2.5 rounded-lg border border-green-100 mb-4 text-center">
                {resetSuccess}
              </div>
            )}

            {!showReset ? (
              <form onSubmit={handleLogin} className="w-full max-w-[320px] flex flex-col items-center">
                <div className="w-full relative mb-5">
                  <User className="absolute left-1 bottom-2 text-slate-400 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full border-b border-slate-200 py-2 pl-8 pr-2 text-sm text-slate-800 outline-none focus:border-[#a94276] transition-colors bg-transparent"
                  />
                </div>

                <div className="w-full relative mb-6">
                  <Lock className="absolute left-1 bottom-2 text-slate-400 w-5 h-5" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full border-b border-slate-200 py-2 pl-8 pr-2 text-sm text-slate-800 outline-none focus:border-[#a94276] transition-colors bg-transparent"
                  />
                </div>

                <div className="w-full flex justify-between items-center mt-2">
                  <button
                    type="button"
                    onClick={() => { setShowReset(true); setError(''); }}
                    className="text-xs text-slate-400 hover:text-[#a94276] bg-transparent transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-linear-to-r from-[#8a164b] to-[#690b31] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-full shadow-md hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? 'Signing in…' : 'Login'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="w-full max-w-[320px] flex flex-col items-center">
                <div className="w-full relative mb-6">
                  <Mail className="absolute left-1 bottom-2 text-slate-400 w-5 h-5" />
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    className="w-full border-b border-slate-200 py-2 pl-8 pr-2 text-sm text-slate-800 outline-none focus:border-[#a94276] transition-colors bg-transparent"
                  />
                </div>

                <div className="w-full flex justify-between items-center mt-2">
                  <button
                    type="button"
                    onClick={() => { setShowReset(false); setError(''); setResetSuccess(''); }}
                    className="text-xs text-slate-400 hover:text-[#690b31] bg-transparent transition-colors cursor-pointer"
                  >
                    Back to Login
                  </button>
                  
                  <button
                    type="submit"
                    className="bg-linear-to-r from-[#8a164b] to-[#690b31] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-full shadow-md hover:opacity-95 transition-all cursor-pointer"
                  >
                    Send Link
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