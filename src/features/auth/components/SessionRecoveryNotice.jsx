import { useAuth } from "../context/AuthContext";
import "./SessionRecoveryNotice.css";

export default function SessionRecoveryNotice() {
  const { sessionStatus, sessionError, retrySession, logout } = useAuth();

  if (sessionStatus !== "unavailable") return null;

  return (
    <aside
      className="session-recovery-notice"
      role="alert"
      aria-live="assertive"
    >
      <div className="session-recovery-copy">
        <strong>We couldn't verify your sign-in.</strong>
        <span>
          {sessionError} Your account is not treated as signed in until the
          server confirms the session.
        </span>
      </div>
      <div className="session-recovery-actions">
        <button type="button" onClick={retrySession}>
          Retry
        </button>
        <button type="button" className="secondary" onClick={logout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
