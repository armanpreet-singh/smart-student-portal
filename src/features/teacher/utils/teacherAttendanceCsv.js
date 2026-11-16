const HEADERS = [
  "Attendance date",
  "Class code",
  "Class name",
  "Academic year",
  "Subject code",
  "Subject name",
  "Student name",
  "Username",
  "Official roll number",
  "Saved attendance status",
  "Saved remarks",
  "Register marked at (submission time)",
  "Duty proof submitted",
];

function escapeCsvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  // Student-entered names and remarks are untrusted spreadsheet content.
  const safeText = /^[\u0000-\u0020]*[=+\-@]/.test(text)
    ? "'" + text
    : text;

  return '"' + safeText.replace(/"/g, '""') + '"';
}

export function buildTeacherAttendanceRegisterCsv({
  subject,
  attendanceDate,
  records,
}) {
  const classRecord = subject?.class || {};
  const savedRows = Array.isArray(records) ? records : [];

  const rows = savedRows.map(({ student, attendance }) => [
    attendanceDate,
    classRecord.code,
    classRecord.name,
    classRecord.academicYear,
    subject?.code,
    subject?.name,
    student?.fullName,
    student?.username,
    student?.rollNumber,
    attendance?.status,
    attendance?.remarks,
    attendance?.markedAt,
    attendance?.proofSubmitted ? "Yes" : "No",
  ]);

  return [HEADERS, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");
}

function safeFilenamePart(value) {
  return String(value ?? "")
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function createTeacherAttendanceCsvFilename(
  classCode,
  subjectCode,
  attendanceDate,
) {
  const safeClass = safeFilenamePart(classCode) || "class";
  const safeSubject = safeFilenamePart(subjectCode) || "subject";
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(String(attendanceDate ?? ""))
    ? attendanceDate
    : "date";

  return "teacher-attendance-" +
    safeClass + "-" + safeSubject + "-" + safeDate + ".csv";
}
