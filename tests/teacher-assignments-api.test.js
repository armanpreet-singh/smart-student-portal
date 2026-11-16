import test from "node:test";
import assert from "node:assert/strict";

import {
  fetchTeacherAssignments,
  createTeacherAssignment,
  fetchTeacherAssignmentAttachment,
  fetchTeacherAssignmentSubmissions,
  gradeTeacherAssignmentSubmission,
  publishTeacherAssignment
} from "../src/features/teacher/api/teacherAssignmentsApi.js";

const assignment = {
  id: "assignment-1",
  title: "Functions and arrays",
  instructions: "Submit your solution.",
  assignmentDate: "2026-11-16T00:00:00.000Z",
  attachment: null,
  dueAt: "2026-11-20T12:00:00.000Z",
  maxMarks: 50,
  publishedAt: null,
  createdAt: "2026-11-16T12:00:00.000Z",
  updatedAt: "2026-11-16T12:00:00.000Z",
  subject: {
    id: "subject-1",
    code: "CSE-101",
    name: "Programming Fundamentals",
    class: {
      id: "class-1",
      code: "CSE-2026",
      name: "Computer Science"
    }
  }
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

test("Teacher assignment list uses the authenticated endpoint and validates server records", async () => {
  let requestedUrl = "";
  const result = await withMockedFetch(async (url, options) => {
    requestedUrl = url;
    assert.equal(options.headers.Authorization, "Bearer teacher-token");
    return jsonResponse({ assignments: [{ ...assignment, submissionCount: 2, studentCount: 8 }] });
  }, () => fetchTeacherAssignments("teacher-token"));

  assert.ok(requestedUrl.endsWith("/api/teacher/assignments"));
  assert.equal(result[0].submissionCount, 2);
  assert.equal(result[0].studentCount, 8);
});

test("Teacher creates draft with explicit due date and maximum marks", async () => {
  let body;
  await withMockedFetch(async (_url, options) => {
    body = JSON.parse(options.body);
    return jsonResponse({ assignment });
  }, () => createTeacherAssignment("teacher-token", {
    subjectId: "subject-1",
    title: assignment.title,
    instructions: assignment.instructions,
    assignmentDate: assignment.assignmentDate,
    dueAt: assignment.dueAt,
    maxMarks: 50
  }));

  assert.ok(body instanceof FormData);
  assert.equal(body.get("subjectId"), "subject-1");
  assert.equal(body.get("assignmentDate"), assignment.assignmentDate);
  assert.equal(body.get("dueAt"), assignment.dueAt);
  assert.equal(body.get("maxMarks"), "50");
  assert.equal(body.get("publishedAt"), null);
});

test("Teacher can review the complete class roster and persisted submissions", async () => {
  const detail = {
    assignment,
    studentCount: 1,
    submittedCount: 1,
    students: [{
      id: "student-1",
      fullName: "Student One",
      username: "student.one",
      rollNumber: "0007",
      submission: {
        id: "submission-1",
        studentId: "student-1",
        content: "My answer",
        submittedAt: "2026-11-18T10:00:00.000Z",
        marksAwarded: null,
        feedback: null,
        gradedAt: null,
        resultPublishedAt: null
      }
    }]
  };
  const result = await withMockedFetch(
    async () => jsonResponse(detail),
    () => fetchTeacherAssignmentSubmissions("teacher-token", "assignment-1")
  );

  assert.equal(result.students[0].rollNumber, "0007");
  assert.equal(result.students[0].submission.content, "My answer");
});

test("Teacher grade request sends marks and feedback", async () => {
  let body;
  const result = await withMockedFetch(async (_url, options) => {
    body = JSON.parse(options.body);
    return jsonResponse({
      submission: {
        id: "submission-1",
        marksAwarded: 42,
        feedback: "Good work.",
        gradedAt: "2026-11-18T12:00:00.000Z",
        resultPublishedAt: null
      }
    });
  }, () => gradeTeacherAssignmentSubmission("teacher-token", "submission-1", {
    marksAwarded: 42,
    feedback: "Good work."
  }));

  assert.deepEqual(body, { marksAwarded: 42, feedback: "Good work." });
  assert.equal(result.marksAwarded, 42);
});

test("Teacher publish action requires the API to confirm publication", async () => {
  const published = { ...assignment, publishedAt: "2026-11-16T12:00:00.000Z" };
  const result = await withMockedFetch(
    async () => jsonResponse({ assignment: published }),
    () => publishTeacherAssignment("teacher-token", "assignment-1")
  );

  assert.equal(result.publishedAt, published.publishedAt);
});

test("Teacher API reports server validation errors without pretending a save succeeded", async () => {
  await withMockedFetch(
    async () => jsonResponse({ message: "Set a future deadline before publishing this assignment." }, 400),
    async () => {
      await assert.rejects(
        publishTeacherAssignment("teacher-token", "assignment-1"),
        (error) => error.status === 400 && error.message.includes("future deadline")
      );
    }
  );
});


test("Teacher draft upload sends an attached PDF as multipart data", async () => {
  let formData;
  const attachment = new File(["%PDF-1.7"], "questions.pdf", { type: "application/pdf" });
  const responseAssignment = {
    ...assignment,
    instructions: "",
    attachment: {
      fileName: "questions.pdf",
      mimeType: "application/pdf",
      format: "pdf",
      bytes: 8
    }
  };

  const result = await withMockedFetch(async (_url, options) => {
    formData = options.body;
    assert.equal(options.headers["Content-Type"], undefined);
    return jsonResponse({ assignment: responseAssignment });
  }, () => createTeacherAssignment("teacher-token", {
    subjectId: "subject-1",
    title: "Questions PDF",
    instructions: "",
    assignmentDate: assignment.assignmentDate,
    dueAt: assignment.dueAt,
    maxMarks: 50,
    attachmentFile: attachment
  }));

  assert.ok(formData instanceof FormData);
  assert.equal(formData.get("attachment").name, "questions.pdf");
  assert.equal(formData.get("instructions"), "");
  assert.equal(result.attachment.fileName, "questions.pdf");
});

test("Teacher can request a temporary attachment link for an owned assignment", async () => {
  const attachment = {
    url: "https://signed.example/questions.pdf",
    expiresAt: "2026-11-16T12:05:00.000Z",
    fileName: "questions.pdf",
    mimeType: "application/pdf"
  };
  const result = await withMockedFetch(
    async (url, options) => {
      assert.ok(url.endsWith("/api/teacher/assignments/assignment-1/attachment"));
      assert.equal(options.headers.Authorization, "Bearer teacher-token");
      return jsonResponse({ attachment });
    },
    () => fetchTeacherAssignmentAttachment("teacher-token", "assignment-1")
  );

  assert.equal(result.url, attachment.url);
  assert.equal(result.fileName, attachment.fileName);
});
