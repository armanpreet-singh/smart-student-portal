import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { fetchStudentAttendance } from "../src/features/dashboard/api/studentAttendanceApi.js";

const API_BASE = "https://ltsu-smart-portal-api-0i8h.onrender.com";

const summary = (overrides = {}) => ({
  PRESENT: 1,
  ABSENT: 2,
  ON_DUTY_REVIEW: 1,
  totalRecords: 4,
  eligibleSessions: 4,
  attendedSessions: 1,
  attendancePercentage: 25,
  ...overrides,
});

const subjectResult = (overrides = {}) => ({
  subject: {
    id: "subject-1",
    code: "CSE-101",
    name: "Programming Fundamentals",
    isActive: true,
    class: {
      id: "class-1",
      code: "CSE-2026",
      name: "Computer Science",
      isActive: true,
    },
  },
  summary: summary(),
  records: [
    {
      id: "attendance-1",
      date: "2026-11-14",
      status: "PRESENT",
      remarks: null,
      recordedAt: "2026-11-14T08:30:00.000Z",
      dutyProof: {
        fileName: "duty-note.pdf",
        format: "pdf",
        bytes: 1024,
        submittedAt: "2026-11-14T08:45:00.000Z",
      },
    },
    {
      id: "attendance-2",
      date: "2026-11-13",
      status: "ABSENT",
      remarks: "Not present",
      recordedAt: "2026-11-13T08:30:00.000Z",
    },
    {
      id: "attendance-3",
      date: "2026-11-12",
      status: "ON_DUTY_REVIEW",
      remarks: "Awaiting duty proof",
      recordedAt: "2026-11-12T08:30:00.000Z",
      dutyProof: null,
    },
    {
      id: "attendance-4",
      date: "2026-11-11",
      status: "ABSENT",
      remarks: "Not present",
      recordedAt: "2026-11-11T08:30:00.000Z",
      dutyProof: null,
    },
  ],
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
    if (!next) throw new Error("Unexpected fetch call in Student attendance API test.");

    return {
      ok: next.status >= 200 && next.status < 300,
      status: next.status,
      json: async () => next.body,
    };
  };
}

function success(data) {
  enqueue(200, { status: "ok", data });
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

describe("Student attendance API contracts", () => {
  it("requests self-scoped attendance with a Bearer token and no unnecessary query string", async () => {
    const data = {
      period: { fromDate: null, toDate: null },
      subjects: [subjectResult()],
    };
    success(data);

    const result = await fetchStudentAttendance("student-token");

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, `${API_BASE}/api/student/attendance`);
    assert.equal(calls[0].options.method, "GET");
    assert.equal(calls[0].options.headers.Accept, "application/json");
    assert.equal(calls[0].options.headers.Authorization, "Bearer student-token");
    assert.equal(calls[0].options.body, undefined);
    assert.deepEqual(result, data);
  });

  it("serializes optional fromDate and toDate filters using the backend query names", async () => {
    const data = {
      period: { fromDate: "2026-11-01", toDate: "2026-11-15" },
      subjects: [subjectResult()],
    };
    success(data);

    const result = await fetchStudentAttendance("student-token", {
      fromDate: "2026-11-01",
      toDate: "2026-11-15",
    });

    assert.equal(
      calls[0].url,
      `${API_BASE}/api/student/attendance?fromDate=2026-11-01&toDate=2026-11-15`,
    );
    assert.deepEqual(result.period, data.period);
  });

  it("supports a one-sided date filter without inventing the missing boundary", async () => {
    success({
      period: { fromDate: "2026-11-01", toDate: null },
      subjects: [],
    });

    const result = await fetchStudentAttendance("student-token", {
      fromDate: "2026-11-01",
    });

    assert.equal(
      calls[0].url,
      `${API_BASE}/api/student/attendance?fromDate=2026-11-01`,
    );
    assert.deepEqual(result.subjects, []);
  });

  it("accepts the three backend statuses and validated duty-proof metadata", async () => {
    const resultData = {
      period: { fromDate: null, toDate: null },
      subjects: [subjectResult()],
    };
    success(resultData);

    const result = await fetchStudentAttendance("student-token");

    assert.deepEqual(
      result.subjects[0].records.map((record) => record.status),
      ["PRESENT", "ABSENT", "ON_DUTY_REVIEW", "ABSENT"],
    );
    assert.equal(result.subjects[0].summary.totalRecords, 4);
    assert.equal(result.subjects[0].summary.eligibleSessions, 4);
    assert.equal(result.subjects[0].summary.attendedSessions, 1);
    assert.equal(result.subjects[0].summary.attendancePercentage, 25);
    assert.equal(result.subjects[0].records[0].dutyProof.fileName, "duty-note.pdf");
  });

  it("accepts an empty subject list for a Student with no catalogue subjects", async () => {
    const data = {
      period: { fromDate: null, toDate: null },
      subjects: [],
    };
    success(data);

    const result = await fetchStudentAttendance("student-token");

    assert.deepEqual(result, data);
  });

  it("accepts a null attendance percentage when there are no attendance records", async () => {
    const emptyEligibility = subjectResult({
      summary: summary({
        PRESENT: 0,
        ABSENT: 0,
        ON_DUTY_REVIEW: 0,
        totalRecords: 0,
        eligibleSessions: 0,
        attendedSessions: 0,
        attendancePercentage: null,
      }),
      records: [],
    });
    success({
      period: { fromDate: null, toDate: null },
      subjects: [emptyEligibility],
    });

    const result = await fetchStudentAttendance("student-token");

    assert.equal(result.subjects[0].summary.eligibleSessions, 0);
    assert.equal(result.subjects[0].summary.attendedSessions, 0);
    assert.equal(result.subjects[0].summary.attendancePercentage, null);
  });

  it("rejects a missing token without making a network request", async () => {
    await assert.rejects(
      fetchStudentAttendance(""),
      (error) =>
        error.status === 401 &&
        error.message === "Your session is unavailable. Please sign in again.",
    );

    assert.equal(calls.length, 0);
  });

  it("maps an expired Student session to the sign-in error", async () => {
    enqueue(401, { status: "error", message: "Unauthorized." });

    await assert.rejects(
      fetchStudentAttendance("expired-token"),
      (error) =>
        error.status === 401 &&
        error.message === "Your student session is no longer valid. Please sign in again.",
    );
  });

  it("preserves the backend permission and unassigned-class errors", async () => {
    enqueue(403, { status: "error" });
    await assert.rejects(
      fetchStudentAttendance("student-token"),
      (error) =>
        error.status === 403 &&
        error.message === "Your account is not permitted to view student attendance.",
    );

    enqueue(409, {
      status: "error",
      message: "No class is assigned to this student account.",
    });
    await assert.rejects(
      fetchStudentAttendance("student-token"),
      (error) =>
        error.status === 409 &&
        error.message === "No class is assigned to this student account.",
    );
  });

  it("maps service failures without exposing raw server errors", async () => {
    enqueue(503, { status: "error", message: "Database internal trace." });

    await assert.rejects(
      fetchStudentAttendance("student-token"),
      (error) =>
        error.status === 503 &&
        error.message === "The attendance service is temporarily unavailable. Please try again.",
    );
  });

  it("rejects malformed summaries, dates and unknown statuses as unexpected responses", async () => {
    const invalidRecords = subjectResult({
      records: [
        {
          id: "attendance-invalid",
          date: "2026-02-30",
          status: "LATE",
          remarks: null,
        },
      ],
    });
    success({
      period: { fromDate: null, toDate: null },
      subjects: [invalidRecords],
    });

    await assert.rejects(
      fetchStudentAttendance("student-token"),
      (error) => error.status === 502 && /unexpected response/i.test(error.message),
    );

    const invalidSummary = subjectResult({
      summary: summary({ attendancePercentage: 105 }),
    });
    success({
      period: { fromDate: null, toDate: null },
      subjects: [invalidSummary],
    });

    await assert.rejects(
      fetchStudentAttendance("student-token"),
      (error) => error.status === 502 && /unexpected response/i.test(error.message),
    );
  });

  it("maps network failures and request timeouts to actionable messages", async () => {
    globalThis.fetch = async () => {
      throw new TypeError("fetch failed");
    };

    await assert.rejects(
      fetchStudentAttendance("student-token"),
      (error) =>
        error.status === 0 &&
        /Unable to reach the attendance service/.test(error.message),
    );

    globalThis.fetch = async () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      throw error;
    };

    await assert.rejects(
      fetchStudentAttendance("student-token"),
      (error) =>
        error.status === 0 &&
        error.message === "The attendance request timed out. Please try again.",
    );
  });
});
