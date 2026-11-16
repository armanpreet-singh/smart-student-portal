import { getApiBaseUrl } from "../../auth/api/authApi.js";

const REQUEST_TIMEOUT_MS = 12000;
const ROLE_PATHS = {
  ADMIN: "/api/admin/notifications",
  TEACHER: "/api/teacher/notifications",
  STUDENT: "/api/student/notifications"
};

function createApiError(message, status = 0) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function isText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isNotification(value) {
  return Boolean(
    value &&
    isText(value.id) &&
    isText(value.type) &&
    isText(value.title) &&
    isText(value.message) &&
    (value.href === null || typeof value.href === "string") &&
    (value.readAt === null || (isText(value.readAt) && Number.isFinite(Date.parse(value.readAt)))) &&
    isText(value.createdAt) &&
    Number.isFinite(Date.parse(value.createdAt))
  );
}

async function requestNotifications(accessToken, role, suffix = "", options = {}) {
  const basePath = ROLE_PATHS[role];
  if (!basePath) throw createApiError("Your portal role cannot access notifications.", 403);
  if (!isText(accessToken)) {
    throw createApiError("Your session is unavailable. Please sign in again.", 401);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${getApiBaseUrl()}${basePath}${suffix}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...options.headers
      }
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = response.status === 401
        ? "Your session has expired. Please sign in again."
        : response.status === 403
          ? "Your account is not permitted to access these notifications."
          : response.status >= 500
            ? "The notification service is temporarily unavailable."
            : payload?.message || "The notification request could not be completed.";
      throw createApiError(message, response.status);
    }
    if (payload?.status !== "ok" || !payload.data) {
      throw createApiError("The notification service returned an unexpected response.", 502);
    }
    return payload.data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError("The notification request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw createApiError("Unable to reach the notification service. Check your connection.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function fetchNotifications(accessToken, role) {
  const data = await requestNotifications(accessToken, role, "?limit=40");
  if (
    !Array.isArray(data.notifications) ||
    !data.notifications.every(isNotification) ||
    !Number.isInteger(data.unreadCount) ||
    data.unreadCount < 0
  ) {
    throw createApiError("The notification service returned invalid notification data.", 502);
  }
  return data;
}

export async function markNotificationRead(accessToken, role, notificationId) {
  if (!isText(notificationId)) throw createApiError("Choose a valid notification.", 400);
  const data = await requestNotifications(
    accessToken,
    role,
    `/${encodeURIComponent(notificationId)}/read`,
    { method: "PATCH" }
  );
  if (data.id !== notificationId || data.read !== true) {
    throw createApiError("The notification service did not confirm that the notification was read.", 502);
  }
  return data;
}

export async function markAllNotificationsRead(accessToken, role) {
  const data = await requestNotifications(
    accessToken,
    role,
    "/read-all",
    { method: "POST" }
  );
  if (!Number.isInteger(data.updatedCount) || data.updatedCount < 0) {
    throw createApiError("The notification service returned an invalid read confirmation.", 502);
  }
  return data;
}
