import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
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

  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${baseURL}/public/settings`);
        if (res.data.settings?.orgName) setOrgName(res.data.settings.orgName);
      } catch (err) {
        console.error('Could not fetch public settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const afterLogin = () => {
    const from = location.state?.from?.pathname;
    navigate(from && from.startsWith('/student') ? from : '/student/dashboard', {
      replace: true,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      afterLogin();
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
    <div className="min-h-screen flex items-center justify-center bg-[#5d0f2d] px-3 sm:px-4 py-6 sm:py-8 relative overflow-hidden font-[family-name:var(--font-body)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(216,161,95,0.22),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(93,15,45,0.35),transparent_45%)]" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-2xl sm:rounded-3xl overflow-hidden relative z-10 shadow-2xl min-h-0 md:min-h-[560px]">
        <div className="relative flex flex-col justify-between p-6 sm:p-8 md:p-10 overflow-hidden min-h-[220px] sm:min-h-[260px] md:min-h-0">
          <img
            src="images/Hero/hero.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(155deg,rgba(138,22,75,0.88)_0%,rgba(93,15,45,0.92)_60%,rgba(61,10,31,0.95)_100%)]" />

          <div className="relative z-10 flex items-center gap-3 sm:gap-4">
            <img
              alt="Amaanitvam Foundation logo"
              className="h-14 w-14 sm:h-20 sm:w-20 md:h-24 md:w-24 object-contain bg-white p-1.5 sm:p-2 rounded-2xl shadow-lg shrink-0"
              src="images/Logo/logo.jpg"
            />
            <div className="flex flex-col justify-center leading-none">
              <b className="text-white text-lg sm:text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold tracking-wide uppercase">
                {orgName.split(' ')[0] || 'Amaanitvam'}
              </b>
              <span className="text-[#e9c9a3] text-[10px] sm:text-xs md:text-sm font-[family-name:var(--font-ui)] font-semibold tracking-[0.3em] uppercase mt-1 sm:mt-1.5">
                {orgName.split(' ').slice(1).join(' ') || 'Foundation'}
              </span>
            </div>
          </div>

          <div className="relative z-10 my-6 sm:my-8 md:my-10">
            <p className="mt-2 sm:mt-4 text-white/85 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
              Empowering Lives Through Education, Compassion, and Collective Action.
              A student-led movement inspiring learning, responsibility, and positive
              change for a stronger society.
            </p>
            <small className="block mt-3 sm:mt-5 text-[#e9c9a3] text-[10px] sm:text-[11px] font-[family-name:var(--font-ui)] tracking-[0.25em] uppercase font-semibold">
              Amaanitvam Foundation &middot; Learning Portal
            </small>
          </div>
          <div className="relative z-10 text-[0.7rem] sm:text-[0.78rem] text-white/65">
            Trusted by Learners &middot; Mentor-led Courses &middot; Accessible Education for All
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10 bg-[#faf7f2]">
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-[320px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-px bg-[#d8a15f]" />
                <span className="text-[#8a164b] text-[11px] sm:text-xs font-[family-name:var(--font-ui)] font-bold tracking-[0.2em] uppercase">
                  Learner Portal Access
                </span>
              </div>
              <h2 className="text-[#5d0f2d] text-xl sm:text-2xl md:text-[1.7rem] font-[family-name:var(--font-heading)] font-bold mb-5 sm:mb-6">
                {!showReset ? 'Student Login' : 'Reset Password'}
              </h2>
            </div>

            {!showReset && (
              <div className="flex bg-[#f0e7de] rounded-full p-1 mb-6 w-full max-w-[320px]">
                <button
                  type="button"
                  onClick={() => {
                    setShowReset(false);
                    setError('');
                    setResetSuccess('');
                  }}
                  className={`flex-1 text-xs font-[family-name:var(--font-ui)] font-bold uppercase tracking-widest py-2.5 rounded-full transition-all duration-200 cursor-pointer ${!showReset
                      ? 'bg-[#5d0f2d] text-white shadow-md'
                      : 'text-[#8a7468] hover:text-[#5d0f2d]'
                    }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReset(true);
                    setError('');
                  }}
                  className={`flex-1 text-xs font-[family-name:var(--font-ui)] font-bold uppercase tracking-widest py-2.5 rounded-full transition-all duration-200 cursor-pointer ${showReset
                      ? 'bg-[#5d0f2d] text-white shadow-md'
                      : 'text-[#8a7468] hover:text-[#5d0f2d]'
                    }`}
                >
                  Reset
                </button>
              </div>
            )}

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

            {!showReset ? (
              <form onSubmit={handleLogin} className="w-full max-w-[320px] flex flex-col">
                <div className="w-full mb-4">
                  <label htmlFor="email" className="block text-xs font-semibold text-[#5d0f2d] mb-1.5">
                    Email or Unique ID
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@amaanitvam.org"
                    required
                    className="w-full rounded-xl border border-[#e3d6c8] py-2.5 px-4 text-sm text-[#3a2a22] outline-none focus:border-[#8a164b] transition-colors bg-white placeholder-[#b3a297]"
                  />
                </div>
                <div className="w-full mb-3">
                  <label htmlFor="password" className="block text-xs font-semibold text-[#5d0f2d] mb-1.5">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-xl border border-[#e3d6c8] py-2.5 px-4 text-sm text-[#3a2a22] outline-none focus:border-[#8a164b] transition-colors bg-white placeholder-[#b3a297]"
                  />
                </div>
                <div className="w-full flex flex-wrap justify-between items-center gap-y-2 mb-6">
                  <label className="flex items-center gap-1.5 text-xs text-[#8a7468]">
                    <input type="checkbox" defaultChecked className="accent-[#8a164b]" />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReset(true);
                      setError('');
                    }}
                    className="text-xs text-[#8a164b] font-semibold hover:underline bg-transparent transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#5d0f2d] text-white text-sm font-[family-name:var(--font-ui)] font-bold uppercase tracking-wider py-3 rounded-full shadow-md hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? 'Signing in…' : 'Login'}
                </button>
                <Link
                  to="/"
                  className="mt-5 flex items-center justify-center gap-1 text-xs text-[#8a164b] font-semibold hover:underline"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Course Catalog
                </Link>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="w-full max-w-[320px] flex flex-col">
                <label htmlFor="reset-email" className="block text-xs font-semibold text-[#5d0f2d] mb-1.5">
                  Email or Username
                </label>
                <input
                  id="reset-email"
                  name="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@amaanitvam.org"
                  required
                  className="w-full rounded-xl border border-[#e3d6c8] py-2.5 px-4 text-sm text-[#3a2a22] outline-none focus:border-[#8a164b] transition-colors bg-white placeholder-[#b3a297] mb-6"
                />
                <div className="w-full flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReset(false);
                      setError('');
                      setResetSuccess('');
                    }}
                    className="text-xs text-[#8a7468] hover:text-[#5d0f2d] bg-transparent transition-colors cursor-pointer flex items-center justify-center gap-1 shrink-0"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back to Sign In
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-[#5d0f2d] text-white text-xs font-[family-name:var(--font-ui)] font-bold uppercase tracking-wider py-3 px-6 rounded-full shadow-md hover:opacity-90 transition-all cursor-pointer"
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