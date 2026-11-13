import { getApiBaseUrl } from "../../auth/api/authApi";

const REQUEST_TIMEOUT_MS = 12000;
const CLASS_OPTION_PAGE_SIZE = 100;
const MAX_CLASS_OPTION_PAGES = 100;

function createApiError(message, status = 0, details = []) {
  const error = new Error(message);
  error.status = status;
  error.details = Array.isArray(details) ? details : [];
  return error;
}

function buildQuery({ page, pageSize, search, isActive, classId }) {
  const query = new URLSearchParams();

  if (Number.isInteger(page) && page >= 1) query.set("page", String(page));
  if (Number.isInteger(pageSize) && pageSize >= 1) {
    query.set("pageSize", String(pageSize));
  }
  if (typeof search === "string" && search.trim()) {
    query.set("search", search.trim());
  }
  if (isActive === "true" || isActive === "false") {
    query.set("isActive", isActive);
  }
  if (typeof classId === "string" && classId.trim()) {
    query.set("classId", classId.trim());
  }

  return query.toString();
}

async function requestDirectory(accessToken, path, params) {
  if (!accessToken) {
    throw createApiError(
      "Your administrator session is unavailable. Please sign in again.",
      401,
    );
  }

  const query = buildQuery(params);
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
      throw createApiError(
        "The catalogue request timed out. Please try again.",
      );
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
          ? "Your account is not permitted to view the academic catalogue."
          : response.status >= 500
            ? "The administration service is temporarily unavailable. Please try again."
            : payload?.message || "Unable to load the academic catalogue.";

    throw createApiError(message, response.status, payload?.details);
  }

  if (payload?.status !== "ok" || !payload.data) {
    throw createApiError(
      "The administration service returned an unexpected catalogue response.",
      502,
    );
  }

  return payload.data;
}

function isPagination(pagination) {
  return (
    pagination &&
    Number.isInteger(pagination.page) &&
    pagination.page >= 1 &&
    Number.isInteger(pagination.pageSize) &&
    pagination.pageSize >= 1 &&
    Number.isInteger(pagination.total) &&
    pagination.total >= 0 &&
    Number.isInteger(pagination.totalPages) &&
    pagination.totalPages >= 0
  );
}

function isClassRecord(item) {
  return (
    item &&
    typeof item.id === "string" &&
    typeof item.code === "string" &&
    typeof item.name === "string" &&
    typeof item.academicYear === "string" &&
    typeof item.isActive === "boolean" &&
    item._count &&
    Number.isInteger(item._count.students) &&
    item._count.students >= 0 &&
    Number.isInteger(item._count.subjects) &&
    item._count.subjects >= 0
  );
}

function isSubjectRecord(item) {
  return (
    item &&
    typeof item.id === "string" &&
    typeof item.classId === "string" &&
    typeof item.code === "string" &&
    typeof item.name === "string" &&
    (item.description === null || typeof item.description === "string") &&
    typeof item.isActive === "boolean" &&
    item.class &&
    typeof item.class.id === "string" &&
    typeof item.class.code === "string" &&
    typeof item.class.name === "string" &&
    typeof item.class.academicYear === "string" &&
    typeof item.class.isActive === "boolean"
  );
}

function validatePage(data, collectionKey, validator) {
  const rows = data?.[collectionKey];

  if (
    !Array.isArray(rows) ||
    !isPagination(data.pagination) ||
    !rows.every(validator)
  ) {
    throw createApiError(
      "The academic catalogue returned records in an unexpected format.",
      502,
    );
  }

  return { rows, pagination: data.pagination };
}

export async function fetchAdminClasses(accessToken, filters = {}) {
  const data = await requestDirectory(
    accessToken,
    "/api/admin/classes",
    filters,
  );

  return validatePage(data, "classes", isClassRecord);
}

export async function fetchAdminSubjects(accessToken, filters = {}) {
  const data = await requestDirectory(
    accessToken,
    "/api/admin/subjects",
    filters,
  );

  return validatePage(data, "subjects", isSubjectRecord);
}

export async function fetchAllAdminClasses(accessToken) {
  const first = await fetchAdminClasses(accessToken, {
    page: 1,
    pageSize: CLASS_OPTION_PAGE_SIZE,
  });

  const totalPages = Math.max(first.pagination.totalPages, 1);
  if (totalPages > MAX_CLASS_OPTION_PAGES) {
    throw createApiError(
      "There are too many classes to populate the subject filter safely. Use the class directory search or contact support.",
      502,
    );
  }

  const pages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchAdminClasses(accessToken, {
        page: index + 2,
        pageSize: CLASS_OPTION_PAGE_SIZE,
      }),
    ),
  );

  return [
    ...first.rows,
    ...pages.flatMap((page) => page.rows),
  ];
}
