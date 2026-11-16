import { getApiBaseUrl } from "../../auth/api/authApi.js";

const REQUEST_TIMEOUT_MS = 20000;

function createApiError(message, status = 0) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function isText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isDate(value) {
  return isText(value) && Number.isFinite(Date.parse(value));
}

export function isLearningResource(value) {
  return Boolean(
    value &&
    isText(value.id) &&
    isText(value.teacherId) &&
    isText(value.subjectId) &&
    isText(value.title) &&
    typeof value.description === "string" &&
    value.file &&
    isText(value.file.fileName) &&
    isText(value.file.mimeType) &&
    isText(value.file.format) &&
    Number.isInteger(value.file.bytes) &&
    value.file.bytes >= 0 &&
    isDate(value.createdAt) &&
    isDate(value.updatedAt) &&
    value.teacher &&
    isText(value.teacher.id) &&
    isText(value.teacher.fullName) &&
    value.subject &&
    value.subject.id === value.subjectId &&
    isText(value.subject.code) &&
    isText(value.subject.name) &&
    value.subject.class &&
    isText(value.subject.class.id) &&
    isText(value.subject.class.code) &&
    isText(value.subject.class.name) &&
    isText(value.subject.class.academicYear)
  );
}

const RESOURCE_PATHS = {
  teacher: "/api/teacher/resources",
  student: "/api/student/resources"
};

async function requestLearningResources(accessToken, role, suffix = "", options = {}) {
  const prefix = RESOURCE_PATHS[role];
  if (!prefix) throw createApiError("Choose a valid portal role.", 400);
  if (!isText(accessToken)) {
    throw createApiError("Your session is unavailable. Please sign in again.", 401);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const isMultipart = typeof FormData !== "undefined" && options.body instanceof FormData;
    const response = await fetch(`${getApiBaseUrl()}${prefix}${suffix}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.body && !isMultipart ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${accessToken}`,
        ...options.headers
      }
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message = response.status === 401
        ? "Your session has expired. Please sign in again."
        : response.status === 403
          ? "Your account is not permitted to access these learning resources."
          : response.status === 404
            ? payload?.message || "This learning resource is no longer available."
            : response.status === 413
              ? "The selected notes file is larger than the 20 MB limit."
              : response.status === 415
                ? payload?.message || "Choose a supported notes file."
                : response.status >= 500
                  ? "The learning resource service is temporarily unavailable. Please retry."
                  : payload?.message || "The learning resource request could not be completed.";
      throw createApiError(message, response.status);
    }

    if (payload?.status !== "ok" || !payload.data) {
      throw createApiError("The learning resource service returned an unexpected response.", 502);
    }
    return payload.data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError("The learning resource request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw createApiError("Unable to reach the learning resource service. Check your connection.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function validateDownload(data) {
  const download = data?.download;
  if (
    !download ||
    !isText(download.url) ||
    !isDate(download.expiresAt) ||
    !isText(download.fileName) ||
    !isText(download.mimeType)
  ) {
    throw createApiError("The learning resource service returned an invalid download link.", 502);
  }
  return download;
}

export async function fetchLearningResources(accessToken, role) {
  const data = await requestLearningResources(accessToken, role);
  if (!Array.isArray(data.resources) || !data.resources.every(isLearningResource)) {
    throw createApiError("The learning resource service returned an invalid resource list.", 502);
  }
  return data.resources;
}

export async function uploadTeacherLearningResource(accessToken, input) {
  if (!input || !(input.file instanceof File)) {
    throw createApiError("Choose a notes file to upload.", 400);
  }
  const body = new FormData();
  body.append("subjectId", input.subjectId);
  body.append("title", input.title);
  body.append("description", input.description || "");
  body.append("file", input.file);

  const data = await requestLearningResources(accessToken, "teacher", "", {
    method: "POST",
    body
  });
  if (!isLearningResource(data.resource)) {
    throw createApiError("The learning resource service did not confirm the uploaded file.", 502);
  }
  return data.resource;
}

export async function fetchLearningResourceDownload(accessToken, role, resourceId) {
  if (!isText(resourceId)) {
    throw createApiError("Choose a valid learning resource.", 400);
  }
  const data = await requestLearningResources(
    accessToken,
    role,
    `/${encodeURIComponent(resourceId)}/download`
  );
  return validateDownload(data);
}

export async function deleteTeacherLearningResource(accessToken, resourceId) {
  if (!isText(resourceId)) {
    throw createApiError("Choose a valid learning resource.", 400);
  }
  const data = await requestLearningResources(
    accessToken,
    "teacher",
    `/${encodeURIComponent(resourceId)}`,
    { method: "DELETE" }
  );
  if (data?.id !== resourceId || data?.deleted !== true) {
    throw createApiError("The learning resource service did not confirm deletion.", 502);
  }
  return data;
}

export function formatResourceBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "Size unavailable";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
