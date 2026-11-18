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


test("Student subject selection navigates to a dedicated subject URL instead of expanding the topic dropdown", async () => {
  const page = await read("features/shared/syllabus/SyllabusPage.jsx");

  assert.match(page, /function StudentSubjectLinkCard\(\{ subject \}\)/);
  assert.match(page, /to=\{\x60\/dashboard\/syllabus\/\$\{encodeURIComponent\(subject\.id\)\}\/\$\{encodeURIComponent\(subject\.name\)\}\x60\}/);
  assert.match(page, /role === "student"[\s\S]*?StudentSubjectLinkCard/);
  assert.match(page, /role === "student"[\s\S]*?:\s*<SubjectCard/);
});

test("Student subject detail resolves the selected subject from the authenticated class syllabus", async () => {
  const page = await read("features/shared/syllabus/SyllabusPage.jsx");

  assert.match(page, /const \{ subjectId \} = useParams\(\)/);
  assert.match(page, /syllabus\?\.subjects\.find\(\(subject\) => subject\.id === subjectId\)/);
  assert.match(page, /<StudentSubjectDetail subject=\{selectedSubject\}/);
  assert.match(page, /Subject syllabus not found/);
  assert.match(page, /This subject is not part of your active Semester V class/);
});

test("Student subject detail shows its own progress, units, topics and a return link", async () => {
  const page = await read("features/shared/syllabus/SyllabusPage.jsx");

  assert.match(page, /function StudentSubjectDetail\(\{ subject \}\)/);
  assert.match(page, /Subject syllabus covered/);
  assert.match(page, /subject\.progressPercent/);
  assert.match(page, /Unit-wise syllabus coverage/);
  assert.match(page, /unit\.progressPercent/);
  assert.match(page, /topic\.completed \? "Covered" : "Not covered"/);
  assert.match(page, /to="\/dashboard\/syllabus" className="syllabus-back-link"/);
});

test("Student syllabus detail route and topbar breadcrumb show Dashboard, Syllabus and the chosen subject name", async () => {
  const [routes, topbar] = await Promise.all([
    read("features/dashboard/routes/DashboardRoutes.jsx"),
    read("features/dashboard/components/Topbar/Topbar.jsx")
  ]);

  assert.match(routes, /path="syllabus\/\:subjectId\/\:subjectName"/);
  assert.match(topbar, /pathnames\[0\] === "dashboard" &&\s*\["syllabus", "attendance"\]\.includes\(pathnames\[1\]\)/);
  assert.match(topbar, /const section = pathnames\[1\] === "syllabus" \? "Syllabus" : "Attendance"/);
  assert.match(topbar, /decodeURIComponent\(subjectName\)/);
});

test("Teacher keeps its existing expandable syllabus completion controls", async () => {
  const page = await read("features/shared/syllabus/SyllabusPage.jsx");

  assert.match(page, /<details className="syllabus-subject-details">/);
  assert.match(page, /<SubjectCard key=\{subject\.id\} subject=\{subject\} role=\{role\}/);
  assert.match(page, /Mark complete/);
});

test("Student subject selection and detail pages retain responsive light/dark theme styling", async () => {
  const css = await read("features/shared/syllabus/syllabus.css");

  assert.match(css, /\.syllabus-subject-select-card/);
  assert.match(css, /background:var\(--d-surface\)/);
  assert.match(css, /\.syllabus-subject-select-card:focus-visible/);
  assert.match(css, /\.syllabus-subject-detail-page/);
  assert.match(css, /\.syllabus-detail-progress-card/);
  assert.match(css, /@media \(max-width:760px\)/);
  assert.match(css, /@media \(max-width:440px\)/);
});
