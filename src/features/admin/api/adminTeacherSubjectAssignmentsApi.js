import { getApiBaseUrl } from "../../auth/api/authApi";

const REQUEST_TIMEOUT_MS = 12000;

function createApiError(message, status = 0, details = []) {
  const error = new Error(message);
  error.status = status;
  error.details = Array.isArray(details) ? details : [];
  return error;
}

export async function createTeacherSubjectAssignment(accessToken, teacherId, subjectId) {
  if (!accessToken) {
    throw createApiError(
      "Your administrator session is unavailable. Please sign in again.",
      401,
    );
  }

  if (
    typeof teacherId !== "string" ||
    !teacherId.trim() ||
    teacherId.trim().length > 64 ||
    typeof subjectId !== "string" ||
    !subjectId.trim() ||
    subjectId.trim().length > 64
  ) {
    throw createApiError("Select an active teacher and an eligible subject.", 400);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  let response;

  try {
    response = await fetch(
      `${getApiBaseUrl()}/api/admin/teacher-subject-assignments`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          teacherId: teacherId.trim(),
          subjectId: subjectId.trim(),
        }),
        signal: controller.signal,
      },
    );
  } catch (error) {
    if (error?.name === "AbortError") {
      throw createApiError(
        "The assignment request timed out. The server may still have created it; check before trying again.",
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
      response.status === 400
        ? payload?.message || "The selected teacher or subject is no longer eligible."
        : response.status === 401
          ? "Your administrator session is no longer valid. Please sign in again."
          : response.status === 403
            ? "Your account is not permitted to assign teachers to subjects."
            : response.status === 409
              ? "This teacher is already assigned to the selected subject."
              : response.status >= 500
                ? "The administration service is temporarily unavailable. Please try again."
                : payload?.message || "Unable to create this teacher-subject assignment.";

    throw createApiError(message, response.status, payload?.details);
  }

  const assignment = payload?.data?.assignment;
  if (
    payload?.status !== "ok" ||
    response.status !== 201 ||
    !assignment ||
    typeof assignment.id !== "string" ||
    assignment.teacherId !== teacherId.trim() ||
    assignment.subjectId !== subjectId.trim() ||
    typeof assignment.assignedAt !== "string" ||
    !Number.isFinite(Date.parse(assignment.assignedAt))
  ) {
    throw createApiError(
      "The administration service returned an unexpected assignment response.",
      502,
    );
  }

  return assignment;
}
