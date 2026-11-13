export const ACCESS_TOKEN_KEY = "ltsu-access-token";
export const AUTH_USER_KEY = "ltsu-auth-user";

export function getStoredAccessToken() {
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function saveAuthSession(accessToken, user) {
  if (typeof accessToken !== "string" || !accessToken || !user?.id) {
    throw new Error("The sign-in response could not be saved.");
  }

  try {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch {
    try {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.localStorage.removeItem(AUTH_USER_KEY);
    } catch {
      // Preserve the original storage error for the caller.
    }

    throw new Error(
      "Your browser blocked session storage. Enable site storage and try again.",
    );
  }
}

export function saveUserSnapshot(user) {
  if (!user?.id) return;

  try {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch {
    // The access token and live in-memory session remain authoritative.
  }
}

export function clearStoredSession() {
  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_USER_KEY);
    return true;
  } catch {
    return false;
  }
}
