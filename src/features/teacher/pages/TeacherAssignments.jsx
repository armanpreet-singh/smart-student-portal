import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  LoaderCircle,
  Plus,
  RefreshCw,
  Save,
  Send,
  Users
} from "lucide-react";
import toast from "react-hot-toast";

import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import { useAuth } from "../../auth/context/AuthContext";
import { fetchTeacherAssignedSubjects } from "../api/teacherSubjectsApi";
import {
  createTeacherAssignment,
  fetchTeacherAssignments,
  updateTeacherAssignment,
  publishTeacherAssignment,
  fetchTeacherAssignmentSubmissions,
  gradeTeacherAssignmentSubmission,
  publishTeacherAssignmentResult
} from "../api/teacherAssignmentsApi";

import "./TeacherAssignments.css";

const EMPTY_FORM = {
  subjectId: "",
  title: "",
  instructions: "",
  dueAt: "",
  maxMarks: "100"
};

function asLocalDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function formatDate(value, withTime = true) {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Deadline unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {})
  }).format(date);
}

function getAssignmentState(assignment) {
  if (!assignment.publishedAt) return "Draft";
  if (assignment.dueAt && new Date(assignment.dueAt).getTime() < Date.now()) {
    return "Closed";
  }
  return "Published";
}

const TeacherAssignments = memo(() => {
  const { accessToken, sessionStatus, sessionError } = useAuth();
  const requestSequence = useRef(0);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  const [loadState, setLoadState] = useState("loading");
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [busyAssignmentId, setBusyAssignmentId] = useState("");
  const [submissionView, setSubmissionView] = useState(null);
  const [submissionState, setSubmissionState] = useState("idle");
  const [submissionError, setSubmissionError] = useState("");
  const [gradeDrafts, setGradeDrafts] = useState({});
  const [busySubmissionId, setBusySubmissionId] = useState("");

  const selectedAssignment = useMemo(
    () => assignments.find((item) => item.id === submissionView?.assignmentId) || null,
    [assignments, submissionView]
  );

  const visibleAssignments = useMemo(
    () => selectedSubjectId === "all"
      ? assignments
      : assignments.filter((item) => item.subject.id === selectedSubjectId),
    [assignments, selectedSubjectId]
  );

  const loadData = useCallback(async () => {
    const requestId = ++requestSequence.current;
    if (sessionStatus !== "authenticated" || !accessToken) {
      setLoadState(sessionStatus === "restoring" ? "loading" : "error");
      setError(sessionError || "Your Teacher session is unavailable. Sign in again to manage assignments.");
      return;
    }

    setLoadState("loading");
    setError("");
    try {
      const [subjectLinks, nextAssignments] = await Promise.all([
        fetchTeacherAssignedSubjects(accessToken),
        fetchTeacherAssignments(accessToken)
      ]);
      if (requestId !== requestSequence.current) return;
      setSubjects(subjectLinks.map((link) => link.subject));
      setAssignments(nextAssignments);
      setSelectedSubjectId((current) =>
        current === "all" || subjectLinks.some((link) => link.subject.id === current)
          ? current
          : "all"
      );
      setLoadState("success");
    } catch (cause) {
      if (requestId !== requestSequence.current) return;
      setError(cause?.message || "Unable to load assignments.");
      setLoadState("error");
    }
  }, [accessToken, sessionError, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "authenticated") void loadData();
    else if (sessionStatus === "restoring") setLoadState("loading");
    else {
      setLoadState("error");
      setError(sessionError || "Your Teacher session is unavailable.");
    }
    return () => {
      requestSequence.current += 1;
    };
  }, [loadData, sessionError, sessionStatus]);

  const openCreateForm = () => {
    setEditingAssignmentId("");
    setForm({
      ...EMPTY_FORM,
      subjectId: selectedSubjectId !== "all"
        ? selectedSubjectId
        : subjects[0]?.id || ""
    });
    setFormOpen(true);
  };

  const openEditForm = (assignment) => {
    if (assignment.publishedAt) return;
    setEditingAssignmentId(assignment.id);
    setForm({
      subjectId: assignment.subject.id,
      title: assignment.title,
      instructions: assignment.instructions,
      dueAt: asLocalDateTime(assignment.dueAt),
      maxMarks: String(assignment.maxMarks)
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditingAssignmentId("");
    setForm(EMPTY_FORM);
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveAssignment = async (event) => {
    event.preventDefault();
    if (!form.subjectId || !form.title.trim() || !form.instructions.trim()) return;

    setSaving(true);
    setError("");
    const input = {
      title: form.title.trim(),
      instructions: form.instructions.trim(),
      dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
      maxMarks: Number(form.maxMarks)
    };

    try {
      if (editingAssignmentId) {
        await updateTeacherAssignment(accessToken, editingAssignmentId, input);
        toast.success("Draft updated.");
      } else {
        await createTeacherAssignment(accessToken, {
          ...input,
          subjectId: form.subjectId
        });
        toast.success("Assignment draft created.");
      }
      setFormOpen(false);
      setEditingAssignmentId("");
      setForm(EMPTY_FORM);
      await loadData();
    } catch (cause) {
      setError(cause?.message || "The assignment could not be saved.");
      toast.error("Assignment was not saved.");
    } finally {
      setSaving(false);
    }
  };

  const publishAssignment = async (assignment) => {
    setBusyAssignmentId(assignment.id);
    setError("");
    try {
      await publishTeacherAssignment(accessToken, assignment.id);
      toast.success("Assignment published to the selected class.");
      await loadData();
    } catch (cause) {
      setError(cause?.message || "The assignment could not be published.");
      toast.error("Assignment was not published.");
    } finally {
      setBusyAssignmentId("");
    }
  };

  const openSubmissions = async (assignment) => {
    setSubmissionView({
      assignmentId: assignment.id,
      assignment: null,
      students: []
    });
    setSubmissionState("loading");
    setSubmissionError("");
    setGradeDrafts({});
    try {
      const result = await fetchTeacherAssignmentSubmissions(accessToken, assignment.id);
      setSubmissionView({
        assignmentId: assignment.id,
        assignment: result.assignment,
        students: result.students
      });
      setGradeDrafts(Object.fromEntries(
        result.students
          .filter((student) => student.submission)
          .map((student) => [student.submission.id, {
            marksAwarded: student.submission.marksAwarded === null
              ? ""
              : String(student.submission.marksAwarded),
            feedback: student.submission.feedback || ""
          }])
      ));
      setSubmissionState("success");
    } catch (cause) {
      setSubmissionError(cause?.message || "Unable to load submissions.");
      setSubmissionState("error");
    }
  };

  const refreshSubmissions = async () => {
    if (!submissionView?.assignmentId) return;
    const result = await fetchTeacherAssignmentSubmissions(accessToken, submissionView.assignmentId);
    setSubmissionView({
      assignmentId: submissionView.assignmentId,
      assignment: result.assignment,
      students: result.students
    });
    setGradeDrafts(Object.fromEntries(
      result.students
        .filter((student) => student.submission)
        .map((student) => [student.submission.id, {
          marksAwarded: student.submission.marksAwarded === null
            ? ""
            : String(student.submission.marksAwarded),
          feedback: student.submission.feedback || ""
        }])
    ));
    setSubmissionState("success");
  };

  const saveGrade = async (submission) => {
    const draft = gradeDrafts[submission.id] || {};
    const marksAwarded = Number(draft.marksAwarded);
    if (draft.marksAwarded === "" || !Number.isInteger(marksAwarded) ||
        marksAwarded < 0 || marksAwarded > (submissionView?.assignment?.maxMarks || 0)) {
      setSubmissionError("Enter a whole-number grade within the assignment maximum.");
      return;
    }

    setBusySubmissionId(submission.id);
    setSubmissionError("");
    try {
      await gradeTeacherAssignmentSubmission(accessToken, submission.id, {
        marksAwarded,
        feedback: draft.feedback.trim() || null
      });
      toast.success("Grade saved. Publish the result when it is ready for the Student.");
      await refreshSubmissions();
    } catch (cause) {
      setSubmissionError(cause?.message || "The grade could not be saved.");
    } finally {
      setBusySubmissionId("");
    }
  };

  const publishResult = async (submission) => {
    setBusySubmissionId(submission.id);
    setSubmissionError("");
    try {
      await publishTeacherAssignmentResult(accessToken, submission.id);
      toast.success("Grade published to the Student.");
      await refreshSubmissions();
    } catch (cause) {
      setSubmissionError(cause?.message || "The result could not be published.");
    } finally {
      setBusySubmissionId("");
    }
  };

  const closeSubmissions = () => {
    setSubmissionView(null);
    setSubmissionState("idle");
    setSubmissionError("");
    setGradeDrafts({});
  };

  const stats = useMemo(() => ({
    total: assignments.length,
    published: assignments.filter((item) => item.publishedAt).length,
    drafts: assignments.filter((item) => !item.publishedAt).length,
    submitted: assignments.reduce((sum, item) => sum + item.submissionCount, 0)
  }), [assignments]);

  return (
    <div className="d-page-container t-assignments-page">
      <SectionHeader
        title="Assignments"
        subtitle="Create coursework, review Student submissions, grade work and publish results"
        action={
          <button
            type="button"
            className="d-btn-primary t-assignments-primary-action"
            onClick={openCreateForm}
            disabled={loadState !== "success" || subjects.length === 0}
          >
            <Plus size={16} aria-hidden="true" />
            Create assignment
          </button>
        }
      />

      {loadState === "loading" && (
        <div className="t-assignments-state" role="status">
          <LoaderCircle className="t-assignments-spinner" size={22} />
          Loading assigned subjects and coursework…
        </div>
      )}

      {loadState === "error" && (
        <DashboardCard className="t-assignments-state-card">
          <div className="t-assignments-state t-assignments-error" role="alert">
            <AlertCircle size={22} aria-hidden="true" />
            <div>
              <strong>Unable to load assignments</strong>
              <span>{error}</span>
              <button type="button" className="t-assignments-secondary-button" onClick={loadData}>
                <RefreshCw size={15} /> Retry
              </button>
            </div>
          </div>
        </DashboardCard>
      )}

      {loadState === "success" && (
        <>
          <div className="t-assignments-stats">
            <DashboardCard><span>Total assignments</span><strong>{stats.total}</strong></DashboardCard>
            <DashboardCard><span>Published</span><strong>{stats.published}</strong></DashboardCard>
            <DashboardCard><span>Drafts</span><strong>{stats.drafts}</strong></DashboardCard>
            <DashboardCard><span>Submissions received</span><strong>{stats.submitted}</strong></DashboardCard>
          </div>

          {subjects.length === 0 ? (
            <DashboardCard className="t-assignments-empty">
              <BookOpen size={25} />
              <strong>No active subjects assigned</strong>
              <span>An administrator must assign an active subject before you can create coursework.</span>
            </DashboardCard>
          ) : (
            <>
              <DashboardCard className="t-assignments-filter-card">
                <label>
                  <span>Filter by assigned subject</span>
                  <select value={selectedSubjectId} onChange={(event) => setSelectedSubjectId(event.target.value)}>
                    <option value="all">All assigned subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.code} · {subject.name} — {subject.class.name}
                      </option>
                    ))}
                  </select>
                </label>
              </DashboardCard>

              {formOpen && (
                <DashboardCard className="t-assignments-form-card">
                  <div className="t-assignments-panel-heading">
                    <div>
                      <h3>{editingAssignmentId ? "Edit draft" : "Create assignment draft"}</h3>
                      <p>Drafts are visible only to you until you publish them.</p>
                    </div>
                    <button type="button" className="t-assignments-text-button" onClick={closeForm} disabled={saving}>Close</button>
                  </div>
                  <form className="t-assignments-form" onSubmit={saveAssignment}>
                    <label>
                      <span>Assigned subject and class</span>
                      <select
                        value={form.subjectId}
                        onChange={(event) => updateForm("subjectId", event.target.value)}
                        required
                        disabled={Boolean(editingAssignmentId) || saving}
                      >
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.code} · {subject.name} — {subject.class.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="t-assignments-form-wide">
                      <span>Assignment title</span>
                      <input
                        value={form.title}
                        onChange={(event) => updateForm("title", event.target.value)}
                        maxLength={160}
                        minLength={3}
                        required
                        placeholder="For example, Programming fundamentals exercise"
                        disabled={saving}
                      />
                    </label>
                    <label className="t-assignments-form-wide">
                      <span>Instructions</span>
                      <textarea
                        value={form.instructions}
                        onChange={(event) => updateForm("instructions", event.target.value)}
                        maxLength={20000}
                        rows={5}
                        required
                        placeholder="Explain the task, expected answer and submission requirements."
                        disabled={saving}
                      />
                    </label>
                    <label>
                      <span>Due date and time (optional)</span>
                      <input
                        type="datetime-local"
                        value={form.dueAt}
                        onChange={(event) => updateForm("dueAt", event.target.value)}
                        disabled={saving}
                      />
                    </label>
                    <label>
                      <span>Maximum marks</span>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        step="1"
                        value={form.maxMarks}
                        onChange={(event) => updateForm("maxMarks", event.target.value)}
                        required
                        disabled={saving}
                      />
                    </label>
                    <div className="t-assignments-form-actions">
                      <button type="button" className="t-assignments-secondary-button" onClick={closeForm} disabled={saving}>Cancel</button>
                      <button type="submit" className="d-btn-primary" disabled={saving}>
                        {saving ? <LoaderCircle className="t-assignments-spinner" size={16} /> : <Save size={16} />}
                        {saving ? "Saving…" : editingAssignmentId ? "Save draft" : "Create draft"}
                      </button>
                    </div>
                  </form>
                </DashboardCard>
              )}

              {error && <div className="t-assignments-alert" role="alert"><AlertCircle size={17} />{error}</div>}

              {visibleAssignments.length === 0 ? (
                <DashboardCard className="t-assignments-empty">
                  <ClipboardList size={25} />
                  <strong>No assignments yet</strong>
                  <span>Create a draft for one of your assigned subjects, then publish it when it is ready for Students.</span>
                  <button type="button" className="d-btn-primary" onClick={openCreateForm}>Create your first assignment</button>
                </DashboardCard>
              ) : (
                <div className="t-assignments-list">
                  {visibleAssignments.map((assignment) => {
                    const state = getAssignmentState(assignment);
                    return (
                      <DashboardCard className="t-assignment-card" key={assignment.id}>
                        <div className="t-assignment-card-top">
                          <span className={`t-assignment-status ${state.toLowerCase()}`}>{state}</span>
                          <span className="t-assignment-subject">{assignment.subject.code} · {assignment.subject.name}</span>
                        </div>
                        <h3>{assignment.title}</h3>
                        <p className="t-assignment-instructions">{assignment.instructions}</p>
                        <div className="t-assignment-meta">
                          <span><Users size={15} /> {assignment.subject.class.name}</span>
                          <span><CalendarClock size={15} /> {formatDate(assignment.dueAt)}</span>
                          <span><ClipboardList size={15} /> {assignment.maxMarks} marks</span>
                          <span><CheckCircle2 size={15} /> {assignment.submissionCount} / {assignment.studentCount} submitted</span>
                        </div>
                        <div className="t-assignment-actions">
                          {!assignment.publishedAt ? (
                            <>
                              <button type="button" className="t-assignments-secondary-button" onClick={() => openEditForm(assignment)}>Edit draft</button>
                              <button
                                type="button"
                                className="d-btn-primary"
                                onClick={() => publishAssignment(assignment)}
                                disabled={busyAssignmentId === assignment.id || Boolean(saving)}
                              >
                                {busyAssignmentId === assignment.id ? <LoaderCircle className="t-assignments-spinner" size={15} /> : <Send size={15} />}
                                Publish to class
                              </button>
                            </>
                          ) : (
                            <button type="button" className="t-assignments-secondary-button" onClick={() => openSubmissions(assignment)}>
                              <Users size={15} /> Manage submissions and grades
                            </button>
                          )}
                        </div>
                      </DashboardCard>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {submissionView && (
        <div className="t-assignments-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeSubmissions();
        }}>
          <section className="t-assignments-drawer" role="dialog" aria-modal="true" aria-labelledby="t-assignments-drawer-title">
            <div className="t-assignments-drawer-header">
              <div>
                <span>SUBMISSIONS AND GRADING</span>
                <h2 id="t-assignments-drawer-title">{selectedAssignment?.title || "Assignment submissions"}</h2>
              </div>
              <button type="button" className="t-assignments-text-button" onClick={closeSubmissions}>Close</button>
            </div>

            {submissionState === "loading" && <div className="t-assignments-state"><LoaderCircle className="t-assignments-spinner" size={22} />Loading class submissions…</div>}
            {submissionState === "error" && (
              <div className="t-assignments-state t-assignments-error" role="alert">
                <AlertCircle size={20} />
                <div><span>{submissionError}</span><button type="button" className="t-assignments-secondary-button" onClick={() => selectedAssignment && openSubmissions(selectedAssignment)}>Retry</button></div>
              </div>
            )}
            {submissionState === "success" && submissionView.students.length === 0 && (
              <div className="t-assignments-empty"><Users size={25} /><strong>No active Students in this class</strong></div>
            )}
            {submissionState === "success" && (
              <div className="t-assignments-drawer-body">
                <p className="t-assignments-submission-summary">
                  {submissionView.students.filter((student) => student.submission).length} of {submissionView.students.length} active Students have submitted.
                  Grades remain private until you publish each result.
                </p>
                {submissionView.students.map((student) => {
                  const submission = student.submission;
                  const draft = submission ? (gradeDrafts[submission.id] || { marksAwarded: "", feedback: "" }) : null;
                  return (
                    <article className="t-assignment-student-row" key={student.id}>
                      <div className="t-assignment-student-heading">
                        <div>
                          <strong>{student.fullName}</strong>
                          <span>{student.rollNumber || student.username}</span>
                        </div>
                        <span className={`t-assignment-submission-status ${submission ? "submitted" : "missing"}`}>
                          {submission ? "Submitted" : "Not submitted"}
                        </span>
                      </div>
                      {submission && (
                        <>
                          <p className="t-assignment-submitted-at">Submitted {formatDate(submission.submittedAt)}</p>
                          <details className="t-assignment-response">
                            <summary>View Student response</summary>
                            <pre>{submission.content}</pre>
                          </details>
                          <div className="t-assignment-grade-form">
                            <label>
                              <span>Marks (out of {submissionView.assignment.maxMarks})</span>
                              <input
                                type="number"
                                min="0"
                                max={submissionView.assignment.maxMarks}
                                step="1"
                                value={draft?.marksAwarded ?? ""}
                                onChange={(event) => setGradeDrafts((current) => ({
                                  ...current,
                                  [submission.id]: { ...draft, marksAwarded: event.target.value }
                                }))}
                              />
                            </label>
                            <label className="t-assignment-feedback">
                              <span>Feedback for Student</span>
                              <textarea
                                rows={2}
                                maxLength={4000}
                                value={draft?.feedback ?? ""}
                                onChange={(event) => setGradeDrafts((current) => ({
                                  ...current,
                                  [submission.id]: { ...draft, feedback: event.target.value }
                                }))}
                              />
                            </label>
                          </div>
                          <div className="t-assignment-grade-actions">
                            <span>
                              {submission.resultPublishedAt
                                ? "Result published"
                                : submission.gradedAt
                                  ? "Grade saved · not yet published"
                                  : "Not graded"}
                            </span>
                            <button
                              type="button"
                              className="t-assignments-secondary-button"
                              onClick={() => saveGrade(submission)}
                              disabled={busySubmissionId === submission.id}
                            >
                              <Save size={14} /> Save grade
                            </button>
                            <button
                              type="button"
                              className="d-btn-primary"
                              onClick={() => publishResult(submission)}
                              disabled={!submission.gradedAt || submission.resultPublishedAt || busySubmissionId === submission.id}
                            >
                              <Send size={14} /> Publish result
                            </button>
                          </div>
                        </>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
            {submissionError && submissionState === "success" && <div className="t-assignments-alert" role="alert"><AlertCircle size={16} />{submissionError}</div>}
          </section>
        </div>
      )}
    </div>
  );
});

export default TeacherAssignments;
