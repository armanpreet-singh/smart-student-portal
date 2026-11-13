import React, { memo, useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  LoaderCircle,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import StatCard from "../../../features/dashboard/components/StatCard/StatCard";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const DEMO_SUBJECTS = [
  {
    id: "demo-dbms",
    code: "DBMS",
    name: "Database Management Systems",
    classId: "demo-class-5a",
    class: { id: "demo-class-5a", code: "CSE-5A", name: "5th Semester · Section A", academicYear: "2026-27" },
    assignedAt: null,
    demoTime: "09:00 AM",
    students: [
      { id: "demo-student-23", fullName: "Aarav Sharma", username: "aarav.sharma" },
      { id: "demo-student-45", fullName: "Meera Kaur", username: "meera.kaur" },
      { id: "demo-student-55", fullName: "Rohan Singh", username: "rohan.singh" },
      { id: "demo-student-67", fullName: "Simran Gill", username: "simran.gill" },
    ],
  },
  {
    id: "demo-cn",
    code: "CN",
    name: "Computer Networks",
    classId: "demo-class-5b",
    class: { id: "demo-class-5b", code: "CSE-5B", name: "5th Semester · Section B", academicYear: "2026-27" },
    assignedAt: null,
    demoTime: "11:00 AM",
    students: [
      { id: "demo-student-31", fullName: "Ishita Verma", username: "ishita.verma" },
      { id: "demo-student-32", fullName: "Kabir Saini", username: "kabir.saini" },
      { id: "demo-student-33", fullName: "Ananya Das", username: "ananya.das" },
    ],
  },
  {
    id: "demo-os",
    code: "OS",
    name: "Operating Systems",
    classId: "demo-class-3a",
    class: { id: "demo-class-3a", code: "CSE-3A", name: "3rd Semester · Section A", academicYear: "2026-27" },
    assignedAt: null,
    demoTime: "02:00 PM",
    students: [
      { id: "demo-student-12", fullName: "Dev Malhotra", username: "dev.malhotra" },
      { id: "demo-student-14", fullName: "Naina Joshi", username: "naina.joshi" },
    ],
  },
];

const EMPTY_RECORDS = {};
const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "LATE", label: "Late" },
  { value: "EXCUSED", label: "Excused" },
];
const todayIso = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
};
const formatTime = (value) => value || "Class time not provided";
const normalizeError = (error) => {
  if (error?.name === "AbortError") return "The request timed out. Please try again.";
  return error?.message || "Something went wrong. Please try again.";
};

async function requestApi(path, token, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.error?.message || payload?.message || `Request failed (${response.status}).`;
      throw new Error(message);
    }
    return payload?.data ?? payload;
  } finally {
    window.clearTimeout(timeout);
  }
}

const getDemoState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("ltsu-teacher-attendance-demo") || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
};

const TeacherAttendance = memo(() => {
  const [token, setToken] = useState(() => localStorage.getItem("ltsu-access-token") || "");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(todayIso);
  const [roster, setRoster] = useState([]);
  const [records, setRecords] = useState(EMPTY_RECORDS);
  const [marked, setMarked] = useState({});
  const [mode, setMode] = useState(token && API_BASE_URL ? "loading" : "demo");
  const [loading, setLoading] = useState(false);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [savedDemo, setSavedDemo] = useState(getDemoState);

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId) || null;
  const isDemo = mode === "demo";
  const isConfiguredApi = Boolean(API_BASE_URL);

  const hydrateDemo = useCallback((subjectId, date) => {
    const subject = DEMO_SUBJECTS.find((item) => item.id === subjectId);
    if (!subject) return;
    const key = `${subjectId}:${date}`;
    const previous = getDemoState()[key];
    const nextRoster = subject.students;
    const nextRecords = previous?.records || Object.fromEntries(nextRoster.map((student) => [student.id, "PRESENT"]));
    setRoster(nextRoster);
    setRecords(nextRecords);
    setMarked((current) => ({ ...current, [key]: Boolean(previous?.marked) }));
    setError("");
  }, []);

  const loadSubjects = useCallback(async (accessToken) => {
    setLoading(true);
    setError("");
    try {
      const result = await requestApi("/api/teacher/subjects", accessToken);
      const list = Array.isArray(result.subjects) ? result.subjects : [];
      setSubjects(list);
      setSelectedSubjectId((current) => list.some((subject) => subject.id === current) ? current : (list[0]?.id || ""));
      setMode("api");
    } catch (cause) {
      setError(normalizeError(cause));
      setMode("api-error");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (mode === "loading" && token && API_BASE_URL) loadSubjects(token);
  }, [mode, token, loadSubjects]);

  React.useEffect(() => {
    if (mode !== "api" || !selectedSubjectId || !token) return;
    let active = true;
    setLoadingRoster(true);
    setError("");
    requestApi(`/api/teacher/subjects/${encodeURIComponent(selectedSubjectId)}/roster`, token)
      .then((result) => {
        if (!active) return;
        const list = Array.isArray(result.students) ? result.students : [];
        setRoster(list);
        setRecords(Object.fromEntries(list.map((student) => [student.id, "PRESENT"])));
        setMarked((current) => ({ ...current, [`${selectedSubjectId}:${attendanceDate}`]: false }));
      })
      .catch((cause) => { if (active) setError(normalizeError(cause)); })
      .finally(() => { if (active) setLoadingRoster(false); });
    return () => { active = false; };
  }, [mode, selectedSubjectId, token]);

  React.useEffect(() => {
    if (mode === "demo" && selectedSubjectId) hydrateDemo(selectedSubjectId, attendanceDate);
  }, [mode, selectedSubjectId, attendanceDate, hydrateDemo]);

  const visibleRoster = useMemo(() => {
    const query = search.trim().toLowerCase();
    return roster.filter((student) =>
      !query || student.fullName.toLowerCase().includes(query) || student.username.toLowerCase().includes(query)
    );
  }, [roster, search]);

  const totals = useMemo(() => roster.reduce((summary, student) => {
    const status = records[student.id] || "PRESENT";
    summary[status] = (summary[status] || 0) + 1;
    return summary;
  }, { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 }), [roster, records]);

  const updateStatus = (studentId, status) => {
    setRecords((current) => ({ ...current, [studentId]: status }));
  };

  const changeSubject = (nextId) => {
    setSelectedSubjectId(nextId);
    setSearch("");
  };

  const saveAttendance = async () => {
    if (!selectedSubject || roster.length === 0) return;
    setLoading(true);
    setError("");
    const requestBody = {
      attendanceDate,
      records: roster.map((student) => ({
        studentId: student.id,
        status: records[student.id] || "PRESENT",
      })),
    };

    if (isDemo) {
      const state = getDemoState();
      const key = `${selectedSubjectId}:${attendanceDate}`;
      state[key] = { marked: true, records };
      localStorage.setItem("ltsu-teacher-attendance-demo", JSON.stringify(state));
      setSavedDemo(state);
      setMarked((current) => ({ ...current, [key]: true }));
      toast.success("Demo attendance saved in this browser.");
      setLoading(false);
      return;
    }

    if (!token || !isConfiguredApi) {
      setError("API integration is not configured. Enter an API URL and sign in before submitting.");
      setLoading(false);
      return;
    }

    try {
      await requestApi(`/api/teacher/subjects/${encodeURIComponent(selectedSubjectId)}/attendance`, token, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });
      setMarked((current) => ({ ...current, [`${selectedSubjectId}:${attendanceDate}`]: true }));
      toast.success("Attendance marked successfully.");
    } catch (cause) {
      setError(normalizeError(cause));
      toast.error("Attendance was not saved.");
    } finally {
      setLoading(false);
    }
  };

  const markedKey = `${selectedSubjectId}:${attendanceDate}`;
  const isMarked = Boolean(marked[markedKey]);
  const setAll = (status) => setRecords(Object.fromEntries(roster.map((student) => [student.id, status])));

  return (
    <div className="d-page-container">
      <SectionHeader
        title="Mark Attendance"
        subtitle="Review your assigned subjects, mark each student, and submit the class register"
      />

      <div className="d-grid-3">
        <StatCard title="Assigned Subjects" value={String(subjects.length || (isDemo ? DEMO_SUBJECTS.length : 0))} icon="BookOpen" trend="Active teaching assignments" color="#1E3A8A" />
        <StatCard title="Students in Class" value={String(roster.length)} icon="Users" trend={selectedSubject?.class?.name || "Select a subject"} color="#16A34A" />
        <StatCard title="Absent / Excused" value={String(totals.ABSENT + totals.EXCUSED)} icon="AlertCircle" trend="Including excused records" color="#DC2626" />
      </div>

      <DashboardCard>
        <div className="teacher-attendance-controls">
          <label className="d-form-group">
            <span>Subject / Class</span>
            <select value={selectedSubjectId} onChange={(event) => changeSubject(event.target.value)} disabled={loading || subjects.length === 0}>
              {subjects.length === 0 && <option value="">No assigned subjects</option>}
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.code} · {subject.name} — {subject.class?.name || subject.class?.code}</option>)}
            </select>
          </label>
          <label className="d-form-group">
            <span>Attendance date</span>
            <input type="date" value={attendanceDate} max={todayIso()} onChange={(event) => setAttendanceDate(event.target.value)} />
          </label>
          <label className="d-form-group">
            <span>Find student</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by student name or username" />
          </label>
        </div>

        <div className="teacher-attendance-summary">
          <div><span>Present</span><strong>{totals.PRESENT}</strong></div>
          <div><span>Absent</span><strong>{totals.ABSENT}</strong></div>
          <div><span>Late</span><strong>{totals.LATE}</strong></div>
          <div><span>Excused</span><strong>{totals.EXCUSED}</strong></div>
        </div>

        {error && <div className="teacher-attendance-alert" role="alert"><AlertCircle size={18} />{error}</div>}
        {mode === "api-error" && (
          <div className="teacher-attendance-api-retry">
            <button type="button" className="d-btn-primary" onClick={() => loadSubjects(token)} disabled={loading}><RefreshCw size={16} /> Retry API connection</button>
            <span>Demo mode remains available when no valid session is present.</span>
          </div>
        )}
      </DashboardCard>

      <DashboardCard padding={false}>
        <div className="teacher-attendance-roster-heading">
          <div>
            <h4>{selectedSubject?.name || "Student roster"}</h4>
            <p>{selectedSubject?.class?.name || "Choose an assigned class"} · {formatDate(attendanceDate)} · {formatTime(selectedSubject?.classTime || selectedSubject?.demoTime)}</p>
          </div>
          <div className="teacher-attendance-actions">
            <button type="button" className="d-btn-secondary" onClick={() => setAll("PRESENT")} disabled={!roster.length || isMarked}>All present</button>
            <button type="button" className="d-btn-secondary" onClick={() => setAll("ABSENT")} disabled={!roster.length || isMarked}>All absent</button>
          </div>
        </div>

        {loadingRoster ? (
          <div className="teacher-attendance-state"><LoaderCircle className="teacher-attendance-spinner" size={22} />Loading assigned class roster…</div>
        ) : roster.length === 0 ? (
          <div className="teacher-attendance-state"><Users size={24} /><strong>No roster available</strong><span>Select an assigned active subject or check your teacher assignment.</span></div>
        ) : visibleRoster.length === 0 ? (
          <div className="teacher-attendance-state">No students match “{search}”.</div>
        ) : (
          <div className="teacher-attendance-roster">
            {visibleRoster.map((student, index) => (
              <motion.div key={student.id} className="teacher-attendance-student" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.025 }}>
                <div className="teacher-attendance-student-info">
                  <span className="teacher-attendance-student-index">{index + 1}</span>
                  <div><strong>{student.fullName}</strong><span>{student.username}</span></div>
                </div>
                <div className="teacher-attendance-status-group" role="group" aria-label={`Attendance for ${student.fullName}`}>
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`teacher-attendance-status ${(records[student.id] || "PRESENT") === option.value ? "active" : ""}`}
                      onClick={() => updateStatus(student.id, option.value)}
                      disabled={isMarked || loading}
                      aria-pressed={(records[student.id] || "PRESENT") === option.value}
                    >{option.label}</button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="teacher-attendance-submit">
          <div><strong>{roster.length} students</strong><span>{isMarked ? "Attendance submitted for this date." : "Changes stay in this screen until submission."}</span></div>
          <button type="button" className="d-btn-primary" onClick={saveAttendance} disabled={!roster.length || isMarked || loading || loadingRoster}>
            {loading ? <LoaderCircle className="teacher-attendance-spinner" size={17} /> : <ClipboardCheck size={17} />}
            {isMarked ? "Attendance marked" : "Submit attendance"}
          </button>
        </div>
      </DashboardCard>

      <div className="teacher-attendance-integration-note">
        <AlertCircle size={16} />
        <p>Student roll numbers are not included in the current roster API. Copy Absentees / Copy Presentees will be enabled when the backend provides a dedicated rollNumber field; usernames are not substituted for roll numbers.</p>
      </div>

      {isDemo && <p className="teacher-attendance-demo-note">Demo mode · Changes are stored in this browser only. Sign in with an API session to use the backend.</p>}
    </div>
  );
});

export default TeacherAttendance;
