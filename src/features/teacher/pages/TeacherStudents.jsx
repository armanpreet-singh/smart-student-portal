import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  GraduationCap,
  LoaderCircle,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import { useAuth } from "../../auth/context/AuthContext";
import {
  fetchTeacherAssignedSubjects,
  fetchTeacherSubjectRoster,
} from "../api/teacherSubjectsApi";

import "./TeacherStudents.css";

const TeacherStudents = memo(() => {
  const { accessToken, sessionStatus, sessionError } = useAuth();
  const subjectRequestSequence = useRef(0);
  const rosterRequestSequence = useRef(0);

  const [assignments, setAssignments] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [subjectState, setSubjectState] = useState("loading");
  const [subjectError, setSubjectError] = useState("");

  const [roster, setRoster] = useState([]);
  const [rosterState, setRosterState] = useState("idle");
  const [rosterError, setRosterError] = useState("");
  const [search, setSearch] = useState("");

  const selectedAssignment = useMemo(
    () =>
      assignments.find(
        (assignment) => assignment.subject.id === selectedSubjectId,
      ) || null,
    [assignments, selectedSubjectId],
  );

  const loadSubjects = useCallback(async () => {
    const requestId = ++subjectRequestSequence.current;

    if (sessionStatus !== "authenticated" || !accessToken) {
      setAssignments([]);
      setSelectedSubjectId("");
      setRoster([]);
      setSubjectState("error");
      setSubjectError(
        sessionError ||
          "Your Teacher session is unavailable. Sign in again to view assigned students.",
      );
      return;
    }

    setSubjectState("loading");
    setSubjectError("");
    setAssignments([]);
    setSelectedSubjectId("");
    setRoster([]);
    setRosterState("idle");
    setRosterError("");
    setSearch("");

    try {
      const result = await fetchTeacherAssignedSubjects(accessToken);
      if (requestId !== subjectRequestSequence.current) return;

      setAssignments(result);
      setSelectedSubjectId(result[0]?.subject.id || "");
      setSubjectState("success");
    } catch (cause) {
      if (requestId !== subjectRequestSequence.current) return;

      setSubjectError(cause?.message || "Unable to load assigned subjects.");
      setSubjectState("error");
    }
  }, [accessToken, sessionError, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      void loadSubjects();
    } else if (sessionStatus === "restoring") {
      setAssignments([]);
      setSelectedSubjectId("");
      setRoster([]);
      setSubjectState("loading");
      setSubjectError("");
      setRosterState("idle");
      setRosterError("");
    } else {
      setAssignments([]);
      setSelectedSubjectId("");
      setRoster([]);
      setSubjectState("error");
      setSubjectError(
        sessionError ||
          "Your Teacher session is unavailable. Sign in again to view assigned students.",
      );
      setRosterState("idle");
      setRosterError("");
    }

    return () => {
      subjectRequestSequence.current += 1;
    };
  }, [loadSubjects, sessionError, sessionStatus]);

  const loadRoster = useCallback(
    async (subjectId, classId) => {
      const requestId = ++rosterRequestSequence.current;

      if (!subjectId || !classId || !accessToken) {
        setRoster([]);
        setRosterState("idle");
        setRosterError("");
        return;
      }

      setRoster([]);
      setRosterState("loading");
      setRosterError("");

      try {
        const result = await fetchTeacherSubjectRoster(
          accessToken,
          subjectId,
          classId,
        );

        if (requestId !== rosterRequestSequence.current) return;

        setRoster(result.students);
        setRosterState("success");
      } catch (cause) {
        if (requestId !== rosterRequestSequence.current) return;

        setRosterError(cause?.message || "Unable to load this subject roster.");
        setRosterState("error");
      }
    },
    [accessToken],
  );

  useEffect(() => {
    if (subjectState === "success" && selectedAssignment) {
      void loadRoster(
        selectedAssignment.subject.id,
        selectedAssignment.subject.classId,
      );
    } else {
      setRoster([]);
      setRosterState("idle");
      setRosterError("");
    }

    return () => {
      rosterRequestSequence.current += 1;
    };
  }, [loadRoster, selectedAssignment, subjectState]);

  const visibleStudents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return roster;

    return roster.filter((student) =>
      [student.fullName, student.username].some((value) =>
        value.toLocaleLowerCase().includes(query),
      ),
    );
  }, [roster, search]);

  const handleSubjectChange = (event) => {
    setSelectedSubjectId(event.target.value);
    setSearch("");
  };

  return (
    <div className="d-page-container">
      <SectionHeader
        title="Students"
        subtitle="View the active student roster for one of your assigned subjects"
      />

      {subjectState === "loading" && (
        <div className="t-students-state" role="status">
          <LoaderCircle className="t-students-spinner" size={22} />
          Loading your assigned subjects…
        </div>
      )}

      {subjectState === "error" && (
        <DashboardCard className="t-students-state-card">
          <div className="t-students-state t-students-error" role="alert">
            <AlertCircle size={22} aria-hidden="true" />
            <div className="t-students-state-copy">
              <strong>Unable to load assigned subjects</strong>
              <span>{subjectError}</span>
              <button
                type="button"
                className="d-btn-primary t-students-retry"
                onClick={loadSubjects}
              >
                <RefreshCw size={16} aria-hidden="true" />
                Retry
              </button>
            </div>
          </div>
        </DashboardCard>
      )}

      {subjectState === "success" && assignments.length === 0 && (
        <DashboardCard className="t-students-state-card">
          <div className="t-students-state" role="status">
            <BookOpen size={25} aria-hidden="true" />
            <strong>No active subjects assigned</strong>
            <span>
              There are no active subject assignments for this Teacher account,
              so no class rosters are available.
            </span>
          </div>
        </DashboardCard>
      )}

      {subjectState === "success" && assignments.length > 0 && (
        <>
          <DashboardCard className="t-students-filter-card">
            <div className="t-students-controls">
              <label className="t-students-subject-control">
                <span>Assigned subject</span>
                <select
                  value={selectedSubjectId}
                  onChange={handleSubjectChange}
                  aria-label="Select an assigned subject"
                >
                  {assignments.map(({ subject }) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code} · {subject.name} — {subject.class.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="t-students-search-control">
                <span>Find a student</span>
                <span className="t-students-search-input">
                  <Search size={16} aria-hidden="true" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name or username"
                    disabled={rosterState !== "success"}
                  />
                </span>
              </label>
            </div>
          </DashboardCard>

          {selectedAssignment && (
            <div className="t-students-selected-subject">
              <div className="t-students-selected-icon" aria-hidden="true">
                <GraduationCap size={20} />
              </div>
              <div>
                <span>Selected class</span>
                <strong>{selectedAssignment.subject.class.name}</strong>
                <small>
                  {selectedAssignment.subject.code} ·{" "}
                  {selectedAssignment.subject.name} ·{" "}
                  {selectedAssignment.subject.class.code} ·{" "}
                  {selectedAssignment.subject.class.academicYear}
                </small>
              </div>
            </div>
          )}

          {rosterState === "loading" && (
            <div className="t-students-state" role="status">
              <LoaderCircle className="t-students-spinner" size={22} />
              Loading students for this subject…
            </div>
          )}

          {rosterState === "error" && (
            <DashboardCard className="t-students-state-card">
              <div className="t-students-state t-students-error" role="alert">
                <AlertCircle size={22} aria-hidden="true" />
                <div className="t-students-state-copy">
                  <strong>Unable to load this class roster</strong>
                  <span>{rosterError}</span>
                  <button
                    type="button"
                    className="d-btn-primary t-students-retry"
                    onClick={() =>
                      loadRoster(
                        selectedAssignment.subject.id,
                        selectedAssignment.subject.classId,
                      )
                    }
                    disabled={!selectedAssignment}
                  >
                    <RefreshCw size={16} aria-hidden="true" />
                    Retry roster
                  </button>
                </div>
              </div>
            </DashboardCard>
          )}

          {rosterState === "success" && roster.length === 0 && (
            <DashboardCard className="t-students-state-card">
              <div className="t-students-state" role="status">
                <Users size={25} aria-hidden="true" />
                <strong>No active students in this class</strong>
                <span>
                  The selected subject has no active student records in its
                  assigned class.
                </span>
              </div>
            </DashboardCard>
          )}

          {rosterState === "success" && roster.length > 0 && (
            <DashboardCard padding={false} className="t-students-list-card">
              <div className="t-students-list-heading">
                <div>
                  <strong>Class roster</strong>
                  <span>
                    {roster.length} active{" "}
                    {roster.length === 1 ? "student" : "students"}
                  </span>
                </div>
                <span className="t-students-visible-count" aria-live="polite">
                  {visibleStudents.length} shown
                </span>
              </div>

              <div className="t-students-table" role="table" aria-label="Students in selected subject roster">
                <div className="t-students-table-header" role="row">
                  <span role="columnheader">Student name</span>
                  <span role="columnheader">Username</span>
                </div>

                {visibleStudents.length === 0 ? (
                  <div className="t-students-no-match" role="status">
                    No students match “{search}”.
                  </div>
                ) : (
                  visibleStudents.map((student) => (
                    <div
                      className="t-students-table-row"
                      role="row"
                      key={student.id}
                    >
                      <strong role="cell">{student.fullName}</strong>
                      <span role="cell">{student.username}</span>
                    </div>
                  ))
                )}
              </div>
            </DashboardCard>
          )}
        </>
      )}
    </div>
  );
});

export default TeacherStudents;
