import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell, Megaphone, ClipboardList, Clock3, GraduationCap,
  BookOpen, FileCheck2, ShieldAlert, Activity, Check,
  CheckCheck, LoaderCircle, RefreshCw, X
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "./notificationsApi";

import "./notifications.css";

const TYPE_ICONS = {
  ANNOUNCEMENT: Megaphone,
  ASSIGNMENT: ClipboardList,
  ASSIGNMENT_DEADLINE: Clock3,
  ASSIGNMENT_SUBMISSION: FileCheck2,
  ASSIGNMENT_RESULT: GraduationCap,
  ATTENDANCE_LOW: ShieldAlert,
  DUTY_PROOF: FileCheck2,
  LEARNING_RESOURCE: BookOpen,
  PLATFORM_ACTIVITY: Activity
};

function formatNotificationDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

const NotificationBell = () => {
  const { accessToken, user, sessionStatus } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const role = user?.role;
  const wrapperRef = useRef(null);
  const requestSequence = useRef(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadState, setLoadState] = useState("idle");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (sessionStatus !== "authenticated" || !accessToken || !role) return;
    const requestId = ++requestSequence.current;
    if (!quiet) setLoadState("loading");
    try {
      const result = await fetchNotifications(accessToken, role);
      if (requestId !== requestSequence.current) return;
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
      setError("");
      setLoadState("success");
    } catch (cause) {
      if (requestId !== requestSequence.current) return;
      setError(cause?.message || "Unable to load notifications.");
      setLoadState("error");
    }
  }, [accessToken, role, sessionStatus]);

  useEffect(() => {
    if (sessionStatus !== "authenticated" || !role) {
      setNotifications([]);
      setUnreadCount(0);
      setLoadState("idle");
      return undefined;
    }

    void load();
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") void load({ quiet: true });
    }, 45000);
    const onFocus = () => void load({ quiet: true });
    const onVisibility = () => {
      if (document.visibilityState === "visible") void load({ quiet: true });
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      requestSequence.current += 1;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [load, role, sessionStatus]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const sortedNotifications = useMemo(() => notifications, [notifications]);

  const openNotification = async (notification) => {
    if (!notification.readAt) {
      setBusyId(notification.id);
      try {
        await markNotificationRead(accessToken, role, notification.id);
        const readAt = new Date().toISOString();
        setNotifications((current) => current.map((item) =>
          item.id === notification.id ? { ...item, readAt } : item
        ));
        setUnreadCount((current) => Math.max(0, current - 1));
      } catch (cause) {
        setError(cause?.message || "Unable to mark notification as read.");
      } finally {
        setBusyId("");
      }
    }
    setIsOpen(false);
    if (notification.href && notification.href.startsWith("/")) {
      navigate(notification.href);
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0 || busyId) return;
    setBusyId("all");
    try {
      await markAllNotificationsRead(accessToken, role);
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt || readAt })));
      setUnreadCount(0);
      setError("");
    } catch (cause) {
      setError(cause?.message || "Unable to mark notifications as read.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="d-notification-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="d-icon-btn d-notification-trigger"
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((open) => !open);
          if (!isOpen) void load({ quiet: true });
        }}
      >
        <Bell size={20} aria-hidden="true"/>
        {unreadCount > 0 && (
          <span className="d-notification-count">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section className="d-notification-panel" role="dialog" aria-label="Notifications">
          <header className="d-notification-panel-header">
            <div>
              <h2>Notifications</h2>
              <span>{unreadCount ? `${unreadCount} unread` : "You're all caught up"}</span>
            </div>
            <div className="d-notification-panel-actions">
              {unreadCount > 0 && (
                <button type="button" onClick={markAllRead} disabled={busyId !== ""} aria-label="Mark all notifications as read">
                  {busyId === "all" ? <LoaderCircle size={15} className="d-notification-spin"/> : <CheckCheck size={15}/>}
                  Mark all read
                </button>
              )}
              <button type="button" className="d-notification-close" onClick={() => setIsOpen(false)} aria-label="Close notifications">
                <X size={17}/>
              </button>
            </div>
          </header>

          {error && (
            <div className="d-notification-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={() => load()} aria-label="Retry notifications"><RefreshCw size={14}/></button>
            </div>
          )}

          {loadState === "loading" && (
            <div className="d-notification-state"><LoaderCircle size={18} className="d-notification-spin"/> Loading notifications…</div>
          )}
          {loadState === "error" && !notifications.length && (
            <div className="d-notification-state">
              <span>Notifications couldn't be loaded.</span>
              <button type="button" onClick={() => load()}>Retry</button>
            </div>
          )}
          {loadState === "success" && sortedNotifications.length === 0 && (
            <div className="d-notification-state d-notification-empty">
              <Bell size={24}/>
              <strong>No notifications yet</strong>
              <span>Important updates for your account will appear here.</span>
            </div>
          )}

          {sortedNotifications.length > 0 && (
            <div className="d-notification-list">
              {sortedNotifications.map((notification) => {
                const Icon = TYPE_ICONS[notification.type] || Bell;
                const isBusy = busyId === notification.id;
                return (
                  <button
                    type="button"
                    className={`d-notification-item ${notification.readAt ? "is-read" : "is-unread"}`}
                    key={notification.id}
                    onClick={() => void openNotification(notification)}
                    disabled={Boolean(busyId)}
                  >
                    <span className={`d-notification-item-icon type-${notification.type.toLowerCase()}`}>
                      {isBusy ? <LoaderCircle size={17} className="d-notification-spin"/> : <Icon size={17}/>}
                    </span>
                    <span className="d-notification-item-copy">
                      <strong>{notification.title}</strong>
                      <span>{notification.message}</span>
                      <small>{formatNotificationDate(notification.createdAt)}</small>
                    </span>
                    {!notification.readAt && <span className="d-notification-unread-indicator" aria-label="Unread"/>}
                    {notification.readAt && <Check size={14} className="d-notification-read-check" aria-label="Read"/>}
                  </button>
                );
              })}
            </div>
          )}
          <footer className="d-notification-panel-footer">
            Notifications refresh automatically while the portal is open.
          </footer>
        </section>
      )}
    </div>
  );
};

export default NotificationBell;
