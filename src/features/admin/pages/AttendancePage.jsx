import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  CalendarDays,
  CheckCircle,
  Clock3,
  RotateCw,
  Users,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../auth/context/AuthContext";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import ProgressCard from "../../../features/dashboard/components/ProgressCard/ProgressCard";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import {
  fetchAdminAttendanceFilterOptions,
  fetchAdminAttendanceReport,
} from "../api/adminAttendanceApi";

import "./AttendancePage.css";

const STATUS_META = {
  PRESENT: { label: "Present", className: "present" },
  LATE: { label: "Late", className: "late" },
  ABSENT: { label: "Absent", className: "absent" },
  EXCUSED: { label: "Excused", className: "excused" },
};

function isValidDateKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function formatDate(value) {
  if (!isValidDateKey(value)) return value || "";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatPercentage(value) {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${Number(value.toFixed(1))}%`;
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;

  return (
    <div className="d-chart-tooltip">
      <p className="d-tooltip-label">{item?.subjectName || item?.code}</p>
      <p className="d-tooltip-value">
        Attendance: {formatPercentage(item?.attendance)}
      </p>
      <p className="d-tooltip-value">
        Attended: {item?.attended ?? 0} / {item?.eligible ?? 0}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <DashboardCard className="a-attendance-state" padding={false}>
      <span className="a-attendance-spinner" aria-hidden="true" />
      <div>
        <h3>Loading attendance report</h3>
        <p>Retrieving university attendance aggregates.</p>
      </div>
    </DashboardCard>
  );
}

function EmptyState({ title, message }) {
  return (
    <DashboardCard className="a-attendance-state" padding={false}>
      <Activity size={26} aria-hidden="true" />
      <div>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </DashboardCard>
  );
}

function MetricCard({ title, value, icon: Icon, tone }) {
  return (
    <DashboardCard className="a-attendance-metric">
      <div className={`a-attendance-metric-icon ${tone}`}>
        <Icon size={20} aria-hidden="true" />
      </div>
      <div>
        <p className="d-summary-title">{title}</p>
        <h3 className="d-summary-value">{value}</h3>
      </div>
    </DashboardCard>
  );
}

const AttendancePage = ({
  title = "Attendance Overview",
  subtitle = "University attendance aggregates by class and subject",
  showReportScopeNotice = false,
}) => {
  const { accessToken, refreshCurrentUser } = useAuth();

  const [filterOptions, setFilterOptions] = useState({
    classes: [],
    subjects: [],
  });
  const [optionsStatus, setOptionsStatus] = useState("loading");
  const [optionsError, setOptionsError] = useState("");
  const [optionsRetry, setOptionsRetry] = useState(0);

  const [report, setReport] = useState(null);
  const [reportStatus, setReportStatus] = useState("loading");
  const [reportError, setReportError] = useState("");
  const [reportRetry, setReportRetry] = useState(0);

  const [draftFilters, setDraftFilters] = useState({
    fromDate: "",
    toDate: "",
    classId: "",
    subjectId: "",
  });
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    classId: "",
    subjectId: "",
  });
  const [filterError, setFilterError] = useState("");

  useEffect(() => {
    let active = true;

    const loadFilterOptions = async () => {
      setOptionsStatus("loading");
      setOptionsError("");

      try {
        const result = await fetchAdminAttendanceFilterOptions(accessToken);
        if (!active) return;
        setFilterOptions(result);
        setOptionsStatus("success");
      } catch (error) {
        if (!active) return;

        if (error?.status === 401) {
          await refreshCurrentUser();
          if (!active) return;
        }

        setOptionsError(
          error?.message || "Unable to load class and subject filters.",
        );
        setOptionsStatus("error");
      }
    };

    loadFilterOptions();

    return () => {
      active = false;
    };
  }, [accessToken, refreshCurrentUser, optionsRetry]);

  useEffect(() => {
    let active = true;

    const loadReport = async () => {
      setReportStatus("loading");
      setReportError("");
      setReport(null);

      try {
        const result = await fetchAdminAttendanceReport(accessToken, filters);
        if (!active) return;
        setReport(result);
        setReportStatus("success");
      } catch (error) {
        if (!active) return;

        if (error?.status === 401) {
          await refreshCurrentUser();
          if (!active) return;
        }

        setReportError(
          error?.message || "Unable to load the attendance report.",
        );
        setReportStatus("error");
      }
    };

    loadReport();

    return () => {
      active = false;
    };
  }, [
    accessToken,
    filters.fromDate,
    filters.toDate,
    filters.classId,
    filters.subjectId,
    reportRetry,
    refreshCurrentUser,
  ]);

  const availableSubjects = useMemo(
    () =>
      draftFilters.classId
        ? filterOptions.subjects.filter(
            (item) => item.classId === draftFilters.classId,
          )
        : filterOptions.subjects,
    [filterOptions.subjects, draftFilters.classId],
  );

  const chartData = useMemo(
    () =>
      (report?.subjects || []).map((item) => ({
        code: item.subject.code,
        subjectName: item.subject.name,
        className: item.subject.class?.name || item.subject.class?.code || "—",
        attendance: item.summary.attendancePercentage,
        attended: item.summary.attendedSessions,
        eligible: item.summary.eligibleSessions,
      })),
    [report],
  );

  const summary = report?.summary;
  const metricCards = summary
    ? [
        {
          title: "Overall attendance",
          value: formatPercentage(summary.attendancePercentage),
          icon: Activity,
          tone: "primary",
        },
        {
          title: "Attended sessions",
          value: summary.attendedSessions.toLocaleString(),
          icon: CheckCircle,
          tone: "success",
        },
        {
          title: "Eligible sessions",
          value: summary.eligibleSessions.toLocaleString(),
          icon: Users,
          tone: "gold",
        },
        {
          title: "Excused records",
          value: summary.EXCUSED.toLocaleString(),
          icon: Clock3,
          tone: "muted",
        },
      ]
    : [];

  const updateDraftFilter = (field, value) => {
    setDraftFilters((current) => {
      if (field === "classId") {
        const currentSubject = filterOptions.subjects.find(
          (item) => item.id === current.subjectId,
        );
        return {
          ...current,
          classId: value,
          subjectId:
            currentSubject && value && currentSubject.classId !== value
              ? ""
              : current.subjectId,
        };
      }

      return { ...current, [field]: value };
    });
    setFilterError("");
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setFilterError("");

    const { fromDate, toDate, classId, subjectId } = draftFilters;

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

    if (classId && subjectId) {
      const selectedSubject = filterOptions.subjects.find(
        (item) => item.id === subjectId,
      );
      if (!selectedSubject || selectedSubject.classId !== classId) {
        setFilterError("Choose a subject assigned to the selected class.");
        return;
      }
    }

    setFilters({ fromDate, toDate, classId, subjectId });
  };

  const clearFilters = () => {
    const cleared = {
      fromDate: "",
      toDate: "",
      classId: "",
      subjectId: "",
    };
    setDraftFilters(cleared);
    setFilters(cleared);
    setFilterError("");
  };

  const activeFilters = [
    filters.fromDate ? `from ${formatDate(filters.fromDate)}` : "",
    filters.toDate ? `through ${formatDate(filters.toDate)}` : "",
    filters.classId
      ? filterOptions.classes.find((item) => item.id === filters.classId)?.code
      : "",
    filters.subjectId
      ? filterOptions.subjects.find((item) => item.id === filters.subjectId)?.code
      : "",
  ].filter(Boolean);

  const hasSubjects = Boolean(report?.subjects?.length);
  const hasRecords = Boolean(report?.summary?.totalRecords);

  return (
    <div className="d-page-container">
      <SectionHeader title={title} subtitle={subtitle} />

      {showReportScopeNotice && (
        <DashboardCard className="a-attendance-report-scope-note">
          <p>
            This page shows data currently exposed by the Admin reporting API:
            attendance aggregates by subject, class and date range. Student
            growth, department distribution, course enrollment and monthly
            attendance trends are not included in that API and are not presented
            here as university metrics.
          </p>
        </DashboardCard>
      )}

      <DashboardCard className="a-attendance-filters">
        <form onSubmit={applyFilters}>
          <div className="a-attendance-filter-heading">
            <div>
              <h3>Report filters</h3>
              <p>Filter the report by date range, class and subject.</p>
            </div>
            <CalendarDays size={20} aria-hidden="true" />
          </div>

          {optionsStatus === "error" && (
            <div className="a-attendance-filter-warning" role="alert">
              <span>{optionsError} Class and subject filter choices are unavailable.</span>
              <button
                type="button"
                onClick={() => setOptionsRetry((value) => value + 1)}
              >
                Retry filter choices
              </button>
            </div>
          )}

          <div className="a-attendance-filter-grid">
            <label className="d-form-group">
              <span>From date</span>
              <input
                type="date"
                value={draftFilters.fromDate}
                max={draftFilters.toDate || undefined}
                onChange={(event) =>
                  updateDraftFilter("fromDate", event.target.value)
                }
              />
            </label>

            <label className="d-form-group">
              <span>To date</span>
              <input
                type="date"
                value={draftFilters.toDate}
                min={draftFilters.fromDate || undefined}
                onChange={(event) =>
                  updateDraftFilter("toDate", event.target.value)
                }
              />
            </label>

            <label className="d-form-group">
              <span>Class</span>
              <select
                value={draftFilters.classId}
                onChange={(event) =>
                  updateDraftFilter("classId", event.target.value)
                }
                disabled={optionsStatus !== "success"}
              >
                <option value="">All classes</option>
                {filterOptions.classes.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.code} — {item.name} ({item.academicYear})
                  </option>
                ))}
              </select>
            </label>

            <label className="d-form-group">
              <span>Subject</span>
              <select
                value={draftFilters.subjectId}
                onChange={(event) =>
                  updateDraftFilter("subjectId", event.target.value)
                }
                disabled={optionsStatus !== "success"}
              >
                <option value="">All subjects</option>
                {availableSubjects.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.code} — {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filterError && (
            <p className="a-attendance-filter-error" role="alert">
              {filterError}
            </p>
          )}

          <div className="a-attendance-filter-footer">
            <p>
              {activeFilters.length
                ? `Applied: ${activeFilters.join(" · ")}`
                : "Showing all available classes, subjects and dates."}
            </p>
            <div>
              <button
                type="button"
                className="a-attendance-clear-button"
                onClick={clearFilters}
                disabled={
                  !draftFilters.fromDate &&
                  !draftFilters.toDate &&
                  !draftFilters.classId &&
                  !draftFilters.subjectId
                }
              >
                Clear filters
              </button>
              <button type="submit" className="d-btn-primary">
                Apply filters
              </button>
            </div>
          </div>
        </form>
      </DashboardCard>

      {reportStatus === "loading" && <LoadingState />}

      {reportStatus === "error" && (
        <DashboardCard className="a-attendance-state a-attendance-error" padding={false}>
          <div>
            <h3>Attendance report unavailable</h3>
            <p>{reportError}</p>
          </div>
          <button
            type="button"
            className="d-btn-primary a-attendance-retry"
            onClick={() => setReportRetry((value) => value + 1)}
          >
            <RotateCw size={16} />
            Retry report
          </button>
        </DashboardCard>
      )}

      {reportStatus === "success" && (
        <>
          <div className="d-grid-4 a-attendance-metrics-grid">
            {metricCards.map((metric) => (
              <MetricCard key={metric.title} {...metric} />
            ))}
          </div>

          {!hasSubjects ? (
            <EmptyState
              title="No subjects match these filters"
              message="The backend report did not return any subjects for the selected class, subject or date range."
            />
          ) : !hasRecords ? (
            <EmptyState
              title="No attendance records found"
              message="Subjects match the selected filters, but no attendance sessions have been recorded in this report period."
            />
          ) : (
            <div className="d-grid-main">
              <div className="d-col-8">
                <DashboardCard padding={false}>
                  <div className="p-4 a-attendance-card-heading">
                    <SectionHeader
                      title="Attendance by subject"
                      subtitle="Backend-calculated attendance percentages"
                    />
                  </div>
                  <div className="a-attendance-chart-scroll">
                    <ResponsiveContainer
                      width="100%"
                      height={Math.max(280, chartData.length * 42)}
                    >
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 16, right: 28, bottom: 16, left: 12 }}
                        barCategoryGap="24%"
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="var(--d-border)"
                        />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          unit="%"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "var(--d-text-secondary)", fontSize: 11 }}
                        />
                        <YAxis
                          type="category"
                          dataKey="code"
                          width={88}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "var(--d-text-secondary)", fontSize: 11 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="attendance"
                          name="Attendance"
                          fill="#1E3A8A"
                          radius={[0, 6, 6, 0]}
                          maxBarSize={22}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </DashboardCard>

                <DashboardCard padding={false}>
                  <div className="p-4 a-attendance-card-heading">
                    <SectionHeader
                      title="Subject report"
                      subtitle="Class and subject aggregates returned by backend main"
                    />
                  </div>
                  <div className="a-attendance-table-scroll">
                    <table className="a-attendance-table">
                      <thead>
                        <tr>
                          <th>Class</th>
                          <th>Subject</th>
                          <th>Attended</th>
                          <th>Eligible</th>
                          <th>Attendance</th>
                          <th>Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.subjects.map((item) => {
                          const percentage = item.summary.attendancePercentage;
                          return (
                            <tr key={item.subject.id}>
                              <td>
                                <strong>{item.subject.class.code}</strong>
                                <span>{item.subject.class.name}</span>
                              </td>
                              <td>
                                <strong>{item.subject.code}</strong>
                                <span>{item.subject.name}</span>
                              </td>
                              <td>{item.summary.attendedSessions}</td>
                              <td>{item.summary.eligibleSessions}</td>
                              <td className="a-attendance-percent">
                                {formatPercentage(percentage)}
                              </td>
                              <td>
                                {percentage === null ? (
                                  <span className="a-attendance-no-data">
                                    No eligible records
                                  </span>
                                ) : (
                                  <ProgressCard
                                    value={percentage}
                                    showLabel={false}
                                  />
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </DashboardCard>
              </div>

              <div className="d-col-4">
                <DashboardCard>
                  <SectionHeader
                    title="Status breakdown"
                    subtitle={`${summary.totalRecords.toLocaleString()} recorded sessions`}
                  />
                  <div className="a-attendance-breakdown">
                    {Object.entries(STATUS_META).map(([status, meta]) => (
                      <div className="a-attendance-breakdown-row" key={status}>
                        <span className={`a-attendance-dot ${meta.className}`} aria-hidden="true" />
                        <span>{meta.label}</span>
                        <strong>{summary[status].toLocaleString()}</strong>
                      </div>
                    ))}
                  </div>
                  <p className="a-attendance-breakdown-note">
                    Backend attendance percentage counts Present and Late as
                    attended. Absent is included in eligible sessions; Excused
                    is excluded from the percentage denominator.
                  </p>
                </DashboardCard>

                <DashboardCard>
                  <SectionHeader
                    title="Report scope"
                    subtitle="Filters applied by the backend"
                  />
                  <div className="a-attendance-scope-list">
                    <div>
                      <span>From</span>
                      <strong>{report.period.fromDate ? formatDate(report.period.fromDate) : "All dates"}</strong>
                    </div>
                    <div>
                      <span>Through</span>
                      <strong>{report.period.toDate ? formatDate(report.period.toDate) : "All dates"}</strong>
                    </div>
                    <div>
                      <span>Classes</span>
                      <strong>{report.filters.classId ? "Filtered" : "All classes"}</strong>
                    </div>
                    <div>
                      <span>Subjects</span>
                      <strong>{report.filters.subjectId ? "Filtered" : "All subjects"}</strong>
                    </div>
                  </div>
                </DashboardCard>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendancePage;
