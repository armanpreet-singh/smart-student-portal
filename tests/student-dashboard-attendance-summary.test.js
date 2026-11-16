import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getDashboardSummary } from "../src/features/dashboard/utils/dashboardAttendanceSummary.js";

function subjectResult({
  id,
  name = id,
  summary,
  records = [],
}) {
  return {
    subject: { id, name, code: `${id.toUpperCase()}-101` },
    summary: {
      PRESENT: 0,
      ABSENT: 0,
      ON_DUTY_REVIEW: 0,
      totalRecords: 0,
      eligibleSessions: 0,
      attendedSessions: 0,
      attendancePercentage: null,
      ...summary,
    },
    records,
  };
}

describe("Student dashboard attendance summary", () => {
  it("aggregates the released PRESENT, ABSENT and ON_DUTY_REVIEW statuses", () => {
    const result = getDashboardSummary([
      subjectResult({
        id: "math",
        summary: {
          PRESENT: 1,
          ABSENT: 2,
          ON_DUTY_REVIEW: 1,
          totalRecords: 4,
          eligibleSessions: 4,
          attendedSessions: 1,
          attendancePercentage: 25,
        },
      }),
      subjectResult({
        id: "science",
        summary: {
          PRESENT: 2,
          ABSENT: 0,
          ON_DUTY_REVIEW: 2,
          totalRecords: 4,
          eligibleSessions: 4,
          attendedSessions: 2,
          attendancePercentage: 50,
        },
      }),
    ]);

    assert.equal(result.PRESENT, 3);
    assert.equal(result.ABSENT, 2);
    assert.equal(result.ON_DUTY_REVIEW, 3);
    assert.equal(result.totalRecords, 8);
    assert.equal(result.eligibleSessions, 8);
    assert.equal(result.attendedSessions, 3);
    assert.equal(result.notYetPresentSessions, 5);
    assert.equal(result.attendancePercentage, 37.5);
    assert.equal(result.subjectCount, 2);
  });

  it("does not count duty-review records as attended before successful proof submission", () => {
    const result = getDashboardSummary([
      subjectResult({
        id: "physics",
        summary: {
          PRESENT: 0,
          ABSENT: 1,
          ON_DUTY_REVIEW: 2,
          totalRecords: 3,
          eligibleSessions: 3,
          attendedSessions: 0,
          attendancePercentage: 0,
        },
      }),
    ]);

    assert.equal(result.attendedSessions, 0);
    assert.equal(result.notYetPresentSessions, 3);
    assert.equal(result.attendancePercentage, 0);
  });

  it("returns a null percentage for a subject catalogue with no attendance records", () => {
    const result = getDashboardSummary([
      subjectResult({ id: "empty-subject" }),
    ]);

    assert.equal(result.totalRecords, 0);
    assert.equal(result.attendedSessions, 0);
    assert.equal(result.notYetPresentSessions, 0);
    assert.equal(result.attendancePercentage, null);
    assert.deepEqual(result.recentRecords, []);
  });

  it("sorts recent records by attendance date and then recorded timestamp", () => {
    const result = getDashboardSummary([
      subjectResult({
        id: "chemistry",
        records: [
          { id: "older-time", date: "2026-11-10", recordedAt: "2026-11-10T08:00:00Z" },
          { id: "latest", date: "2026-11-11", recordedAt: "2026-11-11T09:00:00Z" },
          { id: "newer-time", date: "2026-11-10", recordedAt: "2026-11-10T10:00:00Z" },
        ],
      }),
    ]);

    assert.deepEqual(
      result.recentRecords.map((record) => record.id),
      ["latest", "newer-time", "older-time"],
    );
  });
});
