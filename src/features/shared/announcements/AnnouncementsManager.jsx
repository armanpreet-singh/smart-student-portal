import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Bell,
  CalendarClock,
  CheckCircle2,
  Edit3,
  LoaderCircle,
  Megaphone,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  Users
} from "lucide-react";
import { showSuccessMessage, showErrorMessage } from "../../../components/ui/toastUtils";

import { useAuth } from "../../auth/context/AuthContext";
import { fetchTeacherAssignedSubjects } from "../../teacher/api/teacherSubjectsApi";
import {
  createAnnouncement,
  deleteAnnouncement,
  fetchAnnouncements,
  publishAnnouncement,
  updateAnnouncement
} from "./announcementsApi";
import "./announcements.css";

const EMPTY_FORM = { title: "", message: "", audience: "ALL_USERS", subjectId: "" };

function formatDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  }).format(date);
}

function audienceLabel(item) {
  if (item.audience === "ALL_USERS") return "Everyone";
  if (item.audience === "STUDENTS") return "Students";
  if (item.audience === "TEACHERS") return "Teachers";
  return [item.class?.name, item.subject?.name].filter(Boolean).join(" · ") || "Assigned class";
}

export default function AnnouncementsManager({ role }) {
  const { accessToken, user, sessionStatus, sessionError } = useAuth();
  const requestSequence = useRef(0);
  const [announcements, setAnnouncements] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");

  const loadData = useCallback(async () => {
    const requestId = ++requestSequence.current;
    if (sessionStatus !== "authenticated" || !accessToken) {
      setLoadState(sessionStatus === "restoring" ? "loading" : "error");
      setLoadError(sessionError || "Sign in again to view announcements.");
      return;
    }
    setLoadState("loading");
    setLoadError("");
    try {
      const results = await Promise.all([
        fetchAnnouncements(accessToken, role),
        role === "teacher" ? fetchTeacherAssignedSubjects(accessToken) : Promise.resolve([])
      ]);
      if (requestId !== requestSequence.current) return;
      setAnnouncements(results[0]);
      setSubjects(results[1].map((item) => item.subject));
      setLoadState("success");
    } catch (error) {
      if (requestId !== requestSequence.current) return;
      setLoadError(error?.message || "Unable to load announcements.");
      setLoadState("error");
    }
  }, [accessToken, role, sessionError, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "authenticated") void loadData();
    else if (sessionStatus === "restoring") setLoadState("loading");
    else {
      setLoadState("error");
      setLoadError(sessionError || "Your session is unavailable.");
    }
    return () => { requestSequence.current += 1; };
  }, [loadData, sessionError, sessionStatus]);

  const stats = useMemo(() => ({
    total: announcements.length,
    published: announcements.filter((item) => item.publishedAt).length,
    drafts: announcements.filter((item) => !item.publishedAt).length
  }), [announcements]);

  const canManage = (item) => role === "admin" ||
    (!item.publishedAt && item.authorId === user?.id);

  const openCreate = () => {
    setEditingId("");
    setForm({
      ...EMPTY_FORM,
      subjectId: subjects[0]?.id || ""
    });
    setActionError("");
    setFormOpen(true);
  };

  const openEdit = (item) => {
    if (!canManage(item) || item.publishedAt) return;
    setEditingId(item.id);
    setForm({
      title: item.title,
      message: item.message,
      audience: item.audience,
      subjectId: item.subjectId || ""
    });
    setActionError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId("");
    setForm(EMPTY_FORM);
    setActionError("");
  };

  const saveForm = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      setActionError("Enter an announcement title and message.");
      return;
    }
    if (role === "teacher" && !editingId && !form.subjectId) {
      setActionError("Select one of your assigned subjects.");
      return;
    }
    setSaving(true);
    setActionError("");
    try {
      if (editingId) {
        await updateAnnouncement(accessToken, role, editingId, {
          title: form.title.trim(),
          message: form.message.trim()
        });
        showSuccessMessage("Announcement draft updated.");
      } else {
        const input = role === "admin"
          ? { title: form.title.trim(), message: form.message.trim(), audience: form.audience }
          : { subjectId: form.subjectId, title: form.title.trim(), message: form.message.trim() };
        await createAnnouncement(accessToken, role, input);
        showSuccessMessage("Announcement draft saved.");
      }
      closeForm();
      await loadData();
    } catch (error) {
      setActionError(error?.message || "The announcement could not be saved.");
      showErrorMessage("Announcement was not saved.");
    } finally {
      setSaving(false);
    }
  };

  const publish = async (item) => {
    setBusyId(item.id);
    setActionError("");
    try {
      await publishAnnouncement(accessToken, role, item.id);
      showSuccessMessage("Announcement published.");
      await loadData();
    } catch (error) {
      setActionError(error?.message || "The announcement could not be published.");
    } finally {
      setBusyId("");
    }
  };

  const removeDraft = async (item) => {
    if (!window.confirm("Delete this announcement draft?")) return;
    setBusyId(item.id);
    setActionError("");
    try {
      await deleteAnnouncement(accessToken, role, item.id);
      showSuccessMessage("Announcement draft deleted.");
      await loadData();
    } catch (error) {
      setActionError(error?.message || "The announcement draft could not be deleted.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="d-page-container announcements-page">
      <header className="announcements-heading">
        <div>
          <h1>Announcements</h1>
          <p>{role === "admin"
            ? "Publish official university notices and important updates."
            : "Share important updates with students in your assigned classes."}</p>
        </div>
        <button type="button" className="announcements-primary" onClick={openCreate}
          disabled={loadState !== "success" || (role === "teacher" && subjects.length === 0)}>
          <Plus size={16} /> Create announcement
        </button>
      </header>

      <div className="announcements-stats">
        <div><span>Total notices</span><strong>{stats.total}</strong></div>
        <div><span>Published</span><strong>{stats.published}</strong></div>
        <div><span>Drafts</span><strong>{stats.drafts}</strong></div>
      </div>

      {loadState === "loading" && <div className="announcements-state" role="status">
        <LoaderCircle className="announcements-spin" size={22} /> Loading announcements…
      </div>}
      {loadState === "error" && <div className="announcements-alert" role="alert">
        <AlertCircle size={20} /><span>{loadError}</span>
        <button type="button" onClick={loadData}><RefreshCw size={15} /> Retry</button>
      </div>}
      {actionError && <div className="announcements-alert" role="alert"><AlertCircle size={18}/>{actionError}</div>}

      {loadState === "success" && role === "teacher" && subjects.length === 0 && (
        <div className="announcements-empty">No active assigned subjects are available. An administrator must assign a subject before you can notify its class.</div>
      )}

      {formOpen && <form className="announcements-form" onSubmit={saveForm}>
        <div className="announcements-form-heading">
          <h2>{editingId ? "Edit draft" : "New announcement draft"}</h2>
          <span>Not visible to recipients until published.</span>
        </div>
        <label>Title<input maxLength={160} required value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></label>
        {role === "admin" ? (
          <label>Audience<select value={form.audience}
            onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value }))}>
            <option value="ALL_USERS">Everyone (Students and Teachers)</option>
            <option value="STUDENTS">Students only</option>
            <option value="TEACHERS">Teachers only</option>
          </select></label>
        ) : !editingId ? (
          <label>Assigned subject / class<select value={form.subjectId} required
            onChange={(event) => setForm((current) => ({ ...current, subjectId: event.target.value }))}>
            <option value="">Select assigned subject</option>
            {subjects.map((subject) => <option key={subject.id} value={subject.id}>
              {subject.code} · {subject.name} — {subject.class.name}
            </option>)}
          </select></label>
        ) : (
          <p className="announcements-muted">Audience: {audienceLabel(announcements.find((item) => item.id === editingId) || {})}</p>
        )}
        <label>Message<textarea rows={6} maxLength={10000} required value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} /></label>
        <div className="announcements-form-footer">
          <span>{form.message.length}/10,000 characters</span>
          <div>
            <button type="button" className="announcements-secondary" onClick={closeForm} disabled={saving}>Cancel</button>
            <button type="submit" className="announcements-primary" disabled={saving}>
              {saving ? <LoaderCircle className="announcements-spin" size={16}/> : <CheckCircle2 size={16}/>}
              Save draft
            </button>
          </div>
        </div>
      </form>}

      {loadState === "success" && announcements.length === 0 && (
        <div className="announcements-empty">
          <Megaphone size={28} />
          <strong>No announcements yet</strong>
          <span>New announcements will appear here after a draft is created.</span>
        </div>
      )}

      {loadState === "success" && announcements.length > 0 && <div className="announcements-list">
        {announcements.map((item) => {
          const ownDraft = !item.publishedAt && (role === "admin" || item.authorId === user?.id);
          return <article className="announcements-card" key={item.id}>
            <div className="announcements-card-top">
              <span className={item.publishedAt ? "announcements-status is-published" : "announcements-status is-draft"}>
                {item.publishedAt ? "Published" : "Draft"}
              </span>
              <span className="announcements-audience"><Users size={14}/>{audienceLabel(item)}</span>
            </div>
            <h2>{item.title}</h2>
            <p className="announcements-message">{item.message}</p>
            <div className="announcements-meta">
              <span><Bell size={14}/> {item.author.fullName}</span>
              <span><CalendarClock size={14}/> {item.publishedAt ? `Published ${formatDate(item.publishedAt)}` : `Created ${formatDate(item.createdAt)}`}</span>
            </div>
            {ownDraft && <div className="announcements-actions">
              <button type="button" className="announcements-secondary" onClick={() => openEdit(item)} disabled={Boolean(busyId)}>
                <Edit3 size={15}/> Edit
              </button>
              <button type="button" className="announcements-primary" onClick={() => publish(item)} disabled={Boolean(busyId)}>
                {busyId === item.id ? <LoaderCircle className="announcements-spin" size={15}/> : <Send size={15}/>} Publish
              </button>
              <button type="button" className="announcements-danger" onClick={() => removeDraft(item)} disabled={Boolean(busyId)}>
                <Trash2 size={15}/> Delete draft
              </button>
            </div>}
          </article>;
        })}
      </div>}
    </div>
  );
}
