import React, { memo, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import { useAuth } from "../../auth/context/AuthContext";
import { fetchTeacherAssignedSubjects } from "../api/teacherSubjectsApi";
import { summarizeTeacherAssignments } from "../utils/teacherDashboardSummary";

import "./TeacherHome.css";

function formatAssignedDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function MetricCard({ icon: Icon, label, value, detail }) {
  return (
    <DashboardCard className="t-dashboard-metric">
      <span className="t-dashboard-metric-icon" aria-hidden="true">
        <Icon size={20} />
      </span>
      <div className="t-dashboard-metric-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </DashboardCard>
  );
}

const TeacherHome = memo(() => {
  const { accessToken, user, sessionStatus, sessionError } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    if (sessionStatus === "restoring") {
      setAssignments([]);
      setLoadState("loading");
      setError("");
      return () => {
        active = false;
      };
    }

    if (sessionStatus !== "authenticated" || !accessToken) {
      setAssignments([]);
      setLoadState("error");
      setError(
        sessionError ||
          "Your Teacher session is unavailable. Sign in again to view assigned subjects.",
      );
      return () => {
        active = false;
      };
    }

    setAssignments([]);
    setLoadState("loading");
    setError("");

    fetchTeacherAssignedSubjects(accessToken)
      .then((result) => {
        if (!active) return;
        setAssignments(result);
        setLoadState("success");
      })
      .catch((cause) => {
        if (!active) return;
        setAssignments([]);
        setError(cause?.message || "Unable to load your assigned subjects.");
        setLoadState("error");
      });

    return () => {
      active = false;
    };
  }, [accessToken, retryCount, sessionError, sessionStatus]);

  const summary = useMemo(
    () => summarizeTeacherAssignments(assignments),
    [assignments],
  );

  const displayName =
    typeof user?.fullName === "string" && user.fullName.trim()
      ? user.fullName.trim()
      : "your teaching workspace";

  return (
    <div className="d-page-container">
      <SectionHeader
        title="Teacher Dashboard"
        subtitle={
          user?.fullName
            ? `Welcome, ${displayName}. Here are your current teaching assignments.`
            : "Your current teaching assignments"
        }
        action={
          <Link className="d-btn-primary t-dashboard-attendance-link" to="/teacher/attendance">
            <ClipboardCheck size={16} aria-hidden="true" />
            Open Attendance
          </Link>
        }
      />

      {loadState === "loading" && (
        <div className="t-dashboard-state" role="status">
          <LoaderCircle className="t-dashboard-spinner" size={22} />
          Loading your assigned subjects…
        </div>
      )}

      {loadState === "error" && (
        <DashboardCard className="t-dashboard-state-card">
          <div className="t-dashboard-state t-dashboard-error" role="alert">
            <AlertCircle size={22} aria-hidden="true" />
            <div className="t-dashboard-state-copy">
              <strong>Unable to load your teaching assignments</strong>
              <span>{error}</span>
              <button
                className="d-btn-primary t-dashboard-retry"
                type="button"
                onClick={() => setRetryCount((value) => value + 1)}
              >
                <RefreshCw size={16} aria-hidden="true" />
                Retry
              </button>
            </div>
          </div>
        </DashboardCard>
      )}

      {loadState === "success" && (
        <>
          <div className="t-dashboard-metrics" aria-live="polite">
            <MetricCard
              icon={BookOpen}
              label="Active subjects"
              value={summary.assignedSubjectCount}
              detail="Assigned to your account"
            />
            <MetricCard
              icon={GraduationCap}
              label="Active classes"
              value={summary.assignedClassCount}
              detail="Distinct classes across your subjects"
            />
          </div>

          {assignments.length === 0 ? (
            <DashboardCard className="t-dashboard-empty-card">
              <div className="t-dashboard-state" role="status">
                <BookOpen size={25} aria-hidden="true" />
                <strong>No active subjects assigned</strong>
                <span>
                  No active subject assignments are currently available for
                  this Teacher account. Contact an administrator if you
                  expected to see a class here.
                </span>
                <Link className="t-dashboard-secondary-link" to="/teacher/classes">
                  View My Classes
                </Link>
              </div>
            </DashboardCard>
          ) : (
            <>
              <SectionHeader
                title="Your teaching assignments"
                subtitle="Active subjects and their assigned class details"
                action={
                  <Link className="t-dashboard-secondary-link" to="/teacher/classes">
                    View all classes
                  </Link>
                }
              />

              <div className="t-dashboard-assignment-grid">
                {assignments.map(({ assignedAt, subject }) => {
                  const assignedDate = formatAssignedDate(assignedAt);

                  return (
                    <DashboardCard
                      className="t-dashboard-assignment-card"
                      key={subject.id}
                    >
                      <div className="t-dashboard-assignment-heading">
                        <span className="t-dashboard-assignment-icon" aria-hidden="true">
                          <BookOpen size={19} />
                        </span>
                        <span className="t-dashboard-subject-code">{subject.code}</span>
                      </div>

                      <h4>{subject.name}</h4>

                      <div className="t-dashboard-assignment-detail">
                        <GraduationCap size={16} aria-hidden="true" />
                        <span>
                          <small>Assigned class</small>
                          <strong>{subject.class.name}</strong>
                        </span>
                      </div>
                      <div className="t-dashboard-assignment-detail">
                        <BookOpen size={16} aria-hidden="true" />
                        <span>
                          <small>Class code</small>
                          <strong>{subject.class.code}</strong>
                        </span>
                      </div>
                      <div className="t-dashboard-assignment-detail">
                        <CalendarDays size={16} aria-hidden="true" />
                        <span>
                          <small>Academic year</small>
                          <strong>{subject.class.academicYear}</strong>
                        </span>
                      </div>

                      {assignedDate && (
                        <p className="t-dashboard-assigned-date">
                          Assigned {assignedDate}
                        </p>
                      )}
                    </DashboardCard>
                  );
                })}
              </div>
            </>
          )}

          <div className="t-dashboard-quick-links">
            <Link to="/teacher/students">View student rosters</Link>
            <Link to="/teacher/attendance">Open attendance workflow</Link>
          </div>
          <p className="t-dashboard-data-note">
            This overview reflects active subject assignments returned by the
            Teacher service. It does not estimate student headcounts or show
            schedule, assignment, grading or results data.
          </p>
        </>
      )}
    </div>
  );
});

export default TeacherHome;
