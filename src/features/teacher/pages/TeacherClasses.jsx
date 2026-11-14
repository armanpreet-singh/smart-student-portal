import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, BookOpen, CalendarDays, GraduationCap, LoaderCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import { useAuth } from "../../auth/context/AuthContext";
import { fetchTeacherAssignedSubjects } from "../api/teacherSubjectsApi";

import "./TeacherClasses.css";

function formatAssignedDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

const TeacherClasses = memo(() => {
  const { accessToken, sessionStatus, sessionError } = useAuth();
  const requestSequence = useRef(0);
  const [subjects, setSubjects] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [error, setError] = useState("");

  const loadSubjects = useCallback(async () => {
    const requestId = ++requestSequence.current;

    if (sessionStatus !== "authenticated" || !accessToken) {
      setLoadState("error");
      setError(
        sessionError ||
          "Your Teacher session is unavailable. Sign in again to view assigned subjects.",
      );
      return;
    }

    setLoadState("loading");
    setError("");

    try {
      const result = await fetchTeacherAssignedSubjects(accessToken);
      if (requestId !== requestSequence.current) return;

      setSubjects(result);
      setLoadState("success");
    } catch (cause) {
      if (requestId !== requestSequence.current) return;

      setError(cause?.message || "Unable to load assigned subjects.");
      setLoadState("error");
    }
  }, [accessToken, sessionError, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      void loadSubjects();
    } else if (sessionStatus === "restoring") {
      setLoadState("loading");
      setError("");
    } else {
      setLoadState("error");
      setError(
        sessionError ||
          "Your Teacher session is unavailable. Sign in again to view assigned subjects.",
      );
    }

    return () => {
      requestSequence.current += 1;
    };
  }, [loadSubjects, sessionError, sessionStatus]);

  return (
    <div className="d-page-container">
      <SectionHeader
        title="My Classes"
        subtitle="Active subjects and their assigned class details"
        action={
          <Link
            className="d-btn-primary t-classes-attendance-link"
            to="/teacher/attendance"
          >
            Open Attendance
          </Link>
        }
      />

      {loadState === "loading" && (
        <div className="t-classes-state" role="status">
          <LoaderCircle className="t-classes-spinner" size={22} />
          <span>Loading your assigned subjects…</span>
        </div>
      )}

      {loadState === "error" && (
        <DashboardCard className="t-classes-state-card">
          <div className="t-classes-state t-classes-error" role="alert">
            <AlertCircle size={22} aria-hidden="true" />
            <div className="t-classes-state-copy">
              <strong>Unable to load assigned subjects</strong>
              <span>{error}</span>
              <button
                className="d-btn-primary t-classes-retry"
                type="button"
                onClick={loadSubjects}
              >
                <RefreshCw size={16} aria-hidden="true" />
                Retry
              </button>
            </div>
          </div>
        </DashboardCard>
      )}

      {loadState === "success" && subjects.length === 0 && (
        <DashboardCard className="t-classes-state-card">
          <div className="t-classes-state" role="status">
            <BookOpen size={25} aria-hidden="true" />
            <strong>No active subjects assigned</strong>
            <span>
              No active subject assignments are currently available for this
              Teacher account. Contact an administrator if you expect to see
              a class here.
            </span>
          </div>
        </DashboardCard>
      )}

      {loadState === "success" && subjects.length > 0 && (
        <>
          <p className="t-classes-result-count" role="status">
            {subjects.length} active {subjects.length === 1 ? "subject" : "subjects"} assigned
          </p>

          <div className="d-grid-2 t-classes-grid">
            {subjects.map(({ assignedAt, subject }) => {
              const assignedDate = formatAssignedDate(assignedAt);

              return (
                <DashboardCard
                  className="t-classes-card"
                  key={subject.id}
                >
                  <div className="t-classes-card-header">
                    <div className="t-classes-subject-icon" aria-hidden="true">
                      <BookOpen size={20} />
                    </div>
                    <span className="t-classes-subject-code">
                      {subject.code}
                    </span>
                  </div>

                  <h4 className="t-classes-subject-name">{subject.name}</h4>

                  <div className="t-classes-class-details">
                    <div className="t-classes-detail">
                      <GraduationCap size={17} aria-hidden="true" />
                      <div>
                        <span>Assigned class</span>
                        <strong>{subject.class.name}</strong>
                      </div>
                    </div>
                    <div className="t-classes-detail">
                      <BookOpen size={17} aria-hidden="true" />
                      <div>
                        <span>Class code</span>
                        <strong>{subject.class.code}</strong>
                      </div>
                    </div>
                    <div className="t-classes-detail">
                      <CalendarDays size={17} aria-hidden="true" />
                      <div>
                        <span>Academic year</span>
                        <strong>{subject.class.academicYear}</strong>
                      </div>
                    </div>
                  </div>

                  {assignedDate && (
                    <p className="t-classes-assigned-date">
                      Assignment recorded {assignedDate}
                    </p>
                  )}
                </DashboardCard>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
});

export default TeacherClasses;
