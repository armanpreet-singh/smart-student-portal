import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Bell, CalendarClock, LoaderCircle, Megaphone, RefreshCw, Users } from "lucide-react";

import { useAuth } from "../../auth/context/AuthContext";
import { fetchAnnouncements } from "./announcementsApi";
import "./announcements.css";

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
  return [item.class?.name, item.subject?.name].filter(Boolean).join(" · ") || "Your class";
}

export default function AnnouncementsFeed() {
  const { accessToken, sessionStatus, sessionError } = useAuth();
  const requestSequence = useRef(0);
  const [announcements, setAnnouncements] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    const requestId = ++requestSequence.current;
    if (sessionStatus !== "authenticated" || !accessToken) {
      setLoadState(sessionStatus === "restoring" ? "loading" : "error");
      setError(sessionError || "Sign in again to view announcements.");
      return;
    }
    setLoadState("loading");
    setError("");
    try {
      const result = await fetchAnnouncements(accessToken, "student");
      if (requestId !== requestSequence.current) return;
      setAnnouncements(result);
      setLoadState("success");
    } catch (cause) {
      if (requestId !== requestSequence.current) return;
      setError(cause?.message || "Unable to load announcements.");
      setLoadState("error");
    }
  }, [accessToken, sessionError, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "authenticated") void loadData();
    else if (sessionStatus === "restoring") setLoadState("loading");
    else {
      setLoadState("error");
      setError(sessionError || "Your Student session is unavailable.");
    }
    return () => { requestSequence.current += 1; };
  }, [loadData, sessionError, sessionStatus]);

  return (
    <div className="d-page-container announcements-page">
      <header className="announcements-heading">
        <div><h1>Announcements</h1><p>Official university and class updates for you.</p></div>
      </header>
      {loadState === "loading" && <div className="announcements-state" role="status">
        <LoaderCircle className="announcements-spin" size={22}/> Loading announcements…
      </div>}
      {loadState === "error" && <div className="announcements-alert" role="alert">
        <AlertCircle size={20}/><span>{error}</span>
        <button type="button" onClick={loadData}><RefreshCw size={15}/> Retry</button>
      </div>}
      {loadState === "success" && announcements.length === 0 && (
        <div className="announcements-empty">
          <Megaphone size={28}/><strong>No announcements at the moment</strong>
          <span>When the university or your class publishes an update, it will appear here.</span>
        </div>
      )}
      {loadState === "success" && announcements.length > 0 && (
        <div className="announcements-list">
          {announcements.map((item) => <article className="announcements-card" key={item.id}>
            <div className="announcements-card-top">
              <span className="announcements-status is-published">Published</span>
              <span className="announcements-audience"><Users size={14}/>{audienceLabel(item)}</span>
            </div>
            <h2>{item.title}</h2>
            <p className="announcements-message">{item.message}</p>
            <div className="announcements-meta">
              <span><Bell size={14}/>{item.author.fullName}</span>
              <span><CalendarClock size={14}/>{formatDate(item.publishedAt)}</span>
            </div>
          </article>)}
        </div>
      )}
    </div>
  );
}
