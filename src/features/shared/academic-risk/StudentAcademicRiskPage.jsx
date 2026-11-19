import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, CalendarCheck, CheckCircle2, ClipboardList, GraduationCap, LoaderCircle, RefreshCw, ShieldAlert, TrendingUp } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { fetchStudentAcademicRisk } from "./academicRiskApi";
import { AcademicAlertList, RiskLevelPill, RiskMethodologyNote } from "./AcademicRiskComponents";
import "./academic-risk.css";

function formatDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

const StudentAcademicRiskPage = () => {
  const { accessToken, sessionStatus } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  const load = useCallback(async () => {
    if (sessionStatus !== "authenticated" || !accessToken) return;
    setLoading(true);
    setError("");
    try {
      const result = await fetchStudentAcademicRisk(accessToken);
      setReport(result);
    } catch (cause) {
      setError(cause?.message || "Unable to calculate your academic risk report.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, sessionStatus]);

  useEffect(() => { void load(); }, [load, refresh]);

  return (
    <div className="d-page-container ar-page">
      <header className="ar-page-header">
        <div>
          <span className="ar-eyebrow">STUDENT SUPPORT</span>
          <h1>Academic Risk Alerts</h1>
          <p>Understand where you may need support, based on your recorded attendance and coursework.</p>
          {report?.class && <small className="ar-class-context">{report.class.name} · {report.class.academicYear}</small>}
        </div>
        <button type="button" className="ar-refresh" onClick={() => setRefresh((value) => value + 1)} disabled={loading}>
          {loading ? <LoaderCircle size={16} className="ar-spin"/> : <RefreshCw size={16}/>} Refresh report
        </button>
      </header>

      {report && <RiskMethodologyNote attendanceThresholdPercent={report.summary.attendanceThresholdPercent}/>}

      {loading && <div className="ar-state" role="status"><LoaderCircle size={22} className="ar-spin"/> Calculating your academic indicators…</div>}
      {!loading && error && (
        <div className="ar-state ar-state-error" role="alert">
          <AlertCircle size={23}/><strong>Your academic report is unavailable</strong><span>{error}</span>
          <button type="button" onClick={() => setRefresh((value) => value + 1)}>Try again</button>
        </div>
      )}

      {!loading && !error && report && (
        <>
          {report.class ? (
            <>
              <section className="ar-overview-card ar-student-risk-hero">
                <div>
                  <span>Current academic status</span>
                  <div className="ar-hero-status">
                    <RiskLevelPill level={report.riskLevel}/>
                    <small>{report.summary.alertCount} current indicator{report.summary.alertCount === 1 ? "" : "s"}</small>
                  </div>
                  <p>These indicators highlight areas where early support may help. They are not a final academic decision.</p>
                </div>
                {report.riskLevel === "HIGH"
                  ? <ShieldAlert size={28}/>
                  : report.riskLevel === "LOW"
                    ? <CheckCircle2 size={28}/>
                    : <TrendingUp size={28}/>}
              </section>

              <div className="ar-risk-overview">
                <div className="ar-overview-card">
                  <span>Overall attendance</span>
                  <strong>{report.summary.attendancePercentage === null ? "—" : `${report.summary.attendancePercentage.toFixed(1)}%`}</strong>
                  <small>{report.summary.attendanceSessions} recorded sessions · threshold {report.summary.attendanceThresholdPercent}%</small>
                </div>
                <div className="ar-overview-card">
                  <span>Published grade average</span>
                  <strong>{report.summary.averageGradePercent === null ? "—" : `${report.summary.averageGradePercent.toFixed(1)}%`}</strong>
                  <small>Across {report.summary.publishedGrades} published results</small>
                </div>
                <div className="ar-overview-card">
                  <span>Overdue assignments</span>
                  <strong>{report.summary.overdueAssignments}</strong>
                  <small>Published work past its deadline and not submitted</small>
                </div>
                <div className="ar-overview-card">
                  <span>High-priority alerts</span>
                  <strong>{report.summary.highAlertCount}</strong>
                  <small>{report.summary.mediumAlertCount} additional indicators need attention</small>
                </div>
              </div>

              <section>
                <div className="ar-section-heading">
                  <div><h2>What needs attention</h2><p>Alerts are grouped by the subject where the signal was recorded.</p></div>
                </div>
                {report.alerts.length
                  ? <AcademicAlertList alerts={report.alerts}/>
                  : <div className="ar-state">
                      {report.riskLevel === "INSUFFICIENT_DATA" ? <GraduationCap size={24}/> : <CheckCircle2 size={24}/>}
                      <strong>{report.riskLevel === "INSUFFICIENT_DATA" ? "More academic data is needed" : "No current risk alerts"}</strong>
                      <span>{report.riskLevel === "INSUFFICIENT_DATA"
                        ? "As more attendance and graded coursework are recorded, this page can provide a more complete picture."
                        : "Your recorded indicators are currently within the configured support thresholds. Keep up your attendance and coursework."}</span>
                    </div>}
              </section>

              <section>
                <div className="ar-section-heading">
                  <div><h2>Subject-wise progress</h2><p>Attendance and published assessment information for your active subjects.</p></div>
                </div>
                {report.subjects.length ? (
                  <div className="ar-subject-list">
                    {report.subjects.map((item) => (
                      <article className="ar-subject-card" key={item.subject.id}>
                        <div className="ar-subject-heading">
                          <div><span>{item.subject.code}</span><h3>{item.subject.name}</h3></div>
                          <RiskLevelPill level={item.riskLevel}/>
                        </div>
                        <div className="ar-subject-metrics">
                          <div><span>Attendance</span><strong>{item.metrics.attendancePercentage === null ? "—" : `${item.metrics.attendancePercentage.toFixed(1)}%`}</strong></div>
                          <div><span>Grade average</span><strong>{item.metrics.averageGradePercent === null ? "—" : `${item.metrics.averageGradePercent.toFixed(1)}%`}</strong></div>
                          <div><span>Overdue</span><strong>{item.metrics.overdueAssignments}</strong></div>
                        </div>
                        {item.alerts.length
                          ? <div className="ar-subject-alerts"><AcademicAlertList alerts={item.alerts}/></div>
                          : <p className="ar-no-alerts">{item.riskLevel === "INSUFFICIENT_DATA" ? "Not enough recorded activity yet." : "No current indicators for this subject."}</p>}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="ar-state"><ClipboardList size={23}/><strong>No active subjects</strong><span>Academic indicators will appear when active subjects are assigned to your class.</span></div>
                )}
              </section>

              <section className="ar-recommendations">
                <h2>Suggested next steps</h2>
                <ul>{report.recommendations.map((item, index) => <li key={index}>{item}</li>)}</ul>
              </section>
              <p className="ar-updated-at">Last calculated: {formatDate(report.calculatedAt)}</p>
            </>
          ) : (
            <div className="ar-state">
              <GraduationCap size={25}/>
              <strong>Class assignment required</strong>
              <span>{report.message || "An active class must be assigned before academic indicators can be calculated."}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentAcademicRiskPage;
