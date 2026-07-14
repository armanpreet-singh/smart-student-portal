import React, { memo, useState } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import { teacherAssignmentsData } from "../data/mockTeacherData";

const TeacherAssignments = memo(() => {
  const [filter, setFilter] = useState("all");
  const filtered =
    filter === "all"
      ? teacherAssignmentsData
      : teacherAssignmentsData.filter((a) => a.status === filter);

  const getStatusUI = (status) => {
    switch (status) {
      case "grading":
        return {
          icon: <AlertTriangle size={14} color="#F59E0B" />,
          text: "Needs Grading",
          className: "warning",
        };
      case "active":
        return {
          icon: <Clock size={14} color="#1E3A8A" />,
          text: "Active",
          className: "safe",
        };
      case "graded":
        return {
          icon: <CheckCircle size={14} color="#16A34A" />,
          text: "Graded",
          className: "safe",
        };
      default:
        return null;
    }
  };

  return (
    <div className="d-page-container">
      <SectionHeader
        title="Assignments"
        subtitle="View submissions and grade student work"
        action={
          <button className="d-btn-primary" style={{ fontSize: "14px" }}>
            + Create Assignment
          </button>
        }
      />

      <div className="d-filter-tabs">
        {["all", "active", "grading", "graded"].map((t) => (
          <button
            key={t}
            className={`d-tab ${filter === t ? "active" : ""}`}
            onClick={() => setFilter(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filtered.map((asg, i) => {
          const statusUI = getStatusUI(asg.status);
          const pct = Math.round((asg.submitted / asg.total) * 100);
          return (
            <motion.div
              key={asg.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <DashboardCard
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div style={{ flex: 1, minWidth: "250px" }}>
                  <h4 style={{ margin: "0 0 4px" }}>{asg.title}</h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "var(--d-text-secondary)",
                    }}
                  >
                    {asg.subject} • {asg.section}
                  </p>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "24px" }}
                >
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "18px" }}>
                      {asg.submitted}/{asg.total}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "11px",
                        color: "var(--d-text-secondary)",
                      }}
                    >
                      Submitted
                    </p>
                  </div>
                  <div style={{ width: "100px" }}>
                    <div className="d-progress-bar">
                      <div
                        className="d-progress-fill"
                        style={{ width: `${pct}%`, background: "#1E3A8A" }}
                      ></div>
                    </div>
                  </div>
                  <span className={`d-status-badge ${statusUI.className}`}>
                    {statusUI.text}
                  </span>
                </div>
              </DashboardCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});
export default TeacherAssignments;
