import React from "react";
import { BookOpen, Info } from "lucide-react";

import DashboardCard from "../components/DashboardCard/DashboardCard";
import SectionHeader from "../components/SectionHeader/SectionHeader";

import "./ResourcesPage.css";

const ResourcesPage = () => (
  <div className="d-page-container s-resources-page">
    <SectionHeader
      title="Learning Resources"
      subtitle="University-provided study materials and authorized downloads"
    />

    <DashboardCard className="s-resources-unavailable" padding={false}>
      <section
        className="s-resources-unavailable-content"
        role="status"
        aria-labelledby="s-resources-unavailable-title"
      >
        <div className="s-resources-unavailable-icon" aria-hidden="true">
          <BookOpen size={25} />
        </div>

        <div className="s-resources-unavailable-copy">
          <div className="s-resources-unavailable-label">
            <Info size={14} aria-hidden="true" />
            Backend capability unavailable
          </div>

          <h2 id="s-resources-unavailable-title">
            Learning resources are not available yet
          </h2>

          <p>
            The current backend does not define Resource or learning-material
            records, and it does not expose a Student resource listing or
            download endpoint. The portal therefore cannot verify resource
            titles, material types, course associations, file sizes,
            availability or access permissions.
          </p>
          <p>
            Sample study-material cards, type filters and download controls
            have been removed so that illustrative files are not presented as
            university-provided resources.
          </p>
        </div>
      </section>

      <div className="s-resources-unavailable-footer">
        A verified resource directory can be added when the backend provides
        Student-authorized resource metadata and protected file delivery.
      </div>
    </DashboardCard>
  </div>
);

export default ResourcesPage;
