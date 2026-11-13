import { getApiBaseUrl } from "../../auth/api/authApi";
import { fetchAdminClasses } from "./adminCatalogueApi";

const REQUEST_TIMEOUT_MS = 12000;
const CLASS_PAGE_SIZE = 100;
const MAX_CLASS_PAGES = 100;

function createApiError(message, status = 0, details = []) {
  const error = new Error(message);
  error.status = status;
  error.details = Array.isArray(details) ? details : [];
  return error;
}

function utf8ByteLength(value) {
  return new TextEncoder().encode(value).length;
}

function validateStudentInput(input) {
  const errors = {};

  const fullName = input.fullName.trim();
  const username = input.username.trim();
  const email = input.email.trim();
  const password = input.temporaryPassword;
  const confirmPassword = input.confirmPassword;

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
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
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
  if (password !== confirmPassword) {
    errors.confirmPassword = "The passwords do not match.";
  }

  return errors;
}

function isStudentRecord(user) {
  return (
    user &&
    typeof user.id === "string" &&
    typeof user.fullName === "string" &&
    typeof user.username === "string" &&
    (user.email === null || typeof user.email === "string") &&
    user.role === "STUDENT" &&
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

export async function fetchActiveStudentClassOptions(accessToken) {
  const first = await fetchAdminClasses(accessToken, {
    page: 1,
    pageSize: CLASS_PAGE_SIZE,
    isActive: "true",
  });

  const totalPages = Math.max(first.pagination.totalPages, 1);
  if (totalPages > MAX_CLASS_PAGES) {
    throw createApiError(
      "There are too many active classes to load safely. Contact support.",
      502,
    );
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchAdminClasses(accessToken, {
        page: index + 2,
        pageSize: CLASS_PAGE_SIZE,
        isActive: "true",
      }),
    ),
  );

  return [...first.rows, ...remainingPages.flatMap((page) => page.rows)]
    .filter((classItem) => classItem.isActive)
    .sort((left, right) =>
      left.code.localeCompare(right.code, undefined, { numeric: true }),
    );
}

export async function createAdminStudent(accessToken, input) {
  if (!accessToken) {
    throw createApiError(
      "Your administrator session is unavailable. Please sign in again.",
      401,
    );
  }

  const errors = validateStudentInput(input);
  if (Object.keys(errors).length > 0) {
    const error = createApiError(
      "Review the student details and correct the highlighted fields.",
      400,
    );
    error.fieldErrors = errors;
    throw error;
  }

  const body = {
    fullName: input.fullName.trim(),
    username: input.username.trim().toLowerCase(),
    role: "STUDENT",
    temporaryPassword: input.temporaryPassword,
  };

  if (input.email.trim()) {
    body.email = input.email.trim().toLowerCase();
  }
  if (input.classId) {
    body.classId = input.classId;
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
        "The student account request timed out. Verify the directory before retrying.",
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
          ? "Your account is not permitted to create student accounts."
          : response.status === 409
            ? payload?.message ||
              "An account with these details already exists. Check the username and email."
            : response.status >= 500
              ? "The administration service is temporarily unavailable. Please try again."
              : payload?.message || "Unable to create the student account.";

    throw createApiError(message, response.status, payload?.details);
  }

  const user = payload?.data?.user;
  if (payload?.status !== "ok" || !isStudentRecord(user)) {
    throw createApiError(
      "The administration service returned an unexpected account creation response.",
      502,
    );
  }

  return user;
}
