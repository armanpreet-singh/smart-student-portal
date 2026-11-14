import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ClipboardList, RotateCw, UserRound, BookOpen, X } from "lucide-react";

import { useAuth } from "../../auth/context/AuthContext";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import { fetchAdminTeachers } from "../api/adminTeachersApi";
import { fetchAdminSubjects } from "../api/adminCatalogueApi";
import { createTeacherSubjectAssignment } from "../api/adminTeacherSubjectAssignmentsApi";

import "./TeacherSubjectAssignmentsPage.css";

const PAGE_SIZE = 100;
const MAX_OPTION_PAGES = 100;

function createOptionError(message, status = 0) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function fetchEveryPage(fetchPage, collectionKey) {
  const first = await fetchPage(1);
  const totalPages = Math.max(first.pagination.totalPages, 1);

  if (totalPages > MAX_OPTION_PAGES) {
    throw createOptionError(
      "There are more than 10,000 records to choose from. Narrow the directory first or contact support.",
      502,
    );
  }

  if (totalPages === 1) return first[collectionKey];

  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchPage(index + 2),
    ),
  );

  return [
    ...first[collectionKey],
    ...remaining.flatMap((page) => page[collectionKey]),
  ];
}

function LoadingState() {
  return (
    <div className="a-teacher-assignment-state" role="status" aria-live="polite">
      <span className="a-teacher-assignment-spinner" aria-hidden="true" />
      <div>
        <h3>Loading assignment choices</h3>
        <p>Retrieving active teacher accounts and eligible subjects.</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="a-teacher-assignment-state error" role="alert">
      <div>
        <h3>Assignment choices unavailable</h3>
        <p>{message}</p>
      </div>
      <button type="button" className="d-btn-primary" onClick={onRetry}>
        <RotateCw size={16} />
        Retry
      </button>
    </div>
  );
}

function formatAssignedAt(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "just now";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const TeacherSubjectAssignmentsPage = () => {
  const { accessToken, refreshCurrentUser } = useAuth();

  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [optionStatus, setOptionStatus] = useState("loading");
  const [optionError, setOptionError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      setOptionStatus("loading");
      setOptionError("");
      setTeachers([]);
      setSubjects([]);

      try {
        const [teacherOptions, subjectOptions] = await Promise.all([
          fetchEveryPage(
            (page) => fetchAdminTeachers(accessToken, {
              page,
              pageSize: PAGE_SIZE,
              isActive: "true",
            }),
            "users",
          ),
          fetchEveryPage(
            (page) => fetchAdminSubjects(accessToken, {
              page,
              pageSize: PAGE_SIZE,
              isActive: "true",
            }),
            "rows",
          ),
        ]);

        if (!active) return;

        setTeachers(teacherOptions.filter(
          (teacher) => teacher.role === "TEACHER" && teacher.isActive,
        ));
        setSubjects(subjectOptions.filter(
          (subject) =>
            subject.isActive &&
            subject.class?.isActive === true,
        ));
        setOptionStatus("success");
      } catch (error) {
        if (!active) return;

        if (error?.status === 401) {
          await refreshCurrentUser();
          if (!active) return;
        }

        setOptionError(
          error?.message || "Unable to retrieve active assignment choices.",
        );
        setOptionStatus("error");
      }
    };

    loadOptions();

    return () => {
      active = false;
    };
  }, [accessToken, refreshCurrentUser, retryCount]);

  useEffect(() => {
    if (!confirmOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) {
        setConfirmOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [confirmOpen, submitting]);

  const selectedTeacher = useMemo(
    () => teachers.find((teacher) => teacher.id === selectedTeacherId) || null,
    [teachers, selectedTeacherId],
  );
  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === selectedSubjectId) || null,
    [subjects, selectedSubjectId],
  );

  const subjectGroups = useMemo(() => {
    const groups = new Map();

    subjects.forEach((subject) => {
      const classId = subject.class.id;
      if (!groups.has(classId)) {
        groups.set(classId, {
          id: classId,
          label:
            subject.class.code + " — " + subject.class.name +
            " (" + subject.class.academicYear + ")",
          subjects: [],
        });
      }
      groups.get(classId).subjects.push(subject);
    });

    return Array.from(groups.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [subjects]);

  const clearFeedback = () => {
    setActionError("");
    setSuccess(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    clearFeedback();

    if (!selectedTeacher || !selectedSubject) {
      setActionError("Choose an active teacher and an eligible subject.");
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedTeacher || !selectedSubject || submitting) return;

    setSubmitting(true);
    setActionError("");

    try {
      const assignment = await createTeacherSubjectAssignment(
        accessToken,
        selectedTeacher.id,
        selectedSubject.id,
      );

      setSuccess({
        teacherName: selectedTeacher.fullName,
        teacherUsername: selectedTeacher.username,
        subjectName: selectedSubject.name,
        subjectCode: selectedSubject.code,
        className: selectedSubject.class.name,
        classCode: selectedSubject.class.code,
        assignedAt: assignment.assignedAt,
      });
      setSelectedTeacherId("");
      setSelectedSubjectId("");
      setConfirmOpen(false);
    } catch (error) {
      if (error?.status === 401) {
        await refreshCurrentUser();
      }

      setActionError(
        error?.message || "Unable to create this teacher-subject assignment.",
      );
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-page-container">
      <SectionHeader
        title="Teacher-to-Subject Assignments"
        subtitle="Assign active teachers to subjects in active classes"
      />

      <div className="a-teacher-assignment-intro">
        <div className="a-teacher-assignment-intro-icon">
          <ClipboardList size={22} />
        </div>
        <p>
          Each assignment links one teacher account to one subject. A teacher
          can be assigned to multiple subjects. The service prevents duplicate
          assignments and validates account and class status when you confirm.
        </p>
      </div>

      <DashboardCard className="a-teacher-assignment-card">
        <div className="a-teacher-assignment-heading">
          <div>
            <h3>Create an assignment</h3>
            <p>Choose a teacher and a subject from the current university directories.</p>
          </div>
          <span className="a-teacher-assignment-counts">
            {optionStatus === "success"
              ? teachers.length + " active teachers · " + subjects.length + " eligible subjects"
              : "Directory choices"}
          </span>
        </div>

        {optionStatus === "loading" && <LoadingState />}

        {optionStatus === "error" && (
          <ErrorState
            message={optionError}
            onRetry={() => setRetryCount((value) => value + 1)}
          />
        )}

        {optionStatus === "success" && (
          <>
            {teachers.length === 0 && (
              <div className="a-teacher-assignment-empty" role="status">
                <UserRound size={25} />
                <div>
                  <h4>No active teachers available</h4>
                  <p>Activate or provision a teacher account before creating an assignment.</p>
                </div>
              </div>
            )}

            {teachers.length > 0 && subjects.length === 0 && (
              <div className="a-teacher-assignment-empty" role="status">
                <BookOpen size={25} />
                <div>
                  <h4>No eligible subjects available</h4>
                  <p>Only active subjects that belong to active classes can be assigned.</p>
                </div>
              </div>
            )}

            {teachers.length > 0 && subjects.length > 0 && (
              <form className="a-teacher-assignment-form" onSubmit={handleSubmit}>
                <label className="d-form-group">
                  <span>Teacher account</span>
                  <select
                    required
                    value={selectedTeacherId}
                    onChange={(event) => {
                      setSelectedTeacherId(event.target.value);
                      clearFeedback();
                    }}
                  >
                    <option value="" disabled>Select an active teacher</option>
                    {teachers.map((teacher) => (
                      <option value={teacher.id} key={teacher.id}>
                        {teacher.fullName} · @{teacher.username}
                      </option>
                    ))}
                  </select>
                  <small>Inactive and non-teacher accounts are not shown.</small>
                </label>

                <label className="d-form-group">
                  <span>Subject</span>
                  <select
                    required
                    value={selectedSubjectId}
                    onChange={(event) => {
                      setSelectedSubjectId(event.target.value);
                      clearFeedback();
                    }}
                  >
                    <option value="" disabled>Select an eligible subject</option>
                    {subjectGroups.map((group) => (
                      <optgroup label={group.label} key={group.id}>
                        {group.subjects.map((subject) => (
                          <option value={subject.id} key={subject.id}>
                            {subject.code} — {subject.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <small>Subjects in inactive classes are excluded.</small>
                </label>

                {selectedTeacher && selectedSubject && (
                  <div className="a-teacher-assignment-preview">
                    <div>
                      <span>Teacher</span>
                      <strong>{selectedTeacher.fullName}</strong>
                      <small>@{selectedTeacher.username}</small>
                    </div>
                    <div>
                      <span>Subject</span>
                      <strong>{selectedSubject.code} — {selectedSubject.name}</strong>
                      <small>{selectedSubject.class.code} — {selectedSubject.class.name} · {selectedSubject.class.academicYear}</small>
                    </div>
                  </div>
                )}

                {actionError && (
                  <div className="a-teacher-assignment-feedback error" role="alert">
                    <AlertCircle size={17} />
                    <span>{actionError}</span>
                  </div>
                )}

                {success && (
                  <div className="a-teacher-assignment-feedback success" role="status" aria-live="polite">
                    <CheckCircle2 size={17} />
                    <span>
                      Assigned {success.teacherName} (@{success.teacherUsername}) to {success.subjectCode} — {success.subjectName}
                      {" "}for {success.classCode} — {success.className}. Created {formatAssignedAt(success.assignedAt)}.
                    </span>
                  </div>
                )}

                <div className="a-teacher-assignment-actions">
                  <button
                    type="button"
                    className="a-teacher-assignment-clear"
                    onClick={() => {
                      setSelectedTeacherId("");
                      setSelectedSubjectId("");
                      clearFeedback();
                    }}
                    disabled={!selectedTeacherId && !selectedSubjectId}
                  >
                    Clear selection
                  </button>
                  <button
                    type="submit"
                    className="d-btn-primary"
                    disabled={!selectedTeacherId || !selectedSubjectId}
                  >
                    Review assignment
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </DashboardCard>

      {confirmOpen && selectedTeacher && selectedSubject && (
        <div
          className="a-teacher-assignment-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              setConfirmOpen(false);
            }
          }}
        >
          <section
            className="a-teacher-assignment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="a-teacher-assignment-modal-title"
            aria-describedby="a-teacher-assignment-modal-description"
          >
            <div className="a-teacher-assignment-modal-heading">
              <div>
                <span>Confirm assignment</span>
                <h3 id="a-teacher-assignment-modal-title">Assign subject to teacher?</h3>
              </div>
              <button
                type="button"
                aria-label="Close confirmation"
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
              >
                <X size={18} />
              </button>
            </div>
            <p id="a-teacher-assignment-modal-description">
              The teacher will be linked to this subject. This action is saved by the administration service.
            </p>
            <div className="a-teacher-assignment-modal-summary">
              <div>
                <span>Teacher</span>
                <strong>{selectedTeacher.fullName}</strong>
                <small>@{selectedTeacher.username}</small>
              </div>
              <div>
                <span>Subject and class</span>
                <strong>{selectedSubject.code} — {selectedSubject.name}</strong>
                <small>{selectedSubject.class.code} — {selectedSubject.class.name} · {selectedSubject.class.academicYear}</small>
              </div>
            </div>
            <div className="a-teacher-assignment-modal-actions">
              <button
                type="button"
                className="a-teacher-assignment-cancel"
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
              >
                Back
              </button>
              <button
                type="button"
                className="d-btn-primary"
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting ? "Creating assignment…" : "Confirm assignment"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default TeacherSubjectAssignmentsPage;
