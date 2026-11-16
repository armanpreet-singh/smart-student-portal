import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildTeacherAttendanceRegisterCsv,
  createTeacherAttendanceCsvFilename,
  selectSavedAttendanceRows,
} from "../src/features/teacher/utils/teacherAttendanceCsv.js";

const subject = {
  id: "subject-1",
  code: "CSE-101",
  name: "Programming Fundamentals",
  class: {
    id: "class-1",
    code: "CSE-2026",
    name: "Computer Science",
    academicYear: "2026-2027",
  },
};

describe("Teacher saved attendance register CSV", () => {
  it("exports only the saved rows supplied by the caller and preserves leading-zero roll numbers", () => {
    const csv = buildTeacherAttendanceRegisterCsv({
      subject,
      attendanceDate: "2026-11-16",
      records: [
        {
          student: {
            fullName: "Student One",
            username: "student.one",
            rollNumber: "000123",
          },
          attendance: {
            status: "ABSENT",
            remarks: null,
            markedAt: "2026-11-16T08:30:00.000Z",
            proofSubmitted: false,
          },
        },
      ],
    });

    assert.equal(
      csv,
      [
        '"Attendance date","Class code","Class name","Academic year","Subject code","Subject name","Student name","Username","Official roll number","Saved attendance status","Saved remarks","Register marked at (submission time)","Duty proof submitted"',
        '"2026-11-16","CSE-2026","Computer Science","2026-2027","CSE-101","Programming Fundamentals","Student One","student.one","000123","ABSENT","","2026-11-16T08:30:00.000Z","No"',
      ].join("\r\n"),
    );
  });

  it("quotes commas, double quotes and embedded line breaks in remarks", () => {
    const csv = buildTeacherAttendanceRegisterCsv({
      subject,
      attendanceDate: "2026-11-16",
      records: [
        {
          student: {
            fullName: "Student One",
            username: "student.one",
            rollNumber: null,
          },
          attendance: {
            status: "ON_DUTY_REVIEW",
            remarks: 'Approved, "pending"\nreview',
            markedAt: "2026-11-16T08:30:00.000Z",
            proofSubmitted: false,
          },
        },
      ],
    });

    assert.ok(csv.includes('"Approved, ""pending""\nreview"'));
  });

  it("neutralizes formula-leading student names, usernames, and remarks", () => {
    const csv = buildTeacherAttendanceRegisterCsv({
      subject,
      attendanceDate: "2026-11-16",
      records: [
        {
          student: {
            fullName: '=HYPERLINK("https://bad.example")',
            username: "+SUM(1,1)",
            rollNumber: "0007",
          },
          attendance: {
            status: "PRESENT",
            remarks: "  @CMD",
            markedAt: "2026-11-16T08:30:00.000Z",
            proofSubmitted: true,
          },
        },
      ],
    });

    assert.ok(csv.includes('"\'=HYPERLINK(""https://bad.example"")"'));
    assert.ok(csv.includes(String.fromCharCode(34, 39) + "+SUM(1,1)" + String.fromCharCode(34)));
    assert.ok(csv.includes('"\'  @CMD"'));
    assert.ok(csv.endsWith('"Yes"'));
  });

  it("returns a header-only CSV when the selected saved register has no rows", () => {
    const csv = buildTeacherAttendanceRegisterCsv({
      subject,
      attendanceDate: "2026-11-16",
      records: [],
    });

    assert.equal(csv.split("\r\n").length, 1);
    assert.ok(csv.startsWith('"Attendance date","Class code"'));
  });

  it("selects only persisted rows and uses saved status rather than an editable screen draft", () => {
    const roster = [
      { id: "student-1", fullName: "Student One" },
      { id: "student-2", fullName: "Student Two" },
      { id: "student-3", fullName: "Student Three" },
    ];
    const savedRecords = {
      "student-1": "ABSENT",
      "student-3": "PRESENT",
    };
    const recordMeta = {
      "student-1": {
        remarks: "Last saved remark",
        markedAt: "2026-11-16T08:30:00.000Z",
        proofSubmitted: false,
      },
      "student-3": {
        remarks: null,
        markedAt: "2026-11-16T08:30:00.000Z",
        proofSubmitted: true,
      },
    };

    const result = selectSavedAttendanceRows(roster, savedRecords, recordMeta);

    assert.deepEqual(result, [
      {
        student: roster[0],
        attendance: {
          status: "ABSENT",
          remarks: "Last saved remark",
          markedAt: "2026-11-16T08:30:00.000Z",
          proofSubmitted: false,
        },
      },
      {
        student: roster[2],
        attendance: {
          status: "PRESENT",
          remarks: null,
          markedAt: "2026-11-16T08:30:00.000Z",
          proofSubmitted: true,
        },
      },
    ]);
  });

  it("does not select rows with missing metadata or invalid persisted statuses", () => {
    const rows = selectSavedAttendanceRows(
      [
        { id: "student-1", fullName: "Student One" },
        { id: "student-2", fullName: "Student Two" },
      ],
      { "student-1": "LATE", "student-2": "ABSENT" },
      { "student-2": { remarks: null, markedAt: null, proofSubmitted: false } },
    );

    assert.deepEqual(rows, [
      {
        student: { id: "student-2", fullName: "Student Two" },
        attendance: {
          status: "ABSENT",
          remarks: null,
          markedAt: null,
          proofSubmitted: false,
        },
      },
    ]);
  });

  it("creates a safe filename from class, subject, and date", () => {
    assert.equal(
      createTeacherAttendanceCsvFilename("CSE-2026", "CSE-101", "2026-11-16"),
      "teacher-attendance-CSE-2026-CSE-101-2026-11-16.csv",
    );
    assert.equal(
      createTeacherAttendanceCsvFilename("../../bad class", "=bad subject", "not-a-date"),
      "teacher-attendance-bad-class-bad-subject-date.csv",
    );
  });
});
