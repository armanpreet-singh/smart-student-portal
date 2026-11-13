import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { fetchCurrentUser } from "../api/authApi";
import {
  clearStoredSession,
  getStoredAccessToken,
  saveAuthSession,
  saveUserSnapshot,
} from "../utils/sessionStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const requestSequence = useRef(0);
  const initialToken = useRef(getStoredAccessToken());
  const [accessToken, setAccessToken] = useState(initialToken.current);
  const [user, setUser] = useState(null);
  const [sessionStatus, setSessionStatus] = useState(
    initialToken.current ? "restoring" : "anonymous",
  );
  const [sessionError, setSessionError] = useState("");

  const restoreSession = useCallback(
    async (tokenToVerify = accessToken) => {
      if (!tokenToVerify) {
        setAccessToken("");
        setUser(null);
        setSessionStatus("anonymous");
        setSessionError("");
        return null;
      }

      const requestId = ++requestSequence.current;
      setSessionStatus("restoring");
      setUser(null);
      setSessionError("");

      try {
        const currentUser = await fetchCurrentUser(tokenToVerify);

        if (requestId !== requestSequence.current) return null;

        setAccessToken(tokenToVerify);
        setUser(currentUser);
        setSessionStatus("authenticated");
        setSessionError("");
        saveUserSnapshot(currentUser);
        return currentUser;
      } catch (error) {
        if (requestId !== requestSequence.current) return null;

        setUser(null);

        if (error?.status === 401) {
          clearStoredSession();
          setAccessToken("");
          setSessionStatus("expired");
          setSessionError("Your LTSU session has expired. Please sign in again.");
          navigate("/login", { replace: true });
          return null;
        }

        setSessionStatus("unavailable");
        setSessionError(
          error?.message ||
            "Unable to verify your sign-in. Check your connection and retry.",
        );
        return null;
      }
    },
    [accessToken, navigate],
  );

  const establishSession = useCallback((token, nextUser) => {
    requestSequence.current += 1;
    saveAuthSession(token, nextUser);
    setAccessToken(token);
    setUser(nextUser);
    setSessionStatus("authenticated");
    setSessionError("");
  }, []);

  const logout = useCallback(() => {
    requestSequence.current += 1;
    const cleared = clearStoredSession();

    setAccessToken("");
    setUser(null);
    setSessionStatus("anonymous");
    setSessionError(
      cleared ? "" : "The browser could not clear the saved session.",
    );
    navigate("/login", { replace: true });
  }, [navigate]);

  const retrySession = useCallback(
    () => restoreSession(accessToken),
    [accessToken, restoreSession],
  );

  const didRestoreOnMount = useRef(false);
  useEffect(() => {
    if (didRestoreOnMount.current) return;
    didRestoreOnMount.current = true;

    if (initialToken.current) {
      restoreSession(initialToken.current);
    }
  }, [restoreSession]);

  const value = useMemo(
    () => ({
      accessToken,
      user,
      sessionStatus,
      sessionError,
      isAuthenticated: sessionStatus === "authenticated",
      isRestoring: sessionStatus === "restoring",
      establishSession,
      restoreSession,
      retrySession,
      logout,
    }),
    [
      accessToken,
      user,
      sessionStatus,
      sessionError,
      establishSession,
      restoreSession,
      retrySession,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
