import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, BookOpen, CalendarDays, CheckCircle2, LoaderCircle, MessageSquareText, RefreshCw, ShieldCheck, Star } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { fetchTeacherFacultyFeedback } from "./facultyFeedbackApi";
import "./faculty-feedback.css";

const RATINGS = [
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

const TeacherFacultyFeedbackPage = () => {
  const { accessToken, sessionStatus } = useAuth();
  const [reports, setReports] = useState([]);
  const [minimumResponses, setMinimumResponses] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const load = useCallback(async () => {
    if (sessionStatus !== "authenticated" || !accessToken) return;
    setLoading(true);
    setError("");
    try {
      const result = await fetchTeacherFacultyFeedback(accessToken);
      setReports(result.reports);
      setMinimumResponses(result.minimumResponses);
    } catch (cause) {
      setError(cause?.message || "Unable to load faculty feedback reports.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, sessionStatus]);

  useEffect(() => { void load(); }, [load, retry]);

  const readyReports = reports.filter((report) => !report.awaitingAnonymousThreshold);
  const totalResponses = readyReports.reduce((total, report) => total + (report.responseCount || 0), 0);

  return (
    <div className="d-page-container f-feedback-page">
      <header className="f-feedback-heading">
        <div>
          <span className="f-feedback-eyebrow">TEACHING INSIGHTS</span>
          <h1>Faculty Feedback</h1>
          <p>Review anonymised feedback about your teaching and assigned subjects.</p>
        </div>
        <button type="button" className="f-feedback-refresh" onClick={() => setRetry((value) => value + 1)} disabled={loading}>
          {loading ? <LoaderCircle size={16} className="f-feedback-spin"/> : <RefreshCw size={16}/>}
          Refresh
        </button>
      </header>

      <section className="f-feedback-privacy" aria-label="Feedback anonymity">
        <ShieldCheck size={20} aria-hidden="true"/>
        <div>
          <strong>Student identity is protected</strong>
          <p>Reports contain no Student names, roll numbers or account identifiers. Ratings and comments remain hidden until at least {minimumResponses} responses are received for the same subject and academic year.</p>
        </div>
      </section>

      {!loading && !error && (
        <div className="f-feedback-summary">
          <div><span>Assigned subject reports</span><strong>{reports.length}</strong></div>
          <div><span>Reports unlocked</span><strong>{readyReports.length}</strong></div>
          <div><span>Responses in unlocked reports</span><strong>{totalResponses}</strong></div>
        </div>
      )}

      {loading && <div className="f-feedback-state" role="status"><LoaderCircle size={21} className="f-feedback-spin"/> Loading anonymised feedback…</div>}
      {!loading && error && (
        <div className="f-feedback-state f-feedback-error" role="alert">
          <AlertCircle size={22}/>
          <strong>Feedback reports are unavailable</strong>
          <span>{error}</span>
          <button type="button" onClick={() => setRetry((value) => value + 1)}>Try again</button>
        </div>
      )}
      {!loading && !error && reports.length === 0 && (
        <div className="f-feedback-state">
          <BookOpen size={26}/>
          <strong>No active teaching assignments</strong>
          <span>Feedback summaries will appear here for your active assigned subjects.</span>
        </div>
      )}

      {!loading && !error && reports.length > 0 && (
        <div className="f-feedback-report-list">
          <div className="f-feedback-list-heading">
            <div><h2>Feedback by subject</h2><p>Results are grouped by academic year.</p></div>
            <span><ShieldCheck size={15}/> Anonymous reports</span>
          </div>
          {reports.map((report) => (
            <article className="f-feedback-report-card" key={`${report.teacherSubjectId}-${report.academicYear}`}>
              <div className="f-feedback-report-heading">
                <div className="f-feedback-subject-icon"><BookOpen size={19}/></div>
                <div className="f-feedback-survey-info">
                  <span>{report.subject.code}</span>
                  <h3>{report.subject.name}</h3>
                  <p>{report.subject.class.name} · {report.academicYear}</p>
                </div>
                <span className={report.awaitingAnonymousThreshold ? "f-feedback-status" : "f-feedback-status is-submitted"}>
                  {report.awaitingAnonymousThreshold ? "Collecting responses" : "Results available"}
                </span>
              </div>

              {report.awaitingAnonymousThreshold ? (
                <div className="f-feedback-threshold">
                  <ShieldCheck size={20}/>
                  <div>
                    <strong>Anonymous threshold not reached</strong>
                    <p>Ratings and comments are hidden until at least {minimumResponses} students have responded for this subject and academic year. The response count is intentionally withheld.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="f-feedback-result-meta">
                    <span><CheckCircle2 size={15}/> {report.responseCount} anonymous responses</span>
                    <span><CalendarDays size={15}/> {report.academicYear}</span>
                  </div>
                  <div className="f-feedback-rating-results">
                    {RATINGS.map(([key, label]) => (
                      <div className="f-feedback-rating-result" key={key}>
                        <span>{label}</span>
                        <div className="f-feedback-rating-track"><i style={{ width: `${(report.ratings[key] / 5) * 100}%` }}/></div>
                        <strong>{report.ratings[key].toFixed(1)} <small>/ 5</small></strong>
                      </div>
                    ))}
                  </div>
                  <section className="f-feedback-comments">
                    <h4><MessageSquareText size={16}/> Anonymous comments</h4>
                    {report.comments.length === 0 ? (
                      <p className="f-feedback-no-comments">No written comments were submitted for this report.</p>
                    ) : report.comments.map((item, index) => (
                      <blockquote key={`${report.teacherSubjectId}-${index}-${item.submittedAt}`}>
                        <p>{item.comment}</p>
                        <small>Anonymous · {formatDate(item.submittedAt)}</small>
                      </blockquote>
                    ))}
                  </section>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherFacultyFeedbackPage;
