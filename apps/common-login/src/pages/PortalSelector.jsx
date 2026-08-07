import { useEffect, useMemo, useRef, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase.js';
import api from '../config/api.js';
import {
  resolvePortalForRole,
  getAllPortals,
  shouldShowPortalChooser,
} from '../config/portals.js';
import toast from 'react-hot-toast';
import { LogOut, ExternalLink, Shield, Loader2, ChevronRight, User } from 'lucide-react';

export default function PortalSelector({ user, sessionData, setSessionData }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [redirecting, setRedirecting] = useState(null);
  const autoRedirectStarted = useRef(false);

  // Load profile/session once
  useEffect(() => {
    let cancelled = false;
    const fetchSession = async () => {
      if (sessionData) {
        setProfile(sessionData);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/session');
        const userData = res.data?.user || res.data?.data || {};
        if (!cancelled) {
          setProfile(userData);
          setSessionData?.(userData);
        }
      } catch {
        if (!cancelled) {
          setProfile({
            email: user?.email || '',
            name: user?.displayName || user?.email?.split('@')[0] || 'User',
            role: 'member',
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchSession();
    return () => { cancelled = true; };
  }, [user, sessionData, setSessionData]);

  const role = useMemo(
    () => profile?.role || profile?.userRole || profile?.accessRole || 'member',
    [profile],
  );

  const resolvedPortal = useMemo(() => resolvePortalForRole(role), [role]);
  const allowChooser = useMemo(() => shouldShowPortalChooser(role), [role]);

  const buildPortalUrl = (portal, customToken) => {
    try {
      const url = new URL(portal.url);
      if (customToken) url.searchParams.set('authToken', customToken);
      return url.toString();
    } catch {
      return customToken
        ? `${portal.url}?authToken=${encodeURIComponent(customToken)}`
        : portal.url;
    }
  };

  const redirectToPortal = async (portal) => {
    setRedirecting(portal.portalKey);
    let customToken = null;
    try {
      const res = await api.post('/auth/cross-portal-token');
      customToken = res.data?.customToken || null;
    } catch (err) {
      console.error('Cross-portal token failed:', err);
      toast.error('Secure sign-in token failed; opening portal without SSO.');
    }
    // Use replace so the login/selector page isn't left in history.
    window.location.replace(buildPortalUrl(portal, customToken));
  };

  // Auto-redirect every non super_admin role straight to its portal.
  useEffect(() => {
    if (loading) return;
    if (allowChooser) return;
    if (autoRedirectStarted.current) return;
    autoRedirectStarted.current = true;
    redirectToPortal(resolvedPortal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, allowChooser, resolvedPortal]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  const handlePortalRedirect = (portal) => {
    if (redirecting) return;
    toast.success(`Opening ${portal.name}...`);
    redirectToPortal(portal);
  };

  const allPortals = getAllPortals();
  const otherPortals = allPortals.filter((p) => p.portalKey !== resolvedPortal.portalKey);

  // Show a minimal redirect splash for non super_admin users once we know their role.
  const showRedirectSplash = !loading && !allowChooser;

  if (loading || showRedirectSplash) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5d0f2d, #3d0a1f)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '3px solid #d8a15f', borderTopColor: 'transparent' }} />
          <p className="text-sm font-medium tracking-wider" style={{ color: '#e9c9a3' }}>
            {loading ? 'Loading your workspace...' : `Opening ${resolvedPortal.name}...`}
          </p>
        </div>
      </div>
    );
  }

  // ─── super_admin-only portal chooser ───
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #5d0f2d 0%, #3d0a1f 50%, #2a0715 100%)' }}>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, #d8a15f 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, #8a164b 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-[560px] relative z-10">
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between mb-8 animate-slide-down">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white rounded-xl shadow-lg flex items-center justify-center p-1">
              <img alt="AF" className="h-full w-full object-contain rounded-lg" src="/assets/images/logo.jpg"
                   onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span style="font-size:0.8rem;font-weight:800;color:#5d0f2d;">AF</span>'; }} />
            </div>
            <div>
              <p className="text-white text-sm font-bold tracking-wide">Amaanitvam Foundation</p>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Portal Access
              </p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-medium transition-all cursor-pointer px-3 py-2 rounded-xl"
            style={{ color: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>

        {/* ─── User card ─── */}
        <div className="rounded-2xl p-5 mb-6 animate-slide-up"
             style={{ backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg shrink-0"
                 style={{ background: 'linear-gradient(135deg, #d8a15f, #8a164b)' }}>
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white text-lg font-bold truncate">
                Welcome, {profile?.name || user?.displayName || 'User'}
              </h2>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {profile?.email || user?.email}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Shield className="w-3.5 h-3.5" style={{ color: '#d8a15f' }} />
              <span className="text-xs font-semibold capitalize" style={{ color: '#e9c9a3' }}>
                {String(role).replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Recommended portal ─── */}
        <div className="mb-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3 pl-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Recommended for your role
          </p>
          <button onClick={() => handlePortalRedirect(resolvedPortal)} disabled={!!redirecting}
            className="w-full group relative rounded-2xl p-5 lg:p-6 transition-all duration-300 cursor-pointer text-left disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110"
                   style={{ background: 'linear-gradient(135deg, rgba(216,161,95,0.2), rgba(138,22,75,0.2))' }}>
                {resolvedPortal.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-base lg:text-lg font-bold group-hover:text-[#e9c9a3] transition-colors">
                  {resolvedPortal.name}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {resolvedPortal.description}
                </p>
              </div>
              <div className="shrink-0">
                {redirecting === resolvedPortal.portalKey
                  ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#d8a15f' }} />
                  : <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-all" style={{ color: 'rgba(255,255,255,0.25)' }} />}
              </div>
            </div>
          </button>
        </div>

        {/* ─── Other portals ─── */}
        {otherPortals.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3 pl-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Other Portals
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {otherPortals.map((portal) => (
                <button key={portal.portalKey} onClick={() => handlePortalRedirect(portal)} disabled={!!redirecting}
                  className="group rounded-xl p-4 transition-all duration-200 cursor-pointer text-left disabled:opacity-50"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">{portal.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors truncate">
                        {portal.name}
                      </h4>
                      <p className="text-[10px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {portal.description}
                      </p>
                    </div>
                    {redirecting === portal.portalKey
                      ? <Loader2 className="w-4 h-4 animate-spin shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
                      : <ExternalLink className="w-4 h-4 shrink-0 group-hover:text-white/50 transition-colors" style={{ color: 'rgba(255,255,255,0.15)' }} />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center mt-10 text-[11px] animate-fade-in" style={{ color: 'rgba(255,255,255,0.2)', animationDelay: '0.3s' }}>
          © {new Date().getFullYear()} Amaanitvam Foundation · Unified Portal Access
        </p>
      </div>
    </div>
  );
}
