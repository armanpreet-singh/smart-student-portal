import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), "utf8");

test("dashboard sidebar header and topbar share one exact header height", async () => {
  const [layout, topbar, sidebar] = await Promise.all([
    read("features/dashboard/styles/dashboard.css"),
    read("features/dashboard/styles/topbar.css"),
    read("features/dashboard/styles/sidebar.css"),
  ]);

  assert.match(layout, /--d-layout-header-height:\s*96px/);
  assert.match(topbar, /height:\s*var\(--d-layout-header-height,\s*96px\)/);
  assert.match(topbar, /min-height:\s*var\(--d-layout-header-height,\s*96px\)/);
  assert.match(sidebar, /height:\s*var\(--d-layout-header-height,\s*96px\)/);
  assert.match(sidebar, /min-height:\s*var\(--d-layout-header-height,\s*96px\)/);
});

test("the shared header height is used by Student, Teacher and Admin layouts", async () => {
  const [student, teacher, admin] = await Promise.all([
    read("features/dashboard/layouts/DashboardLayout.jsx"),
    read("features/teacher/layouts/TeacherLayout.jsx"),
    read("features/admin/layouts/AdminLayout.jsx"),
  ]);

  for (const layout of [student, teacher, admin]) {
    assert.match(layout, /styles\/dashboard\.css/);
    assert.match(layout, /styles\/sidebar\.css/);
    assert.match(layout, /styles\/topbar\.css/);
  }
});
