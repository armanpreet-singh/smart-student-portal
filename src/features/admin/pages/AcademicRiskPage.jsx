import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Filter, LoaderCircle, RefreshCw, Search, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { fetchAdminAcademicRisk, fetchAdminAcademicRiskClasses } from "../../shared/academic-risk/academicRiskApi";
import { AcademicRiskReportCard, RiskMethodologyNote } from "../../shared/academic-risk/AcademicRiskComponents";
import "../../shared/academic-risk/academic-risk.css";

const PAGE_SIZE = 25;

const AdminAcademicRiskPage = () => {
  const { accessToken } = useAuth();
  const [classes, setClasses] = useState([]);
  const [draft, setDraft] = useState({ search: "", classId: "", riskLevel: "" });
  const [filters, setFilters] = useState({ search: "", classId: "", riskLevel: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classesLoading, setClassesLoading] = useState(true);
  const [error, setError] = useState("");
  const [classError, setClassError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!accessToken) return;
    let active = true;
    setClassesLoading(true);
    fetchAdminAcademicRiskClasses(accessToken)
      .then((result) => { if (active) setClasses(result); })
      .catch((cause) => { if (active) setClassError(cause?.message || "Unable to load class filters."); })
      .finally(() => { if (active) setClassesLoading(false); });
    return () => { active = false; };
  }, [accessToken]);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      const result = await fetchAdminAcademicRisk(accessToken, {
        ...filters,
        page,
        pageSize: PAGE_SIZE
      });
      setData(result);
    } catch (cause) {
      setError(cause?.message || "Unable to load university academic risk reports.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, filters, page]);

  useEffect(() => { void load(); }, [load, refresh]);

  const applyFilters = (event) => {
    event.preventDefault();
    setFilters({
      search: draft.search.trim(),
      classId: draft.classId,
      riskLevel: draft.riskLevel
    });
    setPage(1);
  };

  const clearFilters = () => {
    const empty = { search: "", classId: "", riskLevel: "" };
    setDraft(empty);
    setFilters(empty);
    setPage(1);
  };

  return (
    <div className="d-page-container ar-page">
      <header className="ar-page-header">
        <div>
          <span className="ar-eyebrow">UNIVERSITY-WIDE MONITORING</span>
          <h1>Student Academic Risk Alerts</h1>
          <p>Review attendance, overdue coursework and published assignment performance across active classes.</p>
        </div>
        <button type="button" className="ar-refresh" onClick={() => setRefresh((value) => value + 1)} disabled={loading}>
          {loading ? <LoaderCircle size={16} className="ar-spin"/> : <RefreshCw size={16}/>} Refresh
        </button>
      </header>

      {data && <RiskMethodologyNote attendanceThresholdPercent={data.attendanceThresholdPercent}/>}

      {data && (
        <div className="ar-risk-overview">
          <div className="ar-overview-card"><span>Students in this report</span><strong>{data.summary.totalStudents}</strong><small>After applied filters</small></div>
          <div className="ar-overview-card is-high"><span>High risk</span><strong>{data.summary.highRisk}</strong><small>Prompt follow-up suggested</small></div>
          <div className="ar-overview-card is-medium"><span>Needs attention</span><strong>{data.summary.mediumRisk}</strong><small>Early support recommended</small></div>
          <div className="ar-overview-card is-low"><span>On track</span><strong>{data.summary.lowRisk}</strong><small>No current risk indicators</small></div>
        </div>
      )}

      <section className="ar-filter-panel">
        <form className="ar-filter-form" onSubmit={applyFilters}>
          <label>
            <span>Search Student</span>
            <input value={draft.search} maxLength={80} placeholder="Name, username or roll number…" onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}/>
          </label>
          <label>
            <span>Class</span>
            <select value={draft.classId} onChange={(event) => setDraft((current) => ({ ...current, classId: event.target.value }))} disabled={classesLoading}>
              <option value="">All active classes</option>
              {classes.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.academicYear}</option>)}
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
        {classError && <div className="ar-notice" role="status"><AlertCircle size={15}/>{classError} You can still review all classes.</div>}
      </section>

      {loading && <div className="ar-state" role="status"><LoaderCircle size={22} className="ar-spin"/> Preparing university-wide academic risk report…</div>}
      {!loading && error && (
        <div className="ar-state ar-state-error" role="alert"><AlertCircle size={23}/><strong>Academic risk report is unavailable</strong><span>{error}</span><button type="button" onClick={() => setRefresh((value) => value + 1)}>Try again</button></div>
      )}
      {!loading && !error && data?.students.length === 0 && (
        <div className="ar-state"><Users size={25}/><strong>No Students match these filters</strong><span>Change the search, class or risk-level filters to see other records.</span></div>
      )}
      {!loading && !error && data?.students.length > 0 && (
        <section className="ar-report-list">
          <div className="ar-section-heading">
            <div><h2>Academic support overview</h2><p>Risk indicators are calculated from existing records and shown with their underlying reasons.</p></div>
            <span>{data.pagination.total} Students</span>
          </div>
          {data.students.map((report) => <AcademicRiskReportCard key={report.student.id} report={report}/>)}
          <div className="ar-pagination">
            <span>{data.pagination.total} matching Students · Page {data.pagination.page} of {Math.max(1, data.pagination.totalPages)}</span>
            <div>
              <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft size={15}/> Previous</button>
              <button type="button" disabled={page >= data.pagination.totalPages || loading} onClick={() => setPage((value) => value + 1)}>Next <ChevronRight size={15}/></button>
            </div>
          </div>
        </section>
      )}

      <section className="ar-privacy-footnote"><ShieldCheck size={17}/><span>Academic risk information is visible only to authenticated role-authorized users. Use it to coordinate early support; it is not a final academic decision.</span></section>
    </div>
  );
};

export default AdminAcademicRiskPage;
