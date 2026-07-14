import React, { memo, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { UserCheck, AlertCircle } from "lucide-react";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import StatCard from "../../../features/dashboard/components/StatCard/StatCard";

const mockAttendanceList = [
  {
    id: 1,
    subject: "DBMS",
    semester: "5th Sem",
    section: "A",
    time: "09:00 AM",
    status: "pending",
    students: 42,
  },
  {
    id: 2,
    subject: "Computer Networks",
    semester: "5th Sem",
    section: "B",
    time: "11:00 AM",
    status: "pending",
    students: 45,
  },
  {
    id: 3,
    subject: "Operating Systems",
    semester: "3rd Sem",
    section: "A",
    time: "02:00 PM",
    status: "marked",
    students: 41,
  },
];

const TeacherAttendance = memo(() => {
  const stats = useMemo(
    () => [
      {
        id: 1,
        title: "Today's Classes",
        value: "3",
        icon: "Clock",
        trend: "2 Pending",
        color: "#1E3A8A",
      },
      {
        id: 2,
        title: "Total Students",
        value: "128",
        icon: "Users",
        trend: "Present today",
        color: "#16A34A",
      },
      {
        id: 3,
        title: "Pending Submissions",
        value: "2",
        icon: "AlertCircle",
        trend: "Action required",
        color: "#DC2626",
      },
    ],
    [],
  );

  return (
    <div className="d-page-container">
      <SectionHeader
        title="Mark Attendance"
        subtitle="Submit attendance for your scheduled classes"
      />
      <div className="d-grid-3">
        {stats.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginTop: "16px",
        }}
      >
        {mockAttendanceList.map((cls, i) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <DashboardCard
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", gap: "16px", alignItems: "center" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background:
                      cls.status === "marked"
                        ? "rgba(22, 163, 74, 0.1)"
                        : "rgba(245, 158, 11, 0.1)",
                    display: "grid",
                    placeItems: "center",
                    color: cls.status === "marked" ? "#16A34A" : "#F59E0B",
                  }}
                >
                  <UserCheck size={20} />
                </div>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "16px" }}>
                    {cls.subject}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "var(--d-text-secondary)",
                    }}
                  >
                    {cls.semester} • {cls.section} • {cls.time} • {cls.students}{" "}
                    Students
                  </p>
                </div>
              </div>
              {cls.status === "marked" ? (
                <span className="d-status-badge safe">Marked</span>
              ) : (
                <button
                  className="d-btn-primary"
                  style={{ padding: "8px 20px", fontSize: "14px" }}
                >
                  Mark Now
                </button>
              )}
            </DashboardCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
});
export default TeacherAttendance;
