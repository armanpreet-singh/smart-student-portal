import React, { memo, useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Send } from "lucide-react";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
const mockAnn = [
  {
    id: 1,
    title: "Mid-Semester Exam Schedule",
    target: "All Departments",
    date: "2 hours ago",
    status: "sent",
  },
  {
    id: 2,
    title: "Campus Maintenance Alert",
    target: "Admin Staff",
    date: "Tomorrow",
    status: "scheduled",
  },
];
const AnnouncementsPage = memo(() => (
  <div className="d-page-container">
    <SectionHeader
      title="Announcements"
      subtitle="University-wide communications"
      action={
        <button
          className="d-btn-primary"
          style={{
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Send size={16} /> New Announcement
        </button>
      }
    />
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {mockAnn.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <DashboardCard className="d-announcement-card">
            <div className="d-ann-icon">
              <Megaphone size={18} />
            </div>
            <div className="d-ann-content">
              <h5>{a.title}</h5>
              <p>
                {a.target} • {a.date}
              </p>
            </div>
            <span
              className={`d-ann-badge ${a.status === "draft" ? "info" : "urgent"}`}
            >
              {a.status}
            </span>
          </DashboardCard>
        </motion.div>
      ))}
    </div>
  </div>
));
export default AnnouncementsPage;
