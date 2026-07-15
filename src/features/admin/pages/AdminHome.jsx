import React from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  GraduationCap,
  BookOpen,
  Megaphone,
  FileBarChart,
} from "lucide-react";
import StatCard from "../../../features/dashboard/components/StatCard/StatCard";
import InsightCard from "../../../features/dashboard/components/InsightCard/InsightCard";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import QuickActionCard from "../../../features/dashboard/components/QuickActionCard/QuickActionCard";
import {
  adminData,
  adminStatsData,
  adminInsightsData,
} from "../data/mockAdminData";
import { getGreeting } from "../../../features/dashboard/utils/formatHelpers";

const AdminHome = () => (
  <div className="d-page-container">
    <div className="d-hero">
      <div className="d-hero-text">
        <p className="d-hero-greeting">{getGreeting()}, Administrator</p>
        <h1 className="d-hero-name">{adminData.name}</h1>
        <div className="d-hero-meta">
          <span>{adminData.role}</span>
          <span className="d-separator">•</span>
          <span>{adminData.department}</span>
        </div>
        <p className="d-hero-quote">
          "Management is doing things right; leadership is doing the right
          things."
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

    <div className="d-grid-3">
      {adminStatsData.map((stat) => (
        <StatCard key={stat.id} {...stat} />
      ))}
    </div>

    <SectionHeader title="Quick Actions" subtitle="Frequent admin tasks" />
    <DashboardCard padding={false} style={{ marginBottom: "32px" }}>
      <div
        style={{
          display: "flex",
          gap: "12px",
          padding: "16px",
          flexWrap: "wrap",
        }}
      >
        <QuickActionCard icon={UserPlus} label="Add Student" color="#1E3A8A" />
        <QuickActionCard
          icon={GraduationCap}
          label="Add Faculty"
          color="#294D9B"
        />
        <QuickActionCard
          icon={BookOpen}
          label="Create Course"
          color="#16A34A"
        />
        <QuickActionCard
          icon={Megaphone}
          label="Publish Announcement"
          color="#D4AF37"
        />
        <QuickActionCard
          icon={FileBarChart}
          label="Generate Report"
          color="#F59E0B"
        />
      </div>
    </DashboardCard>

    <div className="d-grid-main">
      <div className="d-col-8">
        <SectionHeader title="University Overview" subtitle="System snapshot" />
        <div className="d-grid-2">
          {[
            "Student Distribution",
            "Faculty Workload",
            "Department Stats",
            "System Health",
          ].map((title, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <DashboardCard
                style={{
                  height: "120px",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <h4 style={{ margin: 0, color: "var(--d-text-secondary)" }}>
                  {title}
                </h4>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "var(--d-primary)",
                  }}
                >
                  View Details
                </p>
              </DashboardCard>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="d-col-4">
        <DashboardCard padding={false} className="d-insights-wrapper">
          <div
            className="p-4"
            style={{ borderBottom: "1px solid var(--d-border)" }}
          >
            <SectionHeader title="Admin Insights" subtitle="System alerts" />
          </div>
          <div className="p-4 d-insights-stack">
            {adminInsightsData.map((insight) => (
              <InsightCard key={insight.id} {...insight} />
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  </div>
);
export default AdminHome;
