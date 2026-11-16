const SUMMARY_STATUS_KEYS = ["PRESENT", "ABSENT", "ON_DUTY_REVIEW"];

export function getDashboardSummary(subjects) {
  const totals = {
    PRESENT: 0,
    ABSENT: 0,
    ON_DUTY_REVIEW: 0,
    totalRecords: 0,
    eligibleSessions: 0,
    attendedSessions: 0,
  };

  subjects.forEach((item) => {
    const summary = item.summary;
    SUMMARY_STATUS_KEYS.forEach((status) => {
      totals[status] += summary[status];
    });
    totals.totalRecords += summary.totalRecords;
    totals.eligibleSessions += summary.eligibleSessions;
    totals.attendedSessions += summary.attendedSessions;
  });

  const attendancePercentage =
    totals.eligibleSessions === 0
      ? null
      : Math.round(
          (totals.attendedSessions / totals.eligibleSessions) * 10000,
        ) / 100;

  const recentRecords = subjects
    .flatMap((item) =>
      item.records.map((record) => ({
        ...record,
        subjectName: item.subject.name,
        subjectCode: item.subject.code,
      })),
    )
    .sort((a, b) => {
      const byDate = String(b.date || "").localeCompare(String(a.date || ""));
      if (byDate !== 0) return byDate;
      return (Date.parse(b.recordedAt || "") || 0) -
        (Date.parse(a.recordedAt || "") || 0);
    })
    .slice(0, 5);

  return {
    ...totals,
    notYetPresentSessions: totals.ABSENT + totals.ON_DUTY_REVIEW,
    attendancePercentage,
    recentRecords,
    subjectCount: subjects.length,
  };
}
