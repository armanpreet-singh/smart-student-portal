import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { fetchAdminStudents } from "../src/features/admin/api/adminStudentsApi.js";
import { createAdminStudent } from "../src/features/admin/api/adminStudentProvisioningApi.js";
import { fetchAdminTeachers } from "../src/features/admin/api/adminTeachersApi.js";

const API_BASE = "https://ltsu-smart-portal-api-0i8h.onrender.com";

const studentRecord = (overrides = {}) => ({
  id: "student-1",
  fullName: "Student One",
  username: "student.one",
  email: "student.one@ltsu.ac.in",
  rollNumber: null,
  role: "STUDENT",
  classId: "class-1",
  mustChangePassword: false,
  isActive: true,
  createdAt: "2026-11-01T08:00:00.000Z",
  updatedAt: "2026-11-10T08:00:00.000Z",
  class: {
    id: "class-1",
    code: "CSE-2026",
    name: "Computer Science",
  },
  ...overrides,
});

const teacherRecord = (overrides = {}) => ({
  id: "teacher-1",
  fullName: "Teacher One",
  username: "teacher.one",
  email: "teacher.one@ltsu.ac.in",
  role: "TEACHER",
  classId: null,
  mustChangePassword: false,
  isActive: true,
  createdAt: "2026-10-01T08:00:00.000Z",
  updatedAt: "2026-11-10T08:00:00.000Z",
  class: null,
  ...overrides,
});

const directoryResponse = (users, overrides = {}) => ({
  status: "ok",
  data: {
    users,
    pagination: {
      page: 1,
      pageSize: 20,
      total: users.length,
      totalPages: users.length ? 1 : 0,
      ...overrides,
    },
  },
});

let originalFetch;
let originalWindow;
let calls;
let responder;

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

function setResponder(nextResponder) {
  responder = nextResponder;
  globalThis.fetch = async (url, options = {}) => {
    const request = { url: String(url), options };
    calls.push(request);
    return responder(request);
  };
}

beforeEach(() => {
  originalFetch = globalThis.fetch;
  originalWindow = globalThis.window;
  calls = [];
  globalThis.window = {
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
  };
  setResponder(() => {
    throw new Error("No fetch response configured for Admin user directory test.");
  });
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalWindow === undefined) {
    delete globalThis.window;
  } else {
    globalThis.window = originalWindow;
  }
});

describe("Admin Student and Teacher directory API contracts", () => {
  it("requests paginated Student records with role, search, status and Bearer token", async () => {
    const data = directoryResponse([studentRecord()], {
      page: 2,
      pageSize: 50,
      total: 61,
      totalPages: 2,
    });
    setResponder(() => jsonResponse(200, data));

    const result = await fetchAdminStudents("admin-token", {
      page: 2,
      pageSize: 50,
      search: "  Student One ",
      isActive: "false",
    });

    assert.equal(
      calls[0].url,
      `${API_BASE}/api/admin/users?role=STUDENT&page=2&pageSize=50&search=Student+One&isActive=false`,
    );
    assert.equal(calls[0].options.method, "GET");
    assert.equal(calls[0].options.headers.Accept, "application/json");
    assert.equal(calls[0].options.headers.Authorization, "Bearer admin-token");
    assert.deepEqual(result.users, [studentRecord()]);
    assert.deepEqual(result.pagination, {
      page: 2,
      pageSize: 50,
      total: 61,
      totalPages: 2,
    });
  });

  it("requests paginated Teacher records with the TEACHER role filter", async () => {
    const data = directoryResponse([teacherRecord()], {
      page: 3,
      pageSize: 10,
      total: 21,
      totalPages: 3,
    });
    setResponder(() => jsonResponse(200, data));

    const result = await fetchAdminTeachers("admin-token", {
      page: 3,
      pageSize: 10,
      search: "teacher.one",
      isActive: "true",
    });

    assert.equal(
      calls[0].url,
      `${API_BASE}/api/admin/users?role=TEACHER&page=3&pageSize=10&search=teacher.one&isActive=true`,
    );
    assert.equal(calls[0].options.headers.Authorization, "Bearer admin-token");
    assert.deepEqual(result.users, [teacherRecord()]);
  });

  it("uses the default page size and omits the all-status filter", async () => {
    setResponder(() =>
      jsonResponse(200, directoryResponse([studentRecord()])),
    );

    await fetchAdminStudents("admin-token");

    assert.equal(
      calls[0].url,
      `${API_BASE}/api/admin/users?role=STUDENT&page=1&pageSize=20`,
    );
  });

  it("accepts empty results and nullable user class/email/roll-number fields", async () => {
    const noStudents = directoryResponse([]);
    setResponder(() => jsonResponse(200, noStudents));

    const emptyResult = await fetchAdminStudents("admin-token");
    assert.deepEqual(emptyResult.users, []);
    assert.equal(emptyResult.pagination.totalPages, 0);

    const unassignedTeacher = teacherRecord({
      email: null,
      classId: null,
      class: null,
    });
    setResponder(() =>
      jsonResponse(200, directoryResponse([unassignedTeacher])),
    );

    const teacherResult = await fetchAdminTeachers("admin-token");
    assert.equal(teacherResult.users[0].email, null);
    assert.equal(teacherResult.users[0].class, null);
    assert.equal(teacherResult.users[0].classId, null);
  });

  it("preserves populated official roll numbers and rejects malformed roll-number values", async () => {
    const officialStudent = studentRecord({ rollNumber: "000CSE/0123" });
    setResponder(() =>
      jsonResponse(200, directoryResponse([officialStudent])),
    );

    const result = await fetchAdminStudents("admin-token");
    assert.equal(result.users[0].rollNumber, "000CSE/0123");

    setResponder(() =>
      jsonResponse(
        200,
        directoryResponse([studentRecord({ rollNumber: 123 })]),
      ),
    );

    await assert.rejects(
      fetchAdminStudents("admin-token"),
      (error) => error.status === 502 && /unexpected format/i.test(error.message),
    );
  });

  it("rejects invalid Student page, pageSize, search and status filters before fetch", async () => {
    await assert.rejects(
      fetchAdminStudents("admin-token", { page: 0 }),
      (error) => error.status === 400 && /filters are invalid/i.test(error.message),
    );
    await assert.rejects(
      fetchAdminStudents("admin-token", { pageSize: 101 }),
      (error) => error.status === 400,
    );
    await assert.rejects(
      fetchAdminStudents("admin-token", { search: "x".repeat(81) }),
      (error) => error.status === 400,
    );
    await assert.rejects(
      fetchAdminStudents("admin-token", { isActive: "sometimes" }),
      (error) => error.status === 400,
    );

    assert.equal(calls.length, 0);
  });

  it("rejects invalid Teacher status and paging filters before fetch", async () => {
    await assert.rejects(
      fetchAdminTeachers("admin-token", { isActive: "sometimes" }),
      (error) => error.status === 400 && /filters are invalid/i.test(error.message),
    );
    await assert.rejects(
      fetchAdminTeachers("admin-token", { pageSize: 101 }),
      (error) => error.status === 400,
    );
    assert.equal(calls.length, 0);
  });

  it("rejects a directory record whose role does not match the requested directory", async () => {
    setResponder(() =>
      jsonResponse(200, directoryResponse([teacherRecord()])),
    );

    await assert.rejects(
      fetchAdminStudents("admin-token"),
      (error) => error.status === 502 && /unexpected format/i.test(error.message),
    );
  });

  it("rejects invalid pagination metadata instead of exposing an incomplete directory", async () => {
    setResponder(() =>
      jsonResponse(200, {
        status: "ok",
        data: {
          users: [studentRecord()],
          pagination: {
            page: 1,
            pageSize: 20,
            total: -1,
            totalPages: 1,
          },
        },
      }),
    );

    await assert.rejects(
      fetchAdminStudents("admin-token"),
      (error) => error.status === 502 && /unexpected format/i.test(error.message),
    );
  });

  it("rejects a missing administrator token without calling the endpoint", async () => {
    await assert.rejects(
      fetchAdminTeachers(""),
      (error) => error.status === 401 && /session is unavailable/i.test(error.message),
    );
    assert.equal(calls.length, 0);
  });

  it("maps expired-session and permission responses for the Student directory", async () => {
    setResponder(() => jsonResponse(401, { status: "error" }));
    await assert.rejects(
      fetchAdminStudents("expired-token"),
      (error) => error.status === 401 && /session is no longer valid/i.test(error.message),
    );

    setResponder(() => jsonResponse(403, { status: "error" }));
    await assert.rejects(
      fetchAdminStudents("wrong-role-token"),
      (error) => error.status === 403 && /not permitted to view the student directory/i.test(error.message),
    );
  });

  it("maps service errors and network failures for the Teacher directory", async () => {
    setResponder(() =>
      jsonResponse(503, { status: "error", message: "Internal trace." }),
    );
    await assert.rejects(
      fetchAdminTeachers("admin-token"),
      (error) => error.status === 503 && /temporarily unavailable/i.test(error.message),
    );

    globalThis.fetch = async () => {
      throw new TypeError("fetch failed");
    };
    await assert.rejects(
      fetchAdminTeachers("admin-token"),
      (error) => error.status === 0 && /Unable to reach the administration service/.test(error.message),
    );
  });

  it("maps request timeouts to the directory-specific retry message", async () => {
    globalThis.fetch = async () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      throw error;
    };

    await assert.rejects(
      fetchAdminStudents("admin-token"),
      (error) => error.status === 0 && error.message === "The student directory request timed out. Please try again.",
    );
  });
});


describe("Admin Student create and restore API contract", () => {
  it("returns a restored Student marker when backend restores a retired account", async () => {
    const restoredUser = {
      id: "student-old",
      fullName: "Restored Student",
      username: "student.one",
      email: "student.one@example.edu",
      rollNumber: "CSE-001",
      role: "STUDENT",
      classId: "class-1",
      mustChangePassword: true,
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-11-18T14:00:00.000Z",
      class: { id: "class-1", code: "CSE-2026", name: "Computer Science" }
    };
    setResponder(() => jsonResponse(200, {
      status: "ok",
      message: "Retired account restored.",
      data: { user: restoredUser, restored: true }
    }));

    const result = await createAdminStudent("admin-token", {
      fullName: restoredUser.fullName,
      username: restoredUser.username,
      email: restoredUser.email,
      rollNumber: restoredUser.rollNumber,
      classId: restoredUser.classId,
      temporaryPassword: "new-temporary-password-123",
      confirmPassword: "new-temporary-password-123"
    });

    assert.equal(calls[0].options.method, "POST");
    assert.equal(calls[0].options.headers.Authorization, "Bearer admin-token");
    assert.equal(result.id, "student-old");
    assert.equal(result.restored, true);
  });

  it("keeps newly created Students marked as not restored for older response payloads", async () => {
    setResponder(() => jsonResponse(201, {
      status: "ok",
      data: {
        user: {
          id: "student-new",
          fullName: "New Student",
          username: "new.student",
          email: null,
          rollNumber: null,
          role: "STUDENT",
          classId: null,
          mustChangePassword: true,
          isActive: true,
          createdAt: "2026-11-18T14:00:00.000Z",
          updatedAt: "2026-11-18T14:00:00.000Z",
          class: null
        }
      }
    }));

    const result = await createAdminStudent("admin-token", {
      fullName: "New Student",
      username: "new.student",
      email: "",
      rollNumber: "",
      classId: "",
      temporaryPassword: "new-temporary-password-123",
      confirmPassword: "new-temporary-password-123"
    });

    assert.equal(result.restored, false);
  });

  it("surfaces identity conflicts that cannot be safely restored", async () => {
    setResponder(() => jsonResponse(409, {
      status: "error",
      message: "Use the same username or official roll number to restore a retired Student."
    }));

    await assert.rejects(
      createAdminStudent("admin-token", {
        fullName: "Another Student",
        username: "different.student",
        email: "reused@example.edu",
        rollNumber: "CSE-999",
        temporaryPassword: "new-temporary-password-123",
        confirmPassword: "new-temporary-password-123"
      }),
      (error) => error.status === 409 && /same username or official roll number/i.test(error.message)
    );
  });
});
