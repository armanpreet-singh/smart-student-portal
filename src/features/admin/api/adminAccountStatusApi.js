import { getApiBaseUrl } from "../../auth/api/authApi";

const REQUEST_TIMEOUT_MS = 12000;
const MANAGED_ROLES = ["STUDENT", "TEACHER"];

function createApiError(message, status = 0, details = []) {
  const error = new Error(message);
  error.status = status;
  error.details = Array.isArray(details) ? details : [];
  return error;
}

function isNullableString(value) {
  return value === null || typeof value === "string";
}

function isManagedUser(value, expectedId, expectedRole, expectedStatus) {
  return (
    value &&
    value.id === expectedId &&
    typeof value.fullName === "string" &&
    typeof value.username === "string" &&
    isNullableString(value.email) &&
    value.role === expectedRole &&
    MANAGED_ROLES.includes(value.role) &&
    isNullableString(value.classId) &&
    typeof value.mustChangePassword === "boolean" &&
    value.isActive === expectedStatus &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    (value.class === null ||
      (value.class &&
        typeof value.class.id === "string" &&
        typeof value.class.code === "string" &&
        typeof value.class.name === "string"))
  );
}

export async function updateManagedAccountStatus(
  accessToken,
  userId,
  role,
  isActive,
) {
  if (!accessToken) {
    throw createApiError(
      "Your administrator session is unavailable. Please sign in again.",
      401,
    );
  }

  if (
    typeof userId !== "string" ||
    !userId.trim() ||
    !MANAGED_ROLES.includes(role) ||
    typeof isActive !== "boolean"
  ) {
    throw createApiError("The account status request is invalid.", 400);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  let response;

  try {
    response = await fetch(
      `${getApiBaseUrl()}/api/admin/users/${encodeURIComponent(userId)}/status`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ isActive }),
        signal: controller.signal,
      },
    );
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError(
        "The account status request timed out. Refresh the directory to verify the current status.",
      );
    }

    if (error instanceof TypeError) {
      throw createApiError(
        "Unable to reach the administration service. Check your connection and backend CORS settings.",
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
        ? "Your administrator session is no longer valid. Please sign in again."
        : response.status === 403
          ? "Your account is not permitted to change this account status."
          : response.status === 404
            ? "This managed account could not be found or cannot be changed."
            : response.status >= 500
              ? "The administration service is temporarily unavailable. Please try again."
              : payload?.message || "Unable to update this account status.";

    throw createApiError(message, response.status, payload?.details);
  }

  const user = payload?.data?.user;
  if (
    payload?.status !== "ok" ||
    !isManagedUser(user, userId, role, isActive)
  ) {
    throw createApiError(
      "The administration service returned an unexpected account status response.",
      502,
    );
  }

  return user;
}
