import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildAdminAttendanceCsv } from "../src/features/admin/utils/adminAttendanceCsv.js";

const makeReport = (overrides = {}) => ({
  period: { fromDate: "2026-11-01", toDate: "2026-11-15" },
  subjects: [
    {
      subject: {
        code: "CSE-101",
        name: "Programming Fundamentals",
        class: {
          code: "CSE-2026",
          name: "Computer Science",
          academicYear: "2026-2027",
        },
      },
      summary: {
        PRESENT: 8,
        ABSENT: 2,
        ON_DUTY_REVIEW: 3,
        totalRecords: 13,
        eligibleSessions: 13,
        attendedSessions: 8,
        attendancePercentage: 61.54,
      },
    },
  ],
  ...overrides,
});

describe("Admin attendance CSV export", () => {
  it("exports the applied period and backend subject aggregates as one row per subject", () => {
    const csv = buildAdminAttendanceCsv(makeReport());

    assert.equal(
      csv,
      [
        '"Period from","Period through","Class code","Class name","Academic year","Subject code","Subject name","Present","Absent","On-duty review","Total records","Eligible sessions","Attended sessions","Attendance percentage"',
        '"2026-11-01","2026-11-15","CSE-2026","Computer Science","2026-2027","CSE-101","Programming Fundamentals","8","2","3","13","13","8","61.54"',
      ].join("\\r\\n"),
    );
  });

  it("quotes commas, double quotes and embedded line breaks in text fields", () => {
    const csv = buildAdminAttendanceCsv(makeReport({
      subjects: [
        {
          subject: {
            code: "SCI-1",
            name: 'Science, "Main"\\nCampus',
            class: {
              code: "SCI",
              name: "Science, Arts",
              academicYear: "2026-2027",
            },
          },
          summary: {
            PRESENT: 1,
            ABSENT: 0,
            ON_DUTY_REVIEW: 0,
            totalRecords: 1,
            eligibleSessions: 1,
            attendedSessions: 1,
            attendancePercentage: 100,
          },
        },
      ],
    }));

    assert.ok(csv.includes('"Science, Arts"'));
    assert.ok(csv.includes('"Science, ""Main""\\nCampus"'));
  });

  it("neutralizes spreadsheet formula-leading class and subject text", () => {
    const csv = buildAdminAttendanceCsv(makeReport({
      subjects: [
        {
          subject: {
            code: "=HYPERLINK(\"https://bad.example\")",
            name: "+SUM(1,1)",
            class: {
              code: "@SUM(A1:A2)",
              name: "  -2+3",
              academicYear: "2026-2027",
            },
          },
          summary: {
            PRESENT: 0,
            ABSENT: 0,
            ON_DUTY_REVIEW: 0,
            totalRecords: 0,
            eligibleSessions: 0,
            attendedSessions: 0,
            attendancePercentage: null,
          },
        },
      ],
    }));

    assert.ok(csv.includes('"\'=HYPERLINK(""https://bad.example"")"'));
    assert.ok(csv.includes('"'+SUM(1,1)"'));
    assert.ok(csv.includes('"'+@SUM(A1:A2)"'));
    assert.ok(csv.includes('"\'  -2+3"'));
    assert.ok(csv.endsWith(',""'));
  });

  it("returns a valid header-only CSV when the report has no subjects", () => {
    const csv = buildAdminAttendanceCsv(makeReport({ subjects: [] }));

    assert.equal(csv.split("\\r\\n").length, 1);
    assert.ok(csv.startsWith('"Period from","Period through"'));
  });

  it("leaves a null attendance percentage blank for zero-eligible subjects", () => {
    const csv = buildAdminAttendanceCsv(makeReport({
      subjects: [
        {
          subject: {
            code: "CSE-102",
            name: "Data Structures",
            class: {
              code: "CSE-2026",
              name: "Computer Science",
              academicYear: "2026-2027",
            },
          },
          summary: {
            PRESENT: 0,
            ABSENT: 0,
            ON_DUTY_REVIEW: 0,
            totalRecords: 0,
            eligibleSessions: 0,
            attendedSessions: 0,
            attendancePercentage: null,
          },
        },
      ],
    }));

    assert.ok(csv.endsWith('"0","0","0",""'));
  });
});
