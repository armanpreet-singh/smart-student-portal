import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Archive, BookOpen, Building2, CheckCircle2, ChevronLeft, ChevronRight, Pencil, Plus, RotateCcw, RotateCw, Search, X } from "lucide-react";

import { useAuth } from "../../auth/context/AuthContext";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import {
  fetchAdminClasses,
  fetchAdminSubjects,
  fetchAllAdminClasses,
} from "../api/adminCatalogueApi";
import { createAdminClass, updateAdminClass } from "../api/adminClassManagementApi";
import { createAdminSubject, updateAdminSubject } from "../api/adminSubjectManagementApi";

import "./CoursesPage.css";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function LoadingState({ message }) {
  return (
    <div className="a-catalogue-state" role="status" aria-live="polite">
      <span className="a-catalogue-spinner" aria-hidden="true" />
      <div>
        <h3>Loading catalogue</h3>
        <p>{message}</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="a-catalogue-state a-catalogue-error" role="alert">
      <div>
        <h3>Catalogue unavailable</h3>
        <p>{message}</p>
      </div>
      <button type="button" className="d-btn-primary a-catalogue-retry" onClick={onRetry}>
        <RotateCw size={16} />
        Retry
      </button>
    </div>
  );
}

function EmptyState({ kind, hasFilters }) {
  const isClasses = kind === "classes";
  return (
    <div className="a-catalogue-empty">
      {isClasses ? <Building2 size={28} /> : <BookOpen size={28} />}
      <h3>{hasFilters ? "No matching records" : isClasses ? "No classes are available" : "No subjects are available"}</h3>
      <p>
        {hasFilters
          ? "Try changing the search text or filters."
          : isClasses
            ? "The university service did not return any class records."
            : "The university service did not return any subject records."}
      </p>
    </div>
  );
}

function ActiveBadge({ isActive }) {
  return (
    <span className={`a-catalogue-active-badge ${isActive ? "active" : "inactive"}`}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}


function ClassEditorDialog({ classRecord, submitting, error, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    code: classRecord?.code || "",
    name: classRecord?.name || "",
    academicYear: classRecord?.academicYear || "",
  }));
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submitting]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setValidationError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const values = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      academicYear: form.academicYear.trim(),
    };

    if (
      !values.code ||
      values.code.length > 30 ||
      !/^[A-Z0-9._-]+$/.test(values.code)
    ) {
      setValidationError(
        "Use 1–30 characters for the class code: letters, numbers, dots, underscores, or hyphens.",
      );
      return;
    }
    if (values.name.length < 2 || values.name.length > 120) {
      setValidationError("Class name must be between 2 and 120 characters.");
      return;
    }
    if (values.academicYear.length < 4 || values.academicYear.length > 20) {
      setValidationError("Academic year must be between 4 and 20 characters.");
      return;
    }

    onSave(values);
  };

  return (
    <div
      className="a-class-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        className="a-class-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="a-class-editor-title"
      >
        <div className="a-class-modal-heading">
          <div>
            <span>{classRecord ? "Edit class" : "New class"}</span>
            <h3 id="a-class-editor-title">
              {classRecord ? "Update class details" : "Create a class"}
            </h3>
          </div>
          <button
            type="button"
            aria-label="Close class form"
            onClick={onClose}
            disabled={submitting}
          >
            <X size={18} />
          </button>
        </div>

        <p className="a-class-modal-description">
          Enter the class details used in the university academic catalogue.
        </p>

        <form className="a-class-editor-form" onSubmit={handleSubmit}>
          <label className="d-form-group">
            <span>Class code</span>
            <input
              autoFocus
              required
              value={form.code}
              maxLength={30}
              pattern="[A-Za-z0-9._-]+"
              placeholder="e.g. CSE-2026"
              onChange={(event) => updateField("code", event.target.value)}
            />
            <small>1–30 characters; letters, numbers, dots, underscores, or hyphens.</small>
          </label>
          <label className="d-form-group">
            <span>Class name</span>
            <input
              required
              value={form.name}
              maxLength={120}
              minLength={2}
              placeholder="e.g. B.Tech Computer Science"
              onChange={(event) => updateField("name", event.target.value)}
            />
          </label>
          <label className="d-form-group">
            <span>Academic year</span>
            <input
              required
              value={form.academicYear}
              maxLength={20}
              minLength={4}
              placeholder="e.g. 2026–2027"
              onChange={(event) => updateField("academicYear", event.target.value)}
            />
            <small>4–20 characters.</small>
          </label>

          {(validationError || error) && (
            <div className="a-class-dialog-error" role="alert">
              <AlertCircle size={17} />
              <span>{validationError || error}</span>
            </div>
          )}

          <div className="a-class-modal-actions">
            <button
              type="button"
              className="a-class-secondary-button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="d-btn-primary" disabled={submitting}>
              {submitting
                ? "Saving class…"
                : classRecord
                  ? "Save changes"
                  : "Create class"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ClassStatusDialog({ classRecord, targetActive, submitting, error, onClose, onConfirm }) {
  const actionLabel = targetActive ? "Reactivate" : "Archive";

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submitting]);

  return (
    <div
      className="a-class-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        className="a-class-modal a-class-status-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="a-class-status-title"
      >
        <div className="a-class-modal-heading">
          <div>
            <span>Class status</span>
            <h3 id="a-class-status-title">{actionLabel} this class?</h3>
          </div>
          <button
            type="button"
            aria-label="Close status confirmation"
            onClick={onClose}
            disabled={submitting}
          >
            <X size={18} />
          </button>
        </div>

        <div className="a-class-status-summary">
          <strong>{classRecord.name}</strong>
          <span>{classRecord.code} · {classRecord.academicYear}</span>
          <p>
            {targetActive
              ? "This will make the existing class active again. Its record and related records are retained."
              : "This will mark the class inactive. It does not delete the class or its related records."}
          </p>
        </div>

        {error && (
          <div className="a-class-dialog-error" role="alert">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        <div className="a-class-modal-actions">
          <button
            type="button"
            className="a-class-secondary-button"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="d-btn-primary"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? "Updating status…" : actionLabel}
          </button>
        </div>
      </section>
    </div>
  );
}


function SubjectEditorDialog({ subjectRecord, classOptions, submitting, error, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    classId: subjectRecord?.classId || "",
    code: subjectRecord?.code || "",
    name: subjectRecord?.name || "",
    description: subjectRecord?.description || "",
  }));
  const [validationError, setValidationError] = useState("");
  const activeClasses = classOptions.filter((item) => item.isActive);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submitting]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setValidationError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const values = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      description: form.description.trim() || null,
    };

    if (!subjectRecord) values.classId = form.classId;

    if (
      !values.code ||
      values.code.length > 30 ||
      !/^[A-Z0-9._-]+$/.test(values.code)
    ) {
      setValidationError(
        "Use 1–30 characters for the subject code: letters, numbers, dots, underscores, or hyphens.",
      );
      return;
    }
    if (values.name.length < 2 || values.name.length > 120) {
      setValidationError("Subject name must be between 2 and 120 characters.");
      return;
    }
    if (form.description.length > 500) {
      setValidationError("Subject description must be 500 characters or fewer.");
      return;
    }
    if (!subjectRecord && !activeClasses.some((item) => item.id === form.classId)) {
      setValidationError("Choose an active parent class from the university directory.");
      return;
    }

    onSave(values);
  };

  return (
    <div
      className="a-class-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        className="a-class-modal a-subject-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="a-subject-editor-title"
      >
        <div className="a-class-modal-heading">
          <div>
            <span>{subjectRecord ? "Edit subject" : "New subject"}</span>
            <h3 id="a-subject-editor-title">
              {subjectRecord ? "Update subject details" : "Create a subject"}
            </h3>
          </div>
          <button
            type="button"
            aria-label="Close subject form"
            onClick={onClose}
            disabled={submitting}
          >
            <X size={18} />
          </button>
        </div>

        <p className="a-class-modal-description">
          Enter the subject details supported by the university academic catalogue.
        </p>

        <form className="a-class-editor-form" onSubmit={handleSubmit}>
          {!subjectRecord ? (
            <label className="d-form-group">
              <span>Parent class</span>
              <select
                required
                value={form.classId}
                onChange={(event) => updateField("classId", event.target.value)}
              >
                <option value="" disabled>Select an active class</option>
                {activeClasses.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.code} — {item.name} · {item.academicYear}
                  </option>
                ))}
              </select>
              <small>Only active classes can receive new subjects.</small>
            </label>
          ) : (
            <div className="a-subject-parent-summary">
              <span>Parent class (fixed)</span>
              <strong>{subjectRecord.class.code} — {subjectRecord.class.name}</strong>
              <small>
                {subjectRecord.class.academicYear}
                {subjectRecord.class.isActive ? " · Active" : " · Inactive"}
              </small>
              <p>The backend does not support moving an existing subject to another class.</p>
            </div>
          )}

          <label className="d-form-group">
            <span>Subject code</span>
            <input
              autoFocus={Boolean(subjectRecord)}
              required
              value={form.code}
              maxLength={30}
              pattern="[A-Za-z0-9._-]+"
              placeholder="e.g. CSE-101"
              onChange={(event) => updateField("code", event.target.value)}
            />
            <small>1–30 characters; letters, numbers, dots, underscores, or hyphens.</small>
          </label>

          <label className="d-form-group">
            <span>Subject name</span>
            <input
              required
              value={form.name}
              maxLength={120}
              minLength={2}
              placeholder="e.g. Programming Fundamentals"
              onChange={(event) => updateField("name", event.target.value)}
            />
          </label>

          <label className="d-form-group">
            <span>Description <span className="a-subject-optional">(optional)</span></span>
            <textarea
              value={form.description}
              maxLength={500}
              rows={3}
              placeholder="A brief subject description"
              onChange={(event) => updateField("description", event.target.value)}
            />
            <small>{form.description.length}/500 characters</small>
          </label>

          {(validationError || error) && (
            <div className="a-class-dialog-error" role="alert">
              <AlertCircle size={17} />
              <span>{validationError || error}</span>
            </div>
          )}

          <div className="a-class-modal-actions">
            <button
              type="button"
              className="a-class-secondary-button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="d-btn-primary" disabled={submitting}>
              {submitting
                ? "Saving subject…"
                : subjectRecord
                  ? "Save changes"
                  : "Create subject"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function SubjectStatusDialog({ subjectRecord, targetActive, submitting, error, onClose, onConfirm }) {
  const actionLabel = targetActive ? "Reactivate" : "Archive";
  const canReactivate = !targetActive || subjectRecord.class.isActive;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submitting]);

  return (
    <div
      className="a-class-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section
        className="a-class-modal a-class-status-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="a-subject-status-title"
      >
        <div className="a-class-modal-heading">
          <div>
            <span>Subject status</span>
            <h3 id="a-subject-status-title">{actionLabel} this subject?</h3>
          </div>
          <button
            type="button"
            aria-label="Close status confirmation"
            onClick={onClose}
            disabled={submitting}
          >
            <X size={18} />
          </button>
        </div>

        <div className="a-class-status-summary">
          <strong>{subjectRecord.name}</strong>
          <span>
            {subjectRecord.code} · {subjectRecord.class.code} — {subjectRecord.class.name}
          </span>
          <p>
            {targetActive
              ? canReactivate
                ? "This will make the existing subject active again. Its record and parent class link are retained."
                : "This subject cannot be reactivated while its parent class is inactive. Reactivate the parent class first."
              : "This will mark the subject inactive. It does not delete the subject or its related records."}
          </p>
        </div>

        {error && (
          <div className="a-class-dialog-error" role="alert">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        <div className="a-class-modal-actions">
          <button
            type="button"
            className="a-class-secondary-button"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="d-btn-primary"
            onClick={onConfirm}
            disabled={submitting || !canReactivate}
          >
            {submitting ? "Updating status…" : actionLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

const CoursesPage = () => {
  const { accessToken, refreshCurrentUser } = useAuth();

  const [activeTab, setActiveTab] = useState("classes");
  const [classOptions, setClassOptions] = useState([]);
  const [optionsStatus, setOptionsStatus] = useState("loading");
  const [optionsError, setOptionsError] = useState("");
  const [optionsRetry, setOptionsRetry] = useState(0);

  const [draftFilters, setDraftFilters] = useState({
    search: "",
    isActive: "all",
    classId: "",
  });
  const [filters, setFilters] = useState({
    search: "",
    isActive: "all",
    classId: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [requestStatus, setRequestStatus] = useState("loading");
  const [requestError, setRequestError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [filterError, setFilterError] = useState("");
  const [classEditor, setClassEditor] = useState({ open: false, record: null });
  const [classStatusAction, setClassStatusAction] = useState(null);
  const [classMutationStatus, setClassMutationStatus] = useState("idle");
  const [classEditorError, setClassEditorError] = useState("");
  const [classStatusError, setClassStatusError] = useState("");
  const [classMutationSuccess, setClassMutationSuccess] = useState("");
  const [subjectEditor, setSubjectEditor] = useState({ open: false, record: null });
  const [subjectStatusAction, setSubjectStatusAction] = useState(null);
  const [subjectMutationStatus, setSubjectMutationStatus] = useState("idle");
  const [subjectEditorError, setSubjectEditorError] = useState("");
  const [subjectStatusError, setSubjectStatusError] = useState("");
  const [subjectMutationSuccess, setSubjectMutationSuccess] = useState("");

  useEffect(() => {
    let active = true;

    const loadClassOptions = async () => {
      setOptionsStatus("loading");
      setOptionsError("");

      try {
        const classes = await fetchAllAdminClasses(accessToken);
        if (!active) return;
        setClassOptions(classes);
        setOptionsStatus("success");
      } catch (error) {
        if (!active) return;

        if (error?.status === 401) {
          await refreshCurrentUser();
          if (!active) return;
        }

        setOptionsError(
          error?.message || "Unable to load class filter choices.",
        );
        setOptionsStatus("error");
      }
    };

    loadClassOptions();

    return () => {
      active = false;
    };
  }, [accessToken, refreshCurrentUser, optionsRetry]);

  useEffect(() => {
    let active = true;

    const loadPage = async () => {
      setRequestStatus("loading");
      setRequestError("");
      setRows([]);

      const requestFilters = {
        page,
        pageSize,
        search: filters.search,
        isActive: filters.isActive,
        ...(activeTab === "subjects" && filters.classId
          ? { classId: filters.classId }
          : {}),
      };

      try {
        const result =
          activeTab === "classes"
            ? await fetchAdminClasses(accessToken, requestFilters)
            : await fetchAdminSubjects(accessToken, requestFilters);

        if (!active) return;
        setRows(result.rows);
        setPagination(result.pagination);
        setRequestStatus("success");
      } catch (error) {
        if (!active) return;

        if (error?.status === 401) {
          await refreshCurrentUser();
          if (!active) return;
        }

        setRequestError(
          error?.message || "Unable to load catalogue records.",
        );
        setRequestStatus("error");
      }
    };

    loadPage();

    return () => {
      active = false;
    };
  }, [
    accessToken,
    activeTab,
    filters.search,
    filters.isActive,
    filters.classId,
    page,
    pageSize,
    retryCount,
    refreshCurrentUser,
  ]);

  const selectedClass = useMemo(
    () => classOptions.find((item) => item.id === filters.classId),
    [classOptions, filters.classId],
  );

  const hasFilters = Boolean(
    filters.search || filters.isActive !== "all" ||
    (activeTab === "subjects" && filters.classId),
  );

  const updateDraft = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value }));
    setFilterError("");
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setFilterError("");

    if (draftFilters.search.trim().length > 80) {
      setFilterError("Search must be 80 characters or fewer.");
      return;
    }

    if (
      activeTab === "subjects" &&
      draftFilters.classId &&
      !classOptions.some((item) => item.id === draftFilters.classId)
    ) {
      setFilterError("Choose a class returned by the university directory.");
      return;
    }

    setFilters({
      search: draftFilters.search.trim(),
      isActive: draftFilters.isActive,
      classId: draftFilters.classId,
    });
    setPage(1);
  };

  const clearFilters = () => {
    const cleared = { search: "", isActive: "all", classId: "" };
    setDraftFilters(cleared);
    setFilters(cleared);
    setPage(1);
    setFilterError("");
  };

  const changeTab = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setPage(1);
    setFilterError("");
    setClassMutationSuccess("");
  };


  const openCreateClass = () => {
    setClassMutationSuccess("");
    setClassEditorError("");
    setClassEditor({ open: true, record: null });
  };

  const openEditClass = (record) => {
    setClassMutationSuccess("");
    setClassEditorError("");
    setClassEditor({ open: true, record });
  };

  const closeClassEditor = () => {
    if (classMutationStatus !== "saving") {
      setClassEditor({ open: false, record: null });
      setClassEditorError("");
    }
  };

  const saveClass = async (values) => {
    if (classMutationStatus !== "idle") return;
    setClassMutationStatus("saving");
    setClassEditorError("");
    setClassMutationSuccess("");

    try {
      if (classEditor.record) {
        await updateAdminClass(accessToken, classEditor.record.id, values);
        setClassMutationSuccess("Class details updated successfully.");
      } else {
        await createAdminClass(accessToken, values);
        setClassMutationSuccess("Class created successfully.");
        const cleared = { search: "", isActive: "all", classId: "" };
        setDraftFilters(cleared);
        setFilters(cleared);
        setPage(1);
      }

      setClassEditor({ open: false, record: null });
      setRetryCount((value) => value + 1);
      setOptionsRetry((value) => value + 1);
    } catch (error) {
      if (error?.status === 401) await refreshCurrentUser();
      setClassEditorError(
        error?.message || "Unable to save this class. Please try again.",
      );
    } finally {
      setClassMutationStatus("idle");
    }
  };

  const openClassStatusAction = (record) => {
    setClassMutationSuccess("");
    setClassStatusError("");
    setClassStatusAction({ record, targetActive: !record.isActive });
  };

  const closeClassStatusAction = () => {
    if (classMutationStatus !== "updating-status") {
      setClassStatusAction(null);
      setClassStatusError("");
    }
  };

  const confirmClassStatusAction = async () => {
    if (!classStatusAction || classMutationStatus !== "idle") return;

    setClassMutationStatus("updating-status");
    setClassStatusError("");
    setClassMutationSuccess("");

    try {
      await updateAdminClass(
        accessToken,
        classStatusAction.record.id,
        { isActive: classStatusAction.targetActive },
      );
      setClassMutationSuccess(
        classStatusAction.targetActive
          ? "Class reactivated successfully."
          : "Class archived successfully. The class record and related records were retained.",
      );
      setClassStatusAction(null);
      setRetryCount((value) => value + 1);
      setOptionsRetry((value) => value + 1);
    } catch (error) {
      if (error?.status === 401) await refreshCurrentUser();
      setClassStatusError(
        error?.message || "Unable to update class status. Please try again.",
      );
    } finally {
      setClassMutationStatus("idle");
    }
  };


  const openCreateSubject = () => {
    setSubjectMutationSuccess("");
    setSubjectEditorError("");
    setSubjectEditor({ open: true, record: null });
  };

  const openEditSubject = (record) => {
    setSubjectMutationSuccess("");
    setSubjectEditorError("");
    setSubjectEditor({ open: true, record });
  };

  const closeSubjectEditor = () => {
    if (subjectMutationStatus !== "saving") {
      setSubjectEditor({ open: false, record: null });
      setSubjectEditorError("");
    }
  };

  const saveSubject = async (values) => {
    if (subjectMutationStatus !== "idle") return;
    setSubjectMutationStatus("saving");
    setSubjectEditorError("");
    setSubjectMutationSuccess("");

    try {
      if (subjectEditor.record) {
        await updateAdminSubject(accessToken, subjectEditor.record.id, values);
        setSubjectMutationSuccess("Subject details updated successfully.");
      } else {
        const created = await createAdminSubject(accessToken, values);
        setSubjectMutationSuccess("Subject created successfully.");
        const nextFilters = {
          search: "",
          isActive: "all",
          classId: created.classId,
        };
        setDraftFilters(nextFilters);
        setFilters(nextFilters);
        setPage(1);
      }

      setSubjectEditor({ open: false, record: null });
      setRetryCount((value) => value + 1);
    } catch (error) {
      if (error?.status === 401) await refreshCurrentUser();
      setSubjectEditorError(
        error?.message || "Unable to save this subject. Please try again.",
      );
    } finally {
      setSubjectMutationStatus("idle");
    }
  };

  const openSubjectStatusAction = (record) => {
    setSubjectMutationSuccess("");
    setSubjectStatusError("");
    setSubjectStatusAction({ record, targetActive: !record.isActive });
  };

  const closeSubjectStatusAction = () => {
    if (subjectMutationStatus !== "updating-status") {
      setSubjectStatusAction(null);
      setSubjectStatusError("");
    }
  };

  const confirmSubjectStatusAction = async () => {
    if (!subjectStatusAction || subjectMutationStatus !== "idle") return;
    if (
      subjectStatusAction.targetActive &&
      !subjectStatusAction.record.class.isActive
    ) {
      setSubjectStatusError(
        "Reactivate the parent class before reactivating this subject.",
      );
      return;
    }

    setSubjectMutationStatus("updating-status");
    setSubjectStatusError("");
    setSubjectMutationSuccess("");

    try {
      await updateAdminSubject(
        accessToken,
        subjectStatusAction.record.id,
        { isActive: subjectStatusAction.targetActive },
      );
      setSubjectMutationSuccess(
        subjectStatusAction.targetActive
          ? "Subject reactivated successfully."
          : "Subject archived successfully. The subject record and class link were retained.",
      );
      setSubjectStatusAction(null);
      setRetryCount((value) => value + 1);
    } catch (error) {
      if (error?.status === 401) await refreshCurrentUser();
      setSubjectStatusError(
        error?.message || "Unable to update subject status. Please try again.",
      );
    } finally {
      setSubjectMutationStatus("idle");
    }
  };

  const startRecord = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const endRecord = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <div className="d-page-container">
      <SectionHeader
        title="Class & Subject Catalogue"
        subtitle="University academic directory from the administration service"
      />

      <div className="a-catalogue-tabs" role="tablist" aria-label="Catalogue type">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "classes"}
          className={activeTab === "classes" ? "active" : ""}
          onClick={() => changeTab("classes")}
        >
          <Building2 size={17} />
          Classes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "subjects"}
          className={activeTab === "subjects" ? "active" : ""}
          onClick={() => changeTab("subjects")}
        >
          <BookOpen size={17} />
          Subjects
        </button>
      </div>

      <DashboardCard className="a-catalogue-filters">
        <form onSubmit={applyFilters}>
          <div className="a-catalogue-filter-grid">
            <label className="d-form-group a-catalogue-search">
              <span>Search {activeTab}</span>
              <div className="a-catalogue-search-wrap">
                <Search size={17} aria-hidden="true" />
                <input
                  type="search"
                  value={draftFilters.search}
                  maxLength={80}
                  placeholder={
                    activeTab === "classes"
                      ? "Search class code, name or academic year"
                      : "Search subject code, name or description"
                  }
                  onChange={(event) => updateDraft("search", event.target.value)}
                />
              </div>
            </label>

            <label className="d-form-group">
              <span>Status</span>
              <select
                value={draftFilters.isActive}
                onChange={(event) => updateDraft("isActive", event.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="true">Active only</option>
                <option value="false">Inactive only</option>
              </select>
            </label>

            {activeTab === "subjects" && (
              <label className="d-form-group">
                <span>Class</span>
                <select
                  value={draftFilters.classId}
                  disabled={optionsStatus !== "success"}
                  onChange={(event) => updateDraft("classId", event.target.value)}
                >
                  <option value="">All classes</option>
                  {classOptions.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.code} — {item.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="a-catalogue-filter-actions">
              <button type="button" className="a-catalogue-clear" onClick={clearFilters}>
                Clear
              </button>
              <button type="submit" className="d-btn-primary">
                Apply filters
              </button>
            </div>
          </div>

          {filterError && <p className="a-catalogue-filter-error" role="alert">{filterError}</p>}

          {activeTab === "subjects" && optionsStatus === "error" && (
            <div className="a-catalogue-options-warning" role="alert">
              <span>{optionsError} The subject list can still be viewed without the class filter.</span>
              <button
                type="button"
                onClick={() => setOptionsRetry((value) => value + 1)}
              >
                Retry class choices
              </button>
            </div>
          )}
        </form>
      </DashboardCard>

      <DashboardCard padding={false}>
        <div className="a-catalogue-table-heading">
          <div>
            <h3>{activeTab === "classes" ? "Class directory" : "Subject directory"}</h3>
            <p>
              {requestStatus === "success"
                ? `${pagination.total.toLocaleString()} ${activeTab} found`
                : "Records supplied by the university service"}
            </p>
          </div>
          {activeTab === "classes" && (
            <button type="button" className="d-btn-primary a-catalogue-add-class" onClick={openCreateClass}>
              <Plus size={16} />
              Add class
            </button>
          )}
          {activeTab === "subjects" && (
            <button
              type="button"
              className="d-btn-primary a-catalogue-add-class"
              onClick={openCreateSubject}
              disabled={optionsStatus !== "success" || !classOptions.some((item) => item.isActive)}
            >
              <Plus size={16} />
              Add subject
            </button>
          )}
          <label className="a-catalogue-page-size">
            <span>Rows</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option value={size} key={size}>{size}</option>
              ))}
            </select>
          </label>
        </div>

        {classMutationSuccess && activeTab === "classes" && (
          <div className="a-class-success-banner" role="status" aria-live="polite">
            <CheckCircle2 size={17} />
            <span>{classMutationSuccess}</span>
          </div>
        )}
        {subjectMutationSuccess && activeTab === "subjects" && (
          <div className="a-class-success-banner" role="status" aria-live="polite">
            <CheckCircle2 size={17} />
            <span>{subjectMutationSuccess}</span>
          </div>
        )}

        {requestStatus === "loading" && (
          <LoadingState message={`Retrieving the ${activeTab} directory.`} />
        )}

        {requestStatus === "error" && (
          <ErrorState
            message={requestError}
            onRetry={() => setRetryCount((value) => value + 1)}
          />
        )}

        {requestStatus === "success" && rows.length === 0 && (
          <EmptyState kind={activeTab} hasFilters={hasFilters} />
        )}

        {requestStatus === "success" && rows.length > 0 && activeTab === "classes" && (
          <div className="a-catalogue-table-scroll">
            <table className="a-catalogue-table a-catalogue-class-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Code</th>
                  <th>Academic year</th>
                  <th>Students</th>
                  <th>Subjects</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td className="a-catalogue-code">{item.code}</td>
                    <td>{item.academicYear}</td>
                    <td>{item._count.students.toLocaleString()}</td>
                    <td>{item._count.subjects.toLocaleString()}</td>
                    <td><ActiveBadge isActive={item.isActive} /></td>
                    <td>
                      <div className="a-catalogue-row-actions">
                        <button
                          type="button"
                          className="a-catalogue-row-action"
                          onClick={() => openEditClass(item)}
                          aria-label={`Edit ${item.name}`}
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`a-catalogue-row-action ${item.isActive ? "archive" : "reactivate"}`}
                          onClick={() => openClassStatusAction(item)}
                          aria-label={`${item.isActive ? "Archive" : "Reactivate"} ${item.name}`}
                        >
                          {item.isActive ? <Archive size={14} /> : <RotateCcw size={14} />}
                          {item.isActive ? "Archive" : "Reactivate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {requestStatus === "success" && rows.length > 0 && activeTab === "subjects" && (
          <div className="a-catalogue-table-scroll">
            <table className="a-catalogue-table a-catalogue-subject-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Code</th>
                  <th>Class</th>
                  <th>Academic year</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td className="a-catalogue-code">{item.code}</td>
                    <td>
                      <strong>{item.class.code}</strong>
                      <span>{item.class.name}</span>
                    </td>
                    <td>{item.class.academicYear}</td>
                    <td className="a-catalogue-description">{item.description || "—"}</td>
                    <td><ActiveBadge isActive={item.isActive} /></td>
                    <td>
                      <div className="a-catalogue-row-actions a-subject-row-actions">
                        <button
                          type="button"
                          className="a-catalogue-row-action"
                          onClick={() => openEditSubject(item)}
                          aria-label={`Edit ${item.name}`}
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`a-catalogue-row-action ${item.isActive ? "archive" : "reactivate"}`}
                          onClick={() => openSubjectStatusAction(item)}
                          aria-label={`${item.isActive ? "Archive" : "Reactivate"} ${item.name}`}
                        >
                          {item.isActive ? <Archive size={14} /> : <RotateCcw size={14} />}
                          {item.isActive ? "Archive" : "Reactivate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {requestStatus === "success" && (
          <div className="a-catalogue-pagination">
            <p>
              {pagination.total === 0
                ? "No records to display"
                : `Showing ${startRecord.toLocaleString()}–${endRecord.toLocaleString()} of ${pagination.total.toLocaleString()}`}
            </p>
            <div>
              <button
                type="button"
                aria-label="Previous page"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft size={17} />
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                aria-label="Next page"
                onClick={() => setPage((value) => value + 1)}
                disabled={pagination.totalPages === 0 || page >= pagination.totalPages}
              >
                Next
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </DashboardCard>

      {selectedClass && activeTab === "subjects" && (
        <p className="a-catalogue-selected-class">
          Filtering subjects for <strong>{selectedClass.code} — {selectedClass.name}</strong>.
        </p>
      )}

      {classEditor.open && (
        <ClassEditorDialog
          key={classEditor.record?.id || "new-class"}
          classRecord={classEditor.record}
          submitting={classMutationStatus === "saving"}
          error={classEditorError}
          onClose={closeClassEditor}
          onSave={saveClass}
        />
      )}

      {classStatusAction && (
        <ClassStatusDialog
          classRecord={classStatusAction.record}
          targetActive={classStatusAction.targetActive}
          submitting={classMutationStatus === "updating-status"}
          error={classStatusError}
          onClose={closeClassStatusAction}
          onConfirm={confirmClassStatusAction}
        />
      )}
      {subjectEditor.open && (
        <SubjectEditorDialog
          key={subjectEditor.record?.id || "new-subject"}
          subjectRecord={subjectEditor.record}
          classOptions={classOptions}
          submitting={subjectMutationStatus === "saving"}
          error={subjectEditorError}
          onClose={closeSubjectEditor}
          onSave={saveSubject}
        />
      )}

      {subjectStatusAction && (
        <SubjectStatusDialog
          subjectRecord={subjectStatusAction.record}
          targetActive={subjectStatusAction.targetActive}
          submitting={subjectMutationStatus === "updating-status"}
          error={subjectStatusError}
          onClose={closeSubjectStatusAction}
          onConfirm={confirmSubjectStatusAction}
        />
      )}
    </div>
  );
};

export default CoursesPage;
