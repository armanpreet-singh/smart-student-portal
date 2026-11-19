import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, ChevronLeft, ChevronRight, Eye, EyeOff, LoaderCircle, MessageSquareText, RefreshCw, Search, ShieldCheck, Star } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { fetchAdminFacultyFeedback, setAdminFacultyFeedbackCommentVisibility } from "../../shared/faculty-feedback/facultyFeedbackApi";
import "./FacultyFeedbackAdminPage.css";

const PAGE_SIZE = 25;
const RATING_LABELS = [
  ["teachingClarity", "Teaching clarity"],
  ["subjectKnowledge", "Subject knowledge"],
  ["engagement", "Class engagement"],
  ["approachability", "Approachability"],
  ["assessmentFairness", "Assessment fairness"],
  ["courseContent", "Course content"],
  ["overallRating", "Overall experience"]
];

function formatDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

const FacultyFeedbackAdminPage = () => {
  const { accessToken } = useAuth();
  const [draft, setDraft] = useState({ search: "", academicYear: "" });
  const [filters, setFilters] = useState({ search: "", academicYear: "" });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyCommentId, setBusyCommentId] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminFacultyFeedback(accessToken, {
        ...filters,
        page,
        pageSize: PAGE_SIZE
      });
      setResult(data);
    } catch (cause) {
      setError(cause?.message || "Unable to load faculty feedback reports.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, filters, page]);

  useEffect(() => { void load(); }, [load]);

  const reports = result?.feedback || [];
  const responseCount = useMemo(
    () => reports.reduce((total, item) => total + item.responseCount, 0),
    [reports]
  );
  const commentCount = useMemo(
    () => reports.reduce((total, item) => total + item.comments.length, 0),
    [reports]
  );

  const applyFilters = (event) => {
    event.preventDefault();
    setFilters({ search: draft.search.trim(), academicYear: draft.academicYear.trim() });
    setPage(1);
    setNotice("");
  };

  const updateCommentVisibility = async (report, comment) => {
    setBusyCommentId(comment.id);
    setNotice("");
    try {
      const updated = await setAdminFacultyFeedbackCommentVisibility(
        accessToken,
        comment.id,
        !comment.isHidden
      );
      setResult((current) => ({
        ...current,
        feedback: current.feedback.map((item) => item.teacherSubjectId === report.teacherSubjectId &&
          item.academicYear === report.academicYear
          ? {
              ...item,
              comments: item.comments.map((entry) => entry.id === updated.id
                ? { ...entry, isHidden: updated.isCommentHidden }
                : entry)
            }
          : item)
      }));
      setNotice(updated.isCommentHidden
        ? "Comment hidden from the Teacher report. Ratings were retained."
        : "Comment restored to the Teacher report.");
    } catch (cause) {
      setNotice(cause?.message || "Unable to update comment visibility.");
    } finally {
      setBusyCommentId("");
    }
  };

  return (
    <div className="d-page-container a-faculty-feedback-page">
      <header className="a-faculty-feedback-heading">
        <div>
          <span className="f-feedback-eyebrow">ACADEMIC QUALITY</span>
          <h1>Faculty Feedback Reports</h1>
          <p>Review subject-level ratings and moderate written comments without exposing Student identities.</p>
        </div>
        <button type="button" className="f-feedback-refresh" onClick={() => void load()} disabled={loading}>
          {loading ? <LoaderCircle size={16}/> : <RefreshCw size={16}/>} Refresh
        </button>
      </header>

      <section className="f-feedback-privacy" aria-label="Privacy controls">
        <ShieldCheck size={20}/>
        <div>
          <strong>Confidential feedback records</strong>
          <p>Reports do not return Student names, roll numbers or account IDs. Faculty see aggregate ratings and visible comments only after the minimum of five responses. Hiding a comment does not alter its ratings.</p>
        </div>
      </section>

      {!loading && !error && (
        <div className="a-faculty-feedback-stats">
          <div><span>Feedback groups on this page</span><strong>{reports.length}</strong></div>
          <div><span>Responses represented</span><strong>{responseCount}</strong></div>
          <div><span>Written comments</span><strong>{commentCount}</strong></div>
        </div>
      )}

      <section className="a-faculty-feedback-filters">
        <form onSubmit={applyFilters}>
          <label>
            <span>Search faculty, subject or class</span>
            <div><Search size={16}/><input value={draft.search} maxLength={80} placeholder="Name, subject code or class…" onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}/></div>
          </label>
          <label>
            <span>Academic year</span>
            <input value={draft.academicYear} maxLength={40} placeholder="e.g. 2026-27" onChange={(event) => setDraft((current) => ({ ...current, academicYear: event.target.value }))}/>
          </label>
          <button className="d-btn-primary" type="submit"><Search size={15}/> Apply filters</button>
          <button className="a-faculty-feedback-clear" type="button" onClick={() => {
            setDraft({ search: "", academicYear: "" });
            setFilters({ search: "", academicYear: "" });
            setPage(1);
          }}>Clear</button>
        </form>
      </section>

      {notice && <div className="a-faculty-feedback-notice" role="status"><Check size={16}/>{notice}</div>}
      {loading && <div className="f-feedback-state" role="status"><LoaderCircle size={20} className="f-feedback-spin"/> Loading feedback reports…</div>}
      {!loading && error && (
        <div className="f-feedback-state f-feedback-error" role="alert">
          <AlertCircle size={22}/><strong>Reports could not be loaded</strong><span>{error}</span>
          <button type="button" onClick={() => void load()}>Try again</button>
        </div>
      )}
      {!loading && !error && reports.length === 0 && (
        <div className="f-feedback-state"><MessageSquareText size={26}/><strong>No feedback reports found</strong><span>Feedback is listed after Students submit their evaluations. Adjust the filters or check back later.</span></div>
      )}

      {!loading && !error && reports.length > 0 && (
        <div className="a-faculty-feedback-list">
          {reports.map((report) => (
            <article className="a-faculty-feedback-card" key={`${report.teacherSubjectId}-${report.academicYear}`}>
              <header>
                <div>
                  <span>{report.subject.code} · {report.subject.class.code}</span>
                  <h2>{report.subject.name}</h2>
                  <p>{report.teacher.fullName} · {report.subject.class.name} · {report.academicYear}</p>
                </div>
                <div className="a-faculty-feedback-response-count"><strong>{report.responseCount}</strong><span>responses</span></div>
              </header>
              <div className="a-faculty-feedback-ratings">
                {RATING_LABELS.map(([key, label]) => (
                  <div key={key}>
                    <span>{label}</span>
                    <strong><Star size={13} fill="currentColor"/>{report.ratings[key].toFixed(1)} / 5</strong>
                  </div>
                ))}
              </div>
              <section className="a-faculty-feedback-comments">
                <h3><MessageSquareText size={16}/> Written comments <span>{report.comments.length}</span></h3>
                {report.comments.length === 0 && <p className="a-faculty-feedback-no-comments">No written comments for this report.</p>}
                {report.comments.map((comment) => (
                  <div className={comment.isHidden ? "a-faculty-feedback-comment is-hidden" : "a-faculty-feedback-comment"} key={comment.id}>
                    <div><p>{comment.comment}</p><small>Anonymous · {formatDate(comment.submittedAt)}{comment.isHidden ? " · Hidden from faculty" : ""}</small></div>
                    <button
                      type="button"
                      onClick={() => void updateCommentVisibility(report, comment)}
                      disabled={busyCommentId === comment.id}
                      aria-label={comment.isHidden ? "Restore comment to faculty report" : "Hide comment from faculty report"}
                    >
                      {busyCommentId === comment.id
                        ? <LoaderCircle size={15} className="f-feedback-spin"/>
                        : comment.isHidden ? <Eye size={15}/> : <EyeOff size={15}/>}
                      {comment.isHidden ? "Restore" : "Hide"}
                    </button>
                  </div>
                ))}
              </section>
            </article>
          ))}
          <div className="a-faculty-feedback-pagination">
            <span>{result.pagination.total} feedback groups · Page {result.pagination.page} of {Math.max(1, result.pagination.totalPages)}</span>
            <div>
              <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={16}/> Previous</button>
              <button type="button" disabled={page >= result.pagination.totalPages} onClick={() => setPage((current) => current + 1)}>Next <ChevronRight size={16}/></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyFeedbackAdminPage;
