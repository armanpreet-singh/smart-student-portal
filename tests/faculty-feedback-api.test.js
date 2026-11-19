import test from "node:test";
import assert from "node:assert/strict";

import {
  fetchStudentFacultyFeedback,
  submitStudentFacultyFeedback,
  fetchTeacherFacultyFeedback,
  fetchAdminFacultyFeedback,
  setAdminFacultyFeedbackCommentVisibility
} from "../src/features/shared/faculty-feedback/facultyFeedbackApi.js";

const API_BASE = "https://ltsu-smart-portal-api-0i8h.onrender.com";
const ratings = {
  teachingClarity: 5,
  subjectKnowledge: 4,
  engagement: 4,
  approachability: 4,
  assessmentFairness: 5,
  courseContent: 4,
  overallRating: 5
};
const feedbackReport = {
  teacherSubjectId: "teacher-subject-1",
  subject: { id: "subject-1", code: "CS101", name: "Programming", class: { code: "BCA-1", name: "BCA First Year" } },
  academicYear: "2026-27",
  responseCount: null,
  awaitingAnonymousThreshold: true,
  minimumResponses: 5,
  ratings: null,
  comments: []
};
const feedbackGroup = {
  teacherSubjectId: "teacher-subject-1",
  teacher: { id: "teacher-1", fullName: "Faculty Member", isActive: true },
  subject: { id: "subject-1", code: "CS101", name: "Programming", class: { id: "class-1", code: "BCA-1", name: "BCA First Year", academicYear: "2026-27" } },
  academicYear: "2026-27",
  responseCount: 5,
  ratings: {
    teachingClarity: 4.6,
    subjectKnowledge: 4.5,
    engagement: 4.3,
    approachability: 4.4,
    assessmentFairness: 4.2,
    courseContent: 4.4,
    overallRating: 4.5
  },
  comments: [{ id: "feedback-1", comment: "Good explanations", isHidden: false, submittedAt: "2026-11-19T10:00:00.000Z" }]
};

let originalFetch;
let originalWindow;
let calls;

function withFetch(fetchImpl, run) {
  originalFetch = globalThis.fetch;
  originalWindow = globalThis.window;
  calls = [];
  globalThis.window = {
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout
  };
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return fetchImpl(url, options);
  };
  return Promise.resolve().then(run).finally(() => {
    globalThis.fetch = originalFetch;
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  });
}

function response(data, status = 200, message = "") {
  return new Response(JSON.stringify({
    status: status < 400 ? "ok" : "error",
    data,
    message
  }), { status, headers: { "Content-Type": "application/json" } });
}

test("Student feedback list uses authenticated Student endpoint", async () => {
  await withFetch(async (url, options) => {
    assert.equal(url, `${API_BASE}/api/student/faculty-feedback`);
    assert.equal(options.headers.Authorization, "Bearer student-token");
    return response({ academicYear: "2026-27", class: { code: "BCA-1", name: "BCA First Year" }, surveys: [] });
  }, async () => {
    const result = await fetchStudentFacultyFeedback("student-token");
    assert.equal(result.academicYear, "2026-27");
    assert.deepEqual(result.surveys, []);
  });
});

test("Student can submit a validated feedback response to one assigned faculty subject", async () => {
  await withFetch(async (url, options) => {
    assert.equal(url, `${API_BASE}/api/student/faculty-feedback/teacher-subject-1`);
    assert.equal(options.method, "POST");
    assert.deepEqual(JSON.parse(options.body), { ...ratings, comment: "Helpful classes." });
    return response({ feedback: { id: "feedback-new", academicYear: "2026-27", submittedAt: "2026-11-19T12:00:00.000Z" } });
  }, async () => {
    const result = await submitStudentFacultyFeedback("student-token", "teacher-subject-1", { ...ratings, comment: "Helpful classes." });
    assert.equal(result.id, "feedback-new");
  });
  await withFetch(async () => response({ feedback: {} }), async () => {
    await assert.rejects(
      submitStudentFacultyFeedback("student-token", "teacher-subject-1", { ...ratings, overallRating: 8 }),
      (error) => error.status === 400
    );
  });
});

test("Teacher feedback endpoint validates threshold-gated anonymized reports", async () => {
  await withFetch(async (url) => {
    assert.equal(url, `${API_BASE}/api/teacher/faculty-feedback`);
    return response({ minimumResponses: 5, reports: [feedbackReport] });
  }, async () => {
    const result = await fetchTeacherFacultyFeedback("teacher-token");
    assert.equal(result.minimumResponses, 5);
    assert.equal(result.reports[0].awaitingAnonymousThreshold, true);
  });
});

test("Admin report filters and moderation actions use role-protected endpoints", async () => {
  await withFetch(async (url, options) => {
    assert.equal(url, `${API_BASE}/api/admin/faculty-feedback?search=Faculty&academicYear=2026-27&page=2&pageSize=25`);
    assert.equal(options.method || "GET", "GET");
    return response({ feedback: [feedbackGroup], pagination: { page: 2, pageSize: 25, total: 26, totalPages: 2 } });
  }, async () => {
    const result = await fetchAdminFacultyFeedback("admin-token", {
      search: "Faculty", academicYear: "2026-27", page: 2, pageSize: 25
    });
    assert.equal(result.feedback.length, 1);
    assert.equal(result.pagination.page, 2);
  });

  await withFetch(async (url, options) => {
    assert.equal(url, `${API_BASE}/api/admin/faculty-feedback/feedback-1/comment-visibility`);
    assert.equal(options.method, "PATCH");
    assert.deepEqual(JSON.parse(options.body), { isHidden: true });
    return response({ feedback: { id: "feedback-1", isCommentHidden: true } });
  }, async () => {
    const result = await setAdminFacultyFeedbackCommentVisibility("admin-token", "feedback-1", true);
    assert.equal(result.isCommentHidden, true);
  });
});

test("feedback APIs reject missing tokens, invalid ratings and unexpected responses", async () => {
  await withFetch(async () => response({ academicYear: null, surveys: [] }), async () => {
    await assert.rejects(fetchStudentFacultyFeedback(""), (error) => error.status === 401);
    await assert.rejects(submitStudentFacultyFeedback("student-token", "ts-1", ratings), (error) => error.status === 502);
  });
  await withFetch(async () => response({ minimumResponses: 5, reports: [{ ...feedbackReport, ratings: {} }] }), async () => {
    await assert.rejects(fetchTeacherFacultyFeedback("teacher-token"), (error) => error.status === 502);
  });
});
