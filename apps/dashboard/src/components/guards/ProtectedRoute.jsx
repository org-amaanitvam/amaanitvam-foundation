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
    // A hand-off token is present (or being consumed) — never redirect yet.
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('authToken') || sp.get('token')) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="spinner" />
        </div>
      );
    }


    const target = new URL(buildCommonLoginUrl('session-expired'));
    target.searchParams.set('returnTo', window.location.href);
    window.location.replace(target.toString());
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
