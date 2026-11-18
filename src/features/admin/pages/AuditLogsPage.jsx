import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  History,
  RefreshCw,
  Search,
  ShieldCheck
} from "lucide-react";

import { useAuth } from "../../auth/context/AuthContext";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import { fetchAdminAuditLogs } from "../api/adminAuditApi";

import "./AuditLogsPage.css";

const PAGE_SIZE = 25;

const ACTIONS = [
  ["USER_CREATED", "Student / Teacher created"],
  ["USER_RESTORED", "Retired account restored"],
  ["USER_RETIRED", "Account retired"],
  ["USER_PROFILE_UPDATED", "Account profile updated"],
  ["USER_ACTIVATED", "Account activated"],
  ["USER_DEACTIVATED", "Account deactivated"],
  ["USER_PASSWORD_RESET", "Password reset"],
  ["CLASS_CREATED", "Class created"],
  ["CLASS_UPDATED", "Class updated"],
  ["SUBJECT_CREATED", "Subject created"],
  ["SUBJECT_UPDATED", "Subject updated"],
  ["TEACHER_SUBJECT_ASSIGNED", "Teacher assigned to subject"],
  ["ANNOUNCEMENT_CREATED", "Announcement created"],
  ["ANNOUNCEMENT_UPDATED", "Announcement updated"],
  ["ANNOUNCEMENT_PUBLISHED", "Announcement published"],
  ["ANNOUNCEMENT_DELETED", "Announcement deleted"],
  ["ANNOUNCEMENT_ATTACHMENT_ACCESSED", "Announcement attachment accessed"],
  ["DUTY_PROOF_ACCESSED", "Duty proof accessed"],
  ["SYSTEM_SETTINGS_UPDATED", "System settings updated"]
];

const ENTITY_TYPES = [
  ["USER", "User account"],
  ["CLASS", "Class"],
  ["SUBJECT", "Subject"],
  ["TEACHER_SUBJECT_ASSIGNMENT", "Teaching assignment"],
  ["ANNOUNCEMENT", "Announcement"],
  ["ATTENDANCE", "Attendance / duty proof"],
  ["SYSTEM_SETTING", "System settings"]
];

function formatDateTime(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function actionLabel(action) {
  return ACTIONS.find(([value]) => value === action)?.[1] ||
    action.toLowerCase().replaceAll("_", " ");
}

function entityLabel(type) {
  return ENTITY_TYPES.find(([value]) => value === type)?.[1] || type;
}

function detailLabel(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
}

function detailValue(value) {
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function LoadingState() {
  return (
    <DashboardCard className="a-audit-state" padding={false}>
      <span className="a-audit-spinner" aria-hidden="true" />
      <div>
        <h3>Loading audit history</h3>
        <p>Retrieving administrator activity records.</p>
      </div>
    </DashboardCard>
  );
}

function EmptyState({ filtered }) {
  return (
    <DashboardCard className="a-audit-state" padding={false}>
      <History size={25} aria-hidden="true" />
      <div>
        <h3>{filtered ? "No matching audit events" : "No audit events yet"}</h3>
        <p>
          {filtered
            ? "Try changing the filters or clearing the search."
            : "Successful administrator changes and sensitive document access will appear here."}
        </p>
      </div>
    </DashboardCard>
  );
}

const AuditLogsPage = () => {
  const { accessToken, refreshCurrentUser } = useAuth();
  const [draftFilters, setDraftFilters] = useState({
    search: "",
    action: "",
    entityType: "",
    fromDate: "",
    toDate: ""
  });
  const [filters, setFilters] = useState({
    search: "",
    action: "",
    entityType: "",
    fromDate: "",
    toDate: ""
  });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [filterError, setFilterError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadAuditLogs() {
      setStatus("loading");
      setError("");
      try {
        const data = await fetchAdminAuditLogs(accessToken, {
          ...filters,
          page,
          pageSize: PAGE_SIZE
        });
        if (!active) return;
        setResult(data);
        setStatus("success");
      } catch (loadError) {
        if (!active) return;
        if (loadError?.status === 401) {
          await refreshCurrentUser();
          if (!active) return;
        }
        setError(loadError?.message || "Unable to load the audit history.");
        setStatus("error");
      }
    }
    void loadAuditLogs();
    return () => { active = false; };
  }, [accessToken, filters, page, refreshCurrentUser, retry]);

  const logs = result?.logs || [];
  const pagination = result?.pagination;
  const filtered = useMemo(
    () => Object.values(filters).some((value) => Boolean(value)),
    [filters]
  );

  const applyFilters = (event) => {
    event.preventDefault();
    setFilterError("");
    if (draftFilters.fromDate && draftFilters.toDate &&
        draftFilters.fromDate > draftFilters.toDate) {
      setFilterError("Start date must be on or before end date.");
      return;
    }
    setFilters({
      search: draftFilters.search.trim(),
      action: draftFilters.action,
      entityType: draftFilters.entityType,
      fromDate: draftFilters.fromDate,
      toDate: draftFilters.toDate
    });
    setPage(1);
  };

  const clearFilters = () => {
    const cleared = { search: "", action: "", entityType: "", fromDate: "", toDate: "" };
    setDraftFilters(cleared);
    setFilters(cleared);
    setPage(1);
    setFilterError("");
  };

  return (
    <div className="d-page-container a-audit-page">
      <SectionHeader
        title="Admin Audit Logs"
        subtitle="A chronological, read-only record of administrator changes and sensitive access events"
      />

      <div className="a-audit-intro">
        <div className="a-audit-intro-icon"><ShieldCheck size={21} aria-hidden="true" /></div>
        <div>
          <strong>Administrative activity trail</strong>
          <p>Each entry identifies the administrator, action, affected record, timestamp and request context. Passwords, tokens and file contents are never displayed.</p>
        </div>
      </div>

      <DashboardCard className="a-audit-filters">
        <form onSubmit={applyFilters}>
          <div className="a-audit-filter-heading">
            <div>
              <h3><Filter size={16} aria-hidden="true" /> Filter activity</h3>
              <p>Search by administrator, action, record name or record ID.</p>
            </div>
            <Activity size={20} aria-hidden="true" />
          </div>

          <div className="a-audit-filter-grid">
            <label className="d-form-group a-audit-search-field">
              <span>Search</span>
              <div>
                <Search size={16} aria-hidden="true" />
                <input
                  type="search"
                  maxLength={80}
                  placeholder="Name, username or record…"
                  value={draftFilters.search}
                  onChange={(event) => setDraftFilters((current) => ({ ...current, search: event.target.value }))}
                />
              </div>
            </label>
            <label className="d-form-group">
              <span>Action</span>
              <select value={draftFilters.action} onChange={(event) => setDraftFilters((current) => ({ ...current, action: event.target.value }))}>
                <option value="">All actions</option>
                {ACTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="d-form-group">
              <span>Record type</span>
              <select value={draftFilters.entityType} onChange={(event) => setDraftFilters((current) => ({ ...current, entityType: event.target.value }))}>
                <option value="">All record types</option>
                {ENTITY_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="d-form-group">
              <span>From date</span>
              <input type="date" value={draftFilters.fromDate} max={draftFilters.toDate || undefined} onChange={(event) => setDraftFilters((current) => ({ ...current, fromDate: event.target.value }))} />
            </label>
            <label className="d-form-group">
              <span>To date</span>
              <input type="date" value={draftFilters.toDate} min={draftFilters.fromDate || undefined} onChange={(event) => setDraftFilters((current) => ({ ...current, toDate: event.target.value }))} />
            </label>
          </div>

          {filterError && <p className="a-audit-filter-error" role="alert">{filterError}</p>}
          <div className="a-audit-filter-actions">
            <span>{pagination ? `${pagination.total.toLocaleString()} events found` : "Audit history"}</span>
            <div>
              <button type="button" className="a-audit-clear" onClick={clearFilters}>Clear filters</button>
              <button type="submit" className="d-btn-primary"><Filter size={15} aria-hidden="true" /> Apply filters</button>
            </div>
          </div>
        </form>
      </DashboardCard>

      {status === "loading" && <LoadingState />}

      {status === "error" && (
        <DashboardCard className="a-audit-state a-audit-error" padding={false}>
          <div>
            <h3>Audit history is unavailable</h3>
            <p>{error}</p>
          </div>
          <button type="button" onClick={() => setRetry((value) => value + 1)}>
            <RefreshCw size={15} aria-hidden="true" /> Retry
          </button>
        </DashboardCard>
      )}

      {status === "success" && logs.length === 0 && <EmptyState filtered={filtered} />}

      {status === "success" && logs.length > 0 && (
        <DashboardCard padding={false} className="a-audit-log-card">
          <div className="a-audit-table-heading">
            <div>
              <h3>Activity history</h3>
              <p>Newest events appear first. Audit entries cannot be edited or deleted from the portal.</p>
            </div>
            <span><Clock3 size={15} aria-hidden="true" /> {pagination.total.toLocaleString()} total</span>
          </div>
          <div className="a-audit-table-scroll">
            <table className="a-audit-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Administrator</th>
                  <th>Action</th>
                  <th>Affected record</th>
                  <th>Recorded details</th>
                  <th>IP address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="a-audit-time">
                      <strong>{formatDateTime(log.createdAt)}</strong>
                      <small>{log.id}</small>
                    </td>
                    <td className="a-audit-actor">
                      <strong>{log.actorName}</strong>
                      <small>@{log.actorUsername}</small>
                    </td>
                    <td><span className="a-audit-action">{actionLabel(log.action)}</span></td>
                    <td className="a-audit-entity">
                      <strong>{log.entityLabel || log.entityId || entityLabel(log.entityType)}</strong>
                      <small>{entityLabel(log.entityType)}{log.entityId ? ` · ${log.entityId}` : ""}</small>
                    </td>
                    <td className="a-audit-details">
                      {Object.entries(log.details || {}).length ? Object.entries(log.details).map(([key, value]) => (
                        <span key={key}><b>{detailLabel(key)}:</b> {detailValue(value)}</span>
                      )) : <small>—</small>}
                    </td>
                    <td className="a-audit-ip">
                      {log.ipAddress || "—"}
                      {log.userAgent && <small title={log.userAgent}>Request browser info</small>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="a-audit-pagination">
            <p>
              {pagination.total === 0
                ? "No events to display"
                : `Showing ${((pagination.page - 1) * pagination.pageSize + 1).toLocaleString()}–${Math.min(pagination.page * pagination.pageSize, pagination.total).toLocaleString()} of ${pagination.total.toLocaleString()}`}
            </p>
            <div>
              <button type="button" aria-label="Previous page" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1}>
                <ChevronLeft size={17} /> Previous
              </button>
              <span>Page {pagination.page} of {Math.max(pagination.totalPages, 1)}</span>
              <button type="button" aria-label="Next page" onClick={() => setPage((value) => value + 1)} disabled={pagination.totalPages === 0 || page >= pagination.totalPages}>
                Next <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </DashboardCard>
      )}

      <p className="a-audit-retention-note">
        Audit events are stored in the university database. This page does not provide controls to edit or erase history.
      </p>
    </div>
  );
};

export default AuditLogsPage;
