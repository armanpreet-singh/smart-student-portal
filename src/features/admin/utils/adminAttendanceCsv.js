const HEADERS = [
  "Period from",
  "Period through",
  "Class code",
  "Class name",
  "Academic year",
  "Subject code",
  "Subject name",
  "Present",
  "Absent",
  "On-duty review",
  "Total records",
  "Eligible sessions",
  "Attended sessions",
  "Attendance percentage",
];

function escapeCsvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  // Prefix spreadsheet formula-leading text so names/codes cannot execute as formulas.
  const safeText = /^[\u0000-\u0020]*[=+\-@]/.test(text)
    ? "'" + text
    : text;

  return '"' + safeText.replace(/"/g, '""') + '"';
}

export function buildAdminAttendanceCsv(report) {
  const subjects = Array.isArray(report?.subjects) ? report.subjects : [];
  const periodFrom = report?.period?.fromDate ?? "";
  const periodThrough = report?.period?.toDate ?? "";

  const rows = subjects.map((item) => {
    const subject = item?.subject || {};
    const classRecord = subject.class || {};
    const summary = item?.summary || {};

    return [
      periodFrom,
      periodThrough,
      classRecord.code,
      classRecord.name,
      classRecord.academicYear,
      subject.code,
      subject.name,
      summary.PRESENT,
      summary.ABSENT,
      summary.ON_DUTY_REVIEW,
      summary.totalRecords,
      summary.eligibleSessions,
      summary.attendedSessions,
      summary.attendancePercentage,
    ];
  });

  return [HEADERS, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");
}
