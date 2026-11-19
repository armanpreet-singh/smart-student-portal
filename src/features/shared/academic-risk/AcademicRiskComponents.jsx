import React from "react";
import { AlertTriangle, BookOpen, CalendarClock, CheckCircle2, CircleHelp, GraduationCap, ShieldAlert } from "lucide-react";

const RISK_LABELS = {
  HIGH: "High risk",
  MEDIUM: "Needs attention",
  LOW: "On track",
  INSUFFICIENT_DATA: "Insufficient data"
};

export function RiskLevelPill({ level }) {
  return (
    <span className={`ar-risk-pill ar-risk-${String(level || "INSUFFICIENT_DATA").toLowerCase()}`}>
      {level === "HIGH" ? <ShieldAlert size={14}/> :
        level === "MEDIUM" ? <AlertTriangle size={14}/> :
          level === "LOW" ? <CheckCircle2 size={14}/> : <CircleHelp size={14}/>}
      {RISK_LABELS[level] || RISK_LABELS.INSUFFICIENT_DATA}
    </span>
  );
}

function AlertIcon({ alert }) {
  if (alert.key === "LOW_ATTENDANCE") return <CalendarClock size={17}/>;
  if (alert.key === "OVERDUE_ASSIGNMENTS") return <BookOpen size={17}/>;
  return <GraduationCap size={17}/>;
}

export function AcademicAlertList({ alerts = [] }) {
  if (!alerts.length) return null;
  return (
    <div className="ar-alert-list">
      {alerts.map((alert, index) => (
        <article className={`ar-alert-card ar-alert-${alert.severity.toLowerCase()}`} key={`${alert.key}-${alert.subject.id}-${index}`}>
          <div className="ar-alert-icon"><AlertIcon alert={alert}/></div>
          <div className="ar-alert-copy">
            <div className="ar-alert-heading">
              <strong>{alert.title}</strong>
              <span>{alert.severity === "HIGH" ? "High priority" : "Needs attention"}</span>
            </div>
            <p>{alert.description}</p>
            <small>{alert.subject.code} · {alert.subject.name}</small>
            {Array.isArray(alert.assignments) && alert.assignments.length > 0 && (
              <ul className="ar-overdue-items">
                {alert.assignments.map((item) => (
                  <li key={item.id}>
                    <span>{item.title}</span>
                    <time dateTime={item.dueAt}>{new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(item.dueAt))}</time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export function AcademicRiskReportCard({ report }) {
  return (
    <article className="ar-student-report-card">
      <header className="ar-student-report-header">
        <div className="ar-student-identity">
          <span>{report.class?.code || "Class not assigned"}{report.student.rollNumber ? ` · ${report.student.rollNumber}` : ""}</span>
          <h3>{report.student.fullName}</h3>
          <small>{report.class?.name || report.student.username}</small>
        </div>
        <RiskLevelPill level={report.riskLevel}/>
      </header>

      <div className="ar-student-report-metrics">
        <div>
          <span>Attendance</span>
          <strong>{report.summary.attendancePercentage === null ? "—" : `${report.summary.attendancePercentage.toFixed(1)}%`}</strong>
          <small>{report.summary.attendanceSessions} sessions</small>
        </div>
        <div>
          <span>Published grade average</span>
          <strong>{report.summary.averageGradePercent === null ? "—" : `${report.summary.averageGradePercent.toFixed(1)}%`}</strong>
          <small>{report.summary.publishedGrades} graded results</small>
        </div>
        <div>
          <span>Overdue assignments</span>
          <strong>{report.summary.overdueAssignments}</strong>
          <small>Not submitted by deadline</small>
        </div>
        <div>
          <span>Active indicators</span>
          <strong>{report.summary.alertCount}</strong>
          <small>{report.summary.highAlertCount} high priority</small>
        </div>
      </div>

      {report.alerts.length > 0
        ? <AcademicAlertList alerts={report.alerts}/>
        : <p className="ar-no-alerts">
            {report.riskLevel === "INSUFFICIENT_DATA"
              ? "There is not enough recorded attendance or assessment activity to assess this Student yet."
              : "No current academic risk indicators were found in the recorded data."}
          </p>}
    </article>
  );
}

export function RiskMethodologyNote({ attendanceThresholdPercent }) {
  return (
    <section className="ar-methodology">
      <ShieldAlert size={20}/>
      <div>
        <strong>How these alerts are calculated</strong>
        <p>
          Alerts use recorded attendance (threshold {attendanceThresholdPercent}%), published assignment deadlines and published graded assignment results.
          Attendance needs at least 3 recorded sessions; grade trends need at least 2 published results. Three or more overdue assignments or a published grade average below 40% are high-priority indicators.
          These are early-support indicators, not a final academic decision. Pending duty-review attendance is shown separately and is not counted as present.
        </p>
      </div>
    </section>
  );
}
