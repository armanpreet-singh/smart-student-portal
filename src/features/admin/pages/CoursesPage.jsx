import React, { memo } from "react";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import { coursesListData } from "../data/mockAdminData";

const CoursesPage = memo(() => (
  <div className="d-page-container">
    <SectionHeader
      title="Course Catalog"
      subtitle="Manage curriculum"
      action={
        <button className="d-btn-primary" style={{ fontSize: "14px" }}>
          + Create Course
        </button>
      }
    />
    <DashboardCard padding={false}>
      <div className="d-attend-table-container">
        <div className="d-attend-table-header">
          <span>Course</span>
          <span>Code</span>
          <span>Credits</span>
          <span>Faculty</span>
          <span>Dept</span>
          <span>Sem</span>
        </div>
        {coursesListData.map((c) => (
          <div key={c.id} className="d-attend-table-row">
            <span className="d-subject-name-cell">{c.name}</span>
            <span className="d-sub-code">{c.code}</span>
            <span>{c.credits}</span>
            <span style={{ color: "var(--d-text-secondary)" }}>
              {c.faculty}
            </span>
            <span>{c.dept}</span>
            <span>{c.sem}</span>
          </div>
        ))}
      </div>
    </DashboardCard>
  </div>
));
export default CoursesPage;
