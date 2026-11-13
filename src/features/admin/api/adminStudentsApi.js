import { getApiBaseUrl } from "../../auth/api/authApi";

const REQUEST_TIMEOUT_MS = 12000;

function createApiError(message, status = 0, details = []) {
  const error = new Error(message);
  error.status = status;
  error.details = Array.isArray(details) ? details : [];
  return error;
}

function isNullableString(value) {
  return value === null || typeof value === "string";
}

function isStudentClass(value) {
  return (
    value === null ||
    (value &&
      typeof value.id === "string" &&
      typeof value.code === "string" &&
      typeof value.name === "string")
  );
}

function isStudentRecord(user) {
  return (
    user &&
    typeof user.id === "string" &&
    typeof user.fullName === "string" &&
    typeof user.username === "string" &&
    isNullableString(user.email) &&
    user.role === "STUDENT" &&
    isNullableString(user.classId) &&
    typeof user.mustChangePassword === "boolean" &&
    typeof user.isActive === "boolean" &&
    typeof user.createdAt === "string" &&
    typeof user.updatedAt === "string" &&
    isStudentClass(user.class)
  );
}

function buildQuery({ page, pageSize, search, isActive }) {
  const query = new URLSearchParams();
  query.set("role", "STUDENT");
  query.set("page", String(page));
  query.set("pageSize", String(pageSize));

  if (typeof search === "string" && search.trim()) {
    query.set("search", search.trim());
  }
  if (isActive === "true" || isActive === "false") {
    query.set("isActive", isActive);
  }

  return query.toString();
}

export async function fetchAdminStudents(accessToken, filters = {}) {
  if (!accessToken) {
    throw createApiError(
      "Your administrator session is unavailable. Please sign in again.",
      401,
    );
  }

  const {
    page = 1,
    pageSize = 20,
    search = "",
    isActive = "all",
  } = filters;

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100 ||
    typeof search !== "string" ||
    search.trim().length > 80
  ) {
    throw createApiError("The student directory filters are invalid.", 400);
  }

  const query = buildQuery({ page, pageSize, search, isActive });
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  let response;

  try {
    response = await fetch(
      `${getApiBaseUrl()}/api/admin/users?${query}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        signal: controller.signal,
      },
    );
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError(
        "The student directory request timed out. Please try again.",
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
          ? "Your account is not permitted to view the student directory."
          : response.status >= 500
            ? "The administration service is temporarily unavailable. Please try again."
            : payload?.message || "Unable to load student directory records.";

    throw createApiError(message, response.status, payload?.details);
  }

  if (payload?.status !== "ok" || !payload.data) {
    throw createApiError(
      "The administration service returned an unexpected student directory response.",
      502,
    );
  }

  const { users, pagination } = payload.data;

  if (
    !Array.isArray(users) ||
    !users.every(isStudentRecord) ||
    !pagination ||
    !Number.isInteger(pagination.page) ||
    pagination.page < 1 ||
    !Number.isInteger(pagination.pageSize) ||
    pagination.pageSize < 1 ||
    !Number.isInteger(pagination.total) ||
    pagination.total < 0 ||
    !Number.isInteger(pagination.totalPages) ||
    pagination.totalPages < 0
  ) {
    throw createApiError(
      "The student directory returned records in an unexpected format.",
      502,
    );
  }

  return { users, pagination };
}
