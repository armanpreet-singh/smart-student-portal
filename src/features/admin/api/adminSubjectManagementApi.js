import { getApiBaseUrl } from "../../auth/api/authApi";

const REQUEST_TIMEOUT_MS = 12000;

function createApiError(message, status = 0, details = []) {
  const error = new Error(message);
  error.status = status;
  error.details = Array.isArray(details) ? details : [];
  return error;
}

function isSubjectRecord(value) {
  return (
    value &&
    typeof value.id === "string" &&
    typeof value.classId === "string" &&
    typeof value.code === "string" &&
    typeof value.name === "string" &&
    (value.description === null || typeof value.description === "string") &&
    typeof value.isActive === "boolean" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    value.class &&
    typeof value.class.id === "string" &&
    typeof value.class.code === "string" &&
    typeof value.class.name === "string" &&
    typeof value.class.academicYear === "string" &&
    typeof value.class.isActive === "boolean"
  );
}

function validateSubjectInput(input, { allowStatus = false } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw createApiError("The subject details are invalid.", 400);
  }

  const allowedFields = allowStatus
    ? ["code", "name", "description", "isActive"]
    : ["classId", "code", "name", "description"];

  if (Object.keys(input).some((key) => !allowedFields.includes(key))) {
    throw createApiError("The subject request contains unsupported fields.", 400);
  }

  const normalized = {};

  if (Object.prototype.hasOwnProperty.call(input, "classId")) {
    const classId = typeof input.classId === "string" ? input.classId.trim() : "";
    if (!classId || classId.length > 64) {
      throw createApiError("Select an active parent class.", 400);
    }
    normalized.classId = classId;
  }

  if (Object.prototype.hasOwnProperty.call(input, "code")) {
    const code = typeof input.code === "string" ? input.code.trim() : "";
    if (!code || code.length > 30 || !/^[a-zA-Z0-9._-]+$/.test(code)) {
      throw createApiError(
        "Subject code is required, up to 30 characters, and may contain only letters, numbers, dots, underscores, and hyphens.",
        400,
      );
    }
    normalized.code = code.toUpperCase();
  }

  if (Object.prototype.hasOwnProperty.call(input, "name")) {
    const name = typeof input.name === "string" ? input.name.trim() : "";
    if (name.length < 2 || name.length > 120) {
      throw createApiError("Subject name must be between 2 and 120 characters.", 400);
    }
    normalized.name = name;
  }

  if (Object.prototype.hasOwnProperty.call(input, "description")) {
    const description =
      input.description === null
        ? null
        : typeof input.description === "string"
          ? input.description.trim()
          : undefined;

    if (description === undefined || (description !== null && description.length > 500)) {
      throw createApiError("Subject description must be 500 characters or fewer.", 400);
    }
    normalized.description = description;
  }

  if (Object.prototype.hasOwnProperty.call(input, "isActive")) {
    if (typeof input.isActive !== "boolean") {
      throw createApiError("Subject status must be active or inactive.", 400);
    }
    normalized.isActive = input.isActive;
  }

  if (Object.keys(normalized).length === 0) {
    throw createApiError("Provide at least one subject field to update.", 400);
  }

  return normalized;
}

async function sendSubjectMutation({
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
        "The subject request timed out. Refresh the directory before retrying because the server may have processed the change.",
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
        ? payload?.message || "The subject details are invalid or the parent class is not eligible."
        : response.status === 401
          ? "Your administrator session is no longer valid. Please sign in again."
          : response.status === 403
            ? "Your account is not permitted to manage subjects."
            : response.status === 404
              ? "This subject could not be found. Refresh the directory and try again."
              : response.status === 409
                ? "A subject with this code already exists. Choose a different code."
                : response.status >= 500
                  ? "The administration service is temporarily unavailable. Please try again."
                  : payload?.message || "Unable to save the subject.";

    throw createApiError(message, response.status, payload?.details);
  }

  const subject = payload?.data?.subject;
  if (
    payload?.status !== "ok" ||
    response.status !== expectedStatus ||
    !isSubjectRecord(subject)
  ) {
    throw createApiError(
      "The administration service returned an unexpected subject response.",
      502,
    );
  }

  return subject;
}

export async function createAdminSubject(accessToken, input) {
  const body = validateSubjectInput(input);
  if (
    !Object.prototype.hasOwnProperty.call(body, "classId") ||
    !Object.prototype.hasOwnProperty.call(body, "code") ||
    !Object.prototype.hasOwnProperty.call(body, "name")
  ) {
    throw createApiError(
      "Choose a parent class and enter a subject code and name.",
      400,
    );
  }

  return sendSubjectMutation({
    accessToken,
    path: "/api/admin/subjects",
    method: "POST",
    body,
    expectedStatus: 201,
  });
}

export async function updateAdminSubject(accessToken, subjectId, input) {
  if (
    typeof subjectId !== "string" ||
    !subjectId.trim() ||
    subjectId.trim().length > 64
  ) {
    throw createApiError("The selected subject identifier is invalid.", 400);
  }

  const body = validateSubjectInput(input, { allowStatus: true });

  return sendSubjectMutation({
    accessToken,
    path: `/api/admin/subjects/${encodeURIComponent(subjectId.trim())}`,
    method: "PATCH",
    body,
    expectedStatus: 200,
  });
}
