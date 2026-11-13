import { Navigate, useLocation } from "react-router-dom";

import { getPortalPath } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import "./ProtectedRoute.css";

function SessionLoadingState() {
  return (
    <main className="protected-route-state" role="status" aria-live="polite">
      <span className="protected-route-spinner" aria-hidden="true" />
      <h1>Verifying your LTSU session</h1>
      <p>Checking your account permissions before opening the portal.</p>
    </main>
  );
}

function SessionUnavailableState() {
  const { sessionError, logout } = useAuth();

  return (
    <main className="protected-route-state" role="alert">
      <span className="protected-route-status-icon" aria-hidden="true">
        !
      </span>
      <h1>We could not verify your session</h1>
      <p>
        {sessionError ||
          "The authentication service is unavailable. Your dashboard remains locked until your account can be verified."}
      </p>
      <p className="protected-route-hint">
        Use the session recovery notice at the top of the page to retry
        verification, or sign out and try again.
      </p>
      <button type="button" onClick={logout}>
        Sign out
      </button>
    </main>
  );
}

export default function ProtectedRoute({
  allowedRole,
  requirePasswordChange = false,
  children,
}) {
  const location = useLocation();
  const { user, sessionStatus } = useAuth();

  if (sessionStatus === "restoring") {
    return <SessionLoadingState />;
  }

  if (sessionStatus === "unavailable") {
    return <SessionUnavailableState />;
  }

  if (sessionStatus === "anonymous" || sessionStatus === "expired") {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (sessionStatus !== "authenticated" || !user?.role) {
    return <Navigate to="/login" replace />;
  }

  if (user.mustChangePassword && !requirePasswordChange) {
    return <Navigate to="/change-password" replace />;
  }

  if (requirePasswordChange && !user.mustChangePassword) {
    const correctPortal = getPortalPath(user.role);
    return <Navigate to={correctPortal || "/login"} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    const correctPortal = getPortalPath(user.role);
    return <Navigate to={correctPortal || "/login"} replace />;
  }

  return children;
}

