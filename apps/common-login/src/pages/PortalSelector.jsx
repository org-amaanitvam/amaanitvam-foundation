import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase.js';
import api from '../config/api.js';
import {
  resolvePortalForRole,
  getAllPortals,
  shouldShowPortalChooser,
} from '../config/portals.js';
import toast from 'react-hot-toast';
import { LogOut, Shield, Loader2, ChevronRight, User } from 'lucide-react';

export default function PortalSelector({ user, sessionData, setSessionData }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [redirecting, setRedirecting] = useState(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const autoRedirectStarted = useRef(false);

  // Set when a portal bounced the user back here after signing out — the
  // chooser (or a manual "Continue") is shown instead of an instant redirect.
  const [suppressAuto, setSuppressAuto] = useState(() => {
    try {
      return sessionStorage.getItem('af.suppressAutoPortal') === '1';
    } catch {
      return false;
    }
  });

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
    return () => {
      cancelled = true;
    };
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

  // Mints a Firebase custom token so the destination portal signs the user in
  // automatically — credentials are only ever entered on this page. Available
  // to every authenticated role, not just administrators.
  const redirectToPortal = useCallback(async (portal) => {
    setRedirecting(portal.portalKey);
    let customToken = null;
    try {
      const res = await api.post('/auth/cross-portal-token');
      customToken = res.data?.customToken || res.data?.token || null;
    } catch (err) {
      console.error('[common-login] Cross-portal token failed:', err?.message || err);
    }
    if (!customToken) {
      try {
        // Fallback hand-off: exchange the current ID token for a custom token.
        const idToken = await auth.currentUser?.getIdToken(true);
        if (idToken) {
          const res = await api.post('/auth/sso-token', { idToken });
          customToken = res.data?.customToken || null;
        }
      } catch (err) {
        console.error('[common-login] SSO token fallback failed:', err?.message || err);
      }
    }
    if (!customToken) {
      toast.error('Secure hand-off unavailable; the portal may ask you to sign in.');
    }
    try {
      sessionStorage.removeItem('af.suppressAutoPortal');
    } catch {
      /* ignore */
    }
    window.location.replace(buildPortalUrl(portal, customToken));
  }, []);

  // Every non super_admin role goes straight to its portal — no chooser,
  // no second credential prompt.
  useEffect(() => {
    if (loading || allowChooser || suppressAuto) return;
    if (autoRedirectStarted.current) return;
    autoRedirectStarted.current = true;
    redirectToPortal(resolvedPortal);
  }, [loading, allowChooser, suppressAuto, resolvedPortal, redirectToPortal]);

  useEffect(() => {
    if (!suppressAuto) return;
    try {
      sessionStorage.removeItem('af.suppressAutoPortal');
    } catch {
      /* ignore */
    }
  }, [suppressAuto]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSuppressAuto(false);
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
  const showRedirectSplash = !loading && !allowChooser && !suppressAuto;

  if (loading || showRedirectSplash) {
    return (
      <div className="af-splash">
        <div className="af-spinner" />
        <p>{loading ? 'Loading your workspace…' : `Opening ${resolvedPortal.name}…`}</p>
      </div>
    );
  }

  const renderPortal = (portal, delay) => (
    <button
      key={portal.portalKey}
      type="button"
      className="af-portal"
      style={{ animationDelay: delay }}
      disabled={!!redirecting}
      onClick={() => handlePortalRedirect(portal)}
    >
      <span className="af-portal-icon">{portal.icon}</span>
      <span className="af-portal-body">
        <h3>{portal.name}</h3>
        <p>{portal.description}</p>
      </span>
      <span className="af-portal-go">
        {redirecting === portal.portalKey ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <ChevronRight size={18} />
        )}
      </span>
    </button>
  );

  return (
    <div className="af-shell">
      <div className="af-glow" />

      <div className="af-select-wrap">
        <div className="af-select-head">
          <div className="af-select-brand">
            <div className="af-logo">
              {logoFailed ? (
                'AF'
              ) : (
                <img
                  src="/assets/images/logo.jpg"
                  alt="Amaanitvam Foundation"
                  onError={() => setLogoFailed(true)}
                />
              )}
            </div>
            <div>
              <strong>Amaanitvam Foundation</strong>
              <span>Portal Access</span>
            </div>
          </div>
          <button type="button" className="af-signout" onClick={handleLogout}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        <div className="af-user-card">
          <span className="af-avatar">
            <User size={20} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2>Welcome, {profile?.name || user?.displayName || 'User'}</h2>
            <p>{profile?.email || user?.email}</p>
          </div>
          <span className="af-role">
            <Shield size={14} /> {String(role).replace(/_/g, ' ')}
          </span>
        </div>

        <p className="af-section-label">
          {allowChooser ? 'Recommended for your role' : 'Your workspace'}
        </p>
        {renderPortal(resolvedPortal, '0.1s')}

        {allowChooser && otherPortals.length > 0 && (
          <>
            <p className="af-section-label" style={{ marginTop: '1.5rem' }}>
              Other Portals
            </p>
            {otherPortals.map((portal, index) =>
              renderPortal(portal, `${0.15 + index * 0.05}s`),
            )}
          </>
        )}

        <p className="af-note" style={{ color: 'rgba(255,255,255,0.35)', marginTop: '1.5rem' }}>
          You are already signed in — opening a portal will not ask for your
          credentials again.
        </p>
      </div>
    </div>
  );
}
