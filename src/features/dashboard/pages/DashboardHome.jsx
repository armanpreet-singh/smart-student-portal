import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
  Settings,
  TrendingUp,
  UserRound,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../auth/context/AuthContext";
import DashboardCard from "../components/DashboardCard/DashboardCard";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import { fetchStudentAttendance } from "../api/studentAttendanceApi";
import { getGreeting } from "../utils/formatHelpers";

import "./DashboardHome.css";

const STATUS_META = {
  PRESENT: { label: "Present", className: "present" },
  LATE: { label: "Late", className: "late" },
  ABSENT: { label: "Absent", className: "absent" },
  EXCUSED: { label: "Excused", className: "excused" },
};

function formatCount(value) {
  return new Intl.NumberFormat().format(value);
}

function formatPercentage(value) {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${Number(value.toFixed(1))}%`;
}

function formatDate(value, options = { day: "numeric", month: "short", year: "numeric" }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return "Date unavailable";
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, options).format(
    new Date(year, month - 1, day),
  );
}

function formatDateTime(value) {
  if (!value || !Number.isFinite(Date.parse(value))) return "";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getDashboardSummary(subjects) {
  const totals = subjects.reduce(
    (result, item) => {
      const summary = item.summary;
      result.PRESENT += summary.PRESENT;
      result.LATE += summary.LATE;
      result.ABSENT += summary.ABSENT;
      result.EXCUSED += summary.EXCUSED;
      result.totalRecords += summary.totalRecords;
      result.eligibleSessions += summary.eligibleSessions;
      result.attendedSessions += summary.attendedSessions;
      return result;
    },
    {
      PRESENT: 0,
      LATE: 0,
      ABSENT: 0,
      EXCUSED: 0,
      totalRecords: 0,
      eligibleSessions: 0,
      attendedSessions: 0,
    },
  );

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
    attendancePercentage,
    recentRecords,
    subjectCount: subjects.length,
  };
}

function LoadingState() {
  return (
    <div className="s-dashboard-loading" role="status" aria-live="polite">
      <div className="s-dashboard-loading-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <DashboardCard className="s-dashboard-metric" key={index}>
            <span className="s-dashboard-skeleton-icon" />
            <span className="s-dashboard-skeleton-label" />
            <span className="s-dashboard-skeleton-value" />
          </DashboardCard>
        ))}
      </div>
      <p>Loading the attendance records linked to your student account…</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <DashboardCard className="s-dashboard-state s-dashboard-error" padding={false}>
      <div>
        <h3>Your dashboard data is unavailable</h3>
        <p>{message}</p>
      </div>
      <button type="button" onClick={onRetry}>
        <RefreshCw size={16} aria-hidden="true" />
        Retry
      </button>
    </DashboardCard>
  );
}

function EmptyState({ title, message }) {
  return (
    <DashboardCard className="s-dashboard-state" padding={false}>
      <BookOpen size={25} aria-hidden="true" />
      <div>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </DashboardCard>
  );
}

function MetricCard({ title, value, detail, icon: Icon, tone }) {
  return (
    <DashboardCard className="s-dashboard-metric">
      <div className={`s-dashboard-metric-icon ${tone}`}>
        <Icon size={20} aria-hidden="true" />
      </div>
      <div className="s-dashboard-metric-copy">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </DashboardCard>
  );
}

function QuickLink({ to, title, description, icon: Icon }) {
  return (
    <Link className="s-dashboard-quick-link" to={to}>
      <span className="s-dashboard-quick-link-icon">
        <Icon size={19} aria-hidden="true" />
      </span>
      <span className="s-dashboard-quick-link-copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <ArrowRight size={17} aria-hidden="true" />
    </Link>
  );
}

const DashboardHome = () => {
  const { accessToken, user, refreshCurrentUser } = useAuth();
  const [data, setData] = useState(null);
  const [requestStatus, setRequestStatus] = useState("loading");
  const [requestError, setRequestError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setRequestStatus("loading");
      setRequestError("");

      try {
        const result = await fetchStudentAttendance(accessToken);
        if (!active) return;

        setData(result);
        setLastUpdated(new Date().toISOString());
        setRequestStatus("success");
      } catch (error) {
        if (!active) return;

        if (error?.status === 401) {
          await refreshCurrentUser();
          if (!active) return;
        }

        setRequestError(
          error?.message ||
            "Unable to retrieve attendance information from the university service.",
        );
        setRequestStatus("error");
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [accessToken, refreshCurrentUser, retryCount]);

  const subjects = data?.subjects || [];
  const summary = useMemo(
    () => (data ? getDashboardSummary(data.subjects) : null),
    [data],
  );

  const displayName =
    typeof user?.fullName === "string" && user.fullName.trim()
      ? user.fullName.trim()
      : "Student";

  const todayLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="d-page-container s-dashboard-home">
      <section className="s-dashboard-hero" aria-label="Student welcome">
        <div>
          <p className="s-dashboard-greeting">{getGreeting()},</p>
          <h1>{displayName}</h1>
          <p className="s-dashboard-identity">
            {user?.username ? `@${user.username}` : "Student account"}
          </p>
          <p className="s-dashboard-date">{todayLabel}</p>
        </div>
        <div className="s-dashboard-hero-icon" aria-hidden="true">
          <UserRound size={32} />
        </div>
      </section>

      <div className="s-dashboard-section-heading">
        <SectionHeader
          title="Attendance snapshot"
          subtitle="A summary of records returned for your authenticated student account"
        />
        <Link className="s-dashboard-section-link" to="/dashboard/attendance">
          Full attendance
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      {requestStatus === "loading" && <LoadingState />}

      {requestStatus === "error" && (
        <ErrorState
          message={requestError}
          onRetry={() => setRetryCount((count) => count + 1)}
        />
      )}

      {requestStatus === "success" && subjects.length === 0 && (
        <EmptyState
          title="No subjects are listed for your account"
          message="The attendance service did not return any subjects for your current class. Contact your university administrator if you believe this is unexpected."
        />
      )}

      {requestStatus === "success" && summary && subjects.length > 0 && (
        <>
          <div className="s-dashboard-metrics" aria-live="polite">
            <MetricCard
              title="Overall attendance"
              value={formatPercentage(summary.attendancePercentage)}
              detail={
                summary.eligibleSessions
                  ? `${formatCount(summary.eligibleSessions)} eligible records`
                  : "No eligible records yet"
              }
              icon={TrendingUp}
              tone="primary"
            />
            <MetricCard
              title="Sessions attended"
              value={formatCount(summary.attendedSessions)}
              detail="Present and late records"
              icon={CheckCircle2}
              tone="success"
            />
            <MetricCard
              title="Sessions missed"
              value={formatCount(summary.ABSENT)}
              detail="Absent records"
              icon={XCircle}
              tone="danger"
            />
            <MetricCard
              title="Subjects"
              value={formatCount(summary.subjectCount)}
              detail="Returned for your class"
              icon={BookOpen}
              tone="gold"
            />
          </div>

          <p className="s-dashboard-policy-note">
            Attendance percentage counts Present and Late as attended.
            Absent records are included in the eligible total; Excused records
            are excluded from its denominator.
            {lastUpdated ? ` Updated ${formatDateTime(lastUpdated)}.` : ""}
          </p>

          <div className="s-dashboard-content-grid">
            <section className="s-dashboard-subject-section">
              <SectionHeader
                title="Subject attendance"
                subtitle="Percentages and totals from the university attendance service"
              />
              <div className="s-dashboard-subject-list">
                {subjects.map((item) => {
                  const subjectSummary = item.summary;
                  const percentage = subjectSummary.attendancePercentage;
                  return (
                    <DashboardCard
                      className="s-dashboard-subject-card"
                      key={item.subject.id}
                    >
                      <div className="s-dashboard-subject-heading">
                        <div>
                          <span className="s-dashboard-subject-code">
                            {item.subject.code}
                          </span>
                          <h3>{item.subject.name}</h3>
                        </div>
                        <strong className="s-dashboard-subject-percentage">
                          {formatPercentage(percentage)}
                        </strong>
                      </div>
                      <div className="s-dashboard-subject-progress-track">
                        {percentage !== null && (
                          <span style={{ width: `${percentage}%` }} />
                        )}
                      </div>
                      <div className="s-dashboard-subject-meta">
                        <span>
                          {subjectSummary.attendedSessions} of{" "}
                          {subjectSummary.eligibleSessions} eligible sessions
                        </span>
                        {percentage === null && <span>No eligible records</span>}
                      </div>
                      <div className="s-dashboard-subject-statuses">
                        <span>Present {subjectSummary.PRESENT}</span>
                        <span>Late {subjectSummary.LATE}</span>
                        <span>Absent {subjectSummary.ABSENT}</span>
                        <span>Excused {subjectSummary.EXCUSED}</span>
                      </div>
                    </DashboardCard>
                  );
                })}
              </div>
            </section>

            <section className="s-dashboard-recent-section">
              <SectionHeader
                title="Recent attendance"
                subtitle="Latest recorded entries"
              />
              <DashboardCard className="s-dashboard-recent-card">
                {summary.recentRecords.length > 0 ? (
                  <div className="s-dashboard-recent-list">
                    {summary.recentRecords.map((record) => {
                      const status = STATUS_META[record.status];
                      return (
                        <div className="s-dashboard-recent-row" key={record.id}>
                          <div className="s-dashboard-recent-main">
                            <strong>{record.subjectName}</strong>
                            <span>{record.subjectCode}</span>
                            <small>{formatDate(record.date)}</small>
                          </div>
                          <span className={`s-dashboard-status ${status.className}`}>
                            {status.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="s-dashboard-recent-empty">
                    No attendance records have been returned yet.
                  </p>
                )}
                <Link className="s-dashboard-inline-link" to="/dashboard/attendance">
                  Review all attendance
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </DashboardCard>
            </section>
          </div>
        </>
      )}

      <section className="s-dashboard-tools-section">
        <SectionHeader
          title="Student portal"
          subtitle="Open an available account or attendance workflow"
        />
        <div className="s-dashboard-quick-links">
          <QuickLink
            to="/dashboard/attendance"
            title="Attendance"
            description="Review date-filtered records and subject summaries"
            icon={CalendarDays}
          />
          <QuickLink
            to="/dashboard/profile"
            title="Profile"
            description="View your verified account identity"
            icon={UserRound}
          />
          <QuickLink
            to="/dashboard/settings"
            title="Account settings"
            description="Change your account password"
            icon={Settings}
          />
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;
