import { getApiBaseUrl } from "../../auth/api/authApi";

const REQUEST_TIMEOUT_MS = 12000;
const MANAGED_ROLES = new Set(["STUDENT", "TEACHER"]);

function createApiError(message, status = 0, details = []) {
  const error = new Error(message);
  error.status = status;
  error.details = Array.isArray(details) ? details : [];
  return error;
}

function utf8ByteLength(value) {
  return new TextEncoder().encode(value).length;
}

function isResetUser(user, expectedId, expectedRole) {
  return Boolean(user && user.id === expectedId && typeof user.fullName === "string" && typeof user.username === "string" && (user.email === null || typeof user.email === "string") && user.role === expectedRole && MANAGED_ROLES.has(user.role) && (user.classId === null || typeof user.classId === "string") && user.mustChangePassword === true && typeof user.isActive === "boolean" && typeof user.createdAt === "string" && typeof user.updatedAt === "string" && (user.class === null || (user.class && typeof user.class.id === "string" && typeof user.class.code === "string" && typeof user.class.name === "string")));
}

export async function resetManagedAccountPassword(accessToken, userId, role, temporaryPassword, confirmPassword) {
  if (!accessToken) throw createApiError("Your administrator session is unavailable. Please sign in again.", 401);
  if (typeof userId !== "string" || !userId.trim() || !MANAGED_ROLES.has(role)) throw createApiError("The password reset request is invalid.", 400);
  const fieldErrors = {};
  if (typeof temporaryPassword !== "string" || temporaryPassword.length < 12) fieldErrors.temporaryPassword = "Temporary password must be at least 12 characters.";
  else if (utf8ByteLength(temporaryPassword) > 72) fieldErrors.temporaryPassword = "Temporary password must be no more than 72 UTF-8 bytes.";
  if (temporaryPassword !== confirmPassword) fieldErrors.confirmPassword = "The passwords do not match.";
  if (Object.keys(fieldErrors).length) {
    const error = createApiError("Review the temporary password and correct the highlighted fields.", 400);
    error.fieldErrors = fieldErrors;
    throw error;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${getApiBaseUrl()}/api/admin/users/${encodeURIComponent(userId)}/password-reset`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ temporaryPassword }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw createApiError("The password reset request timed out. Refresh the directory before retrying.");
    if (error instanceof TypeError) throw createApiError("Unable to reach the administration service. Check your connection and backend CORS settings.");
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = response.status === 400 ? payload?.message || "The temporary password does not meet server requirements." : response.status === 401 ? "Your administrator session is no longer valid. Please sign in again." : response.status === 403 ? "Your account is not permitted to reset managed passwords." : response.status === 404 ? "This managed account could not be found or cannot be reset." : response.status >= 500 ? "The administration service is temporarily unavailable. Please try again." : payload?.message || "Unable to reset this account password.";
    throw createApiError(message, response.status, payload?.details);
  }
  const user = payload?.data?.user;
  if (payload?.status !== "ok" || !isResetUser(user, userId, role)) throw createApiError("The administration service returned an unexpected password reset response.", 502);
  return user;
}
