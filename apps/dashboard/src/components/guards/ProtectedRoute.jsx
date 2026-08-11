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
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    window.location.href = isLocal
      ? 'http://localhost:5175/src/pages/login.html'
      : 'https://www.amaanitvam.org/pages/login.html';
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
