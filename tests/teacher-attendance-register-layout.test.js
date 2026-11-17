import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), "utf8");

test("Teacher attendance register uses separate grid columns for identity, status and metadata", async () => {
  const css = await read("features/teacher/styles/teacherAttendance.css");
  assert.match(css, /\.teacher-attendance-student\s*\{[^}]*display: grid;[^}]*grid-template-columns: minmax\(230px, 1fr\) auto minmax\(180px, 0\.72fr\);/s);
  assert.match(css, /\.teacher-attendance-row-meta\s*\{[^}]*width: auto;[^}]*margin-left: 0;/s);
  assert.match(css, /\.teacher-attendance-status-group\s*\{[^}]*justify-self: start;/s);
});

test("Student identifiers remain readable and do not wrap into vertical fragments", async () => {
  const css = await read("features/teacher/styles/teacherAttendance.css");
  assert.match(css, /\.teacher-attendance-student-info \.teacher-attendance-roll-number\s*\{[^}]*white-space: nowrap;[^}]*overflow-wrap: normal;/s);
  assert.match(css, /\.teacher-attendance-student-info strong,[\s\S]*?text-overflow: ellipsis;[\s\S]*?white-space: nowrap;/);
});

test("Attendance register layout stacks safely at tablet and mobile widths", async () => {
  const css = await read("features/teacher/styles/teacherAttendance.css");
  assert.match(css, /@media \(max-width: 1120px\)[\s\S]*?\.teacher-attendance-row-meta\s*\{[^}]*grid-column: 1 \/ -1;/);
  assert.match(css, /@media \(max-width: 640px\)[\s\S]*?grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
});
