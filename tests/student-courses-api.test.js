import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { fetchStudentCourses } from "../src/features/dashboard/api/studentCoursesApi.js";

const API_BASE = "https://ltsu-smart-portal-api-0i8h.onrender.com";

const classSummary = {
  id: "class-1",
  code: "CSE-2026",
  name: "Computer Science",
  academicYear: "2026-2027",
  isActive: true,
};

const course = (overrides = {}) => ({
  id: "subject-1",
  classId: "class-1",
  code: "CSE-101",
  name: "Programming Fundamentals",
  description: "An introduction to programming.",
  class: {
    id: "class-1",
    code: "CSE-2026",
    name: "Computer Science",
    academicYear: "2026-2027",
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
    if (!next) throw new Error("Unexpected fetch call in Student courses API test.");
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

describe("Student course catalogue API contracts", () => {
  it("requests only the authenticated Student course endpoint", async () => {
    const data = { class: classSummary, courses: [course()] };
    success(data);

    const result = await fetchStudentCourses("student-token");

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, `${API_BASE}/api/student/courses`);
    assert.equal(calls[0].options.method, "GET");
    assert.equal(calls[0].options.headers.Accept, "application/json");
    assert.equal(calls[0].options.headers.Authorization, "Bearer student-token");
    assert.equal(calls[0].options.body, undefined);
    assert.deepEqual(result, data);
  });

  it("accepts an empty course list for an assigned class", async () => {
    success({ class: classSummary, courses: [] });
    const result = await fetchStudentCourses("student-token");
    assert.deepEqual(result, { class: classSummary, courses: [] });
  });

  it("accepts an unassigned Student with no class and no courses", async () => {
    success({ class: null, courses: [] });
    const result = await fetchStudentCourses("student-token");
    assert.deepEqual(result, { class: null, courses: [] });
  });

  it("preserves optional course descriptions", async () => {
    success({
      class: classSummary,
      courses: [course({ description: null })],
    });
    const result = await fetchStudentCourses("student-token");
    assert.equal(result.courses[0].description, null);
  });

  it("rejects malformed course records and class mismatches", async () => {
    success({
      class: classSummary,
      courses: [course({ classId: "class-other" })],
    });
    await assert.rejects(
      fetchStudentCourses("student-token"),
      (error) => error.status === 502 && /unexpected response/i.test(error.message),
    );

    success({
      class: classSummary,
      courses: [course({ class: { ...course().class, id: "class-other" } })],
    });
    await assert.rejects(
      fetchStudentCourses("student-token"),
      (error) => error.status === 502 && /unexpected response/i.test(error.message),
    );
  });

  it("rejects a missing Student token without making a request", async () => {
    await assert.rejects(
      fetchStudentCourses(""),
      (error) => error.status === 401,
    );
    assert.equal(calls.length, 0);
  });

  it("maps expired-session and permission errors", async () => {
    enqueue(401, { status: "error" });
    await assert.rejects(
      fetchStudentCourses("expired-token"),
      (error) => error.status === 401 && /session is no longer valid/i.test(error.message),
    );

    enqueue(403, { status: "error" });
    await assert.rejects(
      fetchStudentCourses("wrong-role-token"),
      (error) => error.status === 403 && /not permitted/i.test(error.message),
    );
  });

  it("preserves the backend's not-found message", async () => {
    enqueue(404, { status: "error", message: "Active Student account not found." });
    await assert.rejects(
      fetchStudentCourses("student-token"),
      (error) => error.status === 404 && error.message === "Active Student account not found.",
    );
  });

  it("maps server, network, and timeout errors to actionable messages", async () => {
    enqueue(503, { status: "error", message: "Database internal trace." });
    await assert.rejects(
      fetchStudentCourses("student-token"),
      (error) => error.status === 503 && /temporarily unavailable/i.test(error.message),
    );

    globalThis.fetch = async () => { throw new TypeError("fetch failed"); };
    await assert.rejects(
      fetchStudentCourses("student-token"),
      (error) => error.status === 0 && /Unable to reach/i.test(error.message),
    );

    globalThis.fetch = async () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      throw error;
    };
    await assert.rejects(
      fetchStudentCourses("student-token"),
      (error) => error.status === 0 && /timed out/i.test(error.message),
    );
  });

  it("rejects a malformed successful envelope", async () => {
    success({ class: classSummary, courses: [{ id: "incomplete" }] });
    await assert.rejects(
      fetchStudentCourses("student-token"),
      (error) => error.status === 502,
    );
  });
});
