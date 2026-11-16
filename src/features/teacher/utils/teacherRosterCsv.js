const HEADERS = [
  "Class code",
  "Class name",
  "Academic year",
  "Subject code",
  "Subject name",
  "Student name",
  "Username",
  "Official roll number",
];

function escapeCsvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  // Roster text is untrusted input; neutralize spreadsheet formula prefixes.
  const safeText = /^[\\u0000-\\u0020]*[=+\\-@]/.test(text)
    ? "'" + text
    : text;

  return '"' + safeText.replace(/"/g, '""') + '"';
}

export function buildTeacherRosterCsv(assignment, students) {
  const subject = assignment?.subject || {};
  const classRecord = subject.class || {};
  const roster = Array.isArray(students) ? students : [];

  const rows = roster.map((student) => [
    classRecord.code,
    classRecord.name,
    classRecord.academicYear,
    subject.code,
    subject.name,
    student?.fullName,
    student?.username,
    student?.rollNumber,
  ]);

  return [HEADERS, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\\r\\n");
}

export function createTeacherRosterCsvFilename(subjectCode) {
  const safeSubjectCode = String(subjectCode ?? "")
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `teacher-roster-${safeSubjectCode || "subject"}.csv`;
}
