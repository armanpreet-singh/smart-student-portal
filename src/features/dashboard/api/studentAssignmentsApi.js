import { getApiBaseUrl } from "../../auth/api/authApi.js";

const REQUEST_TIMEOUT_MS = 12000;

function createApiError(message, status = 0) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function isString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isOptionalDate(value) {
  return value === null || (typeof value === "string" && Number.isFinite(Date.parse(value)));
}

function isAssignment(value) {
  return Boolean(
    value &&
    isString(value.id) &&
    isString(value.title) &&
    isString(value.instructions) &&
    Number.isInteger(value.maxMarks) &&
    value.maxMarks > 0 &&
    isOptionalDate(value.dueAt) &&
    isOptionalDate(value.publishedAt) &&
    value.publishedAt &&
    value.subject &&
    isString(value.subject.code) &&
    isString(value.subject.name) &&
    value.subject.class &&
    isString(value.subject.class.name) &&
    (value.submission === null ||
      (isString(value.submission.id) &&
        typeof value.submission.content === "string" &&
        isOptionalDate(value.submission.submittedAt) &&
        (value.submission.result === null ||
          (Number.isInteger(value.submission.result.marksAwarded) &&
            typeof value.submission.result.feedback === "string" ||
            value.submission.result.feedback === null))))
  );
}

async function requestStudentAssignments(accessToken, path, options = {}) {
  if (!isString(accessToken)) {
    throw createApiError("Your Student session is unavailable. Please sign in again.", 401);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
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
        ? "Your Student session has expired. Please sign in again."
        : response.status === 403
          ? "Your account is not permitted to access assignments."
          : response.status >= 500
            ? "The assignment service is temporarily unavailable. Please retry."
            : payload?.message || "The assignment request could not be completed.";
      throw createApiError(message, response.status);
    }

    if (payload?.status !== "ok" || !payload.data) {
      throw createApiError("The assignment service returned an unexpected response.", 502);
    }
    return payload.data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError("The assignment request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw createApiError("Unable to reach the assignment service. Check your connection.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function fetchStudentAssignments(accessToken) {
  const data = await requestStudentAssignments(accessToken, "/api/student/assignments");
  if (!Array.isArray(data.assignments) || !data.assignments.every(isAssignment)) {
    throw createApiError("The assignment service returned an invalid assignment list.", 502);
  }
  return data.assignments;
}

export async function submitStudentAssignment(accessToken, assignmentId, content) {
  if (!isString(content)) {
    throw createApiError("Enter your answer before submitting.", 400);
  }
  const data = await requestStudentAssignments(
    accessToken,
    `/api/student/assignments/${encodeURIComponent(assignmentId)}/submission`,
    {
      method: "POST",
      body: JSON.stringify({ content })
    }
  );

  if (
    !data.submission ||
    !isString(data.submission.id) ||
    data.submission.assignmentId !== assignmentId ||
    data.submission.content !== content.trim() ||
    !isOptionalDate(data.submission.submittedAt) ||
    !data.submission.submittedAt
  ) {
    throw createApiError("The assignment service did not confirm your submission.", 502);
  }
  return data.submission;
}
