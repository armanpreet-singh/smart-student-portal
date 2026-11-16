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

function isAssignment(value, includeCounts = false) {
  return Boolean(
    value &&
    isString(value.id) &&
    isString(value.title) &&
    typeof value.instructions === "string" &&
    (value.instructions.trim().length > 0 || Boolean(value.attachment)) &&
    isOptionalDate(value.assignmentDate) &&
    Number.isInteger(value.maxMarks) &&
    value.maxMarks > 0 &&
    isOptionalDate(value.dueAt) &&
    isOptionalDate(value.publishedAt) &&
    isOptionalDate(value.createdAt) &&
    (value.attachment === null ||
      (value.attachment &&
        isString(value.attachment.fileName) &&
        isString(value.attachment.mimeType) &&
        isString(value.attachment.format) &&
        Number.isInteger(value.attachment.bytes) &&
        value.attachment.bytes >= 0)) &&
    value.subject &&
    isString(value.subject.id) &&
    isString(value.subject.code) &&
    isString(value.subject.name) &&
    value.subject.class &&
    isString(value.subject.class.id) &&
    isString(value.subject.class.code) &&
    isString(value.subject.class.name) &&
    (!includeCounts ||
      (Number.isInteger(value.submissionCount) &&
        value.submissionCount >= 0 &&
        Number.isInteger(value.studentCount) &&
        value.studentCount >= 0))
  );
}

function isSubmission(value) {
  return Boolean(
    value &&
    isString(value.id) &&
    isString(value.studentId) &&
    isString(value.content) &&
    isOptionalDate(value.submittedAt) &&
    (value.marksAwarded === null || Number.isInteger(value.marksAwarded)) &&
    (value.feedback === null || typeof value.feedback === "string") &&
    isOptionalDate(value.gradedAt) &&
    isOptionalDate(value.resultPublishedAt)
  );
}

async function requestTeacherAssignments(accessToken, path, options = {}) {
  if (!isString(accessToken)) {
    throw createApiError("Your Teacher session is unavailable. Please sign in again.", 401);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.body && !(typeof FormData !== "undefined" && options.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
        Authorization: `Bearer ${accessToken}`,
        ...options.headers
      }
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = response.status === 401
        ? "Your Teacher session has expired. Please sign in again."
        : response.status === 403
          ? "Your account is not permitted to manage assignments."
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

function jsonRequest(method, body) {
  return {
    method,
    body: JSON.stringify(body)
  };
}

function multipartRequest(method, input) {
  const body = new FormData();
  for (const key of [
    "subjectId",
    "title",
    "instructions",
    "assignmentDate",
    "dueAt",
    "maxMarks"
  ]) {
    if (input[key] !== undefined && input[key] !== null) {
      body.append(key, String(input[key]));
    }
  }
  if (input.attachmentFile) {
    body.append("attachment", input.attachmentFile);
  }
  if (input.removeAttachment) {
    body.append("removeAttachment", "true");
  }
  return { method, body };
}

function validateAttachmentResponse(data) {
  const attachment = data?.attachment;
  if (
    !attachment ||
    !isString(attachment.url) ||
    !isOptionalDate(attachment.expiresAt) ||
    !isString(attachment.fileName) ||
    !isString(attachment.mimeType)
  ) {
    throw createApiError("The assignment service returned an invalid file link.", 502);
  }
  return attachment;
}

export async function fetchTeacherAssignments(accessToken) {
  const data = await requestTeacherAssignments(accessToken, "/api/teacher/assignments");
  if (!Array.isArray(data.assignments) || !data.assignments.every((item) => isAssignment(item, true))) {
    throw createApiError("The assignment service returned an invalid assignment list.", 502);
  }
  return data.assignments;
}

export async function createTeacherAssignment(accessToken, input) {
  const data = await requestTeacherAssignments(
    accessToken,
    "/api/teacher/assignments",
    multipartRequest("POST", input)
  );
  if (!isAssignment(data.assignment)) {
    throw createApiError("The assignment service did not confirm the new draft.", 502);
  }
  return data.assignment;
}

export async function updateTeacherAssignment(accessToken, assignmentId, input) {
  const data = await requestTeacherAssignments(
    accessToken,
    `/api/teacher/assignments/${encodeURIComponent(assignmentId)}`,
    multipartRequest("PATCH", input)
  );
  if (!isAssignment(data.assignment)) {
    throw createApiError("The assignment service did not confirm the draft update.", 502);
  }
  return data.assignment;
}

export async function publishTeacherAssignment(accessToken, assignmentId) {
  const data = await requestTeacherAssignments(
    accessToken,
    `/api/teacher/assignments/${encodeURIComponent(assignmentId)}/publish`,
    { method: "POST" }
  );
  if (!isAssignment(data.assignment) || !data.assignment.publishedAt) {
    throw createApiError("The assignment service did not confirm publication.", 502);
  }
  return data.assignment;
}

export async function fetchTeacherAssignmentSubmissions(accessToken, assignmentId) {
  const data = await requestTeacherAssignments(
    accessToken,
    `/api/teacher/assignments/${encodeURIComponent(assignmentId)}/submissions`
  );
  if (
    !isAssignment(data.assignment) ||
    !Number.isInteger(data.studentCount) ||
    !Number.isInteger(data.submittedCount) ||
    !Array.isArray(data.students) ||
    !data.students.every((student) =>
      student &&
      isString(student.id) &&
      isString(student.fullName) &&
      isString(student.username) &&
      (student.rollNumber === null || typeof student.rollNumber === "string") &&
      (student.submission === null || isSubmission(student.submission))
    )
  ) {
    throw createApiError("The assignment service returned invalid submission data.", 502);
  }
  return data;
}

export async function fetchTeacherAssignmentAttachment(accessToken, assignmentId) {
  const data = await requestTeacherAssignments(
    accessToken,
    `/api/teacher/assignments/${encodeURIComponent(assignmentId)}/attachment`
  );
  return validateAttachmentResponse(data);
}

export async function gradeTeacherAssignmentSubmission(accessToken, submissionId, input) {
  const data = await requestTeacherAssignments(
    accessToken,
    `/api/teacher/assignments/submissions/${encodeURIComponent(submissionId)}/grade`,
    jsonRequest("PATCH", input)
  );
  const submission = data.submission;
  if (
    !submission ||
    submission.id !== submissionId ||
    !Number.isInteger(submission.marksAwarded) ||
    !isOptionalDate(submission.gradedAt)
  ) {
    throw createApiError("The assignment service did not confirm the saved grade.", 502);
  }
  return submission;
}

export async function publishTeacherAssignmentResult(accessToken, submissionId) {
  const data = await requestTeacherAssignments(
    accessToken,
    `/api/teacher/assignments/submissions/${encodeURIComponent(submissionId)}/publish-result`,
    { method: "POST" }
  );
  const submission = data.submission;
  if (!submission || submission.id !== submissionId || !isOptionalDate(submission.resultPublishedAt) || !submission.resultPublishedAt) {
    throw createApiError("The assignment service did not confirm result publication.", 502);
  }
  return submission;
}
