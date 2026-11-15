import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  fetchAdminAttendanceFilterOptions,
  fetchAdminAttendanceReport,
} from "../src/features/admin/api/adminAttendanceApi.js";

const API_BASE = "https://ltsu-smart-portal-api-0i8h.onrender.com";

const summary = (overrides = {}) => ({
  PRESENT: 8,
  ABSENT: 2,
  LATE: 1,
  EXCUSED: 3,
  totalRecords: 14,
  eligibleSessions: 11,
  attendedSessions: 9,
  attendancePercentage: 81.82,
  ...overrides,
});

const report = (overrides = {}) => ({
  period: { fromDate: "2026-11-01", toDate: "2026-11-15" },
  filters: { classId: "class-1", subjectId: null },
  summary: summary(),
  subjects: [
    {
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
      summary: summary(),
    },
  ],
  ...overrides,
});

const classRecord = (id = "class-1") => ({
  id,
  code: id === "class-1" ? "CSE-2026" : "ECE-2026",
  name: id === "class-1" ? "Computer Science" : "Electronics",
  academicYear: "2026-2027",
});

const subjectRecord = (id = "subject-1") => ({
  id,
  classId: "class-1",
  code: id === "subject-1" ? "CSE-101" : "CSE-102",
  name: id === "subject-1" ? "Programming Fundamentals" : "Data Structures",
  class: {
    id: "class-1",
    code: "CSE-2026",
    name: "Computer Science",
  },
});

const directoryPage = (collection, rows, pageNumber, totalPages) => ({
  status: "ok",
  data: {
    [collection]: rows,
    pagination: {
      page: pageNumber,
      pageSize: 100,
      totalPages,
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
    throw new Error("No fetch response configured for Admin attendance API test.");
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

describe("Admin attendance reporting API contracts", () => {
  it("requests the attendance report with all supported date, class and subject filters", async () => {
    const data = report();
    setResponder(() => jsonResponse(200, { status: "ok", data }));

    const result = await fetchAdminAttendanceReport("admin-token", {
      fromDate: " 2026-11-01 ",
      toDate: "2026-11-15",
      classId: " class-1 ",
      subjectId: " subject-1 ",
    });

    assert.equal(
      calls[0].url,
      `${API_BASE}/api/admin/attendance?fromDate=2026-11-01&toDate=2026-11-15&classId=class-1&subjectId=subject-1`,
    );
    assert.equal(calls[0].options.method, "GET");
    assert.equal(calls[0].options.headers.Accept, "application/json");
    assert.equal(calls[0].options.headers.Authorization, "Bearer admin-token");
    assert.deepEqual(result, data);
  });

  it("omits blank filters instead of sending empty query parameters", async () => {
    const data = report({
      period: { fromDate: null, toDate: null },
      filters: { classId: null, subjectId: null },
    });
    setResponder(() => jsonResponse(200, { status: "ok", data }));

    const result = await fetchAdminAttendanceReport("admin-token", {
      fromDate: "",
      toDate: "  ",
      classId: "",
      subjectId: "",
    });

    assert.equal(calls[0].url, `${API_BASE}/api/admin/attendance`);
    assert.deepEqual(result.period, { fromDate: null, toDate: null });
  });

  it("accepts a report with no subjects and a null percentage for zero eligible sessions", async () => {
    const data = report({
      period: { fromDate: null, toDate: null },
      filters: { classId: null, subjectId: null },
      summary: summary({
        PRESENT: 0,
        ABSENT: 0,
        LATE: 0,
        EXCUSED: 0,
        totalRecords: 0,
        eligibleSessions: 0,
        attendedSessions: 0,
        attendancePercentage: null,
      }),
      subjects: [],
    });
    setResponder(() => jsonResponse(200, { status: "ok", data }));

    const result = await fetchAdminAttendanceReport("admin-token");

    assert.deepEqual(result.subjects, []);
    assert.equal(result.summary.eligibleSessions, 0);
    assert.equal(result.summary.attendancePercentage, null);
  });

  it("accepts all four current backend statuses and the excused-excluded summary fields", async () => {
    const data = report();
    setResponder(() => jsonResponse(200, { status: "ok", data }));

    const result = await fetchAdminAttendanceReport("admin-token");

    assert.equal(result.summary.PRESENT, 8);
    assert.equal(result.summary.ABSENT, 2);
    assert.equal(result.summary.LATE, 1);
    assert.equal(result.summary.EXCUSED, 3);
    assert.equal(result.summary.eligibleSessions, 11);
    assert.equal(result.summary.attendedSessions, 9);
    assert.equal(result.subjects[0].summary.attendancePercentage, 81.82);
  });

  it("rejects summaries with out-of-range percentages or negative counts", async () => {
    setResponder(() =>
      jsonResponse(200, {
        status: "ok",
        data: report({
          summary: summary({ attendancePercentage: 100.01 }),
        }),
      }),
    );

    await assert.rejects(
      fetchAdminAttendanceReport("admin-token"),
      (error) => error.status === 502 && /unexpected response/i.test(error.message),
    );

    setResponder(() =>
      jsonResponse(200, {
        status: "ok",
        data: report({
          summary: summary({ ABSENT: -1 }),
        }),
      }),
    );

    await assert.rejects(
      fetchAdminAttendanceReport("admin-token"),
      (error) => error.status === 502 && /unexpected response/i.test(error.message),
    );
  });

  it("rejects incomplete subject report projections", async () => {
    setResponder(() =>
      jsonResponse(200, {
        status: "ok",
        data: report({
          subjects: [
            {
              subject: {
                id: "subject-1",
                code: "CSE-101",
                name: "Programming Fundamentals",
                class: { id: "class-1", code: "CSE-2026" },
              },
              summary: summary(),
            },
          ],
        }),
      }),
    );

    await assert.rejects(
      fetchAdminAttendanceReport("admin-token"),
      (error) => error.status === 502 && /unexpected response/i.test(error.message),
    );
  });

  it("loads class and subject filter choices with paginated Admin directory endpoints", async () => {
    const dataByUrl = new Map([
      [`${API_BASE}/api/admin/classes?page=1&pageSize=100`, directoryPage("classes", [classRecord()], 1, 1)],
      [`${API_BASE}/api/admin/subjects?page=1&pageSize=100`, directoryPage("subjects", [subjectRecord()], 1, 1)],
    ]);
    setResponder(({ url }) => {
      const body = dataByUrl.get(url);
      if (!body) throw new Error(`Unexpected filter-options URL: ${url}`);
      return jsonResponse(200, body);
    });

    const result = await fetchAdminAttendanceFilterOptions("admin-token");

    assert.deepEqual(result.classes, [classRecord()]);
    assert.deepEqual(result.subjects, [subjectRecord()]);
    assert.deepEqual(
      calls.map((call) => call.url).sort(),
      [
        `${API_BASE}/api/admin/classes?page=1&pageSize=100`,
        `${API_BASE}/api/admin/subjects?page=1&pageSize=100`,
      ].sort(),
    );
    assert.ok(calls.every((call) => call.options.headers.Authorization === "Bearer admin-token"));
  });

  it("retrieves all pages of class and subject filter choices", async () => {
    const dataByUrl = new Map([
      [`${API_BASE}/api/admin/classes?page=1&pageSize=100`, directoryPage("classes", [classRecord("class-1")], 1, 2)],
      [`${API_BASE}/api/admin/classes?page=2&pageSize=100`, directoryPage("classes", [classRecord("class-2")], 2, 2)],
      [`${API_BASE}/api/admin/subjects?page=1&pageSize=100`, directoryPage("subjects", [subjectRecord("subject-1")], 1, 2)],
      [`${API_BASE}/api/admin/subjects?page=2&pageSize=100`, directoryPage("subjects", [subjectRecord("subject-2")], 2, 2)],
    ]);
    setResponder(({ url }) => {
      const body = dataByUrl.get(url);
      if (!body) throw new Error(`Unexpected paginated directory URL: ${url}`);
      return jsonResponse(200, body);
    });

    const result = await fetchAdminAttendanceFilterOptions("admin-token");

    assert.deepEqual(result.classes.map((item) => item.id), ["class-1", "class-2"]);
    assert.deepEqual(result.subjects.map((item) => item.id), ["subject-1", "subject-2"]);
    assert.equal(calls.length, 4);
  });

  it("rejects invalid directory rows instead of exposing incomplete filter choices", async () => {
    setResponder(({ url }) => {
      const collection = url.includes("/classes") ? "classes" : "subjects";
      const rows = collection === "classes"
        ? [{ id: "class-1", code: "CSE-2026" }]
        : [subjectRecord()];
      return jsonResponse(200, {
        status: "ok",
        data: {
          [collection]: rows,
          pagination: { page: 1, pageSize: 100, totalPages: 1 },
        },
      });
    });

    await assert.rejects(
      fetchAdminAttendanceFilterOptions("admin-token"),
      (error) => error.status === 502,
    );
  });

  it("rejects a missing administrator token without calling any endpoint", async () => {
    await assert.rejects(
      fetchAdminAttendanceReport(""),
      (error) => error.status === 401 && /session is unavailable/i.test(error.message),
    );

    assert.equal(calls.length, 0);
  });

  it("maps expired sessions, permission errors and service failures", async () => {
    setResponder(() => jsonResponse(401, { status: "error" }));
    await assert.rejects(
      fetchAdminAttendanceReport("expired-token"),
      (error) => error.status === 401 && /session is no longer valid/i.test(error.message),
    );

    setResponder(() => jsonResponse(403, { status: "error" }));
    await assert.rejects(
      fetchAdminAttendanceReport("wrong-role-token"),
      (error) => error.status === 403 && /not permitted to view/i.test(error.message),
    );

    setResponder(() => jsonResponse(503, { status: "error", message: "Internal trace." }));
    await assert.rejects(
      fetchAdminAttendanceReport("admin-token"),
      (error) => error.status === 503 && /temporarily unavailable/i.test(error.message),
    );
  });

  it("maps network failures and request timeouts to actionable messages", async () => {
    globalThis.fetch = async () => {
      throw new TypeError("fetch failed");
    };

    await assert.rejects(
      fetchAdminAttendanceReport("admin-token"),
      (error) => error.status === 0 && /Unable to reach the administration service/.test(error.message),
    );

    globalThis.fetch = async () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      throw error;
    };

    await assert.rejects(
      fetchAdminAttendanceReport("admin-token"),
      (error) => error.status === 0 && error.message === "The attendance request timed out. Please try again.",
    );
  });
});
