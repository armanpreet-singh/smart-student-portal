import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), "utf8");

test("Student, Teacher and Admin topbars use the shared role-aware search component", async () => {
  const [student, teacher, admin] = await Promise.all([
    read("features/dashboard/components/Topbar/Topbar.jsx"),
    read("features/teacher/components/Topbar/TeacherTopbar.jsx"),
    read("features/admin/components/Topbar/AdminTopbar.jsx")
  ]);
  assert.match(student, /<GlobalSearch role="STUDENT" \/>/);
  assert.match(teacher, /<GlobalSearch role="TEACHER" \/>/);
  assert.match(admin, /<GlobalSearch role="ADMIN" \/>/);
});

test("global search includes page navigation and searchable records from each role's existing APIs", async () => {
  const search = await read("features/shared/search/GlobalSearch.jsx");
  for (const route of ["/dashboard/attendance", "/teacher/attendance", "/admin/students", "/admin/teachers", "/admin/courses"]) {
    assert.ok(search.includes(route), `Missing searchable route: ${route}`);
  }
  for (const api of ["fetchStudentCourses", "fetchStudentAssignments", "fetchStudentAttendance", "fetchTeacherAssignedSubjects", "fetchTeacherAssignments", "fetchAdminStudents", "fetchAdminTeachers", "fetchAdminClasses", "fetchAdminSubjects", "fetchAnnouncements", "fetchLearningResources"]) {
    assert.ok(search.includes(api), `Missing role-scoped data source: ${api}`);
  }
});

test("global search supports keyboard navigation, escape, Ctrl/Cmd+K, and route-change cleanup", async () => {
  const search = await read("features/shared/search/GlobalSearch.jsx");
  assert.match(search, /event\.ctrlKey \|\| event\.metaKey/);
  assert.match(search, /event\.key === "ArrowDown"/);
  assert.match(search, /event\.key === "ArrowUp"/);
  assert.match(search, /event\.key === "Enter"/);
  assert.match(search, /event\.key === "Escape"/);
  assert.match(search, /\[location\.pathname, role\]/);
  assert.match(search, /aria-autocomplete="list"/);
});

test("search only queries after two characters, debounces, and ignores stale responses", async () => {
  const search = await read("features/shared/search/GlobalSearch.jsx");
  assert.match(search, /trimmed\.length < 2/);
  assert.match(search, /}, 250\)/);
  assert.match(search, /requestId !== sequenceRef\.current/);
  assert.match(search, /pageSize: 8, search: query/);
});
