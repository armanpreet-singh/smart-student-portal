import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { summarizeTeacherAssignments } from "../src/features/teacher/utils/teacherDashboardSummary.js";

const assignment = (subjectId, classId) => ({
  assignedAt: "2026-11-10T09:30:00.000Z",
  subject: {
    id: subjectId,
    class: { id: classId },
  },
});

describe("Teacher dashboard assignment summary", () => {
  it("counts assigned subjects and distinct classes without double-counting classes", () => {
    assert.deepEqual(
      summarizeTeacherAssignments([
        assignment("subject-1", "class-1"),
        assignment("subject-2", "class-1"),
        assignment("subject-3", "class-2"),
      ]),
      {
        assignedSubjectCount: 3,
        assignedClassCount: 2,
      },
    );
  });

  it("returns zero totals for an empty assignment list", () => {
    assert.deepEqual(summarizeTeacherAssignments([]), {
      assignedSubjectCount: 0,
      assignedClassCount: 0,
    });
  });

  it("handles absent or malformed assignment collections safely", () => {
    assert.deepEqual(summarizeTeacherAssignments(null), {
      assignedSubjectCount: 0,
      assignedClassCount: 0,
    });
    assert.deepEqual(summarizeTeacherAssignments([{}, assignment("s-1", "")]), {
      assignedSubjectCount: 2,
      assignedClassCount: 0,
    });
  });
});
