const COPYABLE_STATUSES = new Set(["PRESENT", "ABSENT"]);

export function getOfficialRollNumbersForStatus(roster, records, status) {
  if (!Array.isArray(roster) || !COPYABLE_STATUSES.has(status)) return [];

  const seen = new Set();
  const result = [];

  for (const student of roster) {
    if (!student || records?.[student.id] !== status) continue;
    const value =
      typeof student.rollNumber === "string" ? student.rollNumber.trim() : "";
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }

  return result;
}

export function getStudentsMissingRollNumberForStatus(roster, records, status) {
  if (!Array.isArray(roster) || !COPYABLE_STATUSES.has(status)) return 0;

  return roster.filter((student) => {
    if (!student || records?.[student.id] !== status) return false;
    return !(typeof student.rollNumber === "string" && student.rollNumber.trim());
  }).length;
}

export function buildOfficialRollNumberClipboardText(roster, records, status) {
  return getOfficialRollNumbersForStatus(roster, records, status).join("\n");
}
