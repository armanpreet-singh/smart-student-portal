import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle, Building2, CheckCircle2, ExternalLink, Globe2,
  LoaderCircle, Mail, Phone, RefreshCw, RotateCcw, Save, ShieldCheck
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import {
  fetchAdminSystemSettings,
  updateAdminSystemSettings
} from "../api/adminSystemSettingsApi";

import "./SettingsPage.css";

const EMPTY_SETTINGS = {
  universityName: "",
  universityShortName: "",
  supportEmail: "",
  supportPhone: "",
  websiteUrl: "",
  currentAcademicYear: "",
  attendanceThresholdPercent: 75
};

function toFormValues(settings) {
  return {
    universityName: settings.universityName,
    universityShortName: settings.universityShortName,
    supportEmail: settings.supportEmail || "",
    supportPhone: settings.supportPhone || "",
    websiteUrl: settings.websiteUrl || "",
    currentAcademicYear: settings.currentAcademicYear || "",
    attendanceThresholdPercent: settings.attendanceThresholdPercent
  };
}

function formatUpdatedAt(value) {
  if (!value) return "Not saved yet";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

const SettingsPage = memo(() => {
  const { accessToken, sessionStatus, sessionError } = useAuth();
  const requestSequence = useRef(0);
  const [form, setForm] = useState(EMPTY_SETTINGS);
  const [savedForm, setSavedForm] = useState(EMPTY_SETTINGS);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [updatedBy, setUpdatedBy] = useState(null);
  const [loadState, setLoadState] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSettings = useCallback(async () => {
    const requestId = ++requestSequence.current;
    if (sessionStatus !== "authenticated" || !accessToken) {
      setLoadState(sessionStatus === "restoring" ? "loading" : "error");
      setLoadError(sessionError || "Sign in with an administrator account to manage system settings.");
      return;
    }
    setLoadState("loading");
    setLoadError("");
    try {
      const settings = await fetchAdminSystemSettings(accessToken);
      if (requestId !== requestSequence.current) return;
      const values = toFormValues(settings);
      setForm(values);
      setSavedForm(values);
      setUpdatedAt(settings.updatedAt);
      setUpdatedBy(settings.updatedBy);
      setLoadState("success");
    } catch (error) {
      if (requestId !== requestSequence.current) return;
      setLoadError(error?.message || "Unable to load system settings.");
      setLoadState("error");
    }
  }, [accessToken, sessionError, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "authenticated") void loadSettings();
    else if (sessionStatus === "restoring") setLoadState("loading");
    else {
      setLoadState("error");
      setLoadError(sessionError || "Your administrator session is unavailable.");
    }
    return () => { requestSequence.current += 1; };
  }, [loadSettings, sessionError, sessionStatus]);

  const isDirty = Object.keys(EMPTY_SETTINGS).some((key) => form[key] !== savedForm[key]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSaveError("");
    setSaved(false);
  };

  const resetChanges = () => {
    setForm(savedForm);
    setSaveError("");
    setSaved(false);
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    const values = {
      universityName: form.universityName.trim(),
      universityShortName: form.universityShortName.trim(),
      supportEmail: form.supportEmail.trim(),
      supportPhone: form.supportPhone.trim(),
      websiteUrl: form.websiteUrl.trim(),
      currentAcademicYear: form.currentAcademicYear.trim(),
      attendanceThresholdPercent: Number(form.attendanceThresholdPercent)
    };
    if (!values.universityName || !values.universityShortName) {
      setSaveError("Enter both the university name and short name.");
      return;
    }
    if (!Number.isInteger(values.attendanceThresholdPercent) ||
        values.attendanceThresholdPercent < 1 ||
        values.attendanceThresholdPercent > 100) {
      setSaveError("Attendance warning threshold must be a whole number between 1 and 100.");
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaved(false);
    try {
      const result = await updateAdminSystemSettings(accessToken, values);
      const next = toFormValues(result);
      setForm(next);
      setSavedForm(next);
      setUpdatedAt(result.updatedAt);
      setUpdatedBy(result.updatedBy);
      setSaved(true);
    } catch (error) {
      setSaveError(error?.message || "System settings could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="d-page-container a-system-settings-page">
      <SectionHeader
        title="System Settings"
        subtitle="Manage university identity, support contacts and academic alert rules"
      />

      {loadState === "loading" && (
        <div className="a-settings-state" role="status">
          <LoaderCircle size={20} className="a-settings-spin"/> Loading saved system settings…
        </div>
      )}
      {loadState === "error" && (
        <DashboardCard>
          <div className="a-settings-message is-error" role="alert">
            <AlertCircle size={18}/><span>{loadError}</span>
            <button type="button" onClick={loadSettings}><RefreshCw size={15}/> Retry</button>
          </div>
        </DashboardCard>
      )}

      {loadState === "success" && (
        <form className="a-system-settings-form" onSubmit={saveSettings}>
          <DashboardCard className="a-system-settings-card">
            <div className="a-settings-card-heading">
              <span className="a-settings-card-icon"><Building2 size={20}/></span>
              <div>
                <h2>University identity</h2>
                <p>Institution name and abbreviation stored with the portal configuration.</p>
              </div>
            </div>
            <div className="a-settings-field-grid">
              <label className="d-form-group">
                <span>University name</span>
                <input required minLength={2} maxLength={100}
                  value={form.universityName}
                  onChange={(event) => updateField("universityName", event.target.value)}
                  placeholder="e.g. Lovely Professional University"/>
              </label>
              <label className="d-form-group">
                <span>Short name</span>
                <input required minLength={2} maxLength={20}
                  value={form.universityShortName}
                  onChange={(event) => updateField("universityShortName", event.target.value)}
                  placeholder="e.g. LPU"/>
              </label>
            </div>
          </DashboardCard>

          <DashboardCard className="a-system-settings-card">
            <div className="a-settings-card-heading">
              <span className="a-settings-card-icon"><Globe2 size={20}/></span>
              <div>
                <h2>Support and contact details</h2>
                <p>Official support channels for university users.</p>
              </div>
            </div>
            <div className="a-settings-field-grid">
              <label className="d-form-group">
                <span><Mail size={14}/> Support email</span>
                <input type="email" maxLength={254} value={form.supportEmail}
                  onChange={(event) => updateField("supportEmail", event.target.value)}
                  placeholder="support@university.edu"/>
              </label>
              <label className="d-form-group">
                <span><Phone size={14}/> Support phone</span>
                <input type="tel" maxLength={30} value={form.supportPhone}
                  onChange={(event) => updateField("supportPhone", event.target.value)}
                  placeholder="+91 98765 43210"/>
              </label>
              <label className="d-form-group a-settings-wide-field">
                <span><ExternalLink size={14}/> Official website (HTTPS)</span>
                <input type="url" maxLength={2048} value={form.websiteUrl}
                  onChange={(event) => updateField("websiteUrl", event.target.value)}
                  placeholder="https://www.university.edu"/>
              </label>
            </div>
          </DashboardCard>

          <DashboardCard className="a-system-settings-card">
            <div className="a-settings-card-heading">
              <span className="a-settings-card-icon"><ShieldCheck size={20}/></span>
              <div>
                <h2>Academic rules</h2>
                <p>Set the active academic year label and attendance alert threshold.</p>
              </div>
            </div>
            <div className="a-settings-field-grid">
              <label className="d-form-group">
                <span>Current academic year</span>
                <input maxLength={20} value={form.currentAcademicYear}
                  onChange={(event) => updateField("currentAcademicYear", event.target.value)}
                  placeholder="e.g. 2026-2027"/>
                <small>Informational setting; existing class records are not changed.</small>
              </label>
              <label className="d-form-group">
                <span>Minimum attendance threshold (%)</span>
                <input type="number" min={1} max={100} step={1} required
                  value={form.attendanceThresholdPercent}
                  onChange={(event) => updateField("attendanceThresholdPercent", event.target.value)}/>
                <small>Students receive a subject warning when attendance falls below this percentage. Default: 75%.</small>
              </label>
            </div>
          </DashboardCard>

          {saveError && (
            <div className="a-settings-message is-error" role="alert">
              <AlertCircle size={18}/><span>{saveError}</span>
            </div>
          )}
          {saved && (
            <div className="a-settings-message is-success" role="status">
              <CheckCircle2 size={18}/><span>System settings saved successfully.</span>
            </div>
          )}

          <div className="a-settings-save-row">
            <div className="a-settings-save-meta">
              <span>Last saved: {formatUpdatedAt(updatedAt)}</span>
              {updatedBy && <span>Updated by {updatedBy.fullName}</span>}
            </div>
            <div className="a-settings-save-actions">
              <button type="button" className="a-settings-reset-button" onClick={resetChanges} disabled={!isDirty || saving}>
                <RotateCcw size={15}/> Discard changes
              </button>
              <button type="submit" className="d-btn-primary" disabled={!isDirty || saving}>
                {saving ? <LoaderCircle size={16} className="a-settings-spin"/> : <Save size={16}/>}
                {saving ? "Saving settings…" : "Save system settings"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
});

export default SettingsPage;
