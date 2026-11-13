import { getApiBaseUrl } from "../../auth/api/authApi";

const REQUEST_TIMEOUT_MS = 12000;
const VALID_STATUSES = new Set(["PRESENT", "ABSENT", "LATE", "EXCUSED"]);

function createApiError(message, status = 0, details = []) {
  const error = new Error(message);
  error.status = status;
  error.details = Array.isArray(details) ? details : [];
  return error;
}

function isValidSummary(summary) {
  return (
    summary &&
    ["PRESENT", "ABSENT", "LATE", "EXCUSED", "totalRecords", "eligibleSessions", "attendedSessions"]
      .every((key) => Number.isFinite(summary[key]) && summary[key] >= 0) &&
    (summary.attendancePercentage === null ||
      (Number.isFinite(summary.attendancePercentage) &&
        summary.attendancePercentage >= 0 &&
        summary.attendancePercentage <= 100))
  );
}

function isValidSubjectResult(item) {
  return (
    item &&
    item.subject &&
    typeof item.subject.id === "string" &&
    typeof item.subject.name === "string" &&
    typeof item.subject.code === "string" &&
    isValidSummary(item.summary) &&
    Array.isArray(item.records) &&
    item.records.every(
      (record) =>
        record &&
        typeof record.id === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(record.date) &&
        VALID_STATUSES.has(record.status) &&
        (record.remarks === null || typeof record.remarks === "string"),
    )
  );
}

export async function fetchStudentAttendance(
  accessToken,
  { fromDate, toDate } = {},
) {
  if (!accessToken) {
    throw createApiError("Your session is unavailable. Please sign in again.", 401);
  }

  const query = new URLSearchParams();
  if (fromDate) query.set("fromDate", fromDate);
  if (toDate) query.set("toDate", toDate);
  const queryString = query.toString();
  const url = `${getApiBaseUrl()}/api/student/attendance${queryString ? `?${queryString}` : ""}`;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  let response;

  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError(
        "The attendance request timed out. Please try again.",
      );
    }

    if (error instanceof TypeError) {
      throw createApiError(
        "Unable to reach the attendance service. Check your connection and backend CORS settings.",
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
        ? "Your student session is no longer valid. Please sign in again."
        : response.status === 403
          ? "Your account is not permitted to view student attendance."
          : response.status === 409
            ? payload?.message || "Your student account is not assigned to a class yet."
            : response.status >= 500
              ? "The attendance service is temporarily unavailable. Please try again."
              : payload?.message || "Unable to load your attendance.";

    throw createApiError(message, response.status, payload?.details);
  }

  const data = payload?.data;
  if (
    payload?.status !== "ok" ||
    !data ||
    !Array.isArray(data.subjects) ||
    !data.subjects.every(isValidSubjectResult)
  ) {
    throw createApiError(
      "The attendance service returned an unexpected response. Please retry or contact support.",
      502,
    );
  }

  return data;
}
