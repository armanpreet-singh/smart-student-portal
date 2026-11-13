import { useAuth } from "../context/AuthContext";
import "./SessionRecoveryNotice.css";

export default function SessionRecoveryNotice() {
  const { sessionStatus, sessionError, retrySession, logout } = useAuth();
  const isUnavailable = sessionStatus === "unavailable";
  const isExpired = sessionStatus === "expired";

  if (!isUnavailable && !isExpired) return null;

  return (
    <aside
      className={`session-recovery-notice ${isExpired ? "expired" : ""}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="session-recovery-copy">
        <strong>
          {isExpired
            ? "Your previous sign-in has expired."
            : "We couldn't verify your sign-in."}
        </strong>
        <span>
          {sessionError}{" "}
          {isUnavailable
            ? "Your account is not treated as signed in until the server confirms the session."
            : "Please sign in again to continue."}
        </span>
      </div>
      <div className="session-recovery-actions">
        {isUnavailable && (
          <button type="button" onClick={retrySession}>
            Retry
          </button>
        )}
        <button type="button" className="secondary" onClick={logout}>
          {isExpired ? "Continue to sign in" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
