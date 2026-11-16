import { getApiBaseUrl } from "../../auth/api/authApi.js";

const REQUEST_TIMEOUT_MS = 12000;

function createApiError(message, status = 0, details = []) {
  const error = new Error(message);
  error.status = status;
  error.details = Array.isArray(details) ? details : [];
  return error;
}

function isClassSummary(value) {
  return (
    value &&
    typeof value.id === "string" &&
    typeof value.code === "string" &&
    typeof value.name === "string" &&
    typeof value.academicYear === "string" &&
    typeof value.isActive === "boolean"
  );
}

function isCourseRecord(value) {
  return (
    value &&
    typeof value.id === "string" &&
    typeof value.classId === "string" &&
    typeof value.code === "string" &&
    typeof value.name === "string" &&
    (value.description === null || typeof value.description === "string") &&
    value.class &&
    typeof value.class.id === "string" &&
    typeof value.class.code === "string" &&
    typeof value.class.name === "string" &&
    typeof value.class.academicYear === "string" &&
    value.classId === value.class.id
  );
}

function isCatalogue(data) {
  return (
    data &&
    (data.class === null || isClassSummary(data.class)) &&
    Array.isArray(data.courses) &&
    data.courses.every(
      (course) => isCourseRecord(course) && course.classId === data.class?.id,
    )
  );
}

async function requestCourses(accessToken) {
  if (!accessToken) {
    throw createApiError("Your Student session is unavailable. Please sign in again.", 401);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;

  try {
    response = await fetch(`${getApiBaseUrl()}/api/student/courses`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError("The course catalogue request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw createApiError(
        "Unable to reach the course catalogue. Check your connection and backend CORS settings.",
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
        ? "Your Student session is no longer valid. Please sign in again."
        : response.status === 403
          ? "Your account is not permitted to view the Student course catalogue."
          : response.status === 404
            ? payload?.message || "Your active Student account could not be found."
            : response.status >= 500
              ? "The course catalogue is temporarily unavailable. Please try again."
              : payload?.message || "Unable to load your courses.";
    throw createApiError(message, response.status, payload?.details);
  }

  if (payload?.status !== "ok" || !isCatalogue(payload.data)) {
    throw createApiError(
      "The course catalogue returned an unexpected response. Please retry or contact support.",
      502,
    );
  }

  return payload.data;
}

export async function fetchStudentCourses(accessToken) {
  return requestCourses(accessToken);
}
