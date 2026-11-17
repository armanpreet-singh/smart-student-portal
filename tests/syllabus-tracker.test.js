import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), "utf8");

test("Student and Teacher receive distinct read and completion API operations for Semester V", async () => {
  const api = await read("features/shared/syllabus/syllabusApi.js");

  assert.match(api, /fetchStudentSyllabus[\s\S]*?\/api\/student\/syllabus/);
  assert.match(api, /fetchTeacherSyllabus[\s\S]*?\/api\/teacher\/syllabus/);
  assert.match(api, /updateTeacherSyllabusTopic[\s\S]*?\/api\/teacher\/syllabus\/topics/);
  assert.match(api, /method:\s*"PATCH"/);
  assert.match(api, /JSON\.stringify\(\{\s*completed\s*\}\)/);
  assert.match(api, /data\?\.semester !== 5/);
  assert.match(api, /Authorization:\s*\x60Bearer \$\{accessToken\}\x60/);
});

test("syllabus API validates unit and topic counts, progress, attribution and source pages", async () => {
  const api = await read("features/shared/syllabus/syllabusApi.js");

  assert.match(api, /function isSyllabusTopic/);
  assert.match(api, /topic\.completed === Boolean\(topic\.completedAt\)/);
  assert.match(api, /function isSyllabusUnit/);
  assert.match(api, /unit\.totalTopics === unit\.topics\.length/);
  assert.match(api, /function isSyllabusSubject/);
  assert.match(api, /subject\.semester === 5/);
  assert.match(api, /function validateSyllabus/);
});

test("Student and Teacher routes render the shared tracker with role-specific permissions", async () => {
  const [student, teacher] = await Promise.all([
    read("features/dashboard/routes/DashboardRoutes.jsx"),
    read("features/teacher/routes/TeacherRoutes.jsx")
  ]);

  assert.match(student, /path="syllabus"[^\n]*[\s\S]*?SyllabusPage role="student"/);
  assert.match(teacher, /path="syllabus"[\s\S]*?SyllabusPage role="teacher"/);
});

test("both role sidebars and the global search expose the syllabus tracker", async () => {
  const [studentSidebar, teacherSidebar, search] = await Promise.all([
    read("features/dashboard/components/Sidebar/Sidebar.jsx"),
    read("features/teacher/components/Sidebar/TeacherSidebar.jsx"),
    read("features/shared/search/GlobalSearch.jsx")
  ]);

  assert.match(studentSidebar, /to="\/dashboard\/syllabus"[^>]*>Syllabus Tracker/);
  assert.match(teacherSidebar, /to="\/teacher\/syllabus"[^>]*>Syllabus Tracker/);
  assert.match(search, /href: "\/dashboard\/syllabus"/);
  assert.match(search, /href: "\/teacher\/syllabus"/);
});

test("tracker renders Semester V sources, subject progress, unit progress and read-only Student states", async () => {
  const page = await read("features/shared/syllabus/SyllabusPage.jsx");

  assert.match(page, /Semester V/);
  assert.match(page, /subject\.progressPercent/);
  assert.match(page, /unit\.progressPercent/);
  assert.match(page, /Syllabus p\./);
  assert.match(page, /role === "teacher"/);
  assert.match(page, /topic\.completed \? "Covered" : "Not covered"/);
  assert.match(page, /updateTeacherSyllabusTopic/);
  assert.match(page, /fetchStudentSyllabus/);
});

test("syllabus tracker uses shared theme tokens and responsive accessible layouts", async () => {
  const css = await read("features/shared/syllabus/syllabus.css");

  assert.match(css, /background:\s*var\(--d-surface\)/);
  assert.match(css, /color:\s*var\(--d-text\)/);
  assert.match(css, /\.dark-mode \.syllabus-summary-icon/);
  assert.match(css, /@media \(max-width:560px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /\.syllabus-topic-action:disabled/);
});
