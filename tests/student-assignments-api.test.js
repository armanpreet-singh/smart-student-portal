import test from "node:test";
import assert from "node:assert/strict";

import {
  fetchStudentAssignments,
  fetchStudentAssignmentAttachment,
  submitStudentAssignment
} from "../src/features/dashboard/api/studentAssignmentsApi.js";

const assignment = {
  id: "assignment-1",
  title: "Functions and arrays",
  instructions: "Submit your solution.",
  assignmentDate: "2026-11-16T00:00:00.000Z",
  attachment: null,
  dueAt: "2026-11-20T12:00:00.000Z",
  maxMarks: 50,
  publishedAt: "2026-11-16T12:00:00.000Z",
  createdAt: "2026-11-16T12:00:00.000Z",
  updatedAt: "2026-11-16T12:00:00.000Z",
  subject: {
    id: "subject-1",
    code: "CSE-101",
    name: "Programming Fundamentals",
    class: { id: "class-1", code: "CSE-2026", name: "Computer Science" }
  },
  submission: null
};

function withMockedFetch(fetchImplementation, run) {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  globalThis.window = {
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout
  };
  globalThis.fetch = fetchImplementation;

  return Promise.resolve()
    .then(run)
    .finally(() => {
      globalThis.fetch = originalFetch;
      if (originalWindow === undefined) delete globalThis.window;
      else globalThis.window = originalWindow;
    });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify({ status: status < 400 ? "ok" : "error", data, message: data?.message }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

test("Student assignment list contains only published assignments returned for the signed-in Student", async () => {
  const result = await withMockedFetch(
    async (_url, options) => {
      assert.equal(options.headers.Authorization, "Bearer student-token");
      return jsonResponse({ assignments: [assignment] });
    },
    () => fetchStudentAssignments("student-token")
  );

  assert.equal(result.length, 1);
  assert.equal(result[0].publishedAt, assignment.publishedAt);
  assert.equal(result[0].submission, null);
});

test("Student assignment list validates and preserves a published grade", async () => {
  const graded = {
    ...assignment,
    submission: {
      id: "submission-1",
      content: "My answer",
      submittedAt: "2026-11-18T10:00:00.000Z",
      result: {
        marksAwarded: 42,
        feedback: "Good work.",
        gradedAt: "2026-11-18T11:00:00.000Z",
        publishedAt: "2026-11-18T12:00:00.000Z"
      }
    }
  };
  const result = await withMockedFetch(
    async () => jsonResponse({ assignments: [graded] }),
    () => fetchStudentAssignments("student-token")
  );

  assert.equal(result[0].submission.result.marksAwarded, 42);
});

test("Student submit request sends answer text and requires a persisted confirmation", async () => {
  let body;
  const result = await withMockedFetch(async (_url, options) => {
    body = JSON.parse(options.body);
    return jsonResponse({
      submission: {
        id: "submission-1",
        assignmentId: "assignment-1",
        content: "My answer",
        submittedAt: "2026-11-18T10:00:00.000Z"
      }
    });
  }, () => submitStudentAssignment("student-token", "assignment-1", "My answer"));

  assert.deepEqual(body, { content: "My answer" });
  assert.equal(result.id, "submission-1");
});

test("Student sees deadline rejection and does not get a false success", async () => {
  await withMockedFetch(
    async () => jsonResponse({ message: "The submission deadline has passed." }, 409),
    async () => {
      await assert.rejects(
        submitStudentAssignment("student-token", "assignment-1", "Late answer"),
        (error) => error.status === 409 && error.message === "The submission deadline has passed."
      );
    }
  );
});

test("Student cannot submit blank answer text", async () => {
  let calls = 0;
  await withMockedFetch(async () => {
    calls += 1;
    return jsonResponse({});
  }, async () => {
    await assert.rejects(
      submitStudentAssignment("student-token", "assignment-1", "   "),
      (error) => error.status === 400
    );
  });
  assert.equal(calls, 0);
});


test("Student can request a temporary attachment link only through the authenticated API", async () => {
  const attachment = {
    url: "https://signed.example/questions.pdf",
    expiresAt: "2026-11-16T12:05:00.000Z",
    fileName: "questions.pdf",
    mimeType: "application/pdf"
  };
  const result = await withMockedFetch(
    async (url, options) => {
      assert.ok(url.endsWith("/api/student/assignments/assignment-1/attachment"));
      assert.equal(options.headers.Authorization, "Bearer student-token");
      return jsonResponse({ attachment });
    },
    () => fetchStudentAssignmentAttachment("student-token", "assignment-1")
  );

  assert.equal(result.url, attachment.url);
  assert.equal(result.fileName, attachment.fileName);
});
