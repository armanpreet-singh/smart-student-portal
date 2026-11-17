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

function isNullableText(value) {
  return value === null || isText(value);
}

function isCount(value) {
  return Number.isInteger(value) && value >= 0;
}

function isProgressPercent(value) {
  return isCount(value) && value <= 100;
}

function isSyllabusTopic(topic) {
  return Boolean(
    topic &&
    isText(topic.id) &&
    isText(topic.title) &&
    isCount(topic.sequence) &&
    isCount(topic.sourcePage) &&
    typeof topic.completed === "boolean" &&
    (topic.completedAt === null ||
      (isText(topic.completedAt) && Number.isFinite(Date.parse(topic.completedAt)))) &&
    (topic.completedBy === null ||
      (topic.completedBy &&
        isText(topic.completedBy.id) &&
        isText(topic.completedBy.fullName))) &&
    topic.completed === Boolean(topic.completedAt)
  );
}

function isSyllabusUnit(unit) {
  return Boolean(
    unit &&
    isText(unit.code) &&
    isText(unit.title) &&
    isCount(unit.order) &&
    (unit.plannedHours === null || (Number.isInteger(unit.plannedHours) && unit.plannedHours > 0)) &&
    Array.isArray(unit.topics) &&
    unit.topics.length > 0 &&
    unit.topics.every(isSyllabusTopic) &&
    isCount(unit.completedTopics) &&
    isCount(unit.totalTopics) &&
    unit.totalTopics === unit.topics.length &&
    unit.completedTopics === unit.topics.filter((topic) => topic.completed).length &&
    isProgressPercent(unit.progressPercent)
  );
}

function isSyllabusSubject(subject) {
  return Boolean(
    subject &&
    isText(subject.id) &&
    isText(subject.code) &&
    isText(subject.name) &&
    isText(subject.classId) &&
    subject.class &&
    subject.class.id === subject.classId &&
    isText(subject.class.code) &&
    isText(subject.class.name) &&
    isText(subject.class.academicYear) &&
    subject.semester === 5 &&
    isText(subject.syllabusCourseCode) &&
    ["THEORY", "LAB", "WORKSHOP"].includes(subject.curriculumType) &&
    Array.isArray(subject.units) &&
    subject.units.length > 0 &&
    subject.units.every(isSyllabusUnit) &&
    isCount(subject.totalTopics) &&
    isCount(subject.completedTopics) &&
    subject.totalTopics === subject.units.reduce((sum, unit) => sum + unit.totalTopics, 0) &&
    subject.completedTopics === subject.units.reduce((sum, unit) => sum + unit.completedTopics, 0) &&
    isProgressPercent(subject.progressPercent)
  );
}

function validateSyllabus(data) {
  if (
    data?.semester !== 5 ||
    !Array.isArray(data.subjects) ||
    !data.subjects.every(isSyllabusSubject) ||
    !data.summary ||
    !isCount(data.summary.subjectCount) ||
    !isCount(data.summary.totalTopics) ||
    !isCount(data.summary.completedTopics) ||
    !isProgressPercent(data.summary.progressPercent) ||
    data.summary.subjectCount !== data.subjects.length ||
    data.summary.totalTopics !== data.subjects.reduce((sum, item) => sum + item.totalTopics, 0) ||
    data.summary.completedTopics !== data.subjects.reduce((sum, item) => sum + item.completedTopics, 0)
  ) {
    throw createApiError("The syllabus service returned an unexpected curriculum format.", 502);
  }
  return data;
}

async function requestSyllabus(path, accessToken, options = {}) {
  if (!isText(accessToken)) {
    throw createApiError("Your session is unavailable. Please sign in again.", 401);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  let payload;

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
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
      throw createApiError("The syllabus request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw createApiError("Unable to reach the syllabus service. Check your connection.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const message = response.status === 401
      ? "Your session has expired. Please sign in again."
      : response.status === 403
        ? "Your account is not permitted to access the syllabus."
        : response.status === 404
          ? payload?.message || "This syllabus item is no longer available."
          : response.status >= 500
            ? "The syllabus service is temporarily unavailable. Please retry."
            : payload?.message || "The syllabus request could not be completed.";
    throw createApiError(message, response.status);
  }

  if (payload?.status !== "ok" || !payload.data) {
    throw createApiError("The syllabus service returned an unexpected response.", 502);
  }
  return payload.data;
}

export async function fetchStudentSyllabus(accessToken) {
  const data = await requestSyllabus("/api/student/syllabus", accessToken);
  return validateSyllabus(data);
}

export async function fetchTeacherSyllabus(accessToken) {
  const data = await requestSyllabus("/api/teacher/syllabus", accessToken);
  return validateSyllabus(data);
}

export async function updateTeacherSyllabusTopic(accessToken, topicId, completed) {
  if (!isText(topicId) || topicId.length > 64 || typeof completed !== "boolean") {
    throw createApiError("Choose a valid syllabus topic and completion state.", 400);
  }
  const data = await requestSyllabus(
    `/api/teacher/syllabus/topics/${encodeURIComponent(topicId)}`,
    accessToken,
    { method: "PATCH", body: JSON.stringify({ completed }) }
  );
  const topic = data?.topic;
  if (
    !topic ||
    topic.id !== topicId ||
    typeof topic.completed !== "boolean" ||
    topic.completed !== completed ||
    (topic.completedAt !== null &&
      (!isText(topic.completedAt) || !Number.isFinite(Date.parse(topic.completedAt))))
  ) {
    throw createApiError("The syllabus service did not confirm the topic update.", 502);
  }
  return topic;
}
