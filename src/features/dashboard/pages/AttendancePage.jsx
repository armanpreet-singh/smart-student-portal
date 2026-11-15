import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarDays, CheckCircle, Clock3, FileDown, FileUp, RotateCw, UserCheck, XCircle } from "lucide-react";

import { useAuth } from "../../auth/context/AuthContext";
import DashboardCard from "../components/DashboardCard/DashboardCard";
import ProgressCard from "../components/ProgressCard/ProgressCard";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import {
  fetchStudentAttendance,
  getStudentDutyProofDownloadUrl,
  submitStudentDutyProof,
} from "../api/studentAttendanceApi";

import "./AttendancePage.css";

const STATUS_META = {
  PRESENT: { label: "Present", className: "present" },
  ABSENT: { label: "Absent", className: "absent" },
  ON_DUTY_REVIEW: { label: "On-duty review", className: "on-duty-review" },
};

function toLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidDateKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function formatDate(value, options = { day: "numeric", month: "short", year: "numeric" }) {
  if (!isValidDateKey(value)) return value || "Date unavailable";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, options).format(
    new Date(year, month - 1, day),
  );
}

function formatPercentage(value) {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${Number(value.toFixed(1))}%`;
}

function statusLabel(status) {
  return STATUS_META[status]?.label || "Unknown";
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="d-chart-tooltip">
      <p className="d-tooltip-label">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="d-tooltip-value">
          {entry.name}: {entry.value}
          {entry.dataKey === "attendance" && entry.value !== null ? "%" : ""}
        </p>
      ))}
    </div>
  );
}

function buildWeeklyChart(records) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = toLocalDateKey(date);

    return {
      key,
      day: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date),
      present: 0,
      absent: 0,
      onDutyReview: 0,
    };
  });

  const dayByKey = new Map(days.map((day) => [day.key, day]));
  records.forEach((record) => {
    const day = dayByKey.get(record.date);
    const chartKey = {
      PRESENT: "present",
      ABSENT: "absent",
      ON_DUTY_REVIEW: "onDutyReview",
    }[record.status];
    if (day && chartKey) day[chartKey] += 1;
  });

  return days;
}

function buildMonthlyChart(records) {
  const today = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    return {
      key,
      month: new Intl.DateTimeFormat(undefined, {
        month: "short",
        year: "2-digit",
      }).format(date),
      PRESENT: 0,
      ABSENT: 0,
      ON_DUTY_REVIEW: 0,
    };
  });

  const monthByKey = new Map(months.map((month) => [month.key, month]));
  records.forEach((record) => {
    const month = monthByKey.get(record.date.slice(0, 7));
    if (month && Object.hasOwn(month, record.status)) {
      month[record.status] += 1;
    }
  });

  return months.map((month) => {
    const eligible = month.PRESENT + month.ABSENT + month.ON_DUTY_REVIEW;
    const attended = month.PRESENT;
    return {
      month: month.month,
      attendance: eligible
        ? Math.round((attended / eligible) * 10000) / 100
        : null,
      eligible,
    };
  });
}

function LoadingState() {
  return (
    <DashboardCard className="d-attendance-state" padding={false}>
      <span className="d-attendance-spinner" aria-hidden="true" />
      <div>
        <h3>Loading attendance</h3>
        <p>Retrieving attendance records from the university service.</p>
      </div>
    </DashboardCard>
  );
}

function EmptyState({ title, message }) {
  return (
    <DashboardCard className="d-attendance-state" padding={false}>
      <CalendarDays size={26} aria-hidden="true" />
      <div>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </DashboardCard>
  );
}

const AttendancePage = () => {
  const { accessToken, refreshCurrentUser } = useAuth();
  const [data, setData] = useState(null);
  const [requestStatus, setRequestStatus] = useState("loading");
  const [requestError, setRequestError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [draftFilters, setDraftFilters] = useState({ fromDate: "", toDate: "" });
  const [filters, setFilters] = useState({ fromDate: "", toDate: "" });
  const [filterError, setFilterError] = useState("");
  const [proofFiles, setProofFiles] = useState({});
  const [proofBusyId, setProofBusyId] = useState("");
  const [proofErrors, setProofErrors] = useState({});

  useEffect(() => {
    let active = true;

    const loadAttendance = async () => {
      setRequestStatus("loading");
      setRequestError("");
      setData(null);

      try {
        const result = await fetchStudentAttendance(accessToken, filters);
        if (!active) return;
        setData(result);
        setRequestStatus("success");
      } catch (error) {
        if (!active) return;

        if (error?.status === 401) {
          await refreshCurrentUser();
          if (!active) return;
        }

        setRequestError(
          error?.message || "Unable to load attendance. Please try again.",
        );
        setRequestStatus("error");
      }
    };

    loadAttendance();

    return () => {
      active = false;
    };
  }, [accessToken, filters.fromDate, filters.toDate, retryCount, refreshCurrentUser]);

  const subjects = data?.subjects || [];
  const records = useMemo(
    () =>
      subjects.flatMap((item) =>
        item.records.map((record) => ({
          ...record,
          subject: item.subject,
        })),
      ),
    [subjects],
  );

  const totals = useMemo(() => {
    const counts = {
      PRESENT: 0,
      ABSENT: 0,
      ON_DUTY_REVIEW: 0,
    };

    subjects.forEach((item) => {
      Object.keys(counts).forEach((status) => {
        counts[status] += item.summary[status];
      });
    });

    const eligible = counts.PRESENT + counts.ABSENT + counts.ON_DUTY_REVIEW;
    const attended = counts.PRESENT;

    return {
      ...counts,
      eligible,
      attended,
      missed: counts.ABSENT + counts.ON_DUTY_REVIEW,
      attendancePercentage: eligible
        ? Math.round((attended / eligible) * 10000) / 100
        : null,
      totalRecords:
        counts.PRESENT + counts.ABSENT + counts.ON_DUTY_REVIEW,
    };
  }, [subjects]);

  const weeklyData = useMemo(() => buildWeeklyChart(records), [records]);
  const monthlyData = useMemo(() => buildMonthlyChart(records), [records]);

  const recentRecords = useMemo(
    () =>
      [...records]
        .sort((a, b) => {
          if (a.date !== b.date) return b.date.localeCompare(a.date);
          return String(b.recordedAt || "").localeCompare(
            String(a.recordedAt || ""),
          );
        })
        .slice(0, 8),
    [records],
  );

  const recentWeeklyRecords = weeklyData.some(
    (day) => day.present + day.absent + day.onDutyReview > 0,
  );
  const recentMonthlyRecords = monthlyData.some(
    (month) => month.eligible > 0,
  );

  const handleDraftChange = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value }));
    setFilterError("");
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setFilterError("");

    const { fromDate, toDate } = draftFilters;
    if (fromDate && !isValidDateKey(fromDate)) {
      setFilterError("Enter a valid start date.");
      return;
    }
    if (toDate && !isValidDateKey(toDate)) {
      setFilterError("Enter a valid end date.");
      return;
    }
    if (fromDate && toDate && fromDate > toDate) {
      setFilterError("Start date must be on or before the end date.");
      return;
    }

    setFilters({ fromDate, toDate });
  };

  const clearFilters = () => {
    setDraftFilters({ fromDate: "", toDate: "" });
    setFilters({ fromDate: "", toDate: "" });
    setFilterError("");
  };

  const handleProofFileChange = (attendanceId, file) => {
    setProofFiles((current) => ({ ...current, [attendanceId]: file || null }));
    setProofErrors((current) => ({ ...current, [attendanceId]: "" }));
  };

  const submitDutyProof = async (record) => {
    const file = proofFiles[record.id];
    if (!file) {
      setProofErrors((current) => ({
        ...current,
        [record.id]: "Choose a PDF, JPEG or PNG file first.",
      }));
      return;
    }

    setProofBusyId(record.id);
    setProofErrors((current) => ({ ...current, [record.id]: "" }));
    try {
      await submitStudentDutyProof(accessToken, record.id, file);
      setProofFiles((current) => {
        const next = { ...current };
        delete next[record.id];
        return next;
      });
      setRetryCount((count) => count + 1);
    } catch (error) {
      if (error?.status === 401) await refreshCurrentUser();
      setProofErrors((current) => ({
        ...current,
        [record.id]: error?.message || "Unable to submit duty proof.",
      }));
    } finally {
      setProofBusyId("");
    }
  };

  const downloadDutyProof = async (record) => {
    setProofBusyId(record.id);
    setProofErrors((current) => ({ ...current, [record.id]: "" }));
    try {
      const proof = await getStudentDutyProofDownloadUrl(accessToken, record.id);
      window.location.assign(proof.url);
    } catch (error) {
      if (error?.status === 401) await refreshCurrentUser();
      setProofErrors((current) => ({
        ...current,
        [record.id]: error?.message || "Unable to open the duty proof.",
      }));
    } finally {
      setProofBusyId("");
    }
  };

  const summaryCards = [
    {
      title: "Overall Attendance",
      value: formatPercentage(totals.attendancePercentage),
      icon: UserCheck,
      tone: "primary",
    },
    {
      title: "Sessions Present",
      value: totals.attended,
      icon: CheckCircle,
      tone: "success",
    },
    {
      title: "Not Present (incl. duty review)",
      value: totals.missed,
      icon: XCircle,
      tone: "danger",
    },
    {
      title: "Duty Reviews Pending",
      value: totals.ON_DUTY_REVIEW,
      icon: Clock3,
      tone: "gold",
    },
  ];

  return (
    <div className="d-page-container">
      <SectionHeader
        title="Attendance Overview"
        subtitle="Track your recorded attendance across assigned subjects"
      />

      <DashboardCard className="d-attendance-filters">
        <form onSubmit={applyFilters}>
          <div className="d-attendance-filter-heading">
            <div>
              <h3>Filter attendance</h3>
              <p>Choose an optional date range for your records.</p>
            </div>
            <CalendarDays size={20} aria-hidden="true" />
          </div>

          <div className="d-attendance-filter-fields">
            <label className="d-form-group">
              <span>From date</span>
              <input
                type="date"
                value={draftFilters.fromDate}
                max={draftFilters.toDate || undefined}
                onChange={(event) => handleDraftChange("fromDate", event.target.value)}
              />
            </label>
            <label className="d-form-group">
              <span>To date</span>
              <input
                type="date"
                value={draftFilters.toDate}
                min={draftFilters.fromDate || undefined}
                onChange={(event) => handleDraftChange("toDate", event.target.value)}
              />
            </label>
            <div className="d-attendance-filter-actions">
              <button type="submit" className="d-btn-primary" disabled={requestStatus === "loading"}>
                Apply filters
              </button>
              <button
                type="button"
                className="d-attendance-clear-btn"
                onClick={clearFilters}
                disabled={requestStatus === "loading" && !filters.fromDate && !filters.toDate}
              >
                Clear
              </button>
            </div>
          </div>
          {filterError && <p className="d-attendance-filter-error" role="alert">{filterError}</p>}
          {(filters.fromDate || filters.toDate) && (
            <p className="d-attendance-active-filter">
              Showing records {filters.fromDate ? `from ${formatDate(filters.fromDate)}` : ""}
              {filters.fromDate && filters.toDate ? " " : ""}
              {filters.toDate ? `through ${formatDate(filters.toDate)}` : ""}
            </p>
          )}
        </form>
      </DashboardCard>

      {requestStatus === "loading" && <LoadingState />}

      {requestStatus === "error" && (
        <DashboardCard className="d-attendance-state d-attendance-error" padding={false}>
          <div>
            <h3>Attendance could not be loaded</h3>
            <p>{requestError}</p>
          </div>
          <button
            type="button"
            className="d-btn-primary d-attendance-retry"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            <RotateCw size={16} />
            Retry
          </button>
        </DashboardCard>
      )}

      {requestStatus === "success" && subjects.length === 0 && (
        <EmptyState
          title="No subjects are assigned"
          message="The university service did not return any subjects for your account."
        />
      )}

      {requestStatus === "success" && subjects.length > 0 && (
        <>
          <div className="d-attend-summary-grid">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <DashboardCard className="d-attend-summary-card" key={card.title}>
                  <div className={`d-summary-icon d-attendance-icon ${card.tone}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="d-summary-title">{card.title}</p>
                    <h3 className="d-summary-value">{card.value}</h3>
                  </div>
                </DashboardCard>
              );
            })}
          </div>

          <div className="d-grid-main">
            <div className="d-col-8">
              <DashboardCard padding={false}>
                <div className="p-4 d-attendance-card-heading">
                  <SectionHeader
                    title="Attendance by day"
                    subtitle="Present, absent and pending duty-review records in the last seven days"
                  />
                </div>
                <div className="d-chart-wrapper p-4">
                  {recentWeeklyRecords ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={weeklyData} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--d-border)" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--d-text-secondary)", fontSize: 12 }} />
                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "var(--d-text-secondary)", fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="present" name="Present" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="absent" name="Absent" fill="#DC2626" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="onDutyReview" name="On-duty review" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="d-attendance-chart-empty">No attendance records in the last seven days for this date range.</p>
                  )}
                </div>
              </DashboardCard>

              <DashboardCard padding={false}>
                <div className="p-4 d-attendance-card-heading">
                  <SectionHeader
                    title="Monthly attendance trend"
                    subtitle="Present sessions divided by all eligible records; duty review remains not present until proof is submitted"
                  />
                </div>
                <div className="d-chart-wrapper p-4">
                  {recentMonthlyRecords ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--d-border)" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--d-text-secondary)", fontSize: 12 }} />
                        <YAxis domain={[0, 100]} unit="%" axisLine={false} tickLine={false} tick={{ fill: "var(--d-text-secondary)", fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="attendance"
                          name="Attendance"
                          stroke="#D4AF37"
                          strokeWidth={3}
                          connectNulls={false}
                          dot={{ fill: "#D4AF37", r: 4 }}
                          activeDot={{ r: 6, fill: "#D4AF37" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="d-attendance-chart-empty">No eligible attendance records are available in the last six months for this date range.</p>
                  )}
                </div>
              </DashboardCard>

              <DashboardCard padding={false}>
                <div className="p-4 d-attendance-card-heading">
                  <SectionHeader title="Subject details" subtitle="Attendance summaries returned by the university service" />
                </div>
                <div className="d-attend-table-container">
                  <div className="d-attend-table-header d-attendance-table-header">
                    <span>Subject</span>
                    <span>Class</span>
                    <span>Attended</span>
                    <span>Eligible</span>
                    <span>Attendance</span>
                    <span>Progress</span>
                  </div>
                  {subjects.map((item) => {
                    const subjectSummary = item.summary;
                    const percentage = subjectSummary.attendancePercentage;
                    return (
                      <div className="d-attend-table-row d-attendance-table-row" key={item.subject.id}>
                        <span className="d-subject-name-cell">
                          <span className="d-sub-code">{item.subject.code}</span>
                          {item.subject.name}
                        </span>
                        <span className="d-faculty-cell">
                          {item.subject.class?.code || item.subject.class?.name || "—"}
                        </span>
                        <span>{subjectSummary.attendedSessions}</span>
                        <span>{subjectSummary.eligibleSessions}</span>
                        <span className="d-attendance-percentage">
                          {formatPercentage(percentage)}
                        </span>
                        <span className="d-progress-cell">
                          {percentage === null ? (
                            <span className="d-attendance-no-data">No eligible records</span>
                          ) : (
                            <ProgressCard value={percentage} showLabel={false} />
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </DashboardCard>
            </div>

            <div className="d-col-4">
              <DashboardCard>
                <SectionHeader title="Status breakdown" subtitle={`${totals.totalRecords} recorded sessions`} />
                <div className="d-attendance-breakdown">
                  {Object.entries(STATUS_META).map(([status, meta]) => (
                    <div className="d-attendance-breakdown-row" key={status}>
                      <span className={`d-attendance-status-dot ${meta.className}`} aria-hidden="true" />
                      <span>{meta.label}</span>
                      <strong>{totals[status]}</strong>
                    </div>
                  ))}
                </div>
                <p className="d-attendance-breakdown-note">
                  Only PRESENT counts as attended. ABSENT and ON_DUTY_REVIEW are included in the eligible-session denominator; a duty-review record remains not present until your proof is submitted successfully.
                </p>
              </DashboardCard>

              <DashboardCard>
                <SectionHeader title="Recent attendance" subtitle="Latest records returned by the university service" />
                {recentRecords.length ? (
                  <div className="d-attendance-recent-list">
                    {recentRecords.map((record) => (
                      <div className="d-attendance-recent-row" key={record.id}>
                        <div>
                          <strong>{record.subject.name}</strong>
                          <span>{formatDate(record.date, { day: "numeric", month: "short" })}</span>
                          {record.remarks && <small>{record.remarks}</small>}
                        </div>
                        <div className="d-attendance-record-actions">
                          <span className={`d-attendance-status-badge ${STATUS_META[record.status].className}`}>
                            {statusLabel(record.status)}
                          </span>
                          {record.status === "ON_DUTY_REVIEW" && (
                            <div className="d-attendance-proof-actions">
                              <label>
                                <span>Proof file · PDF/JPEG/PNG · max 5 MB</span>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                  onChange={(event) => handleProofFileChange(record.id, event.target.files?.[0] || null)}
                                  disabled={proofBusyId === record.id}
                                />
                              </label>
                              <button
                                type="button"
                                className="d-btn-primary"
                                onClick={() => submitDutyProof(record)}
                                disabled={proofBusyId === record.id || requestStatus === "loading" || !proofFiles[record.id]}
                              >
                                <FileUp size={14} />
                                {proofBusyId === record.id ? "Submitting…" : "Submit proof"}
                              </button>
                            </div>
                          )}
                          {record.dutyProof && (
                            <div className="d-attendance-proof-actions">
                              <small>Proof submitted · {record.dutyProof.fileName}</small>
                              <button
                                type="button"
                                className="d-attendance-proof-download"
                                onClick={() => downloadDutyProof(record)}
                                disabled={proofBusyId === record.id}
                              >
                                <FileDown size={14} />
                                {proofBusyId === record.id ? "Preparing…" : "Download proof"}
                              </button>
                            </div>
                          )}
                          {proofErrors[record.id] && (
                            <p className="d-attendance-proof-error" role="alert">{proofErrors[record.id]}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="d-attendance-chart-empty">No attendance records are available for the selected dates.</p>
                )}
              </DashboardCard>
            </div>
          </div>

          {totals.totalRecords === 0 && (
            <EmptyState
              title="No attendance has been recorded yet"
              message="Your assigned subjects are available, but the university service has not returned any attendance records for the selected dates."
            />
          )}
        </>
      )}
    </div>
  );
};

export default AttendancePage;
