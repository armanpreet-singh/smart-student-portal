import React, { memo } from "react";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import { facultyListData } from "../data/mockAdminData";

const TeachersPage = memo(() => (
  <div className="d-page-container">
    <SectionHeader
      title="Faculty Directory"
      subtitle="Manage university staff"
      action={
        <button className="d-btn-primary" style={{ fontSize: "14px" }}>
          + Add Faculty
        </button>
      }
    />
    <DashboardCard padding={false}>
      <div className="d-attend-table-container">
        <div className="d-attend-table-header">
          <span>Faculty</span>
          <span>ID</span>
          <span>Department</span>
          <span>Subjects</span>
          <span>Status</span>
        </div>
        {facultyListData.map((t, i) => (
          <div key={t.id} className="d-attend-table-row">
            <span className="d-subject-name-cell" style={{ fontWeight: 600 }}>
              {t.name}
            </span>
            <span
              style={{ color: "var(--d-text-secondary)", fontSize: "13px" }}
            >
              {t.id}
            </span>
            <span>{t.dept}</span>
            <span
              style={{ color: "var(--d-text-secondary)", fontSize: "13px" }}
            >
              {t.subjects}
            </span>
            <span>
              <span
                className={`d-status-badge ${t.status === "Active" ? "safe" : "warning"}`}
              >
                {t.status}
              </span>
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  </div>
));
export default TeachersPage;
