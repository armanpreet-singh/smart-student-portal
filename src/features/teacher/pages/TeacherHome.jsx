import React, { useMemo } from "react";
import { UserCheck, FileText, Upload, Megaphone } from "lucide-react";
import Hero from "../../dashboard/Hero/Hero";
import StatCard from "../../../features/dashboard/components/StatCard/StatCard";
import InsightCard from "../../../features/dashboard/components/InsightCard/InsightCard";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import QuickActionCard from "../../../features/dashboard/components/QuickActionCard/QuickActionCard";
import {
  teacherData,
  teacherStatsData,
  teacherScheduleData,
  teacherInsightsData,
} from "../data/mockTeacherData";
import {
  getGreeting,
  getDateStr,
} from "../../../features/dashboard/utils/formatHelpers";

const TeacherHome = () => {
  // Custom Hero implementation for Teacher since data structure differs slightly
  const CustomHero = () => (
    <div className="d-hero" style={{ marginBottom: "32px" }}>
      <div className="d-hero-text">
        <p className="d-hero-greeting">{getGreeting()}, Professor</p>
        <h1 className="d-hero-name">{teacherData.name}</h1>
        <div className="d-hero-meta">
          <span>{teacherData.designation}</span>
          <span className="d-separator">•</span>
          <span>{teacherData.department}</span>
          <span className="d-separator">•</span>
          <span>{teacherData.employeeId}</span>
          <span className="d-separator">•</span>
          <span>{teacherData.semester}</span>
        </div>
        <p className="d-hero-quote">
          "A good teacher is like a candle—it consumes itself to light the way
          for others."
        </p>
      </div>
      <div className="d-hero-date">
        <p className="d-date-day">{new Date().getDate()}</p>
        <p className="d-date-month">
          {new Date().toLocaleString("default", { month: "short" })}
        </p>
        <p className="d-date-year">{new Date().getFullYear()}</p>
      </div>
    </div>
  );

  return (
    <div className="d-page-container">
      <CustomHero />

      <div className="d-grid-4">
        {teacherStatsData.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>

      <SectionHeader title="Quick Actions" subtitle="Frequent tasks" />
      <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
        <QuickActionCard
          icon={UserCheck}
          label="Mark Attendance"
          color="#16A34A"
        />
        <QuickActionCard
          icon={FileText}
          label="Create Assignment"
          color="#1E3A8A"
        />
        <QuickActionCard icon={Upload} label="Upload Notes" color="#294D9B" />
        <QuickActionCard
          icon={Megaphone}
          label="Send Announcement"
          color="#D4AF37"
        />
      </div>

      <div className="d-grid-main">
        <div className="d-col-8">
          <SectionHeader
            title="Today's Schedule"
            subtitle="Your lectures for today"
          />
          <div className="d-timeline">
            {teacherScheduleData.map((item) => (
              <div
                key={item.id}
                className={`d-schedule-card ${item.isCurrent ? "current" : ""}`}
              >
                <div className="d-schedule-time">
                  <p className="d-time-text">{item.time}</p>
                  {item.isCurrent && (
                    <div className="d-current-indicator"></div>
                  )}
                </div>
                <div className="d-schedule-content">
                  <h4>{item.subject}</h4>
                  <p>
                    {item.semester} - {item.section} • {item.room} •{" "}
                    {item.students} Students
                  </p>
                  <span className={`d-type-badge lecture`}>Lecture</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="d-col-4">
          <DashboardCard padding={false} className="d-insights-wrapper">
            <div
              className="p-4"
              style={{ borderBottom: "1px solid var(--d-border)" }}
            >
              <SectionHeader
                title="Teacher Insights"
                subtitle="Powered by LTSU AI"
              />
            </div>
            <div className="p-4 d-insights-stack">
              {teacherInsightsData.map((insight) => (
                <InsightCard key={insight.id} {...insight} />
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default TeacherHome;
