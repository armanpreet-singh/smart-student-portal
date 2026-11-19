import { getApiBaseUrl } from "../../auth/api/authApi.js";

const REQUEST_TIMEOUT_MS = 12000;
const STUDENT_URL = "/api/student/academic-risk";
const TEACHER_URL = "/api/teacher/academic-risk";
const ADMIN_URL = "/api/admin/academic-risk";
const ADMIN_CLASSES_URL = "/api/admin/classes";
const RISK_LEVELS = new Set(["HIGH", "MEDIUM", "LOW", "INSUFFICIENT_DATA"]);
const ALERT_KEYS = new Set(["LOW_ATTENDANCE", "OVERDUE_ASSIGNMENTS", "LOW_ASSESSMENT_PERFORMANCE"]);

function apiError(message, status = 0) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function isObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isCount(value) {
  return Number.isInteger(value) && value >= 0;
}

function isPercent(value) {
  return value === null || (Number.isFinite(value) && value >= 0 && value <= 100);
}

function isRiskSubject(value) {
  return isObject(value) &&
    typeof value.id === "string" &&
    typeof value.code === "string" &&
    typeof value.name === "string";
}

function isAlert(value) {
  return isObject(value) &&
    ALERT_KEYS.has(value.key) &&
    ["HIGH", "MEDIUM"].includes(value.severity) &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    Number.isFinite(value.value) &&
    Number.isFinite(value.threshold) &&
    isRiskSubject(value.subject);
}

function isRiskSummary(value) {
  return isObject(value) &&
    isCount(value.alertCount) &&
    isCount(value.highAlertCount) &&
    isCount(value.mediumAlertCount) &&
    isPercent(value.attendancePercentage) &&
    Number.isFinite(value.attendanceThresholdPercent) &&
    value.attendanceThresholdPercent >= 1 &&
    value.attendanceThresholdPercent <= 100 &&
    isCount(value.attendanceSessions) &&
    isPercent(value.averageGradePercent) &&
    isCount(value.publishedGrades) &&
    isCount(value.overdueAssignments) &&
    isCount(value.subjectsAssessed) &&
    isCount(value.totalSubjects);
}

function isRiskReport(value) {
  return isObject(value) &&
    isObject(value.student) &&
    typeof value.student.id === "string" &&
    typeof value.student.fullName === "string" &&
    (value.student.rollNumber === null || typeof value.student.rollNumber === "string") &&
    (value.class === null || (isObject(value.class) && typeof value.class.code === "string")) &&
    RISK_LEVELS.has(value.riskLevel) &&
    isRiskSummary(value.summary) &&
    Array.isArray(value.alerts) &&
    value.alerts.every(isAlert) &&
    Array.isArray(value.recommendations) &&
    value.recommendations.every((item) => typeof item === "string") &&
    Array.isArray(value.subjects) &&
    value.subjects.every((item) =>
      isObject(item) &&
      isRiskSubject(item.subject) &&
      RISK_LEVELS.has(item.riskLevel) &&
      isObject(item.metrics) &&
      Array.isArray(item.alerts) &&
      item.alerts.every(isAlert)
    ) &&
    typeof value.calculatedAt === "string" &&
    Number.isFinite(Date.parse(value.calculatedAt));
}

function isPagination(value) {
  return isObject(value) &&
    isCount(value.page) && value.page >= 1 &&
    isCount(value.pageSize) && value.pageSize >= 1 &&
    isCount(value.total) &&
    isCount(value.totalPages);
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
          ? `Your account is not permitted to view ${role} academic risk reports.`
          : response.status >= 500
            ? "The academic risk service is temporarily unavailable. Please try again."
            : payload?.message || "The academic risk request could not be completed.";
      throw apiError(message, response.status);
    }
    if (payload?.status !== "ok" || !isObject(payload.data)) {
      throw apiError("The academic risk service returned an unexpected response.", 502);
    }
    return payload.data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw apiError("The academic risk request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw apiError("Unable to reach the academic risk service. Check your connection.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function fetchStudentAcademicRisk(accessToken) {
  const data = await request(accessToken, "Student", STUDENT_URL);
  if (!isRiskReport(data)) {
    throw apiError("The Student academic risk service returned invalid data.", 502);
  }
  return data;
}

export async function fetchTeacherAcademicRisk(accessToken, filters = {}) {
  const query = new URLSearchParams();
  for (const key of ["subjectId", "search", "riskLevel"]) {
    const value = filters[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      query.set(key, String(value).trim());
    }
  }
  const suffix = query.toString();
  const data = await request(accessToken, "Teacher", `${TEACHER_URL}${suffix ? `?${suffix}` : ""}`);
  if (
    !Array.isArray(data.subjects) ||
    !data.subjects.every((item) => isRiskSubject(item) && isObject(item.class)) ||
    !Array.isArray(data.students) ||
    !data.students.every(isRiskReport) ||
    !isObject(data.summary) ||
    !["totalStudents", "highRisk", "mediumRisk", "lowRisk", "insufficientData"].every((key) => isCount(data.summary[key])) ||
    !Number.isFinite(data.attendanceThresholdPercent)
  ) {
    throw apiError("The Teacher academic risk service returned invalid data.", 502);
  }
  return data;
}

export async function fetchAdminAcademicRisk(accessToken, filters = {}) {
  const query = new URLSearchParams();
  for (const key of ["classId", "search", "riskLevel", "page", "pageSize"]) {
    const value = filters[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      query.set(key, String(value).trim());
    }
  }
  const suffix = query.toString();
  const data = await request(accessToken, "Admin", `${ADMIN_URL}${suffix ? `?${suffix}` : ""}`);
  if (
    !Array.isArray(data.students) ||
    !data.students.every(isRiskReport) ||
    !isObject(data.summary) ||
    !["totalStudents", "highRisk", "mediumRisk", "lowRisk", "insufficientData"].every((key) => isCount(data.summary[key])) ||
    !isPagination(data.pagination) ||
    !Number.isFinite(data.attendanceThresholdPercent)
  ) {
    throw apiError("The Admin academic risk service returned invalid data.", 502);
  }
  return data;
}

export async function fetchAdminAcademicRiskClasses(accessToken) {
  const data = await request(accessToken, "Admin", `${ADMIN_CLASSES_URL}?page=1&pageSize=100`);
  if (
    !Array.isArray(data.classes) ||
    !data.classes.every((item) =>
      isObject(item) &&
      typeof item.id === "string" &&
      typeof item.code === "string" &&
      typeof item.name === "string" &&
      typeof item.academicYear === "string"
    )
  ) {
    throw apiError("The class directory returned invalid filter options.", 502);
  }
  return data.classes;
}
