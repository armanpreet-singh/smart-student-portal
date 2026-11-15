import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  fetchTeacherAssignedSubjects,
  fetchTeacherSubjectRoster,
} from "../src/features/teacher/api/teacherSubjectsApi.js";

const API_BASE = "https://ltsu-smart-portal-api-0i8h.onrender.com";

const assignedSubject = (overrides = {}) => ({
  assignedAt: "2026-11-10T09:30:00.000Z",
  subject: {
    id: "subject-1",
    code: "CSE-101",
    name: "Programming Fundamentals",
    classId: "class-1",
    class: {
      id: "class-1",
      code: "CSE-2026",
      name: "Computer Science",
      academicYear: "2026-2027",
    },
  },
  ...overrides,
});

const roster = (overrides = {}) => ({
  subject: {
    id: "subject-1",
    code: "CSE-101",
    name: "Programming Fundamentals",
    class: {
      id: "class-1",
      code: "CSE-2026",
      name: "Computer Science",
    },
  },
  students: [
    { id: "student-1", fullName: "Student One", username: "student.one" },
    { id: "student-2", fullName: "Student Two", username: "student.two" },
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
    if (!next) throw new Error("Unexpected fetch call in Teacher subjects API test.");

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

describe("Teacher assigned-subject and roster API contracts", () => {
  it("loads assigned subjects using the authenticated Teacher endpoint", async () => {
    const data = { subjects: [assignedSubject()] };
    success(data);

    const result = await fetchTeacherAssignedSubjects("teacher-token");

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, `${API_BASE}/api/teacher/subjects`);
    assert.equal(calls[0].options.method, "GET");
    assert.equal(calls[0].options.headers.Accept, "application/json");
    assert.equal(calls[0].options.headers.Authorization, "Bearer teacher-token");
    assert.equal(calls[0].options.body, undefined);
    assert.deepEqual(result, data.subjects);
  });

  it("accepts an empty assigned-subject list", async () => {
    success({ subjects: [] });

    const result = await fetchTeacherAssignedSubjects("teacher-token");

    assert.deepEqual(result, []);
  });

  it("rejects malformed assigned-subject records and class/subject mismatches", async () => {
    success({
      subjects: [
        assignedSubject({
          subject: {
            ...assignedSubject().subject,
            class: {
              ...assignedSubject().subject.class,
              id: "another-class",
            },
          },
        }),
      ],
    });

    await assert.rejects(
      fetchTeacherAssignedSubjects("teacher-token"),
      (error) =>
        error.status === 502 &&
        /assigned subjects in an unexpected format/i.test(error.message),
    );
  });

  it("rejects a missing Teacher token without calling the service", async () => {
    await assert.rejects(
      fetchTeacherAssignedSubjects(""),
      (error) =>
        error.status === 401 &&
        error.message === "Your Teacher session is unavailable. Please sign in again.",
    );

    assert.equal(calls.length, 0);
  });

  it("maps expired-session and role-permission responses", async () => {
    enqueue(401, { status: "error" });
    await assert.rejects(
      fetchTeacherAssignedSubjects("expired-token"),
      (error) =>
        error.status === 401 &&
        error.message === "Your Teacher session is no longer valid. Please sign in again.",
    );

    enqueue(403, { status: "error" });
    await assert.rejects(
      fetchTeacherAssignedSubjects("wrong-role-token"),
      (error) =>
        error.status === 403 &&
        error.message === "Your account is not permitted to view this Teacher resource.",
    );
  });

  it("maps server errors without exposing internal service details", async () => {
    enqueue(503, { status: "error", message: "Database trace details." });

    await assert.rejects(
      fetchTeacherAssignedSubjects("teacher-token"),
      (error) =>
        error.status === 503 &&
        error.message === "The Teacher service is temporarily unavailable. Please try again.",
    );
  });

  it("loads an assigned subject roster using the encoded subject identifier", async () => {
    const data = roster({
      subject: {
        ...roster().subject,
        id: "subject/one",
      },
    });
    success(data);

    const result = await fetchTeacherSubjectRoster(
      "teacher-token",
      "subject/one",
      "class-1",
    );

    assert.equal(
      calls[0].url,
      `${API_BASE}/api/teacher/subjects/subject%2Fone/roster`,
    );
    assert.equal(calls[0].options.method, "GET");
    assert.equal(calls[0].options.headers.Authorization, "Bearer teacher-token");
    assert.deepEqual(result, data);
  });

  it("rejects invalid subject and class identifiers before making a request", async () => {
    await assert.rejects(
      fetchTeacherSubjectRoster("teacher-token", "", "class-1"),
      (error) => error.status === 400 && /valid assigned subject/i.test(error.message),
    );
    await assert.rejects(
      fetchTeacherSubjectRoster("teacher-token", "subject-1", ""),
      (error) => error.status === 400 && /invalid class/i.test(error.message),
    );

    assert.equal(calls.length, 0);
  });

  it("rejects a roster for a different subject or class", async () => {
    success(roster({
      subject: {
        ...roster().subject,
        id: "subject-other",
      },
    }));

    await assert.rejects(
      fetchTeacherSubjectRoster("teacher-token", "subject-1", "class-1"),
      (error) => error.status === 502 && /roster in an unexpected format/i.test(error.message),
    );
  });

  it("rejects duplicate roster student identifiers and malformed student records", async () => {
    success(roster({
      students: [
        { id: "student-1", fullName: "Student One", username: "student.one" },
        { id: "student-1", fullName: "Student Duplicate", username: "student.duplicate" },
      ],
    }));

    await assert.rejects(
      fetchTeacherSubjectRoster("teacher-token", "subject-1", "class-1"),
      (error) => error.status === 502 && /roster in an unexpected format/i.test(error.message),
    );

    success(roster({
      students: [
        { id: "student-1", fullName: "Student One", username: "" },
      ],
    }));

    await assert.rejects(
      fetchTeacherSubjectRoster("teacher-token", "subject-1", "class-1"),
      (error) => error.status === 502 && /roster in an unexpected format/i.test(error.message),
    );
  });

  it("preserves a not-found response when a subject is no longer assigned or active", async () => {
    enqueue(404, {
      status: "error",
      message: "Assigned active subject not found.",
    });

    await assert.rejects(
      fetchTeacherSubjectRoster("teacher-token", "subject-1", "class-1"),
      (error) =>
        error.status === 404 &&
        error.message === "Assigned active subject not found.",
    );
  });

  it("maps network failures and request timeouts to actionable messages", async () => {
    globalThis.fetch = async () => {
      throw new TypeError("fetch failed");
    };

    await assert.rejects(
      fetchTeacherAssignedSubjects("teacher-token"),
      (error) =>
        error.status === 0 &&
        /Unable to reach the Teacher service/.test(error.message),
    );

    globalThis.fetch = async () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      throw error;
    };

    await assert.rejects(
      fetchTeacherSubjectRoster("teacher-token", "subject-1", "class-1"),
      (error) =>
        error.status === 0 &&
        error.message === "The student-roster request timed out. Please try again.",
    );
  });
});
