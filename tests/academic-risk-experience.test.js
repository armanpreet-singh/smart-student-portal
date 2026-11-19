import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../src/${path}`, import.meta.url), "utf8");
}

test("Student dashboard explains personal academic risk indicators and next steps", async () => {
  const page = await source("features/shared/academic-risk/StudentAcademicRiskPage.jsx");
  assert.match(page, /Academic Risk Alerts/);
  assert.match(page, /fetchStudentAcademicRisk/);
  assert.match(page, /Subject-wise progress/);
  assert.match(page, /Suggested next steps/);
  assert.match(page, /not a final academic decision/i);
});

test("Teacher dashboard filters risk reports by assigned subject, Student and risk level", async () => {
  const page = await source("features/shared/academic-risk/TeacherAcademicRiskPage.jsx");
  assert.match(page, /fetchTeacherAcademicRisk/);
  assert.match(page, /Assigned subject/);
  assert.match(page, /Risk level/);
  assert.match(page, /assigned subjects and their classes/);
  assert.match(page, /AcademicRiskReportCard/);
});

test("Admin dashboard provides university-wide class and risk filters with pagination", async () => {
  const page = await source("features/admin/pages/AcademicRiskPage.jsx");
  assert.match(page, /fetchAdminAcademicRisk/);
  assert.match(page, /fetchAdminAcademicRiskClasses/);
  assert.match(page, /All active classes/);
  assert.match(page, /Risk level/);
  assert.match(page, /ar-pagination/);
});

test("role routes and navigation expose Academic Risk Alerts to Students, Teachers and Admins", async () => {
  const [studentRoutes, teacherRoutes, adminRoutes, studentSidebar, teacherSidebar, adminSidebar] = await Promise.all([
    source("features/dashboard/routes/DashboardRoutes.jsx"),
    source("features/teacher/routes/TeacherRoutes.jsx"),
    source("features/admin/routes/AdminRoutes.jsx"),
    source("features/dashboard/components/Sidebar/Sidebar.jsx"),
    source("features/teacher/components/Sidebar/TeacherSidebar.jsx"),
    source("features/admin/components/Sidebar/AdminSidebar.jsx")
  ]);
  assert.match(studentRoutes, /path="academic-risk"/);
  assert.match(teacherRoutes, /path="academic-risk"/);
  assert.match(adminRoutes, /path="academic-risk"/);
  assert.match(studentSidebar, /dashboard\/academic-risk/);
  assert.match(teacherSidebar, /teacher\/academic-risk/);
  assert.match(adminSidebar, /admin\/academic-risk/);
});

test("academic risk UI distinguishes insufficient data and documents the transparent thresholds", async () => {
  const [components, styles] = await Promise.all([
    source("features/shared/academic-risk/AcademicRiskComponents.jsx"),
    source("features/shared/academic-risk/academic-risk.css")
  ]);
  assert.match(components, /INSUFFICIENT_DATA/);
  assert.match(components, /at least 3/i);
  assert.match(components, /at least 2/i);
  assert.match(components, /not a final academic decision/i);
  assert.match(styles, /@media\(max-width:700px\)/);
  assert.match(styles, /prefers-reduced-motion/);
});
