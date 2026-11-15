import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  fetchAdminClasses,
  fetchAdminSubjects,
  fetchAllAdminClasses,
} from "../src/features/admin/api/adminCatalogueApi.js";
import {
  createAdminClass,
  updateAdminClass,
} from "../src/features/admin/api/adminClassManagementApi.js";
import {
  createAdminSubject,
  updateAdminSubject,
} from "../src/features/admin/api/adminSubjectManagementApi.js";

const API_BASE = "https://ltsu-smart-portal-api-0i8h.onrender.com";

const classRecord = (overrides = {}) => ({
  id: "class-1",
  code: "CSE-2026",
  name: "Computer Science",
  academicYear: "2026-2027",
  isActive: true,
  createdAt: "2026-11-15T08:00:00.000Z",
  updatedAt: "2026-11-15T08:00:00.000Z",
  _count: { students: 18, subjects: 6 },
  ...overrides,
});

const subjectRecord = (overrides = {}) => ({
  id: "subject-1",
  classId: "class-1",
  code: "CSE-101",
  name: "Programming Fundamentals",
  description: null,
  isActive: true,
  createdAt: "2026-11-15T08:00:00.000Z",
  updatedAt: "2026-11-15T08:00:00.000Z",
  class: {
    id: "class-1",
    code: "CSE-2026",
    name: "Computer Science",
    academicYear: "2026-2027",
    isActive: true,
  },
  ...overrides,
});

let originalFetch;
let originalWindow;
let calls;
let responses;

function enqueue(status, body) {
  responses.push({ status, body });
}

function installFetchMock() {
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    const next = responses.shift();
    if (!next) throw new Error("Unexpected fetch call in API contract test.");

    return {
      ok: next.status >= 200 && next.status < 300,
      status: next.status,
      json: async () => next.body,
    };
  };
}

beforeEach(() => {
  originalFetch = globalThis.fetch;
  originalWindow = globalThis.window;
  calls = [];
  responses = [];
  globalThis.window = {
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
  };
  installFetchMock();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalWindow === undefined) {
    delete globalThis.window;
  } else {
    globalThis.window = originalWindow;
  }
});

describe("Admin academic catalogue API contracts", () => {
  it("requests paginated class records with the supported filters and Bearer token", async () => {
    const expectedClass = classRecord();
    enqueue(200, {
      status: "ok",
      data: {
        classes: [expectedClass],
        pagination: { page: 2, pageSize: 20, total: 21, totalPages: 2 },
      },
    });

    const result = await fetchAdminClasses("admin-token", {
      page: 2,
      pageSize: 20,
      search: "  Computer  ",
      isActive: "false",
    });

    assert.equal(
      calls[0].url,
      `${API_BASE}/api/admin/classes?page=2&pageSize=20&search=Computer&isActive=false`,
    );
    assert.equal(calls[0].options.method, "GET");
    assert.equal(calls[0].options.headers.Authorization, "Bearer admin-token");
    assert.deepEqual(result.rows, [expectedClass]);
    assert.deepEqual(result.pagination, {
      page: 2, pageSize: 20, total: 21, totalPages: 2,
    });
  });

  it("includes the selected parent class when filtering subjects", async () => {
    const expectedSubject = subjectRecord();
    enqueue(200, {
      status: "ok",
      data: {
        subjects: [expectedSubject],
        pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
      },
    });

    const result = await fetchAdminSubjects("admin-token", {
      page: 1,
      pageSize: 10,
      classId: "class-1",
    });

    assert.equal(
      calls[0].url,
      `${API_BASE}/api/admin/subjects?page=1&pageSize=10&classId=class-1`,
    );
    assert.deepEqual(result.rows, [expectedSubject]);
  });

  it("loads all class-choice pages for subject creation without truncating the directory", async () => {
    const first = classRecord({ id: "class-1" });
    const second = classRecord({ id: "class-2", code: "ECE-2026", name: "Electronics" });
    enqueue(200, {
      status: "ok",
      data: {
        classes: [first],
        pagination: { page: 1, pageSize: 100, total: 2, totalPages: 2 },
      },
    });
    enqueue(200, {
      status: "ok",
      data: {
        classes: [second],
        pagination: { page: 2, pageSize: 100, total: 2, totalPages: 2 },
      },
    });

    const result = await fetchAllAdminClasses("admin-token");

    assert.deepEqual(result, [first, second]);
    assert.deepEqual(
      calls.map((call) => call.url),
      [
        `${API_BASE}/api/admin/classes?page=1&pageSize=100`,
        `${API_BASE}/api/admin/classes?page=2&pageSize=100`,
      ],
    );
  });

  it("creates a class using the exact backend payload and validates the created projection", async () => {
    const created = classRecord({ code: "CSE.2026" });
    enqueue(201, { status: "ok", data: { class: created } });

    const result = await createAdminClass("admin-token", {
      code: " cse.2026 ",
      name: " Computer Science ",
      academicYear: " 2026-2027 ",
    });

    assert.equal(calls[0].url, `${API_BASE}/api/admin/classes`);
    assert.equal(calls[0].options.method, "POST");
    assert.equal(calls[0].options.headers.Authorization, "Bearer admin-token");
    assert.deepEqual(JSON.parse(calls[0].options.body), {
      code: "CSE.2026",
      name: "Computer Science",
      academicYear: "2026-2027",
    });
    assert.deepEqual(result, created);
  });

  it("updates a class through its encoded identifier and permits only supported status fields", async () => {
    const updated = classRecord({ id: "class/one", isActive: false });
    enqueue(200, { status: "ok", data: { class: updated } });

    const result = await updateAdminClass("admin-token", "class/one", {
      isActive: false,
    });

    assert.equal(calls[0].url, `${API_BASE}/api/admin/classes/class%2Fone`);
    assert.equal(calls[0].options.method, "PATCH");
    assert.deepEqual(JSON.parse(calls[0].options.body), { isActive: false });
    assert.deepEqual(result, updated);
  });

  it("rejects unsupported class fields and invalid class codes before making a request", async () => {
    await assert.rejects(
      createAdminClass("admin-token", {
        code: "CSE-1",
        name: "Computer Science",
        academicYear: "2026-2027",
        departmentId: "department-1",
      }),
      (error) => error.status === 400 && /unsupported fields/i.test(error.message),
    );

    await assert.rejects(
      createAdminClass("admin-token", {
        code: "CSE 1",
        name: "Computer Science",
        academicYear: "2026-2027",
      }),
      (error) => error.status === 400,
    );

    assert.equal(calls.length, 0);
  });

  it("maps a duplicate class conflict to the catalogue-specific message", async () => {
    enqueue(409, { status: "error", message: "Unique constraint failed." });

    await assert.rejects(
      createAdminClass("admin-token", {
        code: "CSE-2026",
        name: "Computer Science",
        academicYear: "2026-2027",
      }),
      (error) =>
        error.status === 409 &&
        error.message === "A class with this code already exists. Choose a different code.",
    );
  });

  it("creates a subject with its parent class and a nullable description", async () => {
    const created = subjectRecord({ description: null });
    enqueue(201, { status: "ok", data: { subject: created } });

    const result = await createAdminSubject("admin-token", {
      classId: "class-1",
      code: " cse-101 ",
      name: " Programming Fundamentals ",
      description: null,
    });

    assert.equal(calls[0].url, `${API_BASE}/api/admin/subjects`);
    assert.equal(calls[0].options.method, "POST");
    assert.deepEqual(JSON.parse(calls[0].options.body), {
      classId: "class-1",
      code: "CSE-101",
      name: "Programming Fundamentals",
      description: null,
    });
    assert.deepEqual(result, created);
  });

  it("updates a subject status without allowing its parent class to be changed", async () => {
    const updated = subjectRecord({ isActive: false });
    enqueue(200, { status: "ok", data: { subject: updated } });

    const result = await updateAdminSubject("admin-token", "subject-1", {
      isActive: false,
    });

    assert.equal(calls[0].url, `${API_BASE}/api/admin/subjects/subject-1`);
    assert.equal(calls[0].options.method, "PATCH");
    assert.deepEqual(JSON.parse(calls[0].options.body), { isActive: false });
    assert.deepEqual(result, updated);

    await assert.rejects(
      updateAdminSubject("admin-token", "subject-1", { classId: "class-2" }),
      (error) => error.status === 400 && /unsupported fields/i.test(error.message),
    );
    assert.equal(calls.length, 1);
  });

  it("rejects a malformed successful mutation response instead of trusting it", async () => {
    enqueue(201, {
      status: "ok",
      data: { class: { id: "class-1", code: "CSE-1" } },
    });

    await assert.rejects(
      createAdminClass("admin-token", {
        code: "CSE-1",
        name: "Computer Science",
        academicYear: "2026-2027",
      }),
      (error) => error.status === 502 && /unexpected class response/i.test(error.message),
    );
  });

  it("rejects a missing administrator token without calling the service", async () => {
    await assert.rejects(
      createAdminSubject("", {
        classId: "class-1",
        code: "CSE-101",
        name: "Programming Fundamentals",
      }),
      (error) => error.status === 401 && /session is unavailable/i.test(error.message),
    );

    assert.equal(calls.length, 0);
  });
});
