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

async function requestTeacherApi(path, accessToken, timeoutMessage) {
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
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      signal: controller.signal,
    });

    payload = await response.json().catch(() => null);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError(timeoutMessage);
    }

    if (error instanceof TypeError) {
      throw createApiError(
        "Unable to reach the Teacher service. Check your connection and backend CORS settings.",
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const message =
      response.status === 401
        ? "Your Teacher session is no longer valid. Please sign in again."
        : response.status === 403
          ? "Your account is not permitted to view this Teacher resource."
          : response.status === 404
            ? payload?.message ||
              "This subject assignment is no longer available. Refresh your assigned subjects."
            : response.status >= 500
              ? "The Teacher service is temporarily unavailable. Please try again."
              : payload?.message || "The Teacher service rejected the request.";

    throw createApiError(message, response.status);
  }

  if (payload?.status !== "ok" || !payload.data) {
    throw createApiError(
      "The Teacher service returned a response in an unexpected format.",
      502,
    );
  }

  return payload.data;
}

export async function fetchTeacherAssignedSubjects(accessToken) {
  const data = await requestTeacherApi(
    "/api/teacher/subjects",
    accessToken,
    "The assigned-subject request timed out. Please try again.",
  );

  if (
    !Array.isArray(data.subjects) ||
    !data.subjects.every(isAssignedSubjectRecord)
  ) {
    throw createApiError(
      "The Teacher service returned assigned subjects in an unexpected format.",
      502,
    );
  }

  return data.subjects;
}

function isRosterSubject(subject, expectedSubjectId, expectedClassId) {
  const classRecord = subject?.class;

  return (
    subject &&
    subject.id === expectedSubjectId &&
    isNonEmptyString(subject.code) &&
    isNonEmptyString(subject.name) &&
    classRecord &&
    classRecord.id === expectedClassId &&
    isNonEmptyString(classRecord.code) &&
    isNonEmptyString(classRecord.name)
  );
}

function isRosterStudent(student) {
  return (
    student &&
    isNonEmptyString(student.id) &&
    isNonEmptyString(student.fullName) &&
    isNonEmptyString(student.username)
  );
}

export async function fetchTeacherSubjectRoster(
  accessToken,
  subjectId,
  classId,
) {
  if (!isNonEmptyString(subjectId) || subjectId.length > 64) {
    throw createApiError("Select a valid assigned subject.", 400);
  }

  if (!isNonEmptyString(classId) || classId.length > 64) {
    throw createApiError("The selected subject has an invalid class.", 400);
  }

  const data = await requestTeacherApi(
    `/api/teacher/subjects/${encodeURIComponent(subjectId)}/roster`,
    accessToken,
    "The student-roster request timed out. Please try again.",
  );

  if (
    !isRosterSubject(data.subject, subjectId, classId) ||
    !Array.isArray(data.students) ||
    !data.students.every(isRosterStudent) ||
    new Set(data.students.map((student) => student.id)).size !==
      data.students.length
  ) {
    throw createApiError(
      "The Teacher service returned a roster in an unexpected format.",
      502,
    );
  }

  return data;
}
