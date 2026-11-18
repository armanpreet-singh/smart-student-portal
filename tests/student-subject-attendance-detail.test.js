import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), "utf8");

test("Student attendance overview lists subjects with each subject's own attendance summary", async () => {
  const page = await read("features/dashboard/pages/AttendancePage.jsx");

  assert.match(page, /d-attendance-subject-grid/);
  assert.match(page, /subjects\.map\(\(item\) =>/);
  assert.match(page, /\/dashboard\/attendance\/\$\{encodeURIComponent\(item\.subject\.id\)\}\/\$\{encodeURIComponent\(item\.subject\.name\)\}/);
  assert.match(page, /item\.summary\.attendancePercentage/);
  assert.match(page, /item\.summary\.attendedSessions/);
  assert.match(page, /item\.summary\.eligibleSessions/);
});

test("Student attendance detail resolves the subject using its ID from the authenticated attendance response", async () => {
  const page = await read("features/dashboard/pages/AttendancePage.jsx");

  assert.match(page, /const \{ subjectId \} = useParams\(\)/);
  assert.match(page, /subjects\.find\(\(item\) => item\.subject\.id === subjectId\)/);
  assert.match(page, /visibleSubjects = subjectId/);
  assert.match(page, /Subject not found/);
  assert.match(page, /This subject is not available in your assigned attendance records/);
});

test("Student attendance detail shows subject-only totals, trends, and the full attendance history", async () => {
  const page = await read("features/dashboard/pages/AttendancePage.jsx");

  assert.match(page, /visibleSubjects\.forEach/);
  assert.match(page, /buildWeeklyChart\(records\)/);
  assert.match(page, /buildMonthlyChart\(records\)/);
  assert.match(page, /All attendance records for this subject, newest first/);
  assert.match(page, /\.slice\(0, records\.length\)/);
  assert.match(page, /STATUS_META\[record\.status\]/);
  assert.match(page, /submitDutyProof\(record\)/);
  assert.match(page, /downloadDutyProof\(record\)/);
});

test("Student attendance preserves date filtering and calculates duty-review records as not yet present", async () => {
  const [page, api] = await Promise.all([
    read("features/dashboard/pages/AttendancePage.jsx"),
    read("features/dashboard/api/studentAttendanceApi.js")
  ]);

  assert.match(page, /fetchStudentAttendance\(accessToken, filters\)/);
  assert.match(page, /fromDate/);
  assert.match(page, /toDate/);
  assert.match(page, /missed: counts\.ABSENT \+ counts\.ON_DUTY_REVIEW/);
  assert.match(api, /\/api\/student\/attendance/);
  assert.match(api, /VALID_STATUSES = new Set\(\["PRESENT", "ABSENT", "ON_DUTY_REVIEW"\]\)/);
});

test("Student attendance detail route and breadcrumb render Dashboard, Attendance, and the selected subject", async () => {
  const [routes, topbar] = await Promise.all([
    read("features/dashboard/routes/DashboardRoutes.jsx"),
    read("features/dashboard/components/Topbar/Topbar.jsx")
  ]);

  assert.match(routes, /path="attendance\/\:subjectId\/\:subjectName"/);
  assert.match(topbar, /\["syllabus", "attendance"\]\.includes\(pathnames\[1\]\)/);
  assert.match(topbar, /const section = pathnames\[1\] === "syllabus" \? "Syllabus" : "Attendance"/);
  assert.match(topbar, /decodeURIComponent\(subjectName\)/);
  assert.match(topbar, /path: `\/dashboard\/\$\{pathnames\[1\]\}`/);
});

test("Student attendance subject cards and detail navigation are responsive and keyboard accessible", async () => {
  const css = await read("features/dashboard/pages/AttendancePage.css");

  assert.match(css, /\.d-attendance-subject-grid/);
  assert.match(css, /grid-template-columns: repeat\(auto-fill/);
  assert.match(css, /\.d-attendance-subject-card:focus-visible/);
  assert.match(css, /\.d-attendance-detail-back a:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /var\(--d-surface\)/);
  assert.match(css, /var\(--d-text\)/);
});
