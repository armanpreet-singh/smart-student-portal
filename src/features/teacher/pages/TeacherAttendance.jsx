import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ClipboardCheck,
  Copy,
  LoaderCircle,
  RefreshCw,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import StatCard from "../../../features/dashboard/components/StatCard/StatCard";
import { useAuth } from "../../auth/context/AuthContext";
import { getApiBaseUrl } from "../../auth/api/authApi";
import {
  getOfficialRollNumbersForStatus,
  getStudentsMissingRollNumberForStatus,
} from "../utils/attendanceClipboard";
import {
  fetchTeacherAssignedSubjects,
  fetchTeacherSubjectRoster,
} from "../api/teacherSubjectsApi";
import {
  fetchTeacherAttendanceForDate,
  updateTeacherAttendanceRecord,
} from "../api/teacherAttendanceCorrectionApi";
import {
  demoTeacherAttendanceSubjects,
  readDemoAttendance,
  saveDemoAttendance,
} from "../data/mockTeacherAttendance";
import "./../styles/teacherAttendance.css";

const API_BASE_URL = getApiBaseUrl();
const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "ON_DUTY_REVIEW", label: "On-duty review" },
];

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

function formatEditDeadline(value) {
  if (!value || !Number.isFinite(Date.parse(value))) return "an unavailable time";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
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

const TeacherAttendance = memo(() => {
  const { accessToken, sessionStatus } = useAuth();
  const token = accessToken || "";
  const hasLiveSession = Boolean(API_BASE_URL && token);
  const [mode, setMode] = useState(() =>
    hasLiveSession ? "loading" : "demo",
  );
  const [subjects, setSubjects] = useState(() =>
    hasLiveSession ? [] : demoTeacherAttendanceSubjects,
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState(() =>
    hasLiveSession ? "" : demoTeacherAttendanceSubjects[0]?.id || "",
  );
  const [attendanceDate, setAttendanceDate] = useState(getLocalDate);
  const [roster, setRoster] = useState([]);
  const [records, setRecords] = useState({});
  const [recordMeta, setRecordMeta] = useState({});
  const [savedRecords, setSavedRecords] = useState({});
  const [attendanceRefresh, setAttendanceRefresh] = useState(0);
  const [savingStudentId, setSavingStudentId] = useState("");
  const [marked, setMarked] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const isDemo = mode === "demo";
  const selectedSubject =
    subjects.find((subject) => subject.id === selectedSubjectId) || null;
  const markedKey = `${selectedSubjectId}:${attendanceDate}`;
  const hasSavedRecords = !isDemo && Object.keys(recordMeta).length > 0;
  const hasPartialRecords =
    hasSavedRecords &&
    roster.length > 0 &&
    roster.some((student) => !recordMeta[student.id]);
  const isMarked = isDemo
    ? Boolean(marked[markedKey])
    : hasSavedRecords &&
      roster.length > 0 &&
      roster.every((student) => Boolean(recordMeta[student.id]));

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
    const savedRecords = saved?.records || {};
    const allowedStatuses = new Set(STATUS_OPTIONS.map((option) => option.value));
    const initialRecords = Object.fromEntries(
      subject.students.map((student) => [
        student.id,
        allowedStatuses.has(savedRecords[student.id]) ? savedRecords[student.id] : "PRESENT",
      ]),
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
    if (!token || !API_BASE_URL || sessionStatus !== "authenticated") return;

    setLoading(true);
    setError("");
    try {
      // The API returns assignment records shaped as
      // { assignedAt, subject: { id, code, name, classId, class } }.
      // The attendance UI consumes the nested subject records.
      const assignments = await fetchTeacherAssignedSubjects(token);
      const nextSubjects = assignments.map((assignment) => assignment.subject);
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
  }, [token, sessionStatus]);

  useEffect(() => {
    if (mode === "loading") loadSubjects();
  }, [mode, loadSubjects]);

  useEffect(() => {
    if (sessionStatus === "unavailable" && token && mode === "loading") {
      setError(
        "The sign-in could not be verified. Retry session verification before marking attendance.",
      );
      setMode("api-error");
    }
  }, [sessionStatus, token, mode]);

  useEffect(() => {
    if (sessionStatus === "restoring" && token && mode === "api-error") {
      setError("");
      setMode("loading");
    }
  }, [sessionStatus, token, mode]);

  useEffect(() => {
    if (mode !== "api" || !selectedSubjectId || !token) return undefined;

    if (!selectedSubject?.classId) {
      setRoster([]);
      setRecords({});
      setRecordMeta({});
      setSavedRecords({});
      setLoadingRoster(false);
      setError("The selected subject does not include a valid parent class.");
      return undefined;
    }

    let active = true;
    setLoadingRoster(true);
    setRoster([]);
    setRecords({});
    setRecordMeta({});
    setSavedRecords({});
    setError("");

    Promise.all([
      fetchTeacherSubjectRoster(
        token,
        selectedSubjectId,
        selectedSubject.classId,
      ),
      fetchTeacherAttendanceForDate(token, selectedSubjectId, attendanceDate),
    ])
      .then(([rosterResult, attendanceResult]) => {
        if (!active) return;

        const nextRoster = rosterResult.students;
        const nextSavedRecords = Object.fromEntries(
          attendanceResult.records.map((record) => [
            record.studentId,
            record.status,
          ]),
        );
        const nextRecordMeta = Object.fromEntries(
          attendanceResult.records.map((record) => [
            record.studentId,
            {
              id: record.id,
              editable: record.editable,
              editableUntil: record.editableUntil,
              markedByCurrentTeacher: record.markedByCurrentTeacher,
              proofSubmitted: record.proofSubmitted,
            },
          ]),
        );

        setRoster(nextRoster);
        setSavedRecords(nextSavedRecords);
        setRecordMeta(nextRecordMeta);
        setRecords(
          Object.fromEntries(
            nextRoster.map((student) => [
              student.id,
              nextSavedRecords[student.id] || "PRESENT",
            ]),
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
  }, [
    mode,
    selectedSubjectId,
    selectedSubject?.classId,
    attendanceDate,
    attendanceRefresh,
    token,
  ]);

  useEffect(() => {
    if (mode === "demo" && selectedSubjectId) {
      hydrateDemoRoster(selectedSubjectId, attendanceDate);
    }
  }, [mode, selectedSubjectId, attendanceDate, hydrateDemoRoster]);

  const visibleRoster = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return roster;

    return roster.filter((student) =>
      [student.fullName, student.username, student.rollNumber || ""].some((value) =>
        String(value || "").toLocaleLowerCase().includes(query),
      ),
    );
  }, [roster, search]);

  const totals = useMemo(
    () =>
      roster.reduce(
        (summary, student) => {
          if (hasSavedRecords && !recordMeta[student.id]) return summary;
          const status = records[student.id] || "PRESENT";
          summary[status] = (summary[status] || 0) + 1;
          return summary;
        },
        { PRESENT: 0, ABSENT: 0, ON_DUTY_REVIEW: 0 },
      ),
    [roster, records, recordMeta, hasSavedRecords],
  );

  const recordsForClipboard = useMemo(
    () =>
      hasSavedRecords
        ? Object.fromEntries(
            Object.keys(recordMeta).map((studentId) => [
              studentId,
              records[studentId],
            ]),
          )
        : records,
    [hasSavedRecords, recordMeta, records],
  );

  const absentRollNumbers = useMemo(
    () => getOfficialRollNumbersForStatus(roster, recordsForClipboard, "ABSENT"),
    [roster, records],
  );
  const presentRollNumbers = useMemo(
    () => getOfficialRollNumbersForStatus(roster, recordsForClipboard, "PRESENT"),
    [roster, records],
  );
  const absentMissingRollNumbers = getStudentsMissingRollNumberForStatus(
    roster,
    recordsForClipboard,
    "ABSENT",
  );
  const presentMissingRollNumbers = getStudentsMissingRollNumberForStatus(
    roster,
    recordsForClipboard,
    "PRESENT",
  );
  const dutyReviewRollNumbers = useMemo(
    () => getOfficialRollNumbersForStatus(roster, recordsForClipboard, "ON_DUTY_REVIEW"),
    [roster, records],
  );
  const dutyReviewMissingRollNumbers = getStudentsMissingRollNumberForStatus(
    roster,
    recordsForClipboard,
    "ON_DUTY_REVIEW",
  );

  const copyRollNumbers = async (status) => {
    const rollNumbers = getOfficialRollNumbersForStatus(roster, recordsForClipboard, status);
    if (rollNumbers.length === 0) {
      toast.error("No official roll numbers are available for this attendance status.");
      return;
    }

    if (!navigator.clipboard?.writeText) {
      toast.error("Clipboard access is unavailable. Use a secure browser context and allow clipboard permission.");
      return;
    }

    try {
      await navigator.clipboard.writeText(rollNumbers.join("\n"));
      toast.success(
        `Copied ${rollNumbers.length} official roll number${rollNumbers.length === 1 ? "" : "s"}.`,
      );
    } catch {
      toast.error("The browser did not allow clipboard access. Check clipboard permission and try again.");
    }
  };

  const updateStatus = (studentId, status) => {
    setRecords((current) => ({ ...current, [studentId]: status }));
  };

  const changeSubject = (subjectId) => {
    setSelectedSubjectId(subjectId);
    setSearch("");
  };

  const setAllStatuses = (status) => {
    if (hasSavedRecords) return;
    setRecords(
      Object.fromEntries(roster.map((student) => [student.id, status])),
    );
  };

  const saveCorrection = async (studentId) => {
    const metadata = recordMeta[studentId];
    const nextStatus = records[studentId];
    if (
      !metadata?.editable ||
      !metadata.markedByCurrentTeacher ||
      metadata.proofSubmitted ||
      !nextStatus ||
      nextStatus === savedRecords[studentId] ||
      !metadata.id
    ) {
      return;
    }

    setSavingStudentId(studentId);
    setError("");
    try {
      const updated = await updateTeacherAttendanceRecord(
        token,
        metadata.id,
        { status: nextStatus },
      );
      setRecords((current) => ({ ...current, [studentId]: updated.status }));
      setSavedRecords((current) => ({ ...current, [studentId]: updated.status }));
      setRecordMeta((current) => ({
        ...current,
        [studentId]: {
          ...current[studentId],
          editable: updated.editable,
          editableUntil: updated.editableUntil,
        },
      }));
      toast.success("Attendance correction saved.");
    } catch (cause) {
      setError(normalizeError(cause));
      toast.error("Attendance correction was not saved.");
      if (cause?.status === 409) {
        setAttendanceRefresh((value) => value + 1);
      }
    } finally {
      setSavingStudentId("");
    }
  };

  const refreshRegister = () => {
    setAttendanceRefresh((value) => value + 1);
  };

  const submitAttendance = async () => {
    if (!selectedSubject || roster.length === 0 || isMarked || hasSavedRecords) return;

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
      const result = await requestApi(
        `/api/teacher/subjects/${encodeURIComponent(selectedSubjectId)}/attendance`,
        token,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        },
      );

      if (
        result?.subjectId !== selectedSubjectId ||
        result?.attendanceDate !== attendanceDate ||
        !Array.isArray(result.records) ||
        result.records.length !== roster.length ||
        !result.records.every(
          (record) =>
            typeof record.id === "string" &&
            typeof record.studentId === "string" &&
            STATUS_OPTIONS.some((option) => option.value === record.status) &&
            typeof record.editable === "boolean" &&
            typeof record.editableUntil === "string" &&
            Number.isFinite(Date.parse(record.editableUntil)),
        )
      ) {
        setAttendanceRefresh((value) => value + 1);
        throw new Error(
          "The server did not return a complete attendance confirmation. Refresh the register before making another submission.",
        );
      }

      const nextSavedRecords = Object.fromEntries(
        result.records.map((record) => [record.studentId, record.status]),
      );
      const nextRecordMeta = Object.fromEntries(
        result.records.map((record) => [
          record.studentId,
          {
            id: record.id,
            editable: record.editable,
            editableUntil: record.editableUntil,
            markedByCurrentTeacher: true,
            proofSubmitted: false,
          },
        ]),
      );
      setSavedRecords(nextSavedRecords);
      setRecordMeta(nextRecordMeta);
      setRecords(nextSavedRecords);
      setMarked((current) => ({ ...current, [markedKey]: true }));
      toast.success("Attendance marked successfully. Eligible records can be corrected for 30 minutes.");
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
      title: "Absent / Duty Review",
      value: totals.ABSENT + totals.ON_DUTY_REVIEW,
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
              placeholder="Search by name, username or roll number"
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
            <span>On-duty review</span>
            <strong>{totals.ON_DUTY_REVIEW}</strong>
          </div>
        </div>

        {error && (
          <div className="teacher-attendance-alert" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {hasSavedRecords && (
          <div className="teacher-attendance-correction-notice" role="status">
            <div>
              <strong>Existing attendance register loaded</strong>
              <span>
                Corrections are available only to the Teacher who originally
                marked each record, for 30 minutes after submission. A record
                is locked after duty proof is submitted.
              </span>
              {hasPartialRecords && (
                <span>
                  This register contains only some Student records. Existing
                  records can be corrected when eligible; the missing records
                  cannot be added to this already-submitted register.
                </span>
              )}
            </div>
            <button type="button" onClick={refreshRegister} disabled={loading || loadingRoster}>
              <RefreshCw size={14} />
              Refresh register
            </button>
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
              disabled={!roster.length || hasSavedRecords || loading}
            >
              All present
            </button>
            <button
              type="button"
              onClick={() => setAllStatuses("ABSENT")}
              disabled={!roster.length || hasSavedRecords || loading}
            >
              All absent
            </button>
            <button
              type="button"
              onClick={() => setAllStatuses("ON_DUTY_REVIEW")}
              disabled={!roster.length || hasSavedRecords || loading}
            >
              All on-duty review
            </button>
            <button
              type="button"
              onClick={() => copyRollNumbers("ABSENT")}
              disabled={!absentRollNumbers.length || loadingRoster || loading}
              aria-label={`Copy ${absentRollNumbers.length} absent student roll numbers`}
            >
              <Copy size={14} />
              Copy Absentees ({absentRollNumbers.length})
            </button>
            <button
              type="button"
              onClick={() => copyRollNumbers("PRESENT")}
              disabled={!presentRollNumbers.length || loadingRoster || loading}
              aria-label={`Copy ${presentRollNumbers.length} present student roll numbers`}
            >
              <Copy size={14} />
              Copy Presentees ({presentRollNumbers.length})
            </button>
            <button
              type="button"
              onClick={() => copyRollNumbers("ON_DUTY_REVIEW")}
              disabled={!dutyReviewRollNumbers.length || loadingRoster || loading}
              aria-label={`Copy ${dutyReviewRollNumbers.length} on-duty review student roll numbers`}
            >
              <Copy size={14} />
              Copy Duty Reviews ({dutyReviewRollNumbers.length})
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
            {visibleRoster.map((student, index) => {
              const metadata = recordMeta[student.id];
              const canChangeStatus = isDemo
                ? !isMarked
                : hasSavedRecords
                  ? Boolean(metadata?.editable)
                  : true;
              const hasUnsavedCorrection =
                Boolean(metadata) &&
                records[student.id] !== savedRecords[student.id];
              const canSaveCorrection =
                !isDemo &&
                metadata?.editable &&
                metadata.markedByCurrentTeacher &&
                !metadata.proofSubmitted &&
                hasUnsavedCorrection &&
                savingStudentId !== student.id;

              return (
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
                    <small className="teacher-attendance-roll-number">
                      {student.rollNumber || "Official roll number not assigned"}
                    </small>
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
                        disabled={!canChangeStatus || loading || savingStudentId === student.id}
                        aria-pressed={selected}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                {metadata && (
                  <div className="teacher-attendance-row-meta">
                    {metadata.proofSubmitted ? (
                      <span>Locked · duty proof submitted</span>
                    ) : !metadata.markedByCurrentTeacher ? (
                      <span>Read-only · marked by another Teacher</span>
                    ) : metadata.editable ? (
                      <>
                        <span>Editable until {formatEditDeadline(metadata.editableUntil)}</span>
                        {hasUnsavedCorrection && (
                          <button
                            type="button"
                            className="teacher-attendance-save-correction"
                            onClick={() => saveCorrection(student.id)}
                            disabled={!canSaveCorrection || loading}
                          >
                            {savingStudentId === student.id ? (
                              <LoaderCircle className="teacher-attendance-spinner" size={14} />
                            ) : (
                              <ClipboardCheck size={14} />
                            )}
                            Save correction
                          </button>
                        )}
                      </>
                    ) : (
                      <span>Correction window expired</span>
                    )}
                  </div>
                )}
              </motion.div>
              );
            })}
          </div>
        )}

        <div className="teacher-attendance-submit">
          <div>
            <strong>{roster.length} students</strong>
            <span>
              {hasSavedRecords
                ? hasPartialRecords
                  ? "A partial register already exists. Only eligible existing rows can be corrected."
                  : "Attendance is submitted. Save individual corrections within the 30-minute window."
                : "Review each status before submitting. Eligible records can be corrected for 30 minutes after submission."}
            </span>
          </div>
          <button
            type="button"
            className="d-btn-primary"
            onClick={submitAttendance}
            disabled={
              !roster.length || isMarked || hasSavedRecords || loading || loadingRoster
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
            {isMarked
              ? "Attendance marked"
              : hasPartialRecords
                ? "Partial register exists"
                : hasSavedRecords
                  ? "Attendance submitted"
                  : "Submit attendance"}
          </button>
        </div>
      </DashboardCard>

      <div className="teacher-attendance-integration-note">
        <AlertCircle size={16} />
        <p>
          Clipboard output contains only official roll numbers, one per line,
          grouped by PRESENT, ABSENT or ON_DUTY_REVIEW. Students without an
          official roll number are excluded
          {absentMissingRollNumbers + presentMissingRollNumbers + dutyReviewMissingRollNumbers > 0
            ? ` (${absentMissingRollNumbers + presentMissingRollNumbers + dutyReviewMissingRollNumbers} currently marked students do not have one).`
            : "."}
        </p>
      </div>

      <div className="teacher-attendance-integration-note">
        <AlertCircle size={16} />
        <p>
          ON_DUTY_REVIEW is counted as not present until the Student submits
          proof successfully. A successful proof submission changes that
          Student's attendance record to PRESENT.
        </p>
      </div>

      {isDemo && (
        <p className="teacher-attendance-demo-note">
          Demo mode · Attendance is stored in this browser only. Sign in with
          a teacher account to use the live attendance service. The shared
          authentication provider manages and verifies your session.
        </p>
      )}
    </div>
  );
});

export default TeacherAttendance;
