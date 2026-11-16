import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  fetchAdminTeacherSubjectAssignments,
} from "../src/features/admin/api/adminTeacherSubjectAssignmentsApi.js";

const API_BASE = "https://ltsu-smart-portal-api-0i8h.onrender.com";

const assignment = (overrides = {}) => ({
  id: "assignment-1",
  assignedAt: "2026-11-12T09:30:00.000Z",
  teacher: {
    id: "teacher-1",
    fullName: "Teacher One",
    username: "teacher.one",
    isActive: true,
  },
  subject: {
    id: "subject-1",
    code: "CSE-101",
    name: "Programming Fundamentals",
    isActive: true,
    class: {
      id: "class-1",
      code: "CSE-2026",
      name: "Computer Science",
      academicYear: "2026-2027",
      isActive: true,
    },
  },
  ...overrides,
});

const directoryResponse = (assignments = [], pagination = {}) => ({
  assignments,
  pagination: {
    page: 1,
    pageSize: 20,
    total: assignments.length,
    totalPages: assignments.length ? 1 : 0,
    ...pagination,
  },
});

let originalFetch;
let originalWindow;
let calls;
let responder;

beforeEach(() => {
  originalFetch = globalThis.fetch;
  originalWindow = globalThis.window;
  calls = [];
  responder = async () => ({
    status: 200,
    body: { status: "ok", data: directoryResponse([assignment()]) },
  });
  globalThis.window = {
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
  };
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    const next = await responder();
    return {
      ok: next.status >= 200 && next.status < 300,
      status: next.status,
      json: async () => next.body,
    };
  };
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
});

describe("Admin Teacher-to-Subject assignment directory API", () => {
  it("loads paginated assignments with filters and preserves inactive related records", async () => {
    const inactive = assignment({
      teacher: { ...assignment().teacher, isActive: false },
      subject: {
        ...assignment().subject,
        isActive: false,
        class: { ...assignment().subject.class, isActive: false },
      },
    });
    responder = async () => ({
      status: 200,
      body: { status: "ok", data: directoryResponse([inactive], {
        page: 2,
        pageSize: 10,
        total: 31,
        totalPages: 4,
      }) },
    });

    const result = await fetchAdminTeacherSubjectAssignments("admin-token", {
      page: 2,
      pageSize: 10,
      search: " Computer ",
      teacherId: "teacher-1",
      subjectId: "subject-1",
      classId: "class-1",
    });

    const request = calls[0];
    const url = new URL(request.url);
    assert.equal(url.origin, API_BASE);
    assert.equal(url.pathname, "/api/admin/teacher-subject-assignments");
    assert.equal(url.searchParams.get("page"), "2");
    assert.equal(url.searchParams.get("pageSize"), "10");
    assert.equal(url.searchParams.get("search"), "Computer");
    assert.equal(url.searchParams.get("teacherId"), "teacher-1");
    assert.equal(url.searchParams.get("subjectId"), "subject-1");
    assert.equal(url.searchParams.get("classId"), "class-1");
    assert.equal(request.options.method, "GET");
    assert.equal(request.options.headers.Authorization, "Bearer admin-token");
    assert.equal(result.assignments[0].teacher.isActive, false);
    assert.equal(result.assignments[0].subject.isActive, false);
    assert.equal(result.assignments[0].subject.class.isActive, false);
    assert.deepEqual(result.pagination, {
      page: 2,
      pageSize: 10,
      total: 31,
      totalPages: 4,
    });
  });

  it("accepts an empty assignment directory with zero pages", async () => {
    responder = async () => ({
      status: 200,
      body: { status: "ok", data: directoryResponse([], { total: 0, totalPages: 0 }) },
    });

    const result = await fetchAdminTeacherSubjectAssignments("admin-token");

    assert.deepEqual(result.assignments, []);
    assert.equal(result.pagination.total, 0);
  });

  it("rejects malformed assignment or related active-state fields", async () => {
    responder = async () => ({
      status: 200,
      body: { status: "ok", data: directoryResponse([
        assignment({
          subject: {
            ...assignment().subject,
            class: { ...assignment().subject.class, isActive: "true" },
          },
        }),
      ]) },
    });

    await assert.rejects(
      fetchAdminTeacherSubjectAssignments("admin-token"),
      (error) => error.status === 502 && /unexpected assignment directory response/i.test(error.message),
    );
  });

  it("rejects invalid filters and pagination before making a request", async () => {
    await assert.rejects(
      fetchAdminTeacherSubjectAssignments("admin-token", { page: 0 }),
      (error) => error.status === 400,
    );
    await assert.rejects(
      fetchAdminTeacherSubjectAssignments("admin-token", { pageSize: 101 }),
      (error) => error.status === 400,
    );
    await assert.rejects(
      fetchAdminTeacherSubjectAssignments("admin-token", { search: "x".repeat(81) }),
      (error) => error.status === 400,
    );
    await assert.rejects(
      fetchAdminTeacherSubjectAssignments("admin-token", { teacherId: " " }),
      (error) => error.status === 400,
    );
    assert.equal(calls.length, 0);
  });

  it("rejects a missing Admin token without calling the endpoint", async () => {
    await assert.rejects(
      fetchAdminTeacherSubjectAssignments(""),
      (error) => error.status === 401 && /session is unavailable/i.test(error.message),
    );
    assert.equal(calls.length, 0);
  });

  it("maps expired-session, forbidden and server responses", async () => {
    responder = async () => ({ status: 401, body: { status: "error" } });
    await assert.rejects(
      fetchAdminTeacherSubjectAssignments("expired-token"),
      (error) => error.status === 401 && /no longer valid/i.test(error.message),
    );

    responder = async () => ({ status: 403, body: { status: "error" } });
    await assert.rejects(
      fetchAdminTeacherSubjectAssignments("wrong-role-token"),
      (error) => error.status === 403 && /not permitted/i.test(error.message),
    );

    responder = async () => ({ status: 503, body: { status: "error" } });
    await assert.rejects(
      fetchAdminTeacherSubjectAssignments("admin-token"),
      (error) => error.status === 503 && /temporarily unavailable/i.test(error.message),
    );
  });
});
