import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), "utf8");

test("Student and Teacher profile menus navigate to role-scoped Help & Support", async () => {
  const [studentMenu, teacherMenu, studentRoutes, teacherRoutes] = await Promise.all([
    read("features/dashboard/components/Topbar/Topbar.jsx"),
    read("features/teacher/components/Topbar/TeacherTopbar.jsx"),
    read("features/dashboard/routes/DashboardRoutes.jsx"),
    read("features/teacher/routes/TeacherRoutes.jsx"),
  ]);
  assert.match(studentMenu, /to="\/dashboard\/help"/);
  assert.match(teacherMenu, /to="\/teacher\/help"/);
  assert.match(studentRoutes, /HelpSupportPage role="STUDENT"/);
  assert.match(teacherRoutes, /HelpSupportPage role="TEACHER"/);
});

test("Help Centre provides role-specific FAQs, search, account shortcuts and a local support draft", async () => {
  const page = await read("features/shared/help/HelpSupportPage.jsx");
  assert.match(page, /STUDENT_FAQS/);
  assert.match(page, /TEACHER_FAQS/);
  assert.match(page, /Search help articles/);
  assert.match(page, /Copy request template/);
  assert.match(page, /mailto:\?subject=/);
  assert.match(page, /not submitted or stored by this portal/);
  assert.match(page, /Never share your password/);
});
