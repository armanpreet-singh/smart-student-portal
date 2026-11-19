import { getApiBaseUrl } from "../../auth/api/authApi.js";

const REQUEST_TIMEOUT_MS = 12000;
const STUDENT_URL = "/api/student/faculty-feedback";
const TEACHER_URL = "/api/teacher/faculty-feedback";
const ADMIN_URL = "/api/admin/faculty-feedback";
const RATING_FIELDS = [
  "teachingClarity",
  "subjectKnowledge",
  "engagement",
  "approachability",
  "assessmentFairness",
  "courseContent",
  "overallRating"
];

function apiError(message, status = 0) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function isObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isDate(value) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isRating(value) {
  return Number.isFinite(value) && value >= 1 && value <= 5;
}

function isRatingSummary(value) {
  return isObject(value) && RATING_FIELDS.every((key) =>
    Number.isFinite(value[key]) && value[key] >= 1 && value[key] <= 5
  );
}

function isPagination(value) {
  return isObject(value) &&
    Number.isInteger(value.page) && value.page >= 1 &&
    Number.isInteger(value.pageSize) && value.pageSize >= 1 &&
    Number.isInteger(value.total) && value.total >= 0 &&
    Number.isInteger(value.totalPages) && value.totalPages >= 0;
}

function isSurvey(value) {
  return isObject(value) &&
    typeof value.teacherSubjectId === "string" &&
    isObject(value.teacher) && typeof value.teacher.fullName === "string" &&
    isObject(value.subject) && typeof value.subject.name === "string" &&
    typeof value.academicYear === "string" &&
    typeof value.hasSubmitted === "boolean" &&
    (value.submittedAt === null || isDate(value.submittedAt));
}

function isTeacherReport(value) {
  return isObject(value) &&
    typeof value.teacherSubjectId === "string" &&
    isObject(value.subject) &&
    typeof value.academicYear === "string" &&
    typeof value.awaitingAnonymousThreshold === "boolean" &&
    (value.responseCount === null || (Number.isInteger(value.responseCount) && value.responseCount >= 0)) &&
    (value.ratings === null || isRatingSummary(value.ratings)) &&
    Array.isArray(value.comments) &&
    value.comments.every((item) => isObject(item) && typeof item.comment === "string" && isDate(item.submittedAt));
}

async function request(accessToken, role, path, options = {}) {
  if (typeof accessToken !== "string" || !accessToken.trim()) {
    throw apiError("Your session is unavailable. Please sign in again.", 401);
  }
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers
      }
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = response.status === 401
        ? "Your session has expired. Please sign in again."
        : response.status === 403
          ? `Your account is not permitted to access ${role} faculty feedback.`
          : response.status >= 500
            ? "The faculty feedback service is temporarily unavailable."
            : payload?.message || "The faculty feedback request could not be completed.";
      throw apiError(message, response.status);
    }
    if (payload?.status !== "ok" || !isObject(payload.data)) {
      throw apiError("The faculty feedback service returned an unexpected response.", 502);
    }
    return payload.data;
  } catch (error) {
    if (error?.name === "AbortError") throw apiError("The faculty feedback request timed out. Please try again.");
    if (error instanceof TypeError) throw apiError("Unable to reach the faculty feedback service. Check your connection.");
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function fetchStudentFacultyFeedback(accessToken) {
  const data = await request(accessToken, "Student", STUDENT_URL);
  if (
    !(data.academicYear === null || typeof data.academicYear === "string") ||
    !Array.isArray(data.surveys) ||
    !data.surveys.every(isSurvey)
  ) {
    throw apiError("The Student faculty feedback service returned invalid data.", 502);
  }
  return data;
}

export async function submitStudentFacultyFeedback(accessToken, teacherSubjectId, values) {
  if (typeof teacherSubjectId !== "string" || !teacherSubjectId.trim()) {
    throw apiError("Choose a valid faculty subject.", 400);
  }
  if (
    !isObject(values) ||
    RATING_FIELDS.some((key) => !Number.isInteger(values[key]) || values[key] < 1 || values[key] > 5) ||
    (values.comment !== undefined && (typeof values.comment !== "string" || values.comment.length > 1000))
  ) {
    throw apiError("Complete all ratings using a value from 1 to 5.", 400);
  }
  const data = await request(accessToken, "Student", `${STUDENT_URL}/${encodeURIComponent(teacherSubjectId)}`, {
    method: "POST",
    body: JSON.stringify(values)
  });
  if (
    !isObject(data.feedback) ||
    typeof data.feedback.id !== "string" ||
    typeof data.feedback.academicYear !== "string" ||
    !isDate(data.feedback.submittedAt)
  ) {
    throw apiError("The faculty feedback service did not confirm the submission.", 502);
  }
  return data.feedback;
}

export async function fetchTeacherFacultyFeedback(accessToken) {
  const data = await request(accessToken, "Teacher", TEACHER_URL);
  if (
    !Number.isInteger(data.minimumResponses) ||
    !Array.isArray(data.reports) ||
    !data.reports.every(isTeacherReport)
  ) {
    throw apiError("The Teacher faculty feedback service returned invalid data.", 502);
  }
  return data;
}

export async function fetchAdminFacultyFeedback(accessToken, filters = {}) {
  const query = new URLSearchParams();
  for (const key of ["page", "pageSize", "teacherId", "subjectId", "academicYear"]) {
    const value = filters[key];
    if (value !== undefined && value !== null && String(value).trim()) query.set(key, String(value).trim());
  }
  const suffix = query.toString();
  const data = await request(accessToken, "Admin", `${ADMIN_URL}${suffix ? `?${suffix}` : ""}`);
  if (!Array.isArray(data.feedback) || !isPagination(data.pagination)) {
    throw apiError("The Admin faculty feedback service returned invalid data.", 502);
  }
  return data;
}

export async function setAdminFacultyFeedbackCommentVisibility(accessToken, feedbackId, isHidden) {
  if (typeof feedbackId !== "string" || !feedbackId.trim() || typeof isHidden !== "boolean") {
    throw apiError("Choose a valid feedback comment and visibility setting.", 400);
  }
  const data = await request(accessToken, "Admin", `${ADMIN_URL}/${encodeURIComponent(feedbackId)}/comment-visibility`, {
    method: "PATCH",
    body: JSON.stringify({ isHidden })
  });
  if (!isObject(data.feedback) || data.feedback.id !== feedbackId || data.feedback.isCommentHidden !== isHidden) {
    throw apiError("The feedback service did not confirm the comment visibility update.", 502);
  }
  return data.feedback;
}
