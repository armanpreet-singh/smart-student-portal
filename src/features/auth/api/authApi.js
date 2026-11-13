const DEFAULT_API_BASE_URL =
  "https://ltsu-smart-portal-api-0i8h.onrender.com";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

const LOGIN_TIMEOUT_MS = 12000;

const ROLE_ROUTES = {
  STUDENT: "/dashboard",
  TEACHER: "/teacher",
  ADMIN: "/admin",
};

function getLoginErrorMessage(status, payload) {
  if (status === 401) {
    return "The username or password is incorrect.";
  }

  if (status === 429) {
    return "Too many sign-in attempts. Please try again in 15 minutes.";
  }

  if (status >= 500) {
    return "The sign-in service is temporarily unavailable. Please try again.";
  }

  return (
    payload?.message ||
    "Unable to sign in. Check your details and try again."
  );
}

export async function loginWithUsername({ username, password }) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    LOGIN_TIMEOUT_MS,
  );

  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: String(username).trim(),
        password,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("The sign-in request timed out. Please try again.");
    }

    if (error instanceof TypeError) {
      throw new Error(
        "Unable to reach the sign-in service. Check your connection, API URL, and backend CORS settings.",
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getLoginErrorMessage(response.status, payload));
  }

  const result = payload?.data;

  if (
    payload?.status !== "ok" ||
    typeof result?.accessToken !== "string" ||
    result.accessToken.length === 0 ||
    result.tokenType !== "Bearer" ||
    !result.user ||
    typeof result.user.id !== "string" ||
    !Object.hasOwn(ROLE_ROUTES, result.user.role)
  ) {
    throw new Error(
      "The sign-in service returned an unexpected account response. Please contact support.",
    );
  }

  return result;
}

export function getPortalPath(role) {
  return ROLE_ROUTES[role] || null;
}
