import { getApiBaseUrl } from "../../auth/api/authApi.js";

const REQUEST_TIMEOUT_MS = 12000;

function createApiError(message, status = 0, details = []) {
  const error = new Error(message);
  error.status = status;
  error.details = Array.isArray(details) ? details : [];
  return error;
}

export async function createTeacherSubjectAssignment(accessToken, teacherId, subjectId) {
  if (!accessToken) {
    throw createApiError(
      "Your administrator session is unavailable. Please sign in again.",
      401,
    );
  }

  if (
    typeof teacherId !== "string" ||
    !teacherId.trim() ||
    teacherId.trim().length > 64 ||
    typeof subjectId !== "string" ||
    !subjectId.trim() ||
    subjectId.trim().length > 64
  ) {
    throw createApiError("Select an active teacher and an eligible subject.", 400);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  let response;

  try {
    response = await fetch(
      `${getApiBaseUrl()}/api/admin/teacher-subject-assignments`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          teacherId: teacherId.trim(),
          subjectId: subjectId.trim(),
        }),
        signal: controller.signal,
      },
    );
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError(
        "The assignment request timed out. The server may still have created it; check before trying again.",
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
        ? payload?.message || "The selected teacher or subject is no longer eligible."
        : response.status === 401
          ? "Your administrator session is no longer valid. Please sign in again."
          : response.status === 403
            ? "Your account is not permitted to assign teachers to subjects."
            : response.status === 409
              ? "This teacher is already assigned to the selected subject."
              : response.status >= 500
                ? "The administration service is temporarily unavailable. Please try again."
                : payload?.message || "Unable to create this teacher-subject assignment.";

    throw createApiError(message, response.status, payload?.details);
  }

  const assignment = payload?.data?.assignment;
  if (
    payload?.status !== "ok" ||
    response.status !== 201 ||
    !assignment ||
    typeof assignment.id !== "string" ||
    assignment.teacherId !== teacherId.trim() ||
    assignment.subjectId !== subjectId.trim() ||
    typeof assignment.assignedAt !== "string" ||
    !Number.isFinite(Date.parse(assignment.assignedAt))
  ) {
    throw createApiError(
      "The administration service returned an unexpected assignment response.",
      502,
    );
  }

  return assignment;
}


const MAX_DIRECTORY_PAGE_SIZE = 100;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isAssignmentRow(value) {
  const teacher = value?.teacher;
  const subject = value?.subject;
  const classRecord = subject?.class;

  return (
    value &&
    isNonEmptyString(value.id) &&
    typeof value.assignedAt === "string" &&
    Number.isFinite(Date.parse(value.assignedAt)) &&
    teacher &&
    isNonEmptyString(teacher.id) &&
    isNonEmptyString(teacher.fullName) &&
    isNonEmptyString(teacher.username) &&
    typeof teacher.isActive === "boolean" &&
    subject &&
    isNonEmptyString(subject.id) &&
    isNonEmptyString(subject.code) &&
    isNonEmptyString(subject.name) &&
    typeof subject.isActive === "boolean" &&
    classRecord &&
    isNonEmptyString(classRecord.id) &&
    isNonEmptyString(classRecord.code) &&
    isNonEmptyString(classRecord.name) &&
    isNonEmptyString(classRecord.academicYear) &&
    typeof classRecord.isActive === "boolean"
  );
}

function validateDirectoryFilters({ page, pageSize, search, teacherId, subjectId, classId }) {
  if (!Number.isInteger(page) || page < 1 || page > 100000) {
    throw createApiError("The assignment directory page is invalid.", 400);
  }
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_DIRECTORY_PAGE_SIZE) {
    throw createApiError("The assignment directory page size is invalid.", 400);
  }
  if (search !== undefined && (typeof search !== "string" || search.trim().length > 80)) {
    throw createApiError("Assignment search must be 80 characters or fewer.", 400);
  }
  for (const [label, value] of [
    ["Teacher", teacherId],
    ["Subject", subjectId],
    ["Class", classId],
  ]) {
    if (value !== undefined && (!isNonEmptyString(value) || value.trim().length > 64)) {
      throw createApiError("The " + label.toLowerCase() + " assignment filter is invalid.", 400);
    }
  }
}

export async function fetchAdminTeacherSubjectAssignments(
  accessToken,
  {
    page = 1,
    pageSize = 20,
    search,
    teacherId,
    subjectId,
    classId,
  } = {},
) {
  if (!accessToken) {
    throw createApiError(
      "Your administrator session is unavailable. Please sign in again.",
      401,
    );
  }

  validateDirectoryFilters({ page, pageSize, search, teacherId, subjectId, classId });

  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search?.trim()) query.set("search", search.trim());
  if (teacherId?.trim()) query.set("teacherId", teacherId.trim());
  if (subjectId?.trim()) query.set("subjectId", subjectId.trim());
  if (classId?.trim()) query.set("classId", classId.trim());

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;

  try {
    response = await fetch(
      `${getApiBaseUrl()}/api/admin/teacher-subject-assignments?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        signal: controller.signal,
      },
    );
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError("The assignment directory request timed out. Please try again.");
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
          ? "Your account is not permitted to view teacher-subject assignments."
          : response.status >= 500
            ? "The administration service is temporarily unavailable. Please try again."
            : payload?.message || "Unable to load teacher-subject assignments.";
    throw createApiError(message, response.status, payload?.details);
  }

  const data = payload?.data;
  const pagination = data?.pagination;
  if (
    payload?.status !== "ok" ||
    !Array.isArray(data?.assignments) ||
    !data.assignments.every(isAssignmentRow) ||
    !pagination ||
    !Number.isInteger(pagination.page) ||
    pagination.page < 1 ||
    !Number.isInteger(pagination.pageSize) ||
    pagination.pageSize < 1 ||
    pagination.pageSize > MAX_DIRECTORY_PAGE_SIZE ||
    !Number.isInteger(pagination.total) ||
    pagination.total < 0 ||
    !Number.isInteger(pagination.totalPages) ||
    pagination.totalPages < 0
  ) {
    throw createApiError(
      "The administration service returned an unexpected assignment directory response.",
      502,
    );
  }

  return data;
}
