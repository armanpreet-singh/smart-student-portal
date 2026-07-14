import React, { memo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import { studentsListData } from "../data/mockTeacherData";

const TeacherStudents = memo(() => {
  const [search, setSearch] = useState("");
  const filtered = studentsListData.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="d-page-container">
      <SectionHeader
        title="Students"
        subtitle="View students across your classes"
      />

      <DashboardCard style={{ marginBottom: "24px", padding: "16px" }}>
        <div
          className="d-search-box"
          style={{ width: "100%", background: "var(--d-bg)" }}
        >
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
      </DashboardCard>

      <DashboardCard padding={false}>
        <div
          className="d-attend-table-container"
          style={{ padding: "0 20px 20px" }}
        >
          <div className="d-attend-table-header">
            <span>Student Name</span>
            <span>Roll Number</span>
            <span>Section</span>
            <span>Attendance</span>
            <span>CGPA</span>
          </div>
          {filtered.map((student, i) => (
            <motion.div
              key={student.id}
              className="d-attend-table-row"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <span className="d-subject-name-cell" style={{ fontWeight: 600 }}>
                {student.name}
              </span>
              <span style={{ color: "var(--d-text-secondary)" }}>
                {student.roll}
              </span>
              <span>
                <span className="d-status-badge safe">{student.section}</span>
              </span>
              <span
                style={{
                  fontWeight: 600,
                  color:
                    parseInt(student.attendance) >= 80 ? "#16A34A" : "#DC2626",
                }}
              >
                {student.attendance}
              </span>
              <span style={{ fontWeight: 600 }}>{student.cgpa}</span>
            </motion.div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
});
export default TeacherStudents;
