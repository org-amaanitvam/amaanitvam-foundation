import { buildCommonLoginUrl, redirectToCommonLogin } from '../../config/portal';
import {
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  useAuth,
} from "../../contexts/AuthContext";
import {
  canAccessPath,
} from "../../utils/accessControl";

export default function ProtectedRoute({
  children,
}) {
  const {
    user,
    userProfile,
    loading,
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    // Before redirecting, check if this is a demo faculty session.
    // AuthContext should have handled this already, but as a safety net
    // we check here too so we never bounce a demo user to the login page.
    const urlParams = new URLSearchParams(window.location.search);
    const isDemoFaculty =
      urlParams.get('demo') === 'faculty' ||
      localStorage.getItem('demo_faculty') === 'true' ||
      sessionStorage.getItem('demo_faculty') === 'true' ||
      (location.pathname.startsWith('/faculty') &&
        sessionStorage.getItem('logged_out') !== 'true');

    if (isDemoFaculty) {
      // Still loading demo user — show spinner and let AuthContext finish
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="spinner" />
        </div>
      );
    }

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    window.location.href = isLocal
      ? buildCommonLoginUrl()
      : buildCommonLoginUrl();
    return null;
  }

  if (
    userProfile &&
    !canAccessPath(
      userProfile,
      location.pathname,
    )
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{
          accessDenied:
            "You do not have permission to open that page.",
        }}
      />
    );
  }

  return children;
}
