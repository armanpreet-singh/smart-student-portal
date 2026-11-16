import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle, BookOpen, CalendarClock, Download, FileText, FolderOpen,
  LoaderCircle, RefreshCw, Search
} from "lucide-react";

import DashboardCard from "../components/DashboardCard/DashboardCard";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import { useAuth } from "../../auth/context/AuthContext";
import {
  fetchLearningResourceDownload, fetchLearningResources, formatResourceBytes
} from "../../shared/resources/learningResourcesApi";

import "./ResourcesPage.css";

function formatDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  }).format(date);
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

const ResourcesPage = () => {
  const { accessToken, sessionStatus, sessionError } = useAuth();
  const requestSequence = useRef(0);
  const [resources, setResources] = useState([]);
  const [loadState, setLoadState] = useState("loading");
  const [error, setError] = useState("");
  const [busyResourceId, setBusyResourceId] = useState("");
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    const requestId = ++requestSequence.current;
    if (sessionStatus !== "authenticated" || !accessToken) {
      setLoadState(sessionStatus === "restoring" ? "loading" : "error");
      setError(sessionError || "Sign in again to view learning resources.");
      return;
    }
    setLoadState("loading");
    setError("");
    try {
      const result = await fetchLearningResources(accessToken, "student");
      if (requestId !== requestSequence.current) return;
      setResources(result);
      setLoadState("success");
    } catch (cause) {
      if (requestId !== requestSequence.current) return;
      setError(cause?.message || "Unable to load learning resources.");
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

  const visibleResources = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return resources;
    return resources.filter((item) => [
      item.title, item.description, item.file.fileName, item.subject.name,
      item.subject.code, item.teacher.fullName
    ].some((value) => value.toLowerCase().includes(query)));
  }, [resources, search]);

  const download = async (resource) => {
    const previewWindow = window.open("about:blank", "_blank");
    if (previewWindow) previewWindow.opener = null;
    setBusyResourceId(resource.id);
    setError("");
    try {
      const result = await fetchLearningResourceDownload(accessToken, "student", resource.id);
      openDownload(result, previewWindow);
    } catch (cause) {
      previewWindow?.close();
      setError(cause?.message || "The notes file could not be downloaded.");
    } finally {
      setBusyResourceId("");
    }
  };

  return (
    <div className="d-page-container s-resources-page">
      <SectionHeader
        title="Learning Resources"
        subtitle="Study notes uploaded by your Teachers for your current class"
      />

      <div className="s-resources-summary">
        <div><BookOpen size={19}/><span>{resources.length} notes file{resources.length === 1 ? "" : "s"} available to your class</span></div>
        <label><Search size={16}/><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notes or subjects…"/></label>
      </div>

      {loadState === "loading" && <div className="s-resources-state" role="status"><LoaderCircle className="s-resources-spin" size={20}/> Loading learning resources…</div>}
      {loadState === "error" && <DashboardCard><div className="s-resources-alert" role="alert"><AlertCircle size={18}/><span>{error}</span><button type="button" onClick={loadData}><RefreshCw size={15}/> Retry</button></div></DashboardCard>}

      {loadState === "success" && visibleResources.length === 0 && (
        <DashboardCard className="s-resources-empty">
          <FolderOpen size={30}/>
          <strong>{resources.length ? "No matching notes" : "No notes available yet"}</strong>
          <span>{resources.length ? "Try another title or subject." : "Your Teachers have not uploaded notes for this class yet. Check again later."}</span>
        </DashboardCard>
      )}

      {loadState === "success" && visibleResources.length > 0 && (
        <div className="s-resources-list">
          {visibleResources.map((resource) => (
            <DashboardCard className="s-resource-card" key={resource.id}>
              <div className="s-resource-file-icon"><FileText size={23}/></div>
              <div className="s-resource-main">
                <div className="s-resource-title-row"><h2>{resource.title}</h2><span>{resource.file.format.toUpperCase()}</span></div>
                {resource.description && <p className="s-resource-description">{resource.description}</p>}
                <div className="s-resource-meta">
                  <span><BookOpen size={13}/>{resource.subject.code} · {resource.subject.name}</span>
                  <span>{resource.file.fileName}</span>
                  <span>{formatResourceBytes(resource.file.bytes)}</span>
                  <span>By {resource.teacher.fullName}</span>
                  <span><CalendarClock size={13}/>{formatDate(resource.createdAt)}</span>
                </div>
              </div>
              <button type="button" className="s-resource-download" onClick={() => download(resource)} disabled={Boolean(busyResourceId)}>
                {busyResourceId === resource.id ? <LoaderCircle className="s-resources-spin" size={16}/> : <Download size={16}/>}
                Download
              </button>
            </DashboardCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
