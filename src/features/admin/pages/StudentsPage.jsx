import React, { memo, useState } from "react";
import { Search } from "lucide-react";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import { studentsListData } from "../data/mockAdminData";

const StudentsPage = memo(() => {
  const [search, setSearch] = useState("");
  const filtered = studentsListData.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="d-page-container">
      <SectionHeader
        title="Student Directory"
        subtitle="Manage university students"
        action={
          <button className="d-btn-primary" style={{ fontSize: "14px" }}>
            + Add Student
          </button>
        }
      />
      <DashboardCard style={{ marginBottom: "24px", padding: "16px" }}>
        <div
          className="d-search-box"
          style={{ width: "100%", background: "var(--d-bg)" }}
        >
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
      </DashboardCard>
      <DashboardCard padding={false}>
        <div className="d-attend-table-container">
          <div className="d-attend-table-header">
            <span>Student</span>
            <span>Department</span>
            <span>Semester</span>
            <span>Status</span>
          </div>
          {filtered.map((s, i) => (
            <div
              key={s.id}
              className="d-attend-table-row"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className="d-subject-name-cell">
                <span className="d-sub-code">{s.roll}</span>
                {s.name}
              </span>
              <span style={{ color: "var(--d-text-secondary)" }}>{s.dept}</span>
              <span>{s.sem}</span>
              <span>
                <span
                  className={`d-status-badge ${s.status === "Active" ? "safe" : "danger"}`}
                >
                  {s.status}
                </span>
              </span>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
});
export default StudentsPage;
