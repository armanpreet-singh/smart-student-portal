import { getApiBaseUrl } from "../../auth/api/authApi";

const REQUEST_TIMEOUT_MS = 12000;
const DIRECTORY_PAGE_SIZE = 100;
const MAX_DIRECTORY_PAGES = 100;

function createApiError(message, status = 0, details = []) {
  const error = new Error(message);
  error.status = status;
  error.details = Array.isArray(details) ? details : [];
  return error;
}

function isCount(value) {
  return Number.isInteger(value) && value >= 0;
}

function isAttendanceSummary(summary) {
  return (
    summary &&
    ["PRESENT", "ABSENT", "LATE", "EXCUSED", "totalRecords", "eligibleSessions", "attendedSessions"]
      .every((key) => isCount(summary[key])) &&
    (summary.attendancePercentage === null ||
      (Number.isFinite(summary.attendancePercentage) &&
        summary.attendancePercentage >= 0 &&
        summary.attendancePercentage <= 100))
  );
}

function buildQuery(values) {
  const query = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (typeof value === "string" && value.trim()) {
      query.set(key, value.trim());
    }
  });

  return query.toString();
}

async function requestJson(accessToken, path, queryValues = {}) {
  if (!accessToken) {
    throw createApiError("Your administrator session is unavailable. Please sign in again.", 401);
  }

  const query = buildQuery(queryValues);
  const url = `${getApiBaseUrl()}${path}${query ? `?${query}` : ""}`;
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
      throw createApiError("The attendance request timed out. Please try again.");
    }

    if (error instanceof TypeError) {
      throw createApiError(
        "Unable to reach the administration service. Check your connection and backend CORS settings.",
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
        ? "Your administrator session is no longer valid. Please sign in again."
        : response.status === 403
          ? "Your account is not permitted to view university attendance reports."
          : response.status >= 500
            ? "The administration service is temporarily unavailable. Please try again."
            : payload?.message || "Unable to load attendance information.";

    throw createApiError(message, response.status, payload?.details);
  }

  if (payload?.status !== "ok" || !payload.data) {
    throw createApiError(
      "The administration service returned an unexpected response. Please retry.",
      502,
    );
  }

  return payload.data;
}

function validateDirectoryPage(data, collectionKey) {
  const rows = data?.[collectionKey];
  const pagination = data?.pagination;

  if (
    !Array.isArray(rows) ||
    !pagination ||
    !Number.isInteger(pagination.page) ||
    !Number.isInteger(pagination.pageSize) ||
    !Number.isInteger(pagination.totalPages) ||
    pagination.page < 1 ||
    pagination.pageSize < 1 ||
    pagination.totalPages < 0
  ) {
    throw createApiError(
      "The class and subject directory returned an unexpected response.",
      502,
    );
  }

  return { rows, pagination };
}

async function fetchDirectory(accessToken, path, collectionKey, validateRow) {
  const firstData = await requestJson(accessToken, path, {
    page: "1",
    pageSize: String(DIRECTORY_PAGE_SIZE),
  });
  const first = validateDirectoryPage(firstData, collectionKey);

  if (!first.rows.every(validateRow)) {
    throw createApiError("The class and subject directory returned invalid records.", 502);
  }

  const totalPages = Math.max(first.pagination.totalPages, 1);
  if (totalPages > MAX_DIRECTORY_PAGES) {
    throw createApiError(
      "The class and subject directory is too large to load all filter choices safely. Please contact support.",
      502,
    );
  }

  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) =>
      requestJson(accessToken, path, {
        page: String(index + 2),
        pageSize: String(DIRECTORY_PAGE_SIZE),
      }),
    ),
  );

  const remainingRows = remainingPages.flatMap((data) => {
    const page = validateDirectoryPage(data, collectionKey);
    if (!page.rows.every(validateRow)) {
      throw createApiError("The class and subject directory returned invalid records.", 502);
    }
    return page.rows;
  });

  return [...first.rows, ...remainingRows];
}

const isClass = (item) =>
  item &&
  typeof item.id === "string" &&
  typeof item.code === "string" &&
  typeof item.name === "string" &&
  typeof item.academicYear === "string";

const isSubject = (item) =>
  item &&
  typeof item.id === "string" &&
  typeof item.classId === "string" &&
  typeof item.code === "string" &&
  typeof item.name === "string" &&
  item.class &&
  typeof item.class.id === "string" &&
  typeof item.class.code === "string" &&
  typeof item.class.name === "string";

export async function fetchAdminAttendanceFilterOptions(accessToken) {
  const [classes, subjects] = await Promise.all([
    fetchDirectory(accessToken, "/api/admin/classes", "classes", isClass),
    fetchDirectory(accessToken, "/api/admin/subjects", "subjects", isSubject),
  ]);

  return { classes, subjects };
}

export async function fetchAdminAttendanceReport(accessToken, filters = {}) {
  const data = await requestJson(
    accessToken,
    "/api/admin/attendance",
    filters,
  );

  if (
    !data.period ||
    !data.filters ||
    !isAttendanceSummary(data.summary) ||
    !Array.isArray(data.subjects) ||
    !data.subjects.every(
      (item) =>
        item &&
        item.subject &&
        typeof item.subject.id === "string" &&
        typeof item.subject.code === "string" &&
        typeof item.subject.name === "string" &&
        item.subject.class &&
        typeof item.subject.class.id === "string" &&
        typeof item.subject.class.code === "string" &&
        typeof item.subject.class.name === "string" &&
        isAttendanceSummary(item.summary),
    )
  ) {
    throw createApiError(
      "The attendance report returned an unexpected response. Please retry.",
      502,
    );
  }

  return data;
}
