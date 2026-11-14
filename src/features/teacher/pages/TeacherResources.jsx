import React, { memo } from "react";
import { FolderOpen, Info } from "lucide-react";

import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";

import "./TeacherResources.css";

const TeacherResources = memo(() => (
  <div className="d-page-container">
    <SectionHeader
      title="Learning Resources"
      subtitle="Resource availability from verified university content services"
    />

    <DashboardCard
      className="t-resources-unavailable"
      padding={false}
    >
      <section
        className="t-resources-unavailable-content"
        role="status"
        aria-labelledby="t-resources-unavailable-title"
      >
        <div className="t-resources-unavailable-icon" aria-hidden="true">
          <FolderOpen size={25} />
        </div>

        <div className="t-resources-unavailable-copy">
          <div className="t-resources-unavailable-label">
            <Info size={14} aria-hidden="true" />
            Backend capability unavailable
          </div>

          <h3 id="t-resources-unavailable-title">
            Learning resource data is not available yet
          </h3>

          <p>
            The current backend does not define a Resource or learning-material
            model, or expose Teacher resource listing or upload endpoints.
          </p>
          <p>
            Available files, file details, storage and sharing permissions
            cannot be verified through the supported APIs, so sample resource
            cards and upload controls are intentionally not displayed.
          </p>
        </div>
      </section>
    </DashboardCard>
  </div>
));

export default TeacherResources;
