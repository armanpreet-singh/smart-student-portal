import { getApiBaseUrl } from "../../auth/api/authApi.js";

const REQUEST_TIMEOUT_MS = 12000;
const AUDIT_LOGS_URL = "/api/admin/audit-logs";

function createApiError(message, status = 0) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function buildQuery(filters) {
  const query = new URLSearchParams();
  for (const key of ["page", "pageSize", "search", "action", "entityType", "fromDate", "toDate"]) {
    const value = filters?.[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      query.set(key, String(value).trim());
    }
  }
  return query.toString();
}

function isNullableString(value) {
  return value === null || typeof value === "string";
}

function isAuditLog(value) {
  return Boolean(
    value &&
    typeof value.id === "string" &&
    typeof value.actorId === "string" &&
    typeof value.actorName === "string" &&
    typeof value.actorUsername === "string" &&
    typeof value.action === "string" &&
    typeof value.entityType === "string" &&
    isNullableString(value.entityId) &&
    isNullableString(value.entityLabel) &&
    value.details &&
    typeof value.details === "object" &&
    !Array.isArray(value.details) &&
    isNullableString(value.ipAddress) &&
    isNullableString(value.userAgent) &&
    typeof value.createdAt === "string" &&
    Number.isFinite(Date.parse(value.createdAt))
  );
}

function isPagination(value) {
  return Boolean(
    value &&
    Number.isInteger(value.page) && value.page >= 1 &&
    Number.isInteger(value.pageSize) && value.pageSize >= 1 &&
    Number.isInteger(value.total) && value.total >= 0 &&
    Number.isInteger(value.totalPages) && value.totalPages >= 0
  );
}

export async function fetchAdminAuditLogs(accessToken, filters = {}) {
  if (typeof accessToken !== "string" || !accessToken.trim()) {
    throw createApiError("Your administrator session is unavailable. Please sign in again.", 401);
  }

  const query = buildQuery(filters);
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${getApiBaseUrl()}${AUDIT_LOGS_URL}${query ? `?${query}` : ""}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        signal: controller.signal
      }
    );

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = response.status === 401
        ? "Your administrator session is no longer valid. Please sign in again."
        : response.status === 403
          ? "Only an administrator can view the audit history."
          : response.status >= 500
            ? "The audit history service is temporarily unavailable. Please retry."
            : payload?.message || "Unable to load audit history.";
      throw createApiError(message, response.status);
    }

    const data = payload?.data;
    if (
      payload?.status !== "ok" ||
      !Array.isArray(data?.logs) ||
      !data.logs.every(isAuditLog) ||
      !isPagination(data?.pagination)
    ) {
      throw createApiError("The audit history service returned an unexpected response.", 502);
    }
    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError("The audit history request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw createApiError("Unable to reach the administration service. Check your connection.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
