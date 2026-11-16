import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildTeacherRosterCsv,
  createTeacherRosterCsvFilename,
} from "../src/features/teacher/utils/teacherRosterCsv.js";

const assignment = {
  subject: {
    code: "CSE-101",
    name: "Programming Fundamentals",
    class: {
      code: "CSE-2026",
      name: "Computer Science",
      academicYear: "2026-2027",
    },
  },
};

describe("Teacher roster CSV export", () => {
  it("exports the selected assigned subject and each supplied roster row", () => {
    const csv = buildTeacherRosterCsv(assignment, [
      {
        fullName: "Student One",
        username: "student.one",
        rollNumber: "000123",
      },
      {
        fullName: "Student Two",
        username: "student.two",
        rollNumber: null,
      },
    ]);

    assert.equal(
      csv,
      [
        '"Class code","Class name","Academic year","Subject code","Subject name","Student name","Username","Official roll number"',
        '"CSE-2026","Computer Science","2026-2027","CSE-101","Programming Fundamentals","Student One","student.one","000123"',
        '"CSE-2026","Computer Science","2026-2027","CSE-101","Programming Fundamentals","Student Two","student.two",""',
      ].join("\\r\\n"),
    );
  });

  it("quotes commas, double quotes and embedded line breaks in roster text", () => {
    const csv = buildTeacherRosterCsv(assignment, [
      {
        fullName: 'Student, "One"\\nSecond line',
        username: "student,one",
        rollNumber: "001",
      },
    ]);

    assert.ok(csv.includes('"Student, ""One""\\nSecond line"'));
    assert.ok(csv.includes('"student,one"'));
  });

  it("neutralizes formula-leading student text in all exported identity fields", () => {
    const csv = buildTeacherRosterCsv(assignment, [
      {
        fullName: '=HYPERLINK("https://bad.example")',
        username: "+SUM(1,1)",
        rollNumber: "  @CMD",
      },
    ]);

    assert.ok(csv.includes('"\'=HYPERLINK(""https://bad.example"")"'));
    assert.ok(csv.includes('"\'+SUM(1,1)"'));
    assert.ok(csv.includes('"\'  @CMD"'));
  });

  it("returns a header-only file when the selected roster is empty", () => {
    const csv = buildTeacherRosterCsv(assignment, []);

    assert.equal(csv.split("\\r\\n").length, 1);
    assert.ok(csv.startsWith('"Class code","Class name"'));
  });

  it("uses a safe, bounded filename derived from the assigned subject code", () => {
    assert.equal(
      createTeacherRosterCsvFilename("CSE-101"),
      "teacher-roster-CSE-101.csv",
    );
    assert.equal(
      createTeacherRosterCsvFilename("../../=bad subject"),
      "teacher-roster-bad-subject.csv",
    );
    assert.equal(
      createTeacherRosterCsvFilename(""),
      "teacher-roster-subject.csv",
    );
  });
});
