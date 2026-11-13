import { getApiBaseUrl } from "../../auth/api/authApi";

const REQUEST_TIMEOUT_MS = 12000;

function createApiError(message, status = 0, details = []) {
  const error = new Error(message);
  error.status = status;
  error.details = Array.isArray(details) ? details : [];
  return error;
}

function utf8ByteLength(value) {
  return new TextEncoder().encode(value).length;
}

function validateTeacherInput(input) {
  const errors = {};
  const fullName = input.fullName.trim();
  const username = input.username.trim();
  const email = input.email.trim();
  const password = input.temporaryPassword;

  if (fullName.length < 2 || fullName.length > 120) {
    errors.fullName = "Full name must be between 2 and 120 characters.";
  }
  if (
    username.length < 3 ||
    username.length > 40 ||
    !/^[a-zA-Z0-9._-]+$/.test(username)
  ) {
    errors.username =
      "Username must be 3–40 characters and use only letters, numbers, dots, underscores or hyphens.";
  }
  if (
    email &&
    (email.length > 254 ||
      !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email))
  ) {
    errors.email = "Enter a valid email address (254 characters or fewer).";
  }
  if (password.length < 12) {
    errors.temporaryPassword =
      "Temporary password must be at least 12 characters.";
  } else if (utf8ByteLength(password) > 72) {
    errors.temporaryPassword =
      "Temporary password must be no more than 72 UTF-8 bytes.";
  }
  if (password !== input.confirmPassword) {
    errors.confirmPassword = "The passwords do not match.";
  }

  return errors;
}

function isTeacherRecord(user) {
  return (
    user &&
    typeof user.id === "string" &&
    typeof user.fullName === "string" &&
    typeof user.username === "string" &&
    (user.email === null || typeof user.email === "string") &&
    user.role === "TEACHER" &&
    (user.classId === null || typeof user.classId === "string") &&
    typeof user.mustChangePassword === "boolean" &&
    typeof user.isActive === "boolean" &&
    typeof user.createdAt === "string" &&
    typeof user.updatedAt === "string" &&
    (user.class === null ||
      (user.class &&
        typeof user.class.id === "string" &&
        typeof user.class.code === "string" &&
        typeof user.class.name === "string"))
  );
}

export async function createAdminTeacher(accessToken, input) {
  if (!accessToken) {
    throw createApiError(
      "Your administrator session is unavailable. Please sign in again.",
      401,
    );
  }

  const errors = validateTeacherInput(input);
  if (Object.keys(errors).length > 0) {
    const error = createApiError(
      "Review the teacher details and correct the highlighted fields.",
      400,
    );
    error.fieldErrors = errors;
    throw error;
  }

  // The backend schema rejects classId for TEACHER accounts.
  const body = {
    fullName: input.fullName.trim(),
    username: input.username.trim().toLowerCase(),
    role: "TEACHER",
    temporaryPassword: input.temporaryPassword,
  };

  if (input.email.trim()) {
    body.email = input.email.trim().toLowerCase();
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  let response;

  try {
    response = await fetch(`${getApiBaseUrl()}/api/admin/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError(
        "The teacher account request timed out. Verify the directory before retrying.",
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
          ? "Your account is not permitted to create teacher accounts."
          : response.status === 409
            ? payload?.message ||
              "An account with these details already exists. Check the username and email."
            : response.status >= 500
              ? "The administration service is temporarily unavailable. Please try again."
              : payload?.message || "Unable to create the teacher account.";

    throw createApiError(message, response.status, payload?.details);
  }

  const user = payload?.data?.user;
  if (payload?.status !== "ok" || !isTeacherRecord(user)) {
    throw createApiError(
      "The administration service returned an unexpected account creation response.",
      502,
    );
  }

  return user;
}
