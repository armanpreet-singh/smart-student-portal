import React, { memo, useState } from "react";
import { Upload } from "lucide-react";
import ResourceCard from "../../../features/dashboard/components/ResourceCard/ResourceCard";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";

const mockResources = [
  {
    id: 1,
    title: "DBMS Module 4 Notes",
    type: "Lecture Notes",
    course: "DBMS",
    size: "3.1 MB",
  },
  {
    id: 2,
    title: "CN TCP/IP Slides",
    type: "PPT",
    course: "CN",
    size: "5.4 MB",
  },
  {
    id: 3,
    title: "OS Process Scheduling Reference",
    type: "Reference Material",
    course: "OS",
    size: "1.8 MB",
  },
];

const TeacherResources = memo(() => (
  <div className="d-page-container">
    <SectionHeader
      title="Learning Resources"
      subtitle="Manage and upload study materials"
    />

    <DashboardCard
      style={{
        borderStyle: "dashed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        marginBottom: "24px",
        cursor: "pointer",
      }}
    >
      <Upload size={32} color="var(--d-text-secondary)" />
      <h4 style={{ margin: "16px 0 4px", color: "var(--d-text)" }}>
        Upload New Material
      </h4>
      <p
        style={{
          margin: 0,
          fontSize: "13px",
          color: "var(--d-text-secondary)",
        }}
      >
        Drag and drop files here, or click to browse
      </p>
    </DashboardCard>

    <div className="d-list-stack">
      {mockResources.map((res) => (
        <ResourceCard key={res.id} {...res} />
      ))}
    </div>
  </div>
));
export default TeacherResources;
