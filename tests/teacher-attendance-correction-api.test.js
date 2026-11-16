import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  fetchTeacherAttendanceForDate,
  updateTeacherAttendanceRecord,
} from "../src/features/teacher/api/teacherAttendanceCorrectionApi.js";

const API_BASE = "https://ltsu-smart-portal-api-0i8h.onrender.com";

const attendanceRecord = (overrides = {}) => ({
  id: "attendance-1",
  studentId: "student-1",
  status: "ABSENT",
  remarks: null,
  markedAt: "2026-11-16T10:00:00.000Z",
  editableUntil: "2026-11-16T10:30:00.000Z",
  markedByCurrentTeacher: true,
  proofSubmitted: false,
  editable: true,
  ...overrides,
});

let originalFetch;
let originalWindow;
let calls;
let responses;

function enqueue(status, body) {
  responses.push({ status, body });
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
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    const next = responses.shift();
    if (!next) throw new Error("Unexpected fetch call in Teacher attendance correction API test.");
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

describe("Teacher attendance correction API contracts", () => {
  it("loads records for an encoded assigned subject and exact attendance date", async () => {
    const data = {
      subjectId: "subject/one",
      attendanceDate: "2026-11-16",
      records: [attendanceRecord()],
    };
    success(data);

    const result = await fetchTeacherAttendanceForDate(
      "teacher-token",
      "subject/one",
      "2026-11-16",
    );

    assert.equal(
      calls[0].url,
      `${API_BASE}/api/teacher/subjects/subject%2Fone/attendance?attendanceDate=2026-11-16`,
    );
    assert.equal(calls[0].options.method, "GET");
    assert.equal(calls[0].options.headers.Authorization, "Bearer teacher-token");
    assert.deepEqual(result, data);
  });

  it("accepts an empty register for a valid assigned subject and date", async () => {
    success({ subjectId: "subject-1", attendanceDate: "2026-11-16", records: [] });
    const result = await fetchTeacherAttendanceForDate("teacher-token", "subject-1", "2026-11-16");
    assert.deepEqual(result.records, []);
  });

  it("accepts read-only rows marked by another Teacher and rows locked by proof", async () => {
    success({
      subjectId: "subject-1",
      attendanceDate: "2026-11-16",
      records: [
        attendanceRecord({ markedByCurrentTeacher: false, editable: false }),
        attendanceRecord({
          id: "attendance-2",
          studentId: "student-2",
          proofSubmitted: true,
          editable: false,
        }),
      ],
    });
    const result = await fetchTeacherAttendanceForDate("teacher-token", "subject-1", "2026-11-16");
    assert.equal(result.records[0].editable, false);
    assert.equal(result.records[1].proofSubmitted, true);
  });

  it("rejects malformed, duplicate, or mismatched response records", async () => {
    success({
      subjectId: "subject-1",
      attendanceDate: "2026-11-16",
      records: [attendanceRecord({ editable: true, markedByCurrentTeacher: false })],
    });
    await assert.rejects(
      fetchTeacherAttendanceForDate("teacher-token", "subject-1", "2026-11-16"),
      (error) => error.status === 502,
    );

    success({
      subjectId: "subject-1",
      attendanceDate: "2026-11-16",
      records: [
        attendanceRecord(),
        attendanceRecord({ id: "attendance-2" }),
      ],
    });
    await assert.rejects(
      fetchTeacherAttendanceForDate("teacher-token", "subject-1", "2026-11-16"),
      (error) => error.status === 502,
    );

    success({ subjectId: "another-subject", attendanceDate: "2026-11-16", records: [] });
    await assert.rejects(
      fetchTeacherAttendanceForDate("teacher-token", "subject-1", "2026-11-16"),
      (error) => error.status === 502,
    );
  });

  it("validates identifiers and date before making a request", async () => {
    await assert.rejects(
      fetchTeacherAttendanceForDate("teacher-token", "", "2026-11-16"),
      (error) => error.status === 400,
    );
    await assert.rejects(
      fetchTeacherAttendanceForDate("teacher-token", "subject-1", "2026-02-30"),
      (error) => error.status === 400,
    );
    await assert.rejects(
      fetchTeacherAttendanceForDate("", "subject-1", "2026-11-16"),
      (error) => error.status === 401,
    );
    assert.equal(calls.length, 0);
  });

  it("maps expired sessions, permissions and correction-window conflicts", async () => {
    enqueue(401, { status: "error" });
    await assert.rejects(
      fetchTeacherAttendanceForDate("teacher-token", "subject-1", "2026-11-16"),
      (error) => error.status === 401 && /session is no longer valid/i.test(error.message),
    );
    enqueue(403, { status: "error" });
    await assert.rejects(
      updateTeacherAttendanceRecord("teacher-token", "attendance-1", { status: "ABSENT" }),
      (error) => error.status === 403 && /not permitted/i.test(error.message),
    );
    enqueue(409, { status: "error", message: "The 30-minute attendance correction window has expired." });
    await assert.rejects(
      updateTeacherAttendanceRecord("teacher-token", "attendance-1", { status: "ABSENT" }),
      (error) => error.status === 409 && /30-minute attendance correction window has expired/i.test(error.message),
    );
  });

  it("sends a targeted PATCH for one attendance row and validates the saved result", async () => {
    const attendance = {
      id: "attendance/one",
      studentId: "student-1",
      subjectId: "subject-1",
      attendanceDate: "2026-11-16",
      status: "PRESENT",
      remarks: null,
      editable: true,
      editableUntil: "2026-11-16T10:30:00.000Z",
    };
    success({ attendance });

    const result = await updateTeacherAttendanceRecord(
      "teacher-token",
      "attendance/one",
      { status: "PRESENT" },
    );

    assert.equal(calls[0].url, `${API_BASE}/api/teacher/attendance/attendance%2Fone`);
    assert.equal(calls[0].options.method, "PATCH");
    assert.equal(calls[0].options.headers.Authorization, "Bearer teacher-token");
    assert.deepEqual(JSON.parse(calls[0].options.body), { status: "PRESENT" });
    assert.deepEqual(result, attendance);
  });

  it("rejects invalid corrections locally without network access", async () => {
    await assert.rejects(
      updateTeacherAttendanceRecord("teacher-token", "", { status: "PRESENT" }),
      (error) => error.status === 400,
    );
    await assert.rejects(
      updateTeacherAttendanceRecord("teacher-token", "attendance-1", { status: "LATE" }),
      (error) => error.status === 400,
    );
    assert.equal(calls.length, 0);
  });

  it("maps network and timeout failures to actionable errors", async () => {
    globalThis.fetch = async () => { throw new TypeError("fetch failed"); };
    await assert.rejects(
      fetchTeacherAttendanceForDate("teacher-token", "subject-1", "2026-11-16"),
      (error) => error.status === 0 && /Unable to reach/i.test(error.message),
    );

    globalThis.fetch = async () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      throw error;
    };
    await assert.rejects(
      updateTeacherAttendanceRecord("teacher-token", "attendance-1", { status: "PRESENT" }),
      (error) => error.status === 0 && /timed out/i.test(error.message),
    );
  });
});
