import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, LoaderCircle, MessageSquareText, Send, ShieldCheck, Star } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { fetchStudentFacultyFeedback, submitStudentFacultyFeedback } from "./facultyFeedbackApi";
import "./faculty-feedback.css";

const RATING_FIELDS = [
  { key: "teachingClarity", label: "Teaching clarity", helper: "Are explanations and examples clear?" },
  { key: "subjectKnowledge", label: "Subject knowledge", helper: "Does the faculty demonstrate command of the subject?" },
  { key: "engagement", label: "Class engagement", helper: "Are classes interactive and engaging?" },
  { key: "approachability", label: "Approachability", helper: "Can students ask questions and seek help?" },
  { key: "assessmentFairness", label: "Assessment fairness", helper: "Are assessments and marking fair?" },
  { key: "courseContent", label: "Course content", helper: "Is the course content relevant and well organised?" },
  { key: "overallRating", label: "Overall experience", helper: "Your overall rating for this faculty and subject." }
];

const EMPTY_RATINGS = Object.freeze({
  teachingClarity: 0,
  subjectKnowledge: 0,
  engagement: 0,
  approachability: 0,
  assessmentFairness: 0,
  courseContent: 0,
  overallRating: 0
});

function formatDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

const StudentFacultyFeedbackPage = () => {
  const { accessToken, sessionStatus } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  const [className, setClassName] = useState("");
  const [drafts, setDrafts] = useState({});
  const [openId, setOpenId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [pageNotice, setPageNotice] = useState("");

  const load = useCallback(async () => {
    if (sessionStatus !== "authenticated" || !accessToken) return;
    setLoading(true);
    setError("");
    try {
      const result = await fetchStudentFacultyFeedback(accessToken);
      setSurveys(result.surveys);
      setAcademicYear(result.academicYear || "");
      setClassName(result.class?.name || "");
    } catch (cause) {
      setError(cause?.message || "Unable to load eligible faculty feedback forms.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, sessionStatus]);

  useEffect(() => { void load(); }, [load]);

  const setRating = (teacherSubjectId, key, value) => {
    setDrafts((current) => ({
      ...current,
      [teacherSubjectId]: {
        ...(current[teacherSubjectId] || EMPTY_RATINGS),
        [key]: Number(value)
      }
    }));
  };

  const setComment = (teacherSubjectId, value) => {
    setDrafts((current) => ({
      ...current,
      [teacherSubjectId]: {
        ...(current[teacherSubjectId] || EMPTY_RATINGS),
        comment: value
      }
    }));
  };

  const submit = async (survey) => {
    const draft = drafts[survey.teacherSubjectId] || EMPTY_RATINGS;
    if (RATING_FIELDS.some((field) => !Number.isInteger(draft[field.key]) || draft[field.key] < 1 || draft[field.key] > 5)) {
      setPageNotice("Please select a rating for every question before submitting.");
      return;
    }
    if ((draft.comment || "").length > 1000) {
      setPageNotice("Comments must be 1,000 characters or fewer.");
      return;
    }

    setBusyId(survey.teacherSubjectId);
    setPageNotice("");
    try {
      const submitted = await submitStudentFacultyFeedback(accessToken, survey.teacherSubjectId, {
        ...Object.fromEntries(RATING_FIELDS.map(({ key }) => [key, draft[key]])),
        comment: draft.comment || ""
      });
      setSurveys((current) => current.map((item) =>
        item.teacherSubjectId === survey.teacherSubjectId
          ? {
              ...item,
              hasSubmitted: true,
              submittedAt: submitted.submittedAt,
              submission: {
                ...Object.fromEntries(RATING_FIELDS.map(({ key }) => [key, draft[key]])),
                comment: draft.comment || ""
              }
            }
          : item
      ));
      setOpenId("");
      setPageNotice("Your anonymous feedback has been submitted successfully.");
    } catch (cause) {
      setPageNotice(cause?.message || "Unable to submit this feedback.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="d-page-container f-feedback-page">
      <header className="f-feedback-heading">
        <div>
          <span className="f-feedback-eyebrow">STUDENT VOICE</span>
          <h1>Faculty Feedback</h1>
          <p>Share constructive feedback about your teaching experience and course content.</p>
          {className && <small>{className}{academicYear ? ` · ${academicYear}` : ""}</small>}
        </div>
      </header>

      <section className="f-feedback-privacy" aria-label="Feedback privacy">
        <ShieldCheck size={20} aria-hidden="true"/>
        <div>
          <strong>Your feedback is confidential</strong>
          <p>Your name and Student ID are not shown in faculty or administrator feedback reports. Faculty results are only released after at least five responses for the same subject and academic year.</p>
        </div>
      </section>

      {pageNotice && (
        <div className={pageNotice.includes("successfully") ? "f-feedback-success" : "f-feedback-notice"} role="status">
          {pageNotice.includes("successfully") ? <CheckCircle2 size={17}/> : <AlertCircle size={17}/>}
          {pageNotice}
        </div>
      )}

      {loading && <div className="f-feedback-state" role="status"><LoaderCircle size={21} className="f-feedback-spin"/> Loading your faculty and subjects…</div>}
      {!loading && error && (
        <div className="f-feedback-state f-feedback-error" role="alert">
          <AlertCircle size={22}/>
          <strong>Faculty feedback is unavailable</strong>
          <span>{error}</span>
          <button type="button" onClick={() => void load()}>Try again</button>
        </div>
      )}
      {!loading && !error && surveys.length === 0 && (
        <div className="f-feedback-state">
          <MessageSquareText size={27}/>
          <strong>No feedback forms are available</strong>
          <span>Feedback forms will appear here for faculty currently assigned to subjects in your active class.</span>
        </div>
      )}

      {!loading && !error && surveys.length > 0 && (
        <div className="f-feedback-survey-list">
          <div className="f-feedback-list-heading">
            <div>
              <h2>Your faculty and subjects</h2>
              <p>{surveys.filter((item) => item.hasSubmitted).length} of {surveys.length} feedback forms submitted</p>
            </div>
            <span>{academicYear || "Current academic year"}</span>
          </div>
          {surveys.map((survey) => {
            const isOpen = openId === survey.teacherSubjectId;
            const isBusy = busyId === survey.teacherSubjectId;
            const draft = drafts[survey.teacherSubjectId] || EMPTY_RATINGS;
            return (
              <article className="f-feedback-survey-card" key={survey.teacherSubjectId}>
                <div className="f-feedback-survey-top">
                  <div className="f-feedback-subject-icon"><BookOpenIcon /></div>
                  <div className="f-feedback-survey-info">
                    <span>{survey.subject.code}</span>
                    <h3>{survey.subject.name}</h3>
                    <p>{survey.teacher.fullName}</p>
                    <small>{survey.subject.class.name} · {survey.academicYear}</small>
                  </div>
                  <span className={survey.hasSubmitted ? "f-feedback-status is-submitted" : "f-feedback-status"}>
                    {survey.hasSubmitted ? "Submitted" : "Pending"}
                  </span>
                </div>

                {survey.hasSubmitted ? (
                  <div className="f-feedback-submitted">
                    <CheckCircle2 size={16}/>
                    <span>Your feedback was submitted on {formatDate(survey.submittedAt)}. One response is accepted for this faculty and subject each academic year.</span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      className="f-feedback-open-form"
                      aria-expanded={isOpen}
                      onClick={() => {
                        setOpenId((current) => current === survey.teacherSubjectId ? "" : survey.teacherSubjectId);
                        setPageNotice("");
                      }}
                    >
                      {isOpen ? "Close feedback form" : "Give feedback"}
                      {isOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </button>
                    {isOpen && (
                      <form className="f-feedback-form" onSubmit={(event) => { event.preventDefault(); void submit(survey); }}>
                        <div className="f-feedback-form-intro">
                          <Star size={16}/>
                          <span>Rate each area from 1 (Poor) to 5 (Excellent).</span>
                        </div>
                        <div className="f-feedback-rating-grid">
                          {RATING_FIELDS.map((field) => (
                            <label className="f-feedback-rating-field" key={field.key}>
                              <span>{field.label}</span>
                              <small>{field.helper}</small>
                              <select
                                required
                                value={draft[field.key] || ""}
                                onChange={(event) => setRating(survey.teacherSubjectId, field.key, event.target.value)}
                              >
                                <option value="" disabled>Choose rating</option>
                                <option value="1">1 · Poor</option>
                                <option value="2">2 · Fair</option>
                                <option value="3">3 · Good</option>
                                <option value="4">4 · Very good</option>
                                <option value="5">5 · Excellent</option>
                              </select>
                            </label>
                          ))}
                        </div>
                        <label className="f-feedback-comment-field">
                          <span>Additional comments <small>(optional)</small></span>
                          <textarea
                            rows={4}
                            maxLength={1000}
                            placeholder="Share constructive suggestions. Please do not include your name, roll number or other identifying details."
                            value={draft.comment || ""}
                            onChange={(event) => setComment(survey.teacherSubjectId, event.target.value)}
                          />
                          <small>{(draft.comment || "").length}/1,000 characters</small>
                        </label>
                        <button type="submit" className="f-feedback-submit" disabled={isBusy}>
                          {isBusy ? <LoaderCircle size={16} className="f-feedback-spin"/> : <Send size={16}/>}
                          {isBusy ? "Submitting…" : "Submit anonymous feedback"}
                        </button>
                      </form>
                    )}
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

const BookOpenIcon = () => <Star size={20} aria-hidden="true"/>;

export default StudentFacultyFeedbackPage;
