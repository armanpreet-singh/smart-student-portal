import test, { afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  deleteAdminManagedUser,
  updateAdminManagedUser
} from "../src/features/admin/api/adminManagedUsersApi.js";

const API_BASE = "https://ltsu-smart-portal-api-0i8h.onrender.com";

let originalFetch;
let originalWindow;
let calls;

function response(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload
  };
}

function student(overrides = {}) {
  return {
    id: "student-1",
    fullName: "Updated Student",
    username: "updated.student",
    email: null,
    rollNumber: "00CSE/0021",
    role: "STUDENT",
    classId: "class-2",
    mustChangePassword: false,
    isActive: true,
    createdAt: "2026-11-01T08:00:00.000Z",
    updatedAt: "2026-11-17T08:00:00.000Z",
    class: { id: "class-2", code: "CSE-2026", name: "Computer Science" },
    ...overrides
  };
}

function teacher(overrides = {}) {
  return {
    id: "teacher-1",
    fullName: "Updated Teacher",
    username: "updated.teacher",
    email: "teacher@example.edu",
    role: "TEACHER",
    classId: null,
    mustChangePassword: false,
    isActive: true,
    createdAt: "2026-11-01T08:00:00.000Z",
    updatedAt: "2026-11-17T08:00:00.000Z",
    class: null,
    ...overrides
  };
}

beforeEach(() => {
  originalFetch = globalThis.fetch;
  originalWindow = globalThis.window;
  calls = [];
  globalThis.window = {
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout
  };
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    return response(200, { status: "ok", data: { user: student() } });
  };
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
});

test("updates a Student profile with nullable email/roll number/class fields and validates the response", async () => {
  const result = await updateAdminManagedUser("admin-token", "STUDENT", "student/1", {
    fullName: " Updated Student ",
    username: "UPDATED.STUDENT",
    email: "",
    rollNumber: "",
    classId: ""
  });

  assert.equal(calls[0].url, `${API_BASE}/api/admin/users/student%2F1`);
  assert.equal(calls[0].options.method, "PATCH");
  assert.equal(calls[0].options.headers.Authorization, "Bearer admin-token");
  assert.equal(calls[0].options.headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    fullName: "Updated Student",
    username: "updated.student",
    email: null,
    rollNumber: null,
    classId: null
  });
  assert.equal(result.role, "STUDENT");
});

test("updates Teacher profile fields without sending Student-only properties", async () => {
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    return response(200, { status: "ok", data: { user: teacher() } });
  };

  const result = await updateAdminManagedUser("admin-token", "TEACHER", "teacher-1", {
    fullName: "Updated Teacher",
    username: "updated.teacher",
    email: "teacher@example.edu"
  });

  assert.deepEqual(JSON.parse(calls[0].options.body), {
    fullName: "Updated Teacher",
    username: "updated.teacher",
    email: "teacher@example.edu"
  });
  assert.equal(result.role, "TEACHER");
});

test("rejects invalid profile input and unknown role before the network call", async () => {
  await assert.rejects(
    updateAdminManagedUser("admin-token", "STUDENT", "student-1", {
      fullName: "A",
      username: "invalid username",
      email: "not-an-email",
      rollNumber: "bad roll"
    }),
    (error) => error.status === 400 && Boolean(error.fieldErrors)
  );
  await assert.rejects(
    updateAdminManagedUser("admin-token", "ADMIN", "admin-1", {
      fullName: "Admin User",
      username: "admin.user",
      email: ""
    }),
    (error) => error.status === 400
  );
  assert.equal(calls.length, 0);
});

test("maps duplicate, expired-session and server errors", async () => {
  globalThis.fetch = async () => response(409, {
    status: "error",
    message: "A user with this username already exists."
  });
  await assert.rejects(
    updateAdminManagedUser("admin-token", "TEACHER", "teacher-1", {
      fullName: "Teacher One", username: "teacher.one", email: ""
    }),
    (error) => error.status === 409 && /already exists/i.test(error.message)
  );

  globalThis.fetch = async () => response(401, { status: "error" });
  await assert.rejects(
    updateAdminManagedUser("expired-token", "TEACHER", "teacher-1", {
      fullName: "Teacher One", username: "teacher.one", email: ""
    }),
    (error) => error.status === 401 && /session is no longer valid/i.test(error.message)
  );
});


test("deletes a Student account using the authenticated Admin DELETE endpoint", async () => {
  const deletedAt = "2026-11-18T13:00:00.000Z";
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    return response(200, {
      status: "ok",
      data: {
        user: {
          id: "student/1",
          fullName: "Updated Student",
          username: "updated.student",
          role: "STUDENT",
          isActive: false,
          deletedAt
        }
      }
    });
  };

  const result = await deleteAdminManagedUser("admin-token", "STUDENT", "student/1");
  assert.equal(calls[0].url, `${API_BASE}/api/admin/users/student%2F1`);
  assert.equal(calls[0].options.method, "DELETE");
  assert.equal(calls[0].options.headers.Authorization, "Bearer admin-token");
  assert.equal(result.deletedAt, deletedAt);
  assert.equal(result.isActive, false);
});

test("deletes a Teacher account and rejects unsupported role/user inputs", async () => {
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    return response(200, {
      status: "ok",
      data: {
        user: {
          id: "teacher-1",
          fullName: "Updated Teacher",
          username: "updated.teacher",
          role: "TEACHER",
          isActive: false,
          deletedAt: "2026-11-18T13:00:00.000Z"
        }
      }
    });
  };
  const result = await deleteAdminManagedUser("admin-token", "TEACHER", "teacher-1");
  assert.equal(result.role, "TEACHER");

  await assert.rejects(
    deleteAdminManagedUser("admin-token", "ADMIN", "admin-1"),
    (error) => error.status === 400
  );
  await assert.rejects(
    deleteAdminManagedUser("admin-token", "STUDENT", ""),
    (error) => error.status === 400
  );
});

test("maps expired-session and unavailable-account delete errors", async () => {
  globalThis.fetch = async () => response(401, { status: "error" });
  await assert.rejects(
    deleteAdminManagedUser("expired-token", "STUDENT", "student-1"),
    (error) => error.status === 401 && /session is no longer valid/i.test(error.message)
  );

  globalThis.fetch = async () => response(404, { status: "error" });
  await assert.rejects(
    deleteAdminManagedUser("admin-token", "TEACHER", "teacher-1"),
    (error) => error.status === 404 && /no longer available/i.test(error.message)
  );
});
