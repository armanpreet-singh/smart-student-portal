export function summarizeTeacherAssignments(assignments) {
  const safeAssignments = Array.isArray(assignments) ? assignments : [];
  const classIds = new Set();

  safeAssignments.forEach((assignment) => {
    const classId = assignment?.subject?.class?.id;
    if (typeof classId === "string" && classId.trim()) {
      classIds.add(classId);
    }
  });

  return {
    assignedSubjectCount: safeAssignments.length,
    assignedClassCount: classIds.size,
  };
}
