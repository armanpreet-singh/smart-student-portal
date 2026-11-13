import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ClipboardCheck,
  LoaderCircle,
  RefreshCw,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import StatCard from "../../../features/dashboard/components/StatCard/StatCard";
import {
  demoTeacherAttendanceSubjects,
  readDemoAttendance,
  saveDemoAttendance,
} from "../data/mockTeacherAttendance";
import "./../styles/teacherAttendance.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "LATE", label: "Late" },
  { value: "EXCUSED", label: "Excused" },
];

function readAccessToken() {
  try {
    return window.localStorage.getItem("ltsu-access-token") || "";
  } catch {
    return "";
  }
}

function getLocalDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function normalizeError(error) {
  if (error?.name === "AbortError") {
    return "The request timed out. Check the API connection and try again.";
  }
  return error?.message || "Something went wrong. Please try again.";
}

async function requestApi(path, token, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 12000);

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
      throw new Error(
        payload?.message || `Request failed with status ${response.status}.`,
      );
    }

    return payload?.data ?? payload;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

const readInitialMode = () =>
  API_BASE_URL && readAccessToken() ? "loading" : "demo";

const readInitialSubjects = () =>
  readInitialMode() === "demo" ? demoTeacherAttendanceSubjects : [];

const TeacherAttendance = memo(() => {
  const [token] = useState(readAccessToken);
  const [mode, setMode] = useState(readInitialMode);
  const [subjects, setSubjects] = useState(readInitialSubjects);
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    () => readInitialSubjects()[0]?.id || "",
  );
  const [attendanceDate, setAttendanceDate] = useState(getLocalDate);
  const [roster, setRoster] = useState([]);
  const [records, setRecords] = useState({});
  const [marked, setMarked] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const isDemo = mode === "demo";
  const selectedSubject =
    subjects.find((subject) => subject.id === selectedSubjectId) || null;
  const markedKey = `${selectedSubjectId}:${attendanceDate}`;
  const isMarked = Boolean(marked[markedKey]);

  const hydrateDemoRoster = useCallback((subjectId, date) => {
    const subject = demoTeacherAttendanceSubjects.find(
      (item) => item.id === subjectId,
    );
    if (!subject) {
      setRoster([]);
      setRecords({});
      return;
    }

    const saved = readDemoAttendance()[`${subjectId}:${date}`];
    const initialRecords =
      saved?.records ||
      Object.fromEntries(
        subject.students.map((student) => [student.id, "PRESENT"]),
      );

    setRoster(subject.students);
    setRecords(initialRecords);
    setMarked((current) => ({
      ...current,
      [`${subjectId}:${date}`]: Boolean(saved?.marked),
    }));
    setError("");
  }, []);

  const loadSubjects = useCallback(async () => {
    if (!token || !API_BASE_URL) return;

    setLoading(true);
    setError("");
    try {
      const result = await requestApi("/api/teacher/subjects", token);
      const nextSubjects = Array.isArray(result.subjects)
        ? result.subjects
        : [];
      setSubjects(nextSubjects);
      setSelectedSubjectId((current) =>
        nextSubjects.some((subject) => subject.id === current)
          ? current
          : nextSubjects[0]?.id || "",
      );
      setMode("api");
    } catch (cause) {
      setError(normalizeError(cause));
      setMode("api-error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (mode === "loading") loadSubjects();
  }, [mode, loadSubjects]);

  useEffect(() => {
    if (mode !== "api" || !selectedSubjectId || !token) return undefined;

    let active = true;
    setLoadingRoster(true);
    setError("");

    requestApi(
      `/api/teacher/subjects/${encodeURIComponent(selectedSubjectId)}/roster`,
      token,
    )
      .then((result) => {
        if (!active) return;
        const nextRoster = Array.isArray(result.students) ? result.students : [];
        setRoster(nextRoster);
        setRecords(
          Object.fromEntries(
            nextRoster.map((student) => [student.id, "PRESENT"]),
          ),
        );
      })
      .catch((cause) => {
        if (active) setError(normalizeError(cause));
      })
      .finally(() => {
        if (active) setLoadingRoster(false);
      });

    return () => {
      active = false;
    };
  }, [mode, selectedSubjectId, token]);

  useEffect(() => {
    if (mode === "demo" && selectedSubjectId) {
      hydrateDemoRoster(selectedSubjectId, attendanceDate);
    }
  }, [mode, selectedSubjectId, attendanceDate, hydrateDemoRoster]);

  const visibleRoster = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return roster;

    return roster.filter((student) =>
      [student.fullName, student.username].some((value) =>
        String(value || "").toLocaleLowerCase().includes(query),
      ),
    );
  }, [roster, search]);

  const totals = useMemo(
    () =>
      roster.reduce(
        (summary, student) => {
          const status = records[student.id] || "PRESENT";
          summary[status] = (summary[status] || 0) + 1;
          return summary;
        },
        { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 },
      ),
    [roster, records],
  );

  const updateStatus = (studentId, status) => {
    setRecords((current) => ({ ...current, [studentId]: status }));
  };

  const changeSubject = (subjectId) => {
    setSelectedSubjectId(subjectId);
    setSearch("");
  };

  const setAllStatuses = (status) => {
    setRecords(
      Object.fromEntries(roster.map((student) => [student.id, status])),
    );
  };

  const submitAttendance = async () => {
    if (!selectedSubject || roster.length === 0 || isMarked) return;

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
      try {
        saveDemoAttendance(selectedSubjectId, attendanceDate, records);
        setMarked((current) => ({ ...current, [markedKey]: true }));
        toast.success("Demo attendance saved in this browser.");
      } catch {
        setError("This browser could not save demo attendance locally.");
        toast.error("Demo attendance was not saved.");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      await requestApi(
        `/api/teacher/subjects/${encodeURIComponent(selectedSubjectId)}/attendance`,
        token,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        },
      );
      setMarked((current) => ({ ...current, [markedKey]: true }));
      toast.success("Attendance marked successfully.");
    } catch (cause) {
      setError(normalizeError(cause));
      toast.error("Attendance was not saved.");
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = [
    {
      id: "subjects",
      title: "Assigned Subjects",
      value: subjects.length,
      icon: "BookOpen",
      trend: "Active teaching assignments",
      color: "#1E3A8A",
    },
    {
      id: "students",
      title: "Students in Class",
      value: roster.length,
      icon: "Users",
      trend: selectedSubject?.class?.name || "Select a subject",
      color: "#16A34A",
    },
    {
      id: "absent",
      title: "Absent / Excused",
      value: totals.ABSENT + totals.EXCUSED,
      icon: "AlertCircle",
      trend: "Current register",
      color: "#DC2626",
    },
  ];

  return (
    <div className="d-page-container">
      <SectionHeader
        title="Mark Attendance"
        subtitle="Choose an assigned subject, review its roster, and submit the daily attendance register"
      />

      <div className="d-grid-3">
        {summaryCards.map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </div>

      <DashboardCard>
        <div className="teacher-attendance-controls">
          <label className="d-form-group">
            <span>Subject / Class</span>
            <select
              value={selectedSubjectId}
              onChange={(event) => changeSubject(event.target.value)}
              disabled={loading || subjects.length === 0}
            >
              {subjects.length === 0 && (
                <option value="">No assigned subjects</option>
              )}
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.code} · {subject.name} —{" "}
                  {subject.class?.name || subject.class?.code}
                </option>
              ))}
            </select>
          </label>

          <label className="d-form-group">
            <span>Attendance date</span>
            <input
              type="date"
              value={attendanceDate}
              max={getLocalDate()}
              onChange={(event) => setAttendanceDate(event.target.value)}
            />
          </label>

          <label className="d-form-group">
            <span>Find student</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or username"
            />
          </label>
        </div>

        <div className="teacher-attendance-summary">
          <div>
            <span>Present</span>
            <strong>{totals.PRESENT}</strong>
          </div>
          <div>
            <span>Absent</span>
            <strong>{totals.ABSENT}</strong>
          </div>
          <div>
            <span>Late</span>
            <strong>{totals.LATE}</strong>
          </div>
          <div>
            <span>Excused</span>
            <strong>{totals.EXCUSED}</strong>
          </div>
        </div>

        {error && (
          <div className="teacher-attendance-alert" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {mode === "api-error" && (
          <div className="teacher-attendance-api-retry">
            <button
              type="button"
              className="d-btn-primary"
              onClick={loadSubjects}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Retry API connection
            </button>
            <span>
              The API request failed. The page has not silently replaced live
              data with demo records.
            </span>
          </div>
        )}
      </DashboardCard>

      <DashboardCard padding={false}>
        <div className="teacher-attendance-roster-heading">
          <div>
            <h4>{selectedSubject?.name || "Student roster"}</h4>
            <p>
              {selectedSubject?.class?.name || "Choose an assigned class"} ·{" "}
              {formatDate(attendanceDate)}
            </p>
          </div>
          <div className="teacher-attendance-actions">
            <button
              type="button"
              onClick={() => setAllStatuses("PRESENT")}
              disabled={!roster.length || isMarked || loading}
            >
              All present
            </button>
            <button
              type="button"
              onClick={() => setAllStatuses("ABSENT")}
              disabled={!roster.length || isMarked || loading}
            >
              All absent
            </button>
          </div>
        </div>

        {loadingRoster ? (
          <div className="teacher-attendance-state" role="status">
            <LoaderCircle
              className="teacher-attendance-spinner"
              size={22}
            />
            Loading assigned class roster…
          </div>
        ) : roster.length === 0 ? (
          <div className="teacher-attendance-state">
            <Users size={24} />
            <strong>No roster available</strong>
            <span>
              Select an assigned active subject or check the teacher's subject
              assignment.
            </span>
          </div>
        ) : visibleRoster.length === 0 ? (
          <div className="teacher-attendance-state">
            No students match “{search}”.
          </div>
        ) : (
          <div className="teacher-attendance-roster">
            {visibleRoster.map((student, index) => (
              <motion.div
                key={student.id}
                className="teacher-attendance-student"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.025 }}
              >
                <div className="teacher-attendance-student-info">
                  <span className="teacher-attendance-student-index">
                    {index + 1}
                  </span>
                  <div>
                    <strong>{student.fullName}</strong>
                    <span>{student.username}</span>
                  </div>
                </div>

                <div
                  className="teacher-attendance-status-group"
                  role="group"
                  aria-label={`Attendance for ${student.fullName}`}
                >
                  {STATUS_OPTIONS.map((option) => {
                    const selected =
                      (records[student.id] || "PRESENT") === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`teacher-attendance-status ${selected ? "active" : ""}`}
                        onClick={() => updateStatus(student.id, option.value)}
                        disabled={isMarked || loading}
                        aria-pressed={selected}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="teacher-attendance-submit">
          <div>
            <strong>{roster.length} students</strong>
            <span>
              {isMarked
                ? "Attendance submitted for this subject and date."
                : "Review each status before submitting. Submission is final for the selected date."}
            </span>
          </div>
          <button
            type="button"
            className="d-btn-primary"
            onClick={submitAttendance}
            disabled={
              !roster.length || isMarked || loading || loadingRoster
            }
          >
            {loading ? (
              <LoaderCircle
                className="teacher-attendance-spinner"
                size={17}
              />
            ) : (
              <ClipboardCheck size={17} />
            )}
            {isMarked ? "Attendance marked" : "Submit attendance"}
          </button>
        </div>
      </DashboardCard>

      <div className="teacher-attendance-integration-note">
        <AlertCircle size={16} />
        <p>
          The current backend roster returns student IDs, names, and usernames,
          but no rollNumber. Copy Absentees / Copy Presentees therefore remain
          unavailable: usernames and database IDs are not substitutes for
          official roll numbers.
        </p>
      </div>

      {!isDemo && (
        <div className="teacher-attendance-integration-note">
          <AlertCircle size={16} />
          <p>
            This screen follows the currently deployed API statuses (PRESENT,
            ABSENT, LATE, EXCUSED). The separately confirmed ON_DUTY_REVIEW
            policy is not yet implemented on backend main.
          </p>
        </div>
      )}

      {isDemo && (
        <p className="teacher-attendance-demo-note">
          Demo mode · Attendance is stored in this browser only. Live API mode
          requires VITE_API_BASE_URL and a valid teacher access token in
          localStorage under “ltsu-access-token”.
        </p>
      )}
    </div>
  );
});

export default TeacherAttendance;
