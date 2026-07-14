import React, { memo } from "react";
import { motion } from "framer-motion";
import { Megaphone, Send } from "lucide-react";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";

const mockAnnouncements = [
  {
    id: 1,
    title: "Mid-Semester Syllabus Completed",
    target: "5th Sem CSE",
    date: "2 hours ago",
    status: "sent",
  },
  {
    id: 2,
    title: "Lab Session Rescheduled to Friday",
    target: "3rd Sem CSE A",
    date: "1 day ago",
    status: "sent",
  },
  {
    id: 3,
    title: "Extra Lecture on Sunday",
    target: "All Sections",
    date: "Scheduled for tomorrow",
    status: "draft",
  },
];

const TeacherAnnouncements = memo(() => (
  <div className="d-page-container">
    <SectionHeader
      title="Announcements"
      subtitle="Communicate with your students"
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
      {mockAnnouncements.map((ann, i) => (
        <motion.div
          key={ann.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <DashboardCard className="d-announcement-card">
            <div
              className="d-ann-icon"
              style={{
                color:
                  ann.status === "draft"
                    ? "var(--d-text-secondary)"
                    : "var(--d-primary)",
              }}
            >
              <Megaphone size={18} />
            </div>
            <div className="d-ann-content" style={{ flex: 1 }}>
              <h5>{ann.title}</h5>
              <p>
                Target: {ann.target} • {ann.date}
              </p>
            </div>
            <span
              className={`d-ann-badge ${ann.status === "draft" ? "info" : "urgent"}`}
            >
              {ann.status === "draft" ? "Draft" : "Sent"}
            </span>
          </DashboardCard>
        </motion.div>
      ))}
    </div>
  </div>
));
export default TeacherAnnouncements;
