import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../src/${path}`, import.meta.url), "utf8");
}

test("Student faculty feedback page offers anonymous, one-time course and faculty evaluations", async () => {
  const page = await source("features/shared/faculty-feedback/StudentFacultyFeedbackPage.jsx");
  assert.match(page, /Faculty Feedback/);
  assert.match(page, /Your feedback is confidential/);
  assert.match(page, /teachingClarity/);
  assert.match(page, /subjectKnowledge/);
  assert.match(page, /assessmentFairness/);
  assert.match(page, /courseContent/);
  assert.match(page, /overallRating/);
  assert.match(page, /hasSubmitted/);
  assert.match(page, /Submit anonymous feedback/);
  assert.match(page, /Please do not include your name, roll number/);
});

test("Teacher feedback page withholds all results before the five-response anonymity threshold", async () => {
  const page = await source("features/shared/faculty-feedback/TeacherFacultyFeedbackPage.jsx");
  assert.match(page, /minimumResponses/);
  assert.match(page, /Anonymous threshold not reached/);
  assert.match(page, /response count is intentionally withheld/);
  assert.match(page, /Anonymous comments/);
  assert.doesNotMatch(page, /studentId|rollNumber/);
});

test("Admin feedback page reports aggregates and moderates comments without accessing Student identity", async () => {
  const page = await source("features/admin/pages/FacultyFeedbackAdminPage.jsx");
  assert.match(page, /Faculty Feedback Reports/);
  assert.match(page, /setAdminFacultyFeedbackCommentVisibility/);
  assert.match(page, /Hide/);
  assert.match(page, /Restore/);
  assert.match(page, /ratings were retained/);
  assert.doesNotMatch(page, /studentId|rollNumber/);
});

test("all three authenticated role portals expose Faculty Feedback navigation routes", async () => {
  const [studentRoutes, teacherRoutes, adminRoutes, studentSidebar, teacherSidebar, adminSidebar] = await Promise.all([
    source("features/dashboard/routes/DashboardRoutes.jsx"),
    source("features/teacher/routes/TeacherRoutes.jsx"),
    source("features/admin/routes/AdminRoutes.jsx"),
    source("features/dashboard/components/Sidebar/Sidebar.jsx"),
    source("features/teacher/components/Sidebar/TeacherSidebar.jsx"),
    source("features/admin/components/Sidebar/AdminSidebar.jsx")
  ]);
  assert.match(studentRoutes, /path="faculty-feedback"/);
  assert.match(teacherRoutes, /path="faculty-feedback"/);
  assert.match(adminRoutes, /path="faculty-feedback"/);
  assert.match(studentSidebar, /dashboard\/faculty-feedback/);
  assert.match(teacherSidebar, /teacher\/faculty-feedback/);
  assert.match(adminSidebar, /admin\/faculty-feedback/);
});
