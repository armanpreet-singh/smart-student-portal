import { getApiBaseUrl } from "../../auth/api/authApi.js";

const REQUEST_TIMEOUT_MS = 12000;
const VALID_STATUSES = new Set(["PRESENT", "ABSENT", "ON_DUTY_REVIEW"]);

function createApiError(message, status = 0) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function mapError(status, payload) {
  if (status === 401) return "Your Teacher session is no longer valid. Please sign in again.";
  if (status === 403) return "Your account is not permitted to correct this attendance record.";
  if (status === 404) return payload?.message || "The assigned subject or attendance record is no longer available.";
  if (status === 409) return payload?.message || "This attendance record changed or its 30-minute correction window has expired. Refresh the register.";
  if (status >= 500) return "The attendance service is temporarily unavailable. Please try again.";
  return payload?.message || "The Teacher attendance request was rejected.";
}

async function requestApi(path, accessToken, { method = "GET", body } = {}) {
  if (!isNonEmptyString(accessToken)) {
    throw createApiError("Your Teacher session is unavailable. Please sign in again.", 401);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  let payload;

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });
    payload = await response.json().catch(() => null);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError("The attendance request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw createApiError("Unable to reach the Teacher attendance service. Check your connection and backend CORS settings.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw createApiError(mapError(response.status, payload), response.status);
  }
  if (payload?.status !== "ok" || !payload.data) {
    throw createApiError("The Teacher attendance service returned an unexpected response.", 502);
  }
  return payload.data;
}

function isAttendanceRecord(record) {
  return (
    record &&
    isNonEmptyString(record.id) &&
    isNonEmptyString(record.studentId) &&
    VALID_STATUSES.has(record.status) &&
    (record.remarks === null || typeof record.remarks === "string") &&
    typeof record.markedAt === "string" &&
    Number.isFinite(Date.parse(record.markedAt)) &&
    typeof record.editableUntil === "string" &&
    Number.isFinite(Date.parse(record.editableUntil)) &&
    typeof record.markedByCurrentTeacher === "boolean" &&
    typeof record.proofSubmitted === "boolean" &&
    typeof record.editable === "boolean" &&
    (!record.editable ||
      (record.markedByCurrentTeacher && !record.proofSubmitted))
  );
}

export async function fetchTeacherAttendanceForDate(
  accessToken,
  subjectId,
  attendanceDate,
) {
  if (!isNonEmptyString(subjectId) || subjectId.length > 64) {
    throw createApiError("Select a valid assigned subject.", 400);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(attendanceDate || "")) {
    throw createApiError("Select a valid attendance date.", 400);
  }

  const query = new URLSearchParams({ attendanceDate });
  const data = await requestApi(
    `/api/teacher/subjects/${encodeURIComponent(subjectId)}/attendance?${query.toString()}`,
    accessToken,
  );

  if (
    data.subjectId !== subjectId ||
    data.attendanceDate !== attendanceDate ||
    !Array.isArray(data.records) ||
    !data.records.every(isAttendanceRecord) ||
    new Set(data.records.map((record) => record.studentId)).size !== data.records.length ||
    new Set(data.records.map((record) => record.id)).size !== data.records.length
  ) {
    throw createApiError("The Teacher attendance service returned records in an unexpected format.", 502);
  }

  return data;
}

export async function updateTeacherAttendanceRecord(
  accessToken,
  attendanceId,
  { status } = {},
) {
  if (!isNonEmptyString(attendanceId) || attendanceId.length > 64) {
    throw createApiError("Select a valid attendance record to correct.", 400);
  }
  if (!VALID_STATUSES.has(status)) {
    throw createApiError("Select a valid attendance status.", 400);
  }

  const data = await requestApi(
    `/api/teacher/attendance/${encodeURIComponent(attendanceId)}`,
    accessToken,
    { method: "PATCH", body: { status } },
  );
  const attendance = data.attendance;

  if (
    !attendance ||
    attendance.id !== attendanceId ||
    !isNonEmptyString(attendance.studentId) ||
    !isNonEmptyString(attendance.subjectId) ||
    typeof attendance.attendanceDate !== "string" ||
    !VALID_STATUSES.has(attendance.status) ||
    typeof attendance.editable !== "boolean" ||
    typeof attendance.editableUntil !== "string" ||
    !Number.isFinite(Date.parse(attendance.editableUntil))
  ) {
    throw createApiError("The attendance correction service returned an unexpected confirmation.", 502);
  }

  return attendance;
}
