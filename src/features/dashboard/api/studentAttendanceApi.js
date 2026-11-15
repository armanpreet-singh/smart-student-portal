import { getApiBaseUrl } from "../../auth/api/authApi.js";

const REQUEST_TIMEOUT_MS = 12000;
const MAX_DUTY_PROOF_BYTES = 5 * 1024 * 1024;
const ALLOWED_DUTY_PROOF_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const VALID_STATUSES = new Set(["PRESENT", "ABSENT", "ON_DUTY_REVIEW"]);

function createApiError(message, status = 0, details = []) {
  const error = new Error(message);
  error.status = status;
  error.details = Array.isArray(details) ? details : [];
  return error;
}

function isValidSummary(summary) {
  return (
    summary &&
    ["PRESENT", "ABSENT", "ON_DUTY_REVIEW", "totalRecords", "eligibleSessions", "attendedSessions"]
      .every((key) => Number.isFinite(summary[key]) && summary[key] >= 0) &&
    (summary.attendancePercentage === null ||
      (Number.isFinite(summary.attendancePercentage) &&
        summary.attendancePercentage >= 0 &&
        summary.attendancePercentage <= 100))
  );
}

function isValidDutyProofMetadata(proof) {
  return (
    proof &&
    typeof proof.fileName === "string" &&
    typeof proof.format === "string" &&
    Number.isInteger(proof.bytes) &&
    proof.bytes > 0 &&
    typeof proof.submittedAt === "string" &&
    Number.isFinite(Date.parse(proof.submittedAt))
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
        (record.remarks === null || typeof record.remarks === "string") &&
        (record.dutyProof === undefined ||
          record.dutyProof === null ||
          isValidDutyProofMetadata(record.dutyProof)),
    )
  );
}

function mapProofError(status, payload) {
  if (status === 401) return "Your student session is no longer valid. Please sign in again.";
  if (status === 403) return "Your account is not permitted to access this duty proof.";
  if (status === 404) return payload?.message || "This duty proof or pending attendance record is unavailable.";
  if (status === 409) return payload?.message || "This attendance record has already changed. Refresh the page.";
  if (status === 413) return "The duty proof must be 5 MB or smaller.";
  if (status === 415) return "Duty proof must be a PDF, JPEG or PNG file.";
  if (status === 503) {
    return "Duty proof storage is not configured yet. Your attendance has not been changed; contact the administrator and try again later.";
  }
  if (status >= 500) return "Duty proof service is temporarily unavailable. Please try again later.";
  return payload?.message || "Unable to complete the duty-proof request.";
}

async function requestProofApi(accessToken, attendanceId, { method, body } = {}) {
  if (!accessToken) {
    throw createApiError("Your session is unavailable. Please sign in again.", 401);
  }
  if (typeof attendanceId !== "string" || !attendanceId.trim()) {
    throw createApiError("A valid attendance record is required.", 400);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(
      `${getApiBaseUrl()}/api/student/attendance/${encodeURIComponent(attendanceId)}/duty-proof`,
      {
        method: method || "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        ...(body ? { body } : {}),
        signal: controller.signal,
      },
    );
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError("The duty-proof request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw createApiError("Unable to reach the duty-proof service. Check your connection and try again.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw createApiError(mapProofError(response.status, payload), response.status, payload?.details);
  }
  if (payload?.status !== "ok" || !payload.data) {
    throw createApiError("The duty-proof service returned an unexpected response.", 502);
  }
  return payload.data;
}

export async function fetchStudentAttendance(accessToken, { fromDate, toDate } = {}) {
  if (!accessToken) {
    throw createApiError("Your session is unavailable. Please sign in again.", 401);
  }

  const query = new URLSearchParams();
  if (fromDate) query.set("fromDate", fromDate);
  if (toDate) query.set("toDate", toDate);
  const queryString = query.toString();
  const url = `${getApiBaseUrl()}/api/student/attendance${queryString ? `?${queryString}` : ""}`;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
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
      throw createApiError("The attendance request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw createApiError("Unable to reach the attendance service. Check your connection and backend CORS settings.");
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

export async function submitStudentDutyProof(accessToken, attendanceId, file) {
  if (!file || !Number.isFinite(file.size)) {
    throw createApiError("Choose a duty-proof file before submitting.", 400);
  }
  if (file.size <= 0) {
    throw createApiError("The selected duty-proof file is empty.", 400);
  }
  if (file.size > MAX_DUTY_PROOF_BYTES) {
    throw createApiError("The duty proof must be 5 MB or smaller.", 413);
  }
  if (!ALLOWED_DUTY_PROOF_TYPES.has(file.type)) {
    throw createApiError("Duty proof must be a PDF, JPEG or PNG file.", 415);
  }

  const formData = new FormData();
  formData.append("proof", file, file.name || "duty-proof");
  const data = await requestProofApi(accessToken, attendanceId, {
    method: "POST",
    body: formData,
  });
  const attendance = data.attendance;
  if (
    !attendance ||
    attendance.attendanceId !== attendanceId ||
    attendance.status !== "PRESENT" ||
    !isValidDutyProofMetadata(attendance.dutyProof)
  ) {
    throw createApiError("The duty-proof service returned an unexpected confirmation.", 502);
  }
  return attendance;
}

export async function getStudentDutyProofDownloadUrl(accessToken, attendanceId) {
  const data = await requestProofApi(accessToken, attendanceId, { method: "GET" });
  const proof = data.dutyProof;
  let parsedUrl;
  try {
    parsedUrl = new URL(proof?.url);
  } catch {
    parsedUrl = null;
  }
  if (
    !proof ||
    proof.attendanceId !== attendanceId ||
    typeof proof.fileName !== "string" ||
    !parsedUrl ||
    parsedUrl.protocol !== "https:" ||
    typeof proof.expiresAt !== "string" ||
    !Number.isFinite(Date.parse(proof.expiresAt))
  ) {
    throw createApiError("The duty-proof service returned an invalid download link.", 502);
  }
  return proof;
}
