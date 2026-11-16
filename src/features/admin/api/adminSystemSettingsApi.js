import { getApiBaseUrl } from "../../auth/api/authApi.js";

const REQUEST_TIMEOUT_MS = 12000;
const SETTINGS_URL = "/api/admin/system-settings";

function createApiError(message, status = 0) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function isText(value) {
  return typeof value === "string";
}

export function isAdminSystemSettings(value) {
  return Boolean(
    value &&
    value.id === "global" &&
    typeof value.universityName === "string" &&
    typeof value.universityShortName === "string" &&
    (value.supportEmail === null || typeof value.supportEmail === "string") &&
    (value.supportPhone === null || typeof value.supportPhone === "string") &&
    (value.websiteUrl === null || typeof value.websiteUrl === "string") &&
    typeof value.currentAcademicYear === "string" &&
    Number.isInteger(value.attendanceThresholdPercent) &&
    value.attendanceThresholdPercent >= 1 &&
    value.attendanceThresholdPercent <= 100 &&
    typeof value.updatedAt === "string" &&
    Number.isFinite(Date.parse(value.updatedAt)) &&
    (value.updatedBy === null || (
      value.updatedBy &&
      typeof value.updatedBy.id === "string" &&
      typeof value.updatedBy.fullName === "string" &&
      typeof value.updatedBy.username === "string"
    ))
  );
}

async function requestSettings(accessToken, options = {}) {
  if (!isText(accessToken) || !accessToken.trim()) {
    throw createApiError("Your administrator session is unavailable. Please sign in again.", 401);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${getApiBaseUrl()}${SETTINGS_URL}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${accessToken}`,
        ...options.headers
      }
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = response.status === 401
        ? "Your administrator session is no longer valid. Please sign in again."
        : response.status === 403
          ? "Only an administrator can manage system settings."
          : response.status >= 500
            ? "The system settings service is temporarily unavailable. Please retry."
            : payload?.message || "The system settings request could not be completed.";
      throw createApiError(message, response.status);
    }
    if (payload?.status !== "ok" || !isAdminSystemSettings(payload.data?.settings)) {
      throw createApiError("The settings service returned an unexpected configuration response.", 502);
    }
    return payload.data.settings;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError("The system settings request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw createApiError("Unable to reach the administration service. Check your connection.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function fetchAdminSystemSettings(accessToken) {
  return requestSettings(accessToken);
}

export function updateAdminSystemSettings(accessToken, settings) {
  return requestSettings(accessToken, {
    method: "PUT",
    body: JSON.stringify(settings)
  });
}
