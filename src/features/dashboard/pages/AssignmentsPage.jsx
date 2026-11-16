import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  LoaderCircle,
  RefreshCw,
  Send
} from "lucide-react";

import DashboardCard from "../components/DashboardCard/DashboardCard";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import { useAuth } from "../../auth/context/AuthContext";
import {
  fetchStudentAssignments,
  submitStudentAssignment
} from "../api/studentAssignmentsApi";

import "./AssignmentsPage.css";

function formatDate(value) {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Deadline unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function isPastDue(value) {
  return Boolean(value && new Date(value).getTime() < Date.now());
}

const AssignmentsPage = () => {
  const { accessToken, sessionStatus, sessionError } = useAuth();
  const requestSequence = useRef(0);
  const [assignments, setAssignments] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [submittingId, setSubmittingId] = useState("");
  const [notice, setNotice] = useState("");

  const loadAssignments = useCallback(async () => {
    const requestId = ++requestSequence.current;
    if (sessionStatus !== "authenticated" || !accessToken) {
      setLoadState(sessionStatus === "restoring" ? "loading" : "error");
      setError(sessionError || "Your Student session is unavailable. Sign in again to view assignments.");
      return;
    }

    setLoadState("loading");
    setError("");
    try {
      const result = await fetchStudentAssignments(accessToken);
      if (requestId !== requestSequence.current) return;
      setAssignments(result);
      setAnswers(Object.fromEntries(
        result.map((assignment) => [assignment.id, assignment.submission?.content || ""])
      ));
      setLoadState("success");
    } catch (cause) {
      if (requestId !== requestSequence.current) return;
      setError(cause?.message || "Unable to load assignments.");
      setLoadState("error");
    }
  }, [accessToken, sessionError, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "authenticated") void loadAssignments();
    else if (sessionStatus === "restoring") setLoadState("loading");
    else {
      setLoadState("error");
      setError(sessionError || "Your Student session is unavailable.");
    }
    return () => {
      requestSequence.current += 1;
    };
  }, [loadAssignments, sessionError, sessionStatus]);

  const stats = useMemo(() => ({
    total: assignments.length,
    submitted: assignments.filter((item) => item.submission).length,
    pending: assignments.filter((item) => !item.submission).length,
    graded: assignments.filter((item) => item.submission?.result).length
  }), [assignments]);

  const setAnswer = (assignmentId, value) => {
    setAnswers((current) => ({ ...current, [assignmentId]: value }));
  };

  const submitAnswer = async (assignment) => {
    const content = (answers[assignment.id] || "").trim();
    if (!content) {
      setError("Enter your answer before submitting.");
      return;
    }
    if (isPastDue(assignment.dueAt)) {
      setError("The submission deadline has passed.");
      return;
    }

    setSubmittingId(assignment.id);
    setError("");
    setNotice("");
    try {
      const submission = await submitStudentAssignment(accessToken, assignment.id, content);
      setAssignments((current) => current.map((item) =>
        item.id === assignment.id
          ? {
              ...item,
              submission: {
                id: submission.id,
                content: submission.content,
                submittedAt: submission.submittedAt,
                result: null
              }
            }
          : item
      ));
      setAnswer(assignment.id, submission.content);
      setNotice("Your answer was submitted successfully.");
    } catch (cause) {
      setError(cause?.message || "Your answer could not be submitted.");
    } finally {
      setSubmittingId("");
    }
  };

  return (
    <div className="d-page-container s-assignments-page">
      <SectionHeader
        title="Assignments"
        subtitle="View published coursework, submit your answers and check published grades"
      />

      {loadState === "loading" && (
        <div className="s-assignments-state" role="status">
          <LoaderCircle className="s-assignments-spinner" size={22} />
          Loading your assignments…
        </div>
      )}

      {loadState === "error" && (
        <DashboardCard className="s-assignments-state-card">
          <div className="s-assignments-state s-assignments-error" role="alert">
            <AlertCircle size={22} />
            <div>
              <strong>Unable to load assignments</strong>
              <span>{error}</span>
              <button type="button" className="s-assignments-retry" onClick={loadAssignments}>
                <RefreshCw size={15} /> Retry
              </button>
            </div>
          </div>
        </DashboardCard>
      )}

      {loadState === "success" && (
        <>
          <div className="s-assignments-stats">
            <DashboardCard><span>Published assignments</span><strong>{stats.total}</strong></DashboardCard>
            <DashboardCard><span>Submitted</span><strong>{stats.submitted}</strong></DashboardCard>
            <DashboardCard><span>Not submitted</span><strong>{stats.pending}</strong></DashboardCard>
            <DashboardCard><span>Grades published</span><strong>{stats.graded}</strong></DashboardCard>
          </div>

          {error && <div className="s-assignments-alert" role="alert"><AlertCircle size={17} />{error}</div>}
          {notice && <div className="s-assignments-notice" role="status"><CheckCircle2 size={17} />{notice}</div>}

          {assignments.length === 0 ? (
            <DashboardCard className="s-assignments-empty">
              <ClipboardList size={27} />
              <strong>No published assignments</strong>
              <span>New coursework published for your current class will appear here.</span>
            </DashboardCard>
          ) : (
            <div className="s-assignments-list">
              {assignments.map((assignment) => {
                const submission = assignment.submission;
                const pastDue = isPastDue(assignment.dueAt);
                const isSubmitting = submittingId === assignment.id;
                return (
                  <DashboardCard className="s-assignment-card" key={assignment.id}>
                    <div className="s-assignment-topline">
                      <span className={`s-assignment-status ${submission ? "submitted" : pastDue ? "closed" : "pending"}`}>
                        {submission ? "Submitted" : pastDue ? "Deadline passed" : "Pending"}
                      </span>
                      <span>{assignment.subject.code} · {assignment.subject.name}</span>
                    </div>
                    <h2>{assignment.title}</h2>
                    <p className="s-assignment-class">{assignment.subject.class.name}</p>
                    <p className="s-assignment-instructions">{assignment.instructions}</p>
                    <div className="s-assignment-meta">
                      <span><CalendarClock size={15} /> Due: {formatDate(assignment.dueAt)}</span>
                      <span><ClipboardList size={15} /> Maximum: {assignment.maxMarks} marks</span>
                    </div>

                    <div className="s-assignment-submit-block">
                      <label>
                        <span>{submission ? "Your submitted answer" : "Your answer"}</span>
                        <textarea
                          rows={7}
                          maxLength={20000}
                          value={answers[assignment.id] || ""}
                          onChange={(event) => setAnswer(assignment.id, event.target.value)}
                          placeholder="Type your answer here. You can include explanations, working and code as text."
                          disabled={pastDue || isSubmitting}
                        />
                      </label>
                      <div className="s-assignment-submit-actions">
                        {submission && <span>Last submitted {formatDate(submission.submittedAt)}</span>}
                        <button
                          type="button"
                          className="d-btn-primary"
                          onClick={() => submitAnswer(assignment)}
                          disabled={pastDue || isSubmitting || !(answers[assignment.id] || "").trim()}
                        >
                          {isSubmitting ? <LoaderCircle className="s-assignments-spinner" size={15} /> : <Send size={15} />}
                          {isSubmitting ? "Submitting…" : submission ? "Resubmit answer" : "Submit answer"}
                        </button>
                      </div>
                      {submission && !pastDue && (
                        <p className="s-assignment-resubmit-note">
                          {submission.result
                            ? "You can resubmit before the deadline. This replaces your previous answer and withdraws its published grade until your Teacher grades and publishes the new submission."
                            : "You can update your answer before the deadline. Resubmitting replaces the previous answer and clears any unpublished grade."}
                        </p>
                      )}
                    </div>

                    {submission?.result && (
                      <section className="s-assignment-result" aria-label="Published assignment result">
                        <div>
                          <span>Published grade</span>
                          <strong>{submission.result.marksAwarded} / {assignment.maxMarks}</strong>
                        </div>
                        {submission.result.feedback && (
                          <p><b>Teacher feedback:</b> {submission.result.feedback}</p>
                        )}
                        <small>Published {formatDate(submission.result.publishedAt)}</small>
                      </section>
                    )}
                  </DashboardCard>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AssignmentsPage;
