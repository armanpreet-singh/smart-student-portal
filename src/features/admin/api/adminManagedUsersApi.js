import { getApiBaseUrl } from "../../auth/api/authApi.js";

const REQUEST_TIMEOUT_MS = 12000;

function createApiError(message, status = 0, details = []) {
  const error = new Error(message);
  error.status = status;
  error.details = Array.isArray(details) ? details : [];
  return error;
}

function isNullableString(value) {
  return value === null || typeof value === "string";
}

function isManagedUserRecord(user, role) {
  return Boolean(
    user &&
    typeof user.id === "string" &&
    typeof user.fullName === "string" &&
    typeof user.username === "string" &&
    isNullableString(user.email) &&
    user.role === role &&
    (role !== "STUDENT" || isNullableString(user.rollNumber)) &&
    (user.classId === null || typeof user.classId === "string") &&
    typeof user.mustChangePassword === "boolean" &&
    typeof user.isActive === "boolean" &&
    typeof user.createdAt === "string" &&
    typeof user.updatedAt === "string" &&
    (user.class === null || (
      user.class &&
      typeof user.class.id === "string" &&
      typeof user.class.code === "string" &&
      typeof user.class.name === "string"
    ))
  );
}

function validateProfileInput(role, input) {
  const errors = {};
  const fullName = typeof input.fullName === "string" ? input.fullName.trim() : "";
  const username = typeof input.username === "string" ? input.username.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";

  if (fullName.length < 2 || fullName.length > 120) {
    errors.fullName = "Full name must be between 2 and 120 characters.";
  }
  if (username.length < 3 || username.length > 40 || !/^[a-zA-Z0-9._-]+$/.test(username)) {
    errors.username = "Use 3–40 characters: letters, numbers, dots, underscores or hyphens.";
  }
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    errors.email = "Enter a valid email address (254 characters or fewer).";
  }

  if (role === "STUDENT") {
    const rollNumber = typeof input.rollNumber === "string" ? input.rollNumber.trim() : "";
    if (
      rollNumber &&
      (rollNumber.length > 40 || !/^[a-zA-Z0-9][a-zA-Z0-9./_-]*$/.test(rollNumber))
    ) {
      errors.rollNumber = "Use 1–40 characters beginning with a letter or number; dots, slashes, underscores and hyphens are also allowed.";
    }
    if (input.classId !== undefined && input.classId !== null && typeof input.classId !== "string") {
      errors.classId = "Select a valid class.";
    }
  }

  return errors;
}

export async function updateAdminManagedUser(accessToken, role, userId, input) {
  if (!accessToken) {
    throw createApiError("Your administrator session is unavailable. Please sign in again.", 401);
  }
  if (!["STUDENT", "TEACHER"].includes(role) || typeof userId !== "string" || !userId.trim()) {
    throw createApiError("The managed account selection is invalid.", 400);
  }

  const errors = validateProfileInput(role, input);
  if (Object.keys(errors).length) {
    const error = createApiError("Review the account details and correct the highlighted fields.", 400);
    error.fieldErrors = errors;
    throw error;
  }

  const body = {
    fullName: input.fullName.trim(),
    username: input.username.trim().toLowerCase(),
    email: input.email?.trim() ? input.email.trim().toLowerCase() : null
  };

  if (role === "STUDENT") {
    body.rollNumber = input.rollNumber?.trim() ? input.rollNumber.trim().toUpperCase() : null;
    body.classId = input.classId || null;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;

  try {
    response = await fetch(
      `${getApiBaseUrl()}/api/admin/users/${encodeURIComponent(userId)}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(body),
        signal: controller.signal
      }
    );
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError("The account update request timed out. Refresh the directory before retrying.");
    }
    if (error instanceof TypeError) {
      throw createApiError("Unable to reach the administration service. Check your connection.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = response.status === 401
      ? "Your administrator session is no longer valid. Please sign in again."
      : response.status === 403
        ? "Your account is not permitted to edit managed accounts."
        : response.status === 404
          ? "This account is no longer available. Refresh the directory."
          : response.status === 409
            ? payload?.message || "A user with this username, email or roll number already exists."
            : response.status >= 500
              ? "The administration service is temporarily unavailable. Please try again."
              : payload?.message || "Unable to update the account.";
    throw createApiError(message, response.status, payload?.details);
  }

  const user = payload?.data?.user;
  if (payload?.status !== "ok" || !isManagedUserRecord(user, role)) {
    throw createApiError("The administration service returned an unexpected account update response.", 502);
  }

  return user;
}


function isManagedUserDeletionResult(user, role) {
  return Boolean(
    user &&
    typeof user.id === "string" &&
    typeof user.fullName === "string" &&
    typeof user.username === "string" &&
    user.role === role &&
    user.isActive === false &&
    typeof user.deletedAt === "string" &&
    Number.isFinite(Date.parse(user.deletedAt))
  );
}

export async function deleteAdminManagedUser(accessToken, role, userId) {
  if (!accessToken) {
    throw createApiError("Your administrator session is unavailable. Please sign in again.", 401);
  }
  if (!["STUDENT", "TEACHER"].includes(role) || typeof userId !== "string" || !userId.trim()) {
    throw createApiError("The managed account selection is invalid.", 400);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;

  try {
    response = await fetch(
      `${getApiBaseUrl()}/api/admin/users/${encodeURIComponent(userId)}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        signal: controller.signal
      }
    );
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError("The account deletion request timed out. Refresh the directory before retrying.");
    }
    if (error instanceof TypeError) {
      throw createApiError("Unable to reach the administration service. Check your connection.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = response.status === 401
      ? "Your administrator session is no longer valid. Please sign in again."
      : response.status === 403
        ? "Your account is not permitted to delete managed accounts."
        : response.status === 404
          ? "This account is no longer available. Refresh the directory."
          : response.status === 409
            ? payload?.message || "This account cannot be deleted in its current state."
            : response.status >= 500
              ? "The administration service is temporarily unavailable. Please try again."
              : payload?.message || "Unable to delete the account.";
    throw createApiError(message, response.status, payload?.details);
  }

  const user = payload?.data?.user;
  if (payload?.status !== "ok" || !isManagedUserDeletionResult(user, role)) {
    throw createApiError("The administration service returned an unexpected account deletion response.", 502);
  }

  return user;
}
