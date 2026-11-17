import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  GraduationCap,
  LoaderCircle,
  RefreshCw,
  Search,
  Target
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { showErrorMessage, showSuccessMessage } from "../../../components/ui/toastUtils";
import {
  fetchStudentSyllabus,
  fetchTeacherSyllabus,
  updateTeacherSyllabusTopic
} from "./syllabusApi";
import "./syllabus.css";

const STATUS_OPTIONS = [
  { value: "all", label: "All subjects" },
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "complete", label: "Completed" }
];

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function subjectStatus(subject) {
  if (subject.totalTopics > 0 && subject.completedTopics === subject.totalTopics) return "complete";
  if (subject.completedTopics > 0) return "in_progress";
  return "not_started";
}

function statusLabel(status) {
  if (status === "complete") return "Completed";
  if (status === "in_progress") return "In progress";
  return "Not started";
}

function matchesSubject(subject, query) {
  if (!query) return true;
  const searchable = [
    subject.code,
    subject.name,
    subject.syllabusCourseCode,
    subject.curriculumType,
    ...subject.units.flatMap((unit) => [
      unit.code,
      unit.title,
      ...unit.topics.map((topic) => topic.title)
    ])
  ].join(" ").toLowerCase();
  return searchable.includes(query);
}

function SubjectCard({ subject, role, onToggleTopic, busyTopicId }) {
  const status = subjectStatus(subject);
  const unitCount = subject.units.length;

  return (
    <article className="syllabus-subject-card">
      <details className="syllabus-subject-details">
        <summary className="syllabus-subject-summary">
          <div className="syllabus-subject-main">
            <div className="syllabus-course-icon"><BookOpen size={19}/></div>
            <div className="syllabus-subject-heading">
              <div className="syllabus-subject-title-row">
                <span className="syllabus-subject-code">{subject.code}</span>
                <span className="syllabus-kind">{subject.curriculumType === "LAB"
                  ? "Practical"
                  : subject.curriculumType === "WORKSHOP" ? "Workshop" : "Theory"}</span>
              </div>
              <h2>{subject.name}</h2>
              <p>{subject.syllabusCourseCode} <span aria-hidden="true">·</span> {unitCount} {unitCount === 1 ? "section" : "sections"} <span aria-hidden="true">·</span> {subject.class.name}</p>
            </div>
          </div>
          <div className="syllabus-subject-progress">
            <div className="syllabus-subject-progress-copy">
              <strong>{subject.progressPercent}%</strong>
              <span>{subject.completedTopics}/{subject.totalTopics} topics</span>
            </div>
            <div className="syllabus-progress-track" role="progressbar"
              aria-label={subject.name + " syllabus covered"}
              aria-valuemin={0} aria-valuemax={100} aria-valuenow={subject.progressPercent}>
              <span style={{ width: subject.progressPercent + "%" }}/>
            </div>
            <span className={"syllabus-status syllabus-status-" + status}>{statusLabel(status)}</span>
          </div>
          <ChevronDown className="syllabus-expand-icon" size={19}/>
        </summary>

        <div className="syllabus-unit-list">
          {subject.units.map((unit) => (
            <section className="syllabus-unit" key={unit.code}>
              <div className="syllabus-unit-heading">
                <div>
                  <span className="syllabus-unit-label">{unit.code.replaceAll("_", " ")}</span>
                  <h3>{unit.title}</h3>
                  <p>{unit.totalTopics} topics{unit.plannedHours ? " · " + unit.plannedHours + " planned hours" : ""}</p>
                </div>
                <div className="syllabus-unit-progress">
                  <strong>{unit.progressPercent}%</strong>
                  <span>{unit.completedTopics}/{unit.totalTopics}</span>
                </div>
              </div>
              <div className="syllabus-progress-track syllabus-unit-track" role="progressbar"
                aria-label={unit.title + " progress"} aria-valuemin={0}
                aria-valuemax={100} aria-valuenow={unit.progressPercent}>
                <span style={{ width: unit.progressPercent + "%" }}/>
              </div>
              <ol className="syllabus-topic-list">
                {unit.topics.map((topic) => (
                  <li className={"syllabus-topic-row " + (topic.completed ? "is-completed" : "")}
                    key={topic.id}>
                    <div className="syllabus-topic-marker" aria-hidden="true">
                      {topic.completed ? <Check size={14}/> : <span/>}
                    </div>
                    <div className="syllabus-topic-copy">
                      <span className="syllabus-topic-title">{topic.title}</span>
                      <span className="syllabus-topic-source">Syllabus p. {topic.sourcePage}</span>
                      {topic.completed && topic.completedBy && (
                        <span className="syllabus-topic-attribution">
                          Completed by {topic.completedBy.fullName}
                          {topic.completedAt ? " · " + formatDate(topic.completedAt) : ""}
                        </span>
                      )}
                    </div>
                    {role === "teacher" ? (
                      <button type="button"
                        className={"syllabus-topic-action " + (topic.completed ? "is-undo" : "")}
                        disabled={Boolean(busyTopicId)}
                        aria-label={(topic.completed ? "Mark as not completed: " : "Mark as completed: ") + topic.title}
                        onClick={() => onToggleTopic(topic, !topic.completed)}>
                        {busyTopicId === topic.id
                          ? <LoaderCircle className="syllabus-spin" size={15}/>
                          : topic.completed
                            ? <><CheckCircle2 size={15}/> Completed</>
                            : <><CalendarCheck size={15}/> Mark complete</>}
                      </button>
                    ) : (
                      <span className={"syllabus-topic-state " + (topic.completed ? "is-complete" : "")}>
                        {topic.completed ? "Covered" : "Not covered"}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </details>
    </article>
  );
}

export default function SyllabusPage({ role = "student" }) {
  const isTeacher = role === "teacher";
  const { accessToken, sessionStatus, sessionError } = useAuth();
  const requestSequence = useRef(0);
  const [syllabus, setSyllabus] = useState(null);
  const [loadState, setLoadState] = useState("loading");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyTopicId, setBusyTopicId] = useState("");

  const loadData = useCallback(async () => {
    const requestId = ++requestSequence.current;
    if (sessionStatus !== "authenticated" || !accessToken) {
      setLoadState(sessionStatus === "restoring" ? "loading" : "error");
      setError(sessionError || "Sign in again to view the Semester V syllabus.");
      return;
    }

    setLoadState("loading");
    setError("");
    try {
      const result = isTeacher
        ? await fetchTeacherSyllabus(accessToken)
        : await fetchStudentSyllabus(accessToken);
      if (requestId !== requestSequence.current) return;
      setSyllabus(result);
      setLoadState("success");
    } catch (cause) {
      if (requestId !== requestSequence.current) return;
      setError(cause?.message || "Unable to load the Semester V syllabus.");
      setLoadState("error");
    }
  }, [accessToken, isTeacher, sessionError, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "authenticated") void loadData();
    else if (sessionStatus === "restoring") setLoadState("loading");
    else {
      setLoadState("error");
      setError(sessionError || "Your session is unavailable.");
    }
    return () => { requestSequence.current += 1; };
  }, [loadData, sessionError, sessionStatus]);

  const visibleSubjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (syllabus?.subjects || []).filter((subject) =>
      matchesSubject(subject, query) &&
      (statusFilter === "all" || subjectStatus(subject) === statusFilter)
    );
  }, [search, statusFilter, syllabus]);

  const handleToggleTopic = async (topic, completed) => {
    if (!isTeacher || busyTopicId) return;
    setBusyTopicId(topic.id);
    try {
      await updateTeacherSyllabusTopic(accessToken, topic.id, completed);
      showSuccessMessage(completed ? "Topic marked as completed." : "Topic moved back to not covered.");
      await loadData();
    } catch (cause) {
      showErrorMessage(cause?.message || "The topic progress could not be updated.");
    } finally {
      setBusyTopicId("");
    }
  };

  const summary = syllabus?.summary || {
    subjectCount: 0, totalTopics: 0, completedTopics: 0, progressPercent: 0
  };

  return (
    <main className="d-page-container syllabus-page">
      <header className="syllabus-page-heading">
        <div>
          <span className="syllabus-eyebrow"><GraduationCap size={15}/> Semester V · 2024–2028 Scheme</span>
          <h1>Syllabus Tracker</h1>
          <p>{isTeacher
            ? "Track teaching coverage for your assigned Semester V subjects. Mark each topic when it has been taught."
            : "Follow syllabus coverage in your Semester V subjects as your teachers complete each topic."}</p>
        </div>
        <span className="syllabus-source-pill">Official LTSU syllabus</span>
      </header>

      <section className="syllabus-summary-grid" aria-label="Semester V progress summary">
        <div className="syllabus-summary-card">
          <span className="syllabus-summary-icon"><BookOpen size={18}/></span>
          <span className="syllabus-summary-label">{isTeacher ? "Assigned subjects" : "Your subjects"}</span>
          <strong>{summary.subjectCount}</strong>
        </div>
        <div className="syllabus-summary-card">
          <span className="syllabus-summary-icon"><Target size={18}/></span>
          <span className="syllabus-summary-label">Topics covered</span>
          <strong>{summary.completedTopics}<small> / {summary.totalTopics}</small></strong>
        </div>
        <div className="syllabus-summary-card syllabus-summary-total">
          <span className="syllabus-summary-icon"><CheckCircle2 size={18}/></span>
          <span className="syllabus-summary-label">Overall syllabus progress</span>
          <strong>{summary.progressPercent}%</strong>
          <div className="syllabus-progress-track" role="progressbar"
            aria-label="Overall Semester V syllabus progress"
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={summary.progressPercent}>
            <span style={{ width: summary.progressPercent + "%" }}/>
          </div>
        </div>
      </section>

      <section className="syllabus-content-section">
        <div className="syllabus-list-heading">
          <div>
            <h2>{isTeacher ? "Your assigned curriculum" : "Subject-wise syllabus"}</h2>
            <p>{isTeacher
              ? "Updates are shared with students in the same class."
              : "Progress is updated when your teacher marks a topic as covered."}</p>
          </div>
          <span className="syllabus-result-count">{visibleSubjects.length} of {summary.subjectCount} subjects</span>
        </div>

        <div className="syllabus-toolbar">
          <label className="syllabus-search">
            <Search size={17}/>
            <input type="search" value={search} placeholder="Search subjects, units or topics"
              onChange={(event) => setSearch(event.target.value)}/>
          </label>
          <div className="syllabus-filter" aria-label="Filter subjects by progress">
            {STATUS_OPTIONS.map((option) => (
              <button key={option.value} type="button"
                className={statusFilter === option.value ? "active" : ""}
                aria-pressed={statusFilter === option.value}
                onClick={() => setStatusFilter(option.value)}>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {loadState === "loading" && (
          <div className="syllabus-state" role="status">
            <LoaderCircle className="syllabus-spin" size={21}/> Loading Semester V syllabus…
          </div>
        )}
        {loadState === "error" && (
          <div className="syllabus-state syllabus-state-error" role="alert">
            <AlertCircle size={19}/><span>{error}</span>
            <button type="button" onClick={loadData}><RefreshCw size={15}/> Retry</button>
          </div>
        )}
        {loadState === "success" && summary.subjectCount === 0 && (
          <div className="syllabus-state syllabus-state-empty">
            <BookOpen size={26}/>
            <strong>{isTeacher ? "No assigned Semester V syllabus subjects" : "No Semester V syllabus found for your class"}</strong>
            <span>{isTeacher
              ? "Ask an administrator to assign one of the Semester V subjects listed in the university syllabus."
              : "The Semester V curriculum appears here when your active class has the matching syllabus subjects."}</span>
          </div>
        )}
        {loadState === "success" && summary.subjectCount > 0 && visibleSubjects.length === 0 && (
          <div className="syllabus-state syllabus-state-empty">
            <Search size={23}/><strong>No matching subjects or topics</strong>
            <span>Try another search or clear the progress filter.</span>
            <button type="button" onClick={() => { setSearch(""); setStatusFilter("all"); }}>Clear filters</button>
          </div>
        )}
        {loadState === "success" && visibleSubjects.length > 0 && (
          <div className="syllabus-subject-list">
            {visibleSubjects.map((subject, index) => (
              <SubjectCard key={subject.id} subject={subject} role={role}
                onToggleTopic={handleToggleTopic} busyTopicId={busyTopicId}/>
            ))}
          </div>
        )}
      </section>

      <footer className="syllabus-page-footnote">
        <Clock3 size={14}/>
        <span>Topic titles and unit structure are mapped from the LTSU B.Tech CSE Semester V syllabus. Course codes shown beside subjects are the codes of the existing portal subject records; the official syllabus codes are shown alongside them.</span>
      </footer>
    </main>
  );
}
