import test from "node:test";
import assert from "node:assert/strict";

import {
  fetchStudentAcademicRisk,
  fetchTeacherAcademicRisk,
  fetchAdminAcademicRisk,
  fetchAdminAcademicRiskClasses
} from "../src/features/shared/academic-risk/academicRiskApi.js";

const report = {
  student: { id: "student-1", fullName: "Student One", username: "student.one", rollNumber: "BCA001" },
  class: { id: "class-1", code: "BCA-1", name: "BCA First Year", academicYear: "2026-27" },
  riskLevel: "HIGH",
  summary: {
    alertCount: 1,
    highAlertCount: 1,
    mediumAlertCount: 0,
    attendancePercentage: 33.33,
    attendanceThresholdPercent: 75,
    attendanceSessions: 3,
    averageGradePercent: 45,
    publishedGrades: 2,
    overdueAssignments: 1,
    subjectsAssessed: 1,
    totalSubjects: 1
  },
  alerts: [{
    key: "LOW_ATTENDANCE",
    severity: "HIGH",
    title: "Attendance below the required threshold",
    description: "Attendance is 33.3%, below the university threshold of 75%.",
    value: 33.33,
    threshold: 75,
    subject: { id: "subject-1", code: "CS101", name: "Programming" }
  }],
  recommendations: ["Review your attendance with the subject teacher."],
  subjects: [{
    subject: { id: "subject-1", code: "CS101", name: "Programming" },
    riskLevel: "HIGH",
    metrics: {
      attendancePercentage: 33.33,
      attendanceSessions: 3,
      attendancePresent: 1,
      attendanceAbsent: 2,
      attendanceOnDutyReview: 0,
      attendanceThresholdPercent: 75,
      publishedAssignments: 3,
      overdueAssignments: 1,
      publishedGrades: 2,
      averageGradePercent: 45
    },
    alerts: []
  }],
  calculatedAt: "2026-11-19T12:00:00.000Z"
};
const subjectOption = {
  id: "subject-1",
  code: "CS101",
  name: "Programming",
  class: { id: "class-1", code: "BCA-1", name: "BCA First Year", academicYear: "2026-27" }
};
const summary = { totalStudents: 1, highRisk: 1, mediumRisk: 0, lowRisk: 0, insufficientData: 0 };

let originalFetch;
let originalWindow;
let calls;

async function withFetch(fetchImpl, run) {
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
  try {
    return await run();
  } finally {
    globalThis.fetch = originalFetch;
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
}

function jsonResponse(data, status = 200, message = "") {
  return new Response(JSON.stringify({ status: status < 400 ? "ok" : "error", data, message }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

test("Student academic risk client uses the authenticated Student report endpoint", async () => {
  await withFetch(async (url, options) => {
    assert.ok(url.endsWith("/api/student/academic-risk"));
    assert.equal(options.headers.Authorization, "Bearer student-token");
    return jsonResponse(report);
  }, async () => {
    const result = await fetchStudentAcademicRisk("student-token");
    assert.equal(result.riskLevel, "HIGH");
    assert.equal(result.alerts[0].key, "LOW_ATTENDANCE");
  });
});

test("Teacher academic risk client supports subject, search and severity filters", async () => {
  await withFetch(async (url) => {
    assert.ok(url.includes("/api/teacher/academic-risk?subjectId=subject-1&search=Student&riskLevel=HIGH"));
    return jsonResponse({
      attendanceThresholdPercent: 75,
      subjects: [subjectOption],
      summary,
      students: [report]
    });
  }, async () => {
    const result = await fetchTeacherAcademicRisk("teacher-token", {
      subjectId: "subject-1", search: "Student", riskLevel: "HIGH"
    });
    assert.equal(result.students.length, 1);
    assert.equal(result.subjects[0].id, "subject-1");
  });
});

test("Admin academic risk client sends class and pagination filters and validates reports", async () => {
  await withFetch(async (url) => {
    assert.ok(url.includes("/api/admin/academic-risk?classId=class-1&search=BCA001&riskLevel=HIGH&page=2&pageSize=10"));
    return jsonResponse({
      attendanceThresholdPercent: 75,
      summary,
      students: [report],
      pagination: { page: 2, pageSize: 10, total: 11, totalPages: 2 }
    });
  }, async () => {
    const result = await fetchAdminAcademicRisk("admin-token", {
      classId: "class-1", search: "BCA001", riskLevel: "HIGH", page: 2, pageSize: 10
    });
    assert.equal(result.pagination.page, 2);
    assert.equal(result.students[0].student.rollNumber, "BCA001");
  });
});

test("Admin class filters load from the active class directory endpoint", async () => {
  await withFetch(async (url) => {
    assert.ok(url.endsWith("/api/admin/classes?page=1&pageSize=100"));
    return jsonResponse({ classes: [{ id: "class-1", code: "BCA-1", name: "BCA First Year", academicYear: "2026-27" }] });
  }, async () => {
    const classes = await fetchAdminAcademicRiskClasses("admin-token");
    assert.equal(classes[0].code, "BCA-1");
  });
});

test("academic risk clients reject missing sessions and malformed risk payloads", async () => {
  await withFetch(async () => jsonResponse({ ...report, riskLevel: "CRITICAL" }), async () => {
    await assert.rejects(fetchStudentAcademicRisk(""), (error) => error.status === 401);
    await assert.rejects(fetchTeacherAcademicRisk("teacher-token"), (error) => error.status === 502);
  });
});
