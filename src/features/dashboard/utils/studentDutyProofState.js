export function markDutyProofRecordBusy(current, attendanceId, action) {
  if (
    !attendanceId ||
    (action !== "upload" && action !== "download")
  ) {
    return current;
  }

  return {
    ...(current && typeof current === "object" ? current : {}),
    [attendanceId]: action,
  };
}

export function clearDutyProofRecordBusy(current, attendanceId) {
  if (!current || typeof current !== "object" || !attendanceId) {
    return current;
  }

  if (!Object.hasOwn(current, attendanceId)) return current;

  const next = { ...current };
  delete next[attendanceId];
  return next;
}
