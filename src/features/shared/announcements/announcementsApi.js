import { getApiBaseUrl } from "../../auth/api/authApi.js";

const REQUEST_TIMEOUT_MS = 12000;

function createApiError(message, status = 0) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function isText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function isAnnouncementRecord(value) {
  return Boolean(
    value &&
    isText(value.id) &&
    isText(value.authorId) &&
    isText(value.title) &&
    isText(value.message) &&
    ["ALL_USERS", "STUDENTS", "TEACHERS", "CLASS"].includes(value.audience) &&
    (value.classId === null || isText(value.classId)) &&
    (value.subjectId === null || isText(value.subjectId)) &&
    (value.publishedAt === null || (isText(value.publishedAt) && Number.isFinite(Date.parse(value.publishedAt)))) &&
    isText(value.createdAt) &&
    Number.isFinite(Date.parse(value.createdAt)) &&
    isText(value.updatedAt) &&
    Number.isFinite(Date.parse(value.updatedAt)) &&
    value.author &&
    isText(value.author.id) &&
    isText(value.author.fullName) &&
    ["ADMIN", "TEACHER"].includes(value.author.role) &&
    (value.class === null || (
      value.class &&
      isText(value.class.id) &&
      isText(value.class.code) &&
      isText(value.class.name) &&
      isText(value.class.academicYear)
    )) &&
    (value.subject === null || (
      value.subject &&
      isText(value.subject.id) &&
      isText(value.subject.code) &&
      isText(value.subject.name) &&
      value.subject.class &&
      isText(value.subject.class.id) &&
      isText(value.subject.class.code) &&
      isText(value.subject.class.name)
    ))
  );
}

async function requestAnnouncements(accessToken, role, suffix = "", options = {}) {
  const prefix = role === "admin"
    ? "/api/admin/announcements"
    : role === "teacher"
      ? "/api/teacher/announcements"
      : "/api/student/announcements";

  if (!isText(accessToken)) {
    throw createApiError("Your session is unavailable. Please sign in again.", 401);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  let payload;

  try {
    response = await fetch(`${getApiBaseUrl()}${prefix}${suffix}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${accessToken}`,
        ...options.headers
      }
    });
    payload = await response.json().catch(() => null);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError("The announcement request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw createApiError("Unable to reach the announcement service. Check your connection.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const message = response.status === 401
      ? "Your session has expired. Please sign in again."
      : response.status === 403
        ? "Your account is not permitted to access announcements."
        : response.status >= 500
          ? "The announcement service is temporarily unavailable. Please retry."
          : payload?.message || "The announcement request could not be completed.";
    throw createApiError(message, response.status);
  }

  if (payload?.status !== "ok" || !payload.data) {
    throw createApiError("The announcement service returned an unexpected response.", 502);
  }
  return payload.data;
}

function validateAnnouncement(data) {
  if (!isAnnouncementRecord(data?.announcement)) {
    throw createApiError("The announcement service returned an invalid announcement.", 502);
  }
  return data.announcement;
}

export async function fetchAnnouncements(accessToken, role) {
  const data = await requestAnnouncements(accessToken, role);
  if (!Array.isArray(data.announcements) || !data.announcements.every(isAnnouncementRecord)) {
    throw createApiError("The announcement service returned an invalid announcement list.", 502);
  }
  return data.announcements;
}

export async function createAnnouncement(accessToken, role, input) {
  const data = await requestAnnouncements(accessToken, role, "", {
    method: "POST",
    body: JSON.stringify(input)
  });
  return validateAnnouncement(data);
}

export async function updateAnnouncement(accessToken, role, announcementId, input) {
  const data = await requestAnnouncements(
    accessToken,
    role,
    `/${encodeURIComponent(announcementId)}`,
    { method: "PATCH", body: JSON.stringify(input) }
  );
  return validateAnnouncement(data);
}

export async function publishAnnouncement(accessToken, role, announcementId) {
  const data = await requestAnnouncements(
    accessToken,
    role,
    `/${encodeURIComponent(announcementId)}/publish`,
    { method: "POST" }
  );
  return validateAnnouncement(data);
}

export async function deleteAnnouncement(accessToken, role, announcementId) {
  const data = await requestAnnouncements(
    accessToken,
    role,
    `/${encodeURIComponent(announcementId)}`,
    { method: "DELETE" }
  );
  if (data?.id !== announcementId || data?.deleted !== true) {
    throw createApiError("The announcement service did not confirm deletion.", 502);
  }
  return data;
}
