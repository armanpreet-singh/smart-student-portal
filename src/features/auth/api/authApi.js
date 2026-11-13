const DEFAULT_API_BASE_URL =
  "https://ltsu-smart-portal-api-0i8h.onrender.com";

const REQUEST_TIMEOUT_MS = 12000;

const ROLE_ROUTES = {
  STUDENT: "/dashboard",
  TEACHER: "/teacher",
  ADMIN: "/admin",
};

const VALID_ROLES = new Set(Object.keys(ROLE_ROUTES));

export function getApiBaseUrl() {
  return (
    import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
  ).replace(/\/+$/, "");
}

function createApiError(message, status = 0, details = []) {
  const error = new Error(message);
  error.status = status;
  error.details = Array.isArray(details) ? details : [];
  return error;
}

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
    REQUEST_TIMEOUT_MS,
  );

  let response;

  try {
    response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
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
      throw createApiError("The sign-in request timed out. Please try again.");
    }

    if (error instanceof TypeError) {
      throw createApiError(
        "Unable to reach the sign-in service. Check your connection, API URL, and backend CORS settings.",
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw createApiError(
      getLoginErrorMessage(response.status, payload),
      response.status,
    );
  }

  const result = payload?.data;

  if (
    payload?.status !== "ok" ||
    typeof result?.accessToken !== "string" ||
    result.accessToken.length === 0 ||
    result.tokenType !== "Bearer" ||
    !result.user ||
    typeof result.user.id !== "string" ||
    !VALID_ROLES.has(result.user.role)
  ) {
    throw createApiError(
      "The sign-in service returned an unexpected account response. Please contact support.",
      502,
    );
  }

  return result;
}

export async function fetchCurrentUser(accessToken) {
  if (!accessToken) {
    throw createApiError("A sign-in token is required.", 401);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  let response;

  try {
    response = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError(
        "Session verification timed out. Check your connection and retry.",
      );
    }

    if (error instanceof TypeError) {
      throw createApiError(
        "Unable to reach the authentication service. Check your connection and backend CORS settings.",
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      response.status === 401
        ? "Your sign-in is invalid or has expired."
        : response.status >= 500
          ? "The authentication service is temporarily unavailable."
          : payload?.message || "Unable to verify your sign-in.";

    throw createApiError(message, response.status);
  }

  const user = payload?.data?.user;
  if (
    payload?.status !== "ok" ||
    !user ||
    typeof user.id !== "string" ||
    !VALID_ROLES.has(user.role)
  ) {
    throw createApiError(
      "The authentication service returned an invalid session response.",
      502,
    );
  }

  return user;
}

export async function changeCurrentPassword(
  accessToken,
  { currentPassword, newPassword },
) {
  if (!accessToken) {
    throw createApiError("Your session has expired. Please sign in again.", 401);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  let response;

  try {
    response = await fetch(
      `${getApiBaseUrl()}/api/auth/change-password`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
        signal: controller.signal,
      },
    );
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError(
        "The password change request timed out. Please try again.",
      );
    }

    if (error instanceof TypeError) {
      throw createApiError(
        "Unable to reach the password service. Check your connection and backend CORS settings.",
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      response.status === 401
        ? "Your sign-in has expired or your account is unavailable. Please sign in again."
        : response.status >= 500
          ? "The password service is temporarily unavailable. Please try again."
          : payload?.message || "Unable to change your password.";

    throw createApiError(message, response.status, payload?.details);
  }

  const updatedUser = payload?.data?.user;
  if (
    payload?.status !== "ok" ||
    !updatedUser ||
    typeof updatedUser.id !== "string" ||
    updatedUser.mustChangePassword !== false
  ) {
    throw createApiError(
      "The password service did not confirm that the required password change was completed.",
      502,
    );
  }

  return updatedUser;
}

export function getPortalPath(role) {
  return ROLE_ROUTES[role] || null;
}
