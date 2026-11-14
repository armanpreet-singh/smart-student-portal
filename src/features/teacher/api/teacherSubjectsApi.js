import { getApiBaseUrl } from "../../auth/api/authApi";

const REQUEST_TIMEOUT_MS = 12000;

function createApiError(message, status = 0) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isAssignedSubjectRecord(record) {
  const subject = record?.subject;
  const classRecord = subject?.class;

  return (
    record &&
    typeof record.assignedAt === "string" &&
    Number.isFinite(Date.parse(record.assignedAt)) &&
    subject &&
    isNonEmptyString(subject.id) &&
    isNonEmptyString(subject.code) &&
    isNonEmptyString(subject.name) &&
    isNonEmptyString(subject.classId) &&
    classRecord &&
    isNonEmptyString(classRecord.id) &&
    classRecord.id === subject.classId &&
    isNonEmptyString(classRecord.code) &&
    isNonEmptyString(classRecord.name) &&
    isNonEmptyString(classRecord.academicYear)
  );
}

function getRequestErrorMessage(error, response, payload) {
  if (error?.name === "AbortError") {
    return "The assigned-subject request timed out. Please try again.";
  }

  if (error instanceof TypeError) {
    return "Unable to reach the Teacher service. Check your connection and backend CORS settings.";
  }

  if (response?.status === 401) {
    return "Your Teacher session is no longer valid. Please sign in again.";
  }

  if (response?.status === 403) {
    return "Your account is not permitted to view Teacher subject assignments.";
  }

  if (response?.status >= 500) {
    return "The Teacher service is temporarily unavailable. Please try again.";
  }

  return (
    payload?.message ||
    error?.message ||
    "Unable to load your assigned subjects. Please try again."
  );
}

export async function fetchTeacherAssignedSubjects(accessToken) {
  if (!isNonEmptyString(accessToken)) {
    throw createApiError(
      "Your Teacher session is unavailable. Please sign in again.",
      401,
    );
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  let response;
  let payload;

  try {
    response = await fetch(
      `${getApiBaseUrl()}/api/teacher/subjects`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        signal: controller.signal,
      },
    );

    payload = await response.json().catch(() => null);
  } catch (error) {
    throw createApiError(getRequestErrorMessage(error));
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw createApiError(
      getRequestErrorMessage(null, response, payload),
      response.status,
    );
  }

  const subjects = payload?.data?.subjects;
  if (
    payload?.status !== "ok" ||
    !Array.isArray(subjects) ||
    !subjects.every(isAssignedSubjectRecord)
  ) {
    throw createApiError(
      "The Teacher service returned assigned subjects in an unexpected format.",
      502,
    );
  }

  return subjects;
}
