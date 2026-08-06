import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase.js';
import api from '../config/api.js';
import toast from 'react-hot-toast';
import { ArrowLeft, Eye, EyeOff, LogIn, Mail, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [step, setStep] = useState('credentials'); // credentials | reset
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [orgName, setOrgName] = useState('Amaanitvam Foundation');
  const emailRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/public/settings');
        if (res.data?.settings?.orgName) setOrgName(res.data.settings.orgName);
      } catch { /* silent */ }
    };
    fetchSettings();
  }, []);

  useEffect(() => { emailRef.current?.focus(); }, [step]);

  const resolveEmail = async (identifier) => {
    const trimmed = identifier.trim();
    if (trimmed.includes('@')) return trimmed.toLowerCase();
    try {
      const res = await api.post('/auth/resolve-identifier', { identifier: trimmed });
      if (res.data?.success && res.data?.email) return res.data.email;
    } catch { /* fallback */ }
    return trimmed.toLowerCase();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!identifier.trim()) { setError('Email or Unique ID is required.'); return; }
    if (!password) { setError('Password is required.'); return; }

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
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!identifier.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      const email = await resolveEmail(identifier);
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent. Check your inbox.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email.');
    } finally { setLoading(false); }
  };

  const orgFirst = orgName.split(' ')[0] || 'Amaanitvam';
  const orgRest = orgName.split(' ').slice(1).join(' ') || 'Foundation';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #5d0f2d 0%, #3d0a1f 50%, #2a0715 100%)' }}>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, #d8a15f 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, #8a164b 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5"
             style={{ background: 'radial-gradient(circle, #d8a15f 0%, transparent 60%)' }} />
      </div>

      {/* Main card */}
      <div className="w-full max-w-[920px] relative z-10 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl"
             style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>

          {/* ─── Left branding panel ─── */}
          <div className="relative flex flex-col justify-between p-8 lg:p-10 min-h-[240px] lg:min-h-[580px]"
               style={{ background: 'linear-gradient(160deg, rgba(138,22,75,0.95) 0%, rgba(93,15,45,0.98) 50%, rgba(61,10,31,1) 100%)' }}>

            {/* Dot pattern */}
            <div className="absolute inset-0 opacity-[0.04]"
                 style={{ backgroundImage: 'radial-gradient(circle, #d8a15f 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {/* Logo + Org Name */}
            <div className="relative z-10 flex items-center gap-4">
              <div className="h-16 w-16 lg:h-20 lg:w-20 bg-white rounded-2xl shadow-lg flex items-center justify-center p-1.5 animate-pulse-glow shrink-0">
                <img alt={orgName} className="h-full w-full object-contain rounded-xl" src="/assets/images/logo.jpg"
                     onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span style="font-size:1.2rem;font-weight:800;color:#5d0f2d;">AF</span>'; }} />
              </div>
              <div>
                <div className="text-white text-xl lg:text-2xl font-bold tracking-wide uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {orgFirst}
                </div>
                <div className="text-[#e9c9a3] text-[10px] lg:text-xs font-semibold tracking-[0.3em] uppercase mt-0.5">
                  {orgRest}
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div className="relative z-10 my-auto py-6 lg:py-0">
              <h1 className="text-white text-2xl lg:text-3xl font-bold leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                Welcome Back
              </h1>
              <p className="mt-3 text-white/75 text-sm lg:text-base leading-relaxed max-w-sm">
                Your gateway to all Amaanitvam workspaces. Sign in once and access any portal.
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {['Admin Portal', 'Dashboard', 'LMS'].map((label) => (
                  <span key={label} className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] lg:text-[11px] font-semibold bg-white/10 text-white/80 backdrop-blur border border-white/10">
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 text-white/40 text-[11px]">
              Empowering Communities · Transparent Initiatives
            </div>
          </div>

          {/* ─── Right form panel ─── */}
          <div className="flex flex-col justify-center items-center p-8 lg:p-10" style={{ backgroundColor: '#faf7f2' }}>
            <div className="w-full max-w-[360px]">

              {/* Section label */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-px" style={{ backgroundColor: '#d8a15f' }} />
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: '#8a164b' }}>
                  Unified Access
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#5d0f2d', fontFamily: 'Playfair Display, serif' }}>
                {step === 'credentials' ? 'Sign In' : 'Reset Password'}
              </h2>

              {/* Tab switcher */}
              <div className="flex rounded-full p-1 mb-6" style={{ backgroundColor: '#f0e7de' }}>
                {[{ key: 'credentials', label: 'Sign In' }, { key: 'reset', label: 'Reset' }].map(({ key, label }) => (
                  <button key={key} type="button"
                    onClick={() => { setStep(key); setError(''); setSuccess(''); }}
                    className="flex-1 text-xs font-bold uppercase tracking-widest py-2.5 rounded-full transition-all duration-200 cursor-pointer"
                    style={step === key
                      ? { backgroundColor: '#5d0f2d', color: '#fff', boxShadow: '0 2px 8px rgba(93,15,45,0.3)' }
                      : { color: '#8a7468' }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Messages */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl mb-4 text-xs animate-slide-down" style={{ backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-start gap-2 p-3 rounded-xl mb-4 text-xs animate-slide-down" style={{ backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{success}</span>
                </div>
              )}

              {/* ─── Login Form ─── */}
              {step === 'credentials' ? (
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="login-identifier" className="block text-xs font-semibold mb-1.5" style={{ color: '#5d0f2d' }}>
                      Email or Unique ID
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8a7468' }} />
                      <input ref={emailRef} id="login-identifier" name="identifier" type="text" autoComplete="username"
                        value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="you@amaanitvam.org or JOHN001" required
                        className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all"
                        style={{ border: '1px solid #e3d6c8', color: '#3a2a22', backgroundColor: '#fff' }} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="login-password" className="block text-xs font-semibold mb-1.5" style={{ color: '#5d0f2d' }}>
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8a7468' }} />
                      <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password" required
                        className="w-full rounded-xl py-3 pl-10 pr-11 text-sm outline-none transition-all"
                        style={{ border: '1px solid #e3d6c8', color: '#3a2a22', backgroundColor: '#fff' }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                        style={{ color: '#8a7468' }}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: '#8a7468' }}>
                      <input type="checkbox" defaultChecked className="cursor-pointer" style={{ accentColor: '#8a164b' }} />
                      Remember me
                    </label>
                    <button type="button" onClick={() => { setStep('reset'); setError(''); }}
                      className="text-xs font-semibold hover:underline bg-transparent cursor-pointer" style={{ color: '#8a164b' }}>
                      Forgot Password?
                    </button>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full text-white text-sm font-bold uppercase tracking-wider py-3 rounded-full transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-1"
                    style={{ backgroundColor: '#5d0f2d', boxShadow: '0 4px 15px rgba(93,15,45,0.35)' }}>
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                      : <><LogIn className="w-4 h-4" /> Sign In</>}
                  </button>

                  <p className="text-center text-[11px] mt-2" style={{ color: '#b3a297' }}>
                    One account, all portals. Sign in once to access your workspaces.
                  </p>
                </form>
              ) : (
                /* ─── Reset Form ─── */
                <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="reset-email" className="block text-xs font-semibold mb-1.5" style={{ color: '#5d0f2d' }}>
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8a7468' }} />
                      <input ref={emailRef} id="reset-email" name="reset-email" type="email"
                        value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="you@amaanitvam.org" required
                        className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all"
                        style={{ border: '1px solid #e3d6c8', color: '#3a2a22', backgroundColor: '#fff' }} />
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
                    <button type="button" onClick={() => { setStep('credentials'); setError(''); setSuccess(''); }}
                      className="text-xs bg-transparent cursor-pointer flex items-center justify-center sm:justify-start gap-1 transition-colors"
                      style={{ color: '#8a7468' }}>
                      <ArrowLeft className="w-3 h-3" /> Back to Sign In
                    </button>
                    <button type="submit" disabled={loading}
                      className="w-full sm:w-auto text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-full transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#5d0f2d' }}>
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                      Send Reset Link
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
