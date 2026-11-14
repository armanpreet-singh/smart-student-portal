import { getApiBaseUrl } from "../../auth/api/authApi";

const REQUEST_TIMEOUT_MS = 12000;

function createApiError(message, status = 0, details = []) {
  const error = new Error(message);
  error.status = status;
  error.details = Array.isArray(details) ? details : [];
  return error;
}

function isClassRecord(value) {
  return (
    value &&
    typeof value.id === "string" &&
    typeof value.code === "string" &&
    typeof value.name === "string" &&
    typeof value.academicYear === "string" &&
    typeof value.isActive === "boolean" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    value._count &&
    Number.isInteger(value._count.students) &&
    value._count.students >= 0 &&
    Number.isInteger(value._count.subjects) &&
    value._count.subjects >= 0
  );
}

function validateClassInput(input, { allowStatus = false } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw createApiError("The class details are invalid.", 400);
  }

  const allowedFields = allowStatus
    ? ["code", "name", "academicYear", "isActive"]
    : ["code", "name", "academicYear"];

  if (Object.keys(input).some((key) => !allowedFields.includes(key))) {
    throw createApiError("The class request contains unsupported fields.", 400);
  }

  const normalized = {};

  if (Object.prototype.hasOwnProperty.call(input, "code")) {
    const code = typeof input.code === "string" ? input.code.trim() : "";
    if (!code || code.length > 30 || !/^[a-zA-Z0-9._-]+$/.test(code)) {
      throw createApiError(
        "Class code is required, up to 30 characters, and may contain only letters, numbers, dots, underscores, and hyphens.",
        400,
      );
    }
    normalized.code = code.toUpperCase();
  }

  if (Object.prototype.hasOwnProperty.call(input, "name")) {
    const name = typeof input.name === "string" ? input.name.trim() : "";
    if (name.length < 2 || name.length > 120) {
      throw createApiError("Class name must be between 2 and 120 characters.", 400);
    }
    normalized.name = name;
  }

  if (Object.prototype.hasOwnProperty.call(input, "academicYear")) {
    const academicYear =
      typeof input.academicYear === "string" ? input.academicYear.trim() : "";
    if (academicYear.length < 4 || academicYear.length > 20) {
      throw createApiError(
        "Academic year must be between 4 and 20 characters.",
        400,
      );
    }
    normalized.academicYear = academicYear;
  }

  if (Object.prototype.hasOwnProperty.call(input, "isActive")) {
    if (typeof input.isActive !== "boolean") {
      throw createApiError("Class status must be active or inactive.", 400);
    }
    normalized.isActive = input.isActive;
  }

  if (Object.keys(normalized).length === 0) {
    throw createApiError("Provide at least one class field to update.", 400);
  }

  return normalized;
}

async function sendClassMutation({
  accessToken,
  path,
  method,
  body,
  expectedStatus,
}) {
  if (!accessToken) {
    throw createApiError(
      "Your administrator session is unavailable. Please sign in again.",
      401,
    );
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  let response;

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
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
        "The class request timed out. Refresh the class directory before retrying because the server may have processed the change.",
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
      response.status === 400
        ? payload?.message || "The class details are invalid or the class is not eligible for this change."
        : response.status === 401
          ? "Your administrator session is no longer valid. Please sign in again."
          : response.status === 403
            ? "Your account is not permitted to manage classes."
            : response.status === 404
              ? "This class could not be found. Refresh the directory and try again."
              : response.status === 409
                ? "A class with this code already exists. Choose a different code."
                : response.status >= 500
                  ? "The administration service is temporarily unavailable. Please try again."
                  : payload?.message || "Unable to save the class.";

    throw createApiError(message, response.status, payload?.details);
  }

  const classRecord = payload?.data?.class;
  if (
    payload?.status !== "ok" ||
    response.status !== expectedStatus ||
    !isClassRecord(classRecord)
  ) {
    throw createApiError(
      "The administration service returned an unexpected class response.",
      502,
    );
  }

  return classRecord;
}

export async function createAdminClass(accessToken, input) {
  const body = validateClassInput(input);
  if (
    !Object.prototype.hasOwnProperty.call(body, "code") ||
    !Object.prototype.hasOwnProperty.call(body, "name") ||
    !Object.prototype.hasOwnProperty.call(body, "academicYear")
  ) {
    throw createApiError(
      "Enter a class code, class name, and academic year.",
      400,
    );
  }

  return sendClassMutation({
    accessToken,
    path: "/api/admin/classes",
    method: "POST",
    body,
    expectedStatus: 201,
  });
}

export async function updateAdminClass(accessToken, classId, input) {
  if (
    typeof classId !== "string" ||
    !classId.trim() ||
    classId.trim().length > 64
  ) {
    throw createApiError("The selected class identifier is invalid.", 400);
  }

  const body = validateClassInput(input, { allowStatus: true });

  return sendClassMutation({
    accessToken,
    path: `/api/admin/classes/${encodeURIComponent(classId.trim())}`,
    method: "PATCH",
    body,
    expectedStatus: 200,
  });
}
