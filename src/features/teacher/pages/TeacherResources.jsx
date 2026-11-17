import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle, BookOpen, CalendarClock, Download, FileText, FolderOpen,
  LoaderCircle, RefreshCw, Trash2, UploadCloud
} from "lucide-react";
import { showSuccessMessage, showErrorMessage } from "../../../components/ui/toastUtils";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";

import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import { useAuth } from "../../auth/context/AuthContext";
import { fetchTeacherAssignedSubjects } from "../api/teacherSubjectsApi";
import {
  deleteTeacherLearningResource, fetchLearningResourceDownload,
  fetchLearningResources, formatResourceBytes, uploadTeacherLearningResource
} from "../../shared/resources/learningResourcesApi";

import "./TeacherResources.css";

const EMPTY_FORM = { subjectId: "", title: "", description: "", file: null };
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx", "ppt", "pptx", "txt", "jpg", "jpeg", "png"]);

function formatDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  }).format(date);
}

function getExtension(name) {
  return String(name || "").split(".").pop().toLowerCase();
}

function openDownload(download, previewWindow) {
  if (previewWindow) {
    previewWindow.location.href = download.url;
    return;
  }
  const link = document.createElement("a");
  link.href = download.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

const TeacherResources = memo(() => {
  const { accessToken, user, sessionStatus, sessionError } = useAuth();
  const requestSequence = useRef(0);
  const fileInputRef = useRef(null);
  const [subjects, setSubjects] = useState([]);
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loadState, setLoadState] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyResourceId, setBusyResourceId] = useState("");
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isFileDragActive, setIsFileDragActive] = useState(false);

  const loadData = useCallback(async () => {
    const requestId = ++requestSequence.current;
    if (sessionStatus !== "authenticated" || !accessToken) {
      setLoadState(sessionStatus === "restoring" ? "loading" : "error");
      setLoadError(sessionError || "Sign in again to manage learning resources.");
      return;
    }
    setLoadState("loading");
    setLoadError("");
    try {
      const [assigned, listed] = await Promise.all([
        fetchTeacherAssignedSubjects(accessToken),
        fetchLearningResources(accessToken, "teacher")
      ]);
      if (requestId !== requestSequence.current) return;
      const nextSubjects = assigned.map((item) => item.subject);
      setSubjects(nextSubjects);
      setResources(listed);
      setForm((current) => ({
        ...current,
        subjectId: current.subjectId && nextSubjects.some((subject) => subject.id === current.subjectId)
          ? current.subjectId
          : nextSubjects[0]?.id || ""
      }));
      setLoadState("success");
    } catch (error) {
      if (requestId !== requestSequence.current) return;
      setLoadError(error?.message || "Unable to load learning resources.");
      setLoadState("error");
    }
  }, [accessToken, sessionError, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "authenticated") void loadData();
    else if (sessionStatus === "restoring") setLoadState("loading");
    else {
      setLoadState("error");
      setLoadError(sessionError || "Your Teacher session is unavailable.");
    }
    return () => { requestSequence.current += 1; };
  }, [loadData, sessionError, sessionStatus]);

  const visibleResources = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return resources;
    return resources.filter((item) => [
      item.title, item.description, item.file.fileName, item.subject.name,
      item.subject.code, item.subject.class.name
    ].some((value) => value.toLowerCase().includes(query)));
  }, [resources, search]);

  const applySelectedFile = (file) => {
    if (!file) return;
    setActionError("");
    const extension = getExtension(file.name);
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      setActionError("Unsupported file type. Choose PDF, Word, PowerPoint, TXT, JPEG or PNG.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setActionError("This file is larger than 20 MB. Choose a smaller notes file.");
      return;
    }
    if (file.size === 0) {
      setActionError("This file is empty. Choose a file containing your notes.");
      return;
    }
    setForm((current) => ({
      ...current,
      file,
      title: current.title.trim() ? current.title : file.name.replace(/\.[^.]+$/, "")
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (file) applySelectedFile(file);
    event.target.value = "";
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleDropZoneKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    setIsFileDragActive(false);
    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length > 1) {
      setActionError("Upload one notes file at a time.");
      return;
    }
    if (files[0]) applySelectedFile(files[0]);
  };

  const uploadNotes = async (event) => {
    event.preventDefault();
    if (!form.subjectId || !form.title.trim() || !form.file) {
      setActionError("Select an assigned subject, enter a title, and choose a notes file.");
      return;
    }
    if (form.file.size > MAX_FILE_BYTES || !ALLOWED_EXTENSIONS.has(getExtension(form.file.name))) {
      setActionError("Choose a supported notes file no larger than 20 MB.");
      return;
    }

    setSaving(true);
    setActionError("");
    try {
      await uploadTeacherLearningResource(accessToken, {
        subjectId: form.subjectId,
        title: form.title.trim(),
        description: form.description.trim(),
        file: form.file
      });
      showSuccessMessage("Notes uploaded and shared with the selected class.");
      setForm({ ...EMPTY_FORM, subjectId: form.subjectId });
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadData();
    } catch (error) {
      setActionError(error?.message || "The notes file could not be uploaded.");
      showErrorMessage("Notes were not uploaded.");
    } finally {
      setSaving(false);
    }
  };

  const download = async (resource) => {
    const previewWindow = window.open("about:blank", "_blank");
    if (previewWindow) previewWindow.opener = null;
    setBusyResourceId(resource.id);
    setActionError("");
    try {
      const result = await fetchLearningResourceDownload(accessToken, "teacher", resource.id);
      openDownload(result, previewWindow);
    } catch (error) {
      previewWindow?.close();
      setActionError(error?.message || "The notes file could not be downloaded.");
    } finally {
      setBusyResourceId("");
    }
  };

  const confirmRemove = async () => {
    const resource = pendingDelete;
    if (!resource) return;
    setBusyResourceId(resource.id);
    setActionError("");
    try {
      await deleteTeacherLearningResource(accessToken, resource.id);
      showSuccessMessage("Learning resource deleted.");
      await loadData();
    } catch (error) {
      setActionError(error?.message || "The learning resource could not be deleted.");
    } finally {
      setBusyResourceId("");
      setPendingDelete(null);
    }
  };

  return (
    <div className="d-page-container t-resources-page">
      <SectionHeader
        title="Learning Resources"
        subtitle="Upload notes and share them securely with students in your assigned classes"
      />

      <DashboardCard className="t-resources-upload-card">
        <div className="t-resources-card-heading">
          <div className="t-resources-heading-icon"><UploadCloud size={20}/></div>
          <div><h2>Upload notes</h2><p>Files are shared with students in the selected subject's class after upload.</p></div>
        </div>

        {subjects.length === 0 && loadState === "success" ? (
          <div className="t-resources-empty-inline">No active assigned subjects. An administrator must assign a subject before you can upload notes.</div>
        ) : (
          <form className="t-resources-form" onSubmit={uploadNotes}>
            <label>
              Subject / class
              <select value={form.subjectId} onChange={(event) => setForm((current) => ({ ...current, subjectId: event.target.value }))} required>
                <option value="">Select assigned subject</option>
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>
                  {subject.code} · {subject.name} — {subject.class.name}
                </option>)}
              </select>
            </label>
            <label>
              Notes title
              <input value={form.title} maxLength={160} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. Unit 1 — Introduction to Programming" required/>
            </label>
            <label className="t-resources-description">
              Description <span>(optional)</span>
              <textarea value={form.description} maxLength={4000} rows={3} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Add a short description for students"/>
            </label>
            <div className="t-resources-file-field">
              <span className="t-resources-file-heading">Notes file <span className="t-resources-required">Required</span></span>
              <input
                ref={fileInputRef}
                id="teacher-resource-file"
                className="t-resources-native-file-input"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,image/jpeg,image/png"
                onChange={handleFileChange}
                aria-label="Choose notes file"
              />
              <div
                className={`t-resources-dropzone ${isFileDragActive ? "is-drag-active" : ""} ${form.file ? "has-file" : ""}`}
                role="button"
                tabIndex={0}
                aria-label="Choose a notes file or drag and drop one here"
                aria-describedby="t-resources-file-help"
                onClick={openFilePicker}
                onKeyDown={handleDropZoneKeyDown}
                onDragEnter={(event) => { event.preventDefault(); setIsFileDragActive(true); }}
                onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; setIsFileDragActive(true); }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setIsFileDragActive(false);
                }}
                onDrop={handleFileDrop}
              >
                <span className="t-resources-dropzone-icon"><UploadCloud size={25}/></span>
                <span className="t-resources-dropzone-copy">
                  <strong>{isFileDragActive ? "Drop your notes file here" : form.file ? "Drop a new file to replace this one" : "Drag & drop your notes here"}</strong>
                  <small>or <span className="t-resources-browse-link">browse files</span> from your device</small>
                </span>
                <span className="t-resources-dropzone-limit">MAX 20 MB</span>
              </div>
              <span id="t-resources-file-help" className="t-resources-file-help">
                PDF, Word, PowerPoint, TXT, JPEG or PNG · Maximum 20 MB · One file per upload
              </span>
              {form.file && (
                <div className="t-resources-selected-file">
                  <span className="t-resources-selected-file-icon"><FileText size={19}/></span>
                  <span className="t-resources-selected-file-copy">
                    <strong>{form.file.name}</strong>
                    <small>{getExtension(form.file.name).toUpperCase()} · {formatResourceBytes(form.file.size)} · Ready to upload</small>
                  </span>
                  <button
                    type="button"
                    className="t-resources-remove-file"
                    onClick={() => {
                      setForm((current) => ({ ...current, file: null }));
                      setActionError("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    aria-label={`Remove ${form.file.name}`}
                    disabled={saving}
                  >
                    <Trash2 size={15}/> Remove
                  </button>
                </div>
              )}
            </div>
            <div className="t-resources-form-footer">
              <span>Uploaded notes are immediately available in the selected class's Student portal.</span>
              <button type="submit" className="d-btn-primary" disabled={saving || loadState !== "success" || !subjects.length}>
                {saving ? <LoaderCircle className="t-resources-spin" size={16}/> : <UploadCloud size={16}/>}
                {saving ? "Uploading…" : "Upload notes"}
              </button>
            </div>
          </form>
        )}
      </DashboardCard>

      {loadState === "loading" && <div className="t-resources-state" role="status"><LoaderCircle className="t-resources-spin" size={20}/> Loading resources…</div>}
      {loadState === "error" && <DashboardCard><div className="t-resources-alert" role="alert"><AlertCircle size={18}/><span>{loadError}</span><button type="button" onClick={loadData}><RefreshCw size={15}/> Retry</button></div></DashboardCard>}
      {actionError && <div className="t-resources-alert" role="alert"><AlertCircle size={18}/><span>{actionError}</span></div>}

      {loadState === "success" && (
        <section className="t-resources-library">
          <div className="t-resources-library-heading">
            <div><h2>Available notes</h2><p>{resources.length} file{resources.length === 1 ? "" : "s"} across your assigned subjects</p></div>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notes…"/>
          </div>
          {visibleResources.length === 0 ? (
            <div className="t-resources-empty"><FolderOpen size={28}/><strong>{resources.length ? "No matching notes" : "No notes uploaded yet"}</strong><span>{resources.length ? "Try a different search." : "Upload the first notes file using the form above."}</span></div>
          ) : (
            <div className="t-resources-list">
              {visibleResources.map((resource) => (
                <article className="t-resource-card" key={resource.id}>
                  <div className="t-resource-file-icon"><FileText size={22}/></div>
                  <div className="t-resource-main">
                    <div className="t-resource-title-row"><h3>{resource.title}</h3><span className="t-resource-type">{resource.file.format.toUpperCase()}</span></div>
                    {resource.description && <p className="t-resource-description-text">{resource.description}</p>}
                    <div className="t-resource-meta">
                      <span><BookOpen size={13}/>{resource.subject.code} · {resource.subject.name}</span>
                      <span>{resource.subject.class.name}</span>
                      <span>{resource.file.fileName}</span>
                      <span>{formatResourceBytes(resource.file.bytes)}</span>
                      <span><CalendarClock size={13}/>{formatDate(resource.createdAt)}</span>
                      <span>Uploaded by {resource.teacher.fullName}</span>
                    </div>
                  </div>
                  <div className="t-resource-actions">
                    <button type="button" className="t-resources-secondary" onClick={() => download(resource)} disabled={Boolean(busyResourceId)}>
                      {busyResourceId === resource.id ? <LoaderCircle className="t-resources-spin" size={15}/> : <Download size={15}/>} Download
                    </button>
                    {resource.teacherId === user?.id && <button type="button" className="t-resources-danger" onClick={() => setPendingDelete(resource)} disabled={Boolean(busyResourceId)}>
                      <Trash2 size={15}/> Delete
                    </button>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete learning resource?"
        description={pendingDelete
          ? `Delete "${pendingDelete.title}"? Students will no longer be able to download this file.`
          : ""}
        confirmLabel="Delete resource"
        tone="danger"
        busy={Boolean(pendingDelete && busyResourceId === pendingDelete.id)}
        onCancel={() => { if (!busyResourceId) setPendingDelete(null); }}
        onConfirm={() => void confirmRemove()}
      />
    </div>
  );
});

export default TeacherResources;
