import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, Filter, LoaderCircle, RefreshCw, Search, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { fetchTeacherAcademicRisk } from "./academicRiskApi";
import { AcademicRiskReportCard, RiskMethodologyNote } from "./AcademicRiskComponents";
import "./academic-risk.css";

const TeacherAcademicRiskPage = () => {
  const { accessToken, sessionStatus } = useAuth();
  const [data, setData] = useState(null);
  const [draft, setDraft] = useState({ search: "", subjectId: "", riskLevel: "" });
  const [filters, setFilters] = useState({ search: "", subjectId: "", riskLevel: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  const load = useCallback(async () => {
    if (sessionStatus !== "authenticated" || !accessToken) return;
    setLoading(true);
    setError("");
    try {
      const result = await fetchTeacherAcademicRisk(accessToken, filters);
      setData(result);
    } catch (cause) {
      setError(cause?.message || "Unable to load academic risk reports for assigned subjects.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, filters, sessionStatus]);

  useEffect(() => { void load(); }, [load, refresh]);

  const applyFilters = (event) => {
    event.preventDefault();
    setFilters({
      search: draft.search.trim(),
      subjectId: draft.subjectId,
      riskLevel: draft.riskLevel
    });
  };

  const clearFilters = () => {
    const empty = { search: "", subjectId: "", riskLevel: "" };
    setDraft(empty);
    setFilters(empty);
  };

  return (
    <div className="d-page-container ar-page">
      <header className="ar-page-header">
        <div>
          <span className="ar-eyebrow">EARLY ACADEMIC SUPPORT</span>
          <h1>Student Academic Risk</h1>
          <p>Identify students who may benefit from timely support in your assigned subjects.</p>
        </div>
        <button type="button" className="ar-refresh" onClick={() => setRefresh((value) => value + 1)} disabled={loading}>
          {loading ? <LoaderCircle size={16} className="ar-spin"/> : <RefreshCw size={16}/>} Refresh
        </button>
      </header>

      {data && <RiskMethodologyNote attendanceThresholdPercent={data.attendanceThresholdPercent}/>}

      {data && (
        <div className="ar-risk-overview">
          <div className="ar-overview-card"><span>Students in assigned classes</span><strong>{data.summary.totalStudents}</strong><small>Within your assigned subject scope</small></div>
          <div className="ar-overview-card is-high"><span>High risk</span><strong>{data.summary.highRisk}</strong><small>Require prompt follow-up</small></div>
          <div className="ar-overview-card is-medium"><span>Needs attention</span><strong>{data.summary.mediumRisk}</strong><small>Early support recommended</small></div>
          <div className="ar-overview-card is-low"><span>On track</span><strong>{data.summary.lowRisk}</strong><small>No current risk indicators</small></div>
        </div>
      )}

      <section className="ar-filter-panel">
        <form className="ar-filter-form" onSubmit={applyFilters}>
          <label>
            <span>Search Student</span>
            <input value={draft.search} maxLength={80} placeholder="Name or roll number…" onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}/>
          </label>
          <label>
            <span>Assigned subject</span>
            <select value={draft.subjectId} onChange={(event) => setDraft((current) => ({ ...current, subjectId: event.target.value }))}>
              <option value="">All assigned subjects</option>
              {(data?.subjects || []).map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}
            </select>
          </label>
          <label>
            <span>Risk level</span>
            <select value={draft.riskLevel} onChange={(event) => setDraft((current) => ({ ...current, riskLevel: event.target.value }))}>
              <option value="">All levels</option>
              <option value="HIGH">High risk</option>
              <option value="MEDIUM">Needs attention</option>
              <option value="LOW">On track</option>
              <option value="INSUFFICIENT_DATA">Insufficient data</option>
            </select>
          </label>
          <button type="submit" className="ar-filter-button"><Filter size={14}/> Apply</button>
          <button type="button" className="ar-clear-button" onClick={clearFilters}>Clear</button>
        </form>
      </section>

      {loading && <div className="ar-state" role="status"><LoaderCircle size={22} className="ar-spin"/> Reviewing attendance and published coursework…</div>}
      {!loading && error && (
        <div className="ar-state ar-state-error" role="alert"><AlertCircle size={23}/><strong>Academic risk reports are unavailable</strong><span>{error}</span><button type="button" onClick={() => setRefresh((value) => value + 1)}>Try again</button></div>
      )}
      {!loading && !error && data?.students.length === 0 && (
        <div className="ar-state"><Users size={25}/><strong>No students match these filters</strong><span>Try another subject, risk level or search term.</span></div>
      )}
      {!loading && !error && data?.students.length > 0 && (
        <section className="ar-report-list">
          <div className="ar-section-heading">
            <div><h2>Student support overview</h2><p>Each report is limited to your currently assigned subjects and their classes.</p></div>
            <span className="ar-student-count">{data.students.length} students</span>
          </div>
          {data.students.map((report) => <AcademicRiskReportCard key={report.student.id} report={report}/>)}
        </section>
      )}
      <section className="ar-privacy-footnote"><ShieldCheck size={17}/><span>Use these indicators to offer support and discuss the underlying records with the Student. A risk level is not a disciplinary or final academic decision.</span></section>
    </div>
  );
};

export default TeacherAcademicRiskPage;
