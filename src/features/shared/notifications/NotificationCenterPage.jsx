import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, AlertTriangle, Bell, BookOpen, CalendarClock, Check,
  CheckCheck, Clock3, GraduationCap, Megaphone, RefreshCw,
  ShieldAlert, SlidersHorizontal, ClipboardCheck, LoaderCircle
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import {
  fetchNotifications,
  fetchNotificationPreferences,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences
} from "./notificationsApi";
import "./notification-centre.css";

const ICONS = {
  ANNOUNCEMENT: Megaphone,
  ASSIGNMENT: ClipboardCheck,
  ASSIGNMENT_DEADLINE: CalendarClock,
  ASSIGNMENT_SUBMISSION: GraduationCap,
  ASSIGNMENT_RESULT: GraduationCap,
  ATTENDANCE_LOW: ShieldAlert,
  DUTY_PROOF: ShieldAlert,
  LEARNING_RESOURCE: BookOpen,
  PLATFORM_ACTIVITY: Activity
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "reminders", label: "Reminders" },
  { id: "announcements", label: "Announcements" },
  { id: "academic", label: "Academic updates" },
  { id: "resources", label: "Resources" }
];

const FILTER_TYPES = {
  reminders: ["ASSIGNMENT_DEADLINE", "ATTENDANCE_LOW"],
  announcements: ["ANNOUNCEMENT"],
  academic: ["ASSIGNMENT", "ASSIGNMENT_SUBMISSION", "ASSIGNMENT_RESULT", "DUTY_PROOF"],
  resources: ["LEARNING_RESOURCE"]
};

const PREFERENCE_GROUPS = {
  STUDENT: [
    {
      title: "Assignment reminders",
      description: "Receive in-portal reminders before an assignment is due.",
      items: [
        { key: "assignmentDeadline24h", label: "24 hours before the deadline" },
        { key: "assignmentDeadline1h", label: "1 hour before the deadline" }
      ]
    },
    {
      title: "Academic alerts",
      description: "Stay informed about attendance and coursework activity.",
      items: [
        { key: "lowAttendanceAlerts", label: "Low attendance alerts" },
        { key: "assignmentUpdates", label: "Assignment updates and published results" }
      ]
    },
    {
      title: "Portal updates",
      description: "Updates shared with your class or account.",
      items: [
        { key: "announcements", label: "Announcements" },
        { key: "learningResourceUpdates", label: "New learning resources" },
        { key: "platformUpdates", label: "Other platform activity" }
      ]
    }
  ],
  TEACHER: [
    {
      title: "Teaching workflow reminders",
      description: "Keep track of work that needs faculty attention.",
      items: [
        { key: "pendingReviewReminders", label: "Submissions awaiting grading or result publication" },
        { key: "assignmentUpdates", label: "Assignment and submission activity" }
      ]
    },
    {
      title: "Class updates",
      description: "Updates shared with your assigned classes and subjects.",
      items: [
        { key: "announcements", label: "Announcements" },
        { key: "learningResourceUpdates", label: "Learning resource activity" },
        { key: "platformUpdates", label: "Other platform activity" }
      ]
    }
  ]
};

function formatNotificationDate(value) {
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

function notificationCategory(type) {
  if (type === "ASSIGNMENT_DEADLINE" || type === "ATTENDANCE_LOW") return "Reminder";
  if (type === "ANNOUNCEMENT") return "Announcement";
  if (type === "LEARNING_RESOURCE") return "Resource";
  if (type.startsWith("ASSIGNMENT") || type === "DUTY_PROOF") return "Academic update";
  return "Portal update";
}

const NotificationCenterPage = ({ role = "STUDENT" }) => {
  const { accessToken, sessionStatus } = useAuth();
  const navigate = useNavigate();
  const isTeacher = role === "TEACHER";
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState(null);
  const [draftPreferences, setDraftPreferences] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [preferenceError, setPreferenceError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const load = useCallback(async () => {
    if (sessionStatus !== "authenticated" || !accessToken) return;
    setLoading(true);
    setError("");
    setPreferenceError("");
    try {
      const [feed, savedPreferences] = await Promise.all([
        fetchNotifications(accessToken, role, 100),
        fetchNotificationPreferences(accessToken, role)
      ]);
      setNotifications(feed.notifications);
      setUnreadCount(feed.unreadCount);
      setPreferences(savedPreferences);
      setDraftPreferences(savedPreferences);
    } catch (cause) {
      setError(cause?.message || "Unable to load your notification centre.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, role, sessionStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredNotifications = useMemo(() => {
    const ordered = [...notifications].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    if (activeFilter === "unread") return ordered.filter((item) => !item.readAt);
    const allowedTypes = FILTER_TYPES[activeFilter];
    return allowedTypes ? ordered.filter((item) => allowedTypes.includes(item.type)) : ordered;
  }, [activeFilter, notifications]);

  const dirtyPreferences = useMemo(() => {
    if (!preferences || !draftPreferences) return false;
    return Object.keys(draftPreferences).some((key) => draftPreferences[key] !== preferences[key]);
  }, [draftPreferences, preferences]);

  const markOneRead = async (notification) => {
    if (notification.readAt || busyId) return true;
    setBusyId(notification.id);
    try {
      await markNotificationRead(accessToken, role, notification.id);
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((item) =>
        item.id === notification.id ? { ...item, readAt } : item
      ));
      setUnreadCount((current) => Math.max(0, current - 1));
      return true;
    } catch (cause) {
      setError(cause?.message || "Unable to mark this notification as read.");
      return false;
    } finally {
      setBusyId("");
    }
  };

  const openNotification = async (notification) => {
    const marked = await markOneRead(notification);
    if (!marked) return;
    if (notification.href && notification.href.startsWith("/")) navigate(notification.href);
  };

  const markAllRead = async () => {
    if (!unreadCount || busyId) return;
    setBusyId("all");
    try {
      await markAllNotificationsRead(accessToken, role);
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt || readAt })));
      setUnreadCount(0);
    } catch (cause) {
      setError(cause?.message || "Unable to mark notifications as read.");
    } finally {
      setBusyId("");
    }
  };

  const savePreferences = async () => {
    if (!dirtyPreferences || savingPreferences || !draftPreferences) return;
    setSavingPreferences(true);
    setPreferenceError("");
    setSavedMessage("");
    try {
      const updated = await updateNotificationPreferences(accessToken, role, draftPreferences);
      setPreferences(updated);
      setDraftPreferences(updated);
      setSavedMessage("Your reminder preferences have been saved.");
    } catch (cause) {
      setPreferenceError(cause?.message || "Unable to save reminder preferences.");
    } finally {
      setSavingPreferences(false);
    }
  };

  const updateDraft = (key, checked) => {
    setDraftPreferences((current) => ({ ...current, [key]: checked }));
    setSavedMessage("");
  };

  return (
    <div className="d-page-container d-notification-centre">
      <header className="d-notification-centre-heading">
        <div>
          <span className="d-notification-centre-eyebrow">PERSONAL INBOX</span>
          <h1>Notification Centre</h1>
          <p>
            {isTeacher
              ? "Stay on top of submissions, class announcements and teaching updates."
              : "Keep track of assignment deadlines, attendance alerts and class updates."}
          </p>
        </div>
        <button type="button" className="d-notification-centre-refresh" onClick={() => void load()} disabled={loading}>
          {loading ? <LoaderCircle size={16} className="d-notification-centre-spin"/> : <RefreshCw size={16}/>}
          Refresh
        </button>
      </header>

      <section className="d-notification-centre-stats" aria-label="Notification summary">
        <div className="d-notification-centre-stat">
          <span className="d-notification-centre-stat-icon"><Bell size={18}/></span>
          <div><strong>{notifications.length}</strong><span>Recent notifications</span></div>
        </div>
        <div className="d-notification-centre-stat">
          <span className="d-notification-centre-stat-icon is-unread"><AlertTriangle size={18}/></span>
          <div><strong>{unreadCount}</strong><span>Unread</span></div>
        </div>
        <div className="d-notification-centre-stat">
          <span className="d-notification-centre-stat-icon"><Clock3 size={18}/></span>
          <div><strong>5 min</strong><span>Reminder check interval</span></div>
        </div>
      </section>

      <div className="d-notification-centre-grid">
        <section className="d-notification-centre-card d-notification-inbox">
          <div className="d-notification-section-heading">
            <div>
              <h2>Your notifications</h2>
              <p>Latest 100 updates for your account</p>
            </div>
            <button type="button" className="d-notification-text-action" onClick={() => void markAllRead()} disabled={!unreadCount || Boolean(busyId)}>
              {busyId === "all" ? <LoaderCircle size={14} className="d-notification-centre-spin"/> : <CheckCheck size={14}/>}
              Mark all read
            </button>
          </div>

          <div className="d-notification-centre-filters" role="tablist" aria-label="Filter notifications">
            {FILTERS.map((filter) => (
              <button
                type="button"
                role="tab"
                key={filter.id}
                aria-selected={activeFilter === filter.id}
                className={activeFilter === filter.id ? "is-active" : ""}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
                {filter.id === "unread" && <span>{unreadCount}</span>}
              </button>
            ))}
          </div>

          {error && <div className="d-notification-centre-error" role="alert">{error}</div>}
          {loading && <div className="d-notification-centre-state"><LoaderCircle size={20} className="d-notification-centre-spin"/> Loading notifications…</div>}
          {!loading && !error && filteredNotifications.length === 0 && (
            <div className="d-notification-centre-state">
              <Bell size={25}/>
              <strong>{activeFilter === "unread" ? "No unread notifications" : "Nothing to show yet"}</strong>
              <span>New reminders and account updates will appear here.</span>
            </div>
          )}
          {!loading && filteredNotifications.length > 0 && (
            <div className="d-notification-centre-list">
              {filteredNotifications.map((notification) => {
                const Icon = ICONS[notification.type] || Activity;
                return (
                  <button
                    type="button"
                    key={notification.id}
                    className={`d-notification-centre-item ${notification.readAt ? "is-read" : "is-unread"}`}
                    onClick={() => void openNotification(notification)}
                    disabled={Boolean(busyId)}
                  >
                    <span className={`d-notification-centre-icon type-${notification.type.toLowerCase()}`}><Icon size={18}/></span>
                    <span className="d-notification-centre-copy">
                      <span className="d-notification-centre-item-top">
                        <strong>{notification.title}</strong>
                        <small>{notificationCategory(notification.type)}</small>
                      </span>
                      <span className="d-notification-centre-message">{notification.message}</span>
                      <span className="d-notification-centre-date">{formatNotificationDate(notification.createdAt)}</span>
                    </span>
                    {!notification.readAt && <span className="d-notification-centre-unread-dot" aria-label="Unread"/>}
                    {notification.readAt && <Check size={15} className="d-notification-centre-read-check" aria-label="Read"/>}
                  </button>
                );
              })}
            </div>
          )}
          <footer className="d-notification-centre-footer">Notifications are stored in your account and refresh while the portal is open.</footer>
        </section>

        <aside className="d-notification-centre-card d-notification-preferences">
          <div className="d-notification-section-heading">
            <div>
              <span className="d-notification-preferences-heading-icon"><SlidersHorizontal size={17}/></span>
              <h2>Reminder preferences</h2>
              <p>Choose which in-portal alerts you receive.</p>
            </div>
          </div>
          {!draftPreferences && !loading && (
            <div className="d-notification-preference-error" role="alert">Preferences could not be loaded. Refresh to try again.</div>
          )}
          {draftPreferences && PREFERENCE_GROUPS[role]?.map((group) => (
            <section className="d-notification-preference-group" key={group.title}>
              <div>
                <h3>{group.title}</h3>
                <p>{group.description}</p>
              </div>
              {group.items.map((item) => (
                <label className="d-notification-preference-row" key={item.key}>
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(draftPreferences[item.key])}
                    onChange={(event) => updateDraft(item.key, event.target.checked)}
                    disabled={savingPreferences}
                  />
                </label>
              ))}
            </section>
          ))}
          {preferenceError && <div className="d-notification-preference-error" role="alert">{preferenceError}</div>}
          {savedMessage && <div className="d-notification-preference-success" role="status">{savedMessage}</div>}
          <button type="button" className="d-notification-preferences-save" onClick={() => void savePreferences()} disabled={!dirtyPreferences || savingPreferences}>
            {savingPreferences ? <LoaderCircle size={15} className="d-notification-centre-spin"/> : <Check size={15}/>}
            {savingPreferences ? "Saving…" : "Save preferences"}
          </button>
          <p className="d-notification-preferences-note">
            These settings control in-portal notifications. Email and browser push delivery are not enabled.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default NotificationCenterPage;
