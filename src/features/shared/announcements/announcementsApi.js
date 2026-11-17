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

const ANNOUNCEMENT_ATTACHMENT_FORMATS = new Set([
  "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx",
  "txt", "csv", "jpg", "jpeg", "png", "gif", "webp"
]);
const ANNOUNCEMENT_ATTACHMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp"
]);

function isAnnouncementAttachment(value) {
  return value === null || Boolean(
    value &&
    isText(value.fileName) &&
    isText(value.mimeType) &&
    ANNOUNCEMENT_ATTACHMENT_MIME_TYPES.has(value.mimeType) &&
    Number.isInteger(value.bytes) &&
    value.bytes > 0 &&
    isText(value.format) &&
    ANNOUNCEMENT_ATTACHMENT_FORMATS.has(value.format.toLowerCase())
  );
}

function toAnnouncementFormData(input, file) {
  const data = new FormData();
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== null) data.append(key, String(value));
  }
  if (file) data.append("attachment", file, file.name);
  return data;
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
    isAnnouncementAttachment(value.attachment) &&
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
        ...(options.body && !(typeof FormData !== "undefined" && options.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
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

export async function createAnnouncement(accessToken, role, input, file = null) {
  const data = await requestAnnouncements(accessToken, role, "", {
    method: "POST",
    body: file ? toAnnouncementFormData(input, file) : JSON.stringify(input)
  });
  return validateAnnouncement(data);
}

export async function updateAnnouncement(accessToken, role, announcementId, input, file = null) {
  const data = await requestAnnouncements(
    accessToken,
    role,
    `/${encodeURIComponent(announcementId)}`,
    {
      method: "PATCH",
      body: file ? toAnnouncementFormData(input, file) : JSON.stringify(input)
    }
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


export async function downloadAnnouncementAttachment(accessToken, role, announcementId) {
  const data = await requestAnnouncements(
    accessToken,
    role,
    `/${encodeURIComponent(announcementId)}/attachment`
  );
  const file = data?.download;
  let parsedUrl;
  try {
    parsedUrl = new URL(file?.url);
  } catch {
    throw createApiError("The announcement service returned an invalid attachment link.", 502);
  }
  if (
    parsedUrl.protocol !== "https:" ||
    !isText(file.fileName) ||
    !isText(file.mimeType) ||
    !Number.isInteger(file.bytes) ||
    file.bytes < 0 ||
    !isText(file.expiresAt) ||
    !Number.isFinite(Date.parse(file.expiresAt))
  ) {
    throw createApiError("The announcement service returned an invalid attachment link.", 502);
  }
  return file;
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
