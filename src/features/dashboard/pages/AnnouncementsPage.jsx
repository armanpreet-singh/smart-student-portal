import React, { memo } from "react";
import { Info, Megaphone } from "lucide-react";

import DashboardCard from "../components/DashboardCard/DashboardCard";
import SectionHeader from "../components/SectionHeader/SectionHeader";

import "./AnnouncementsPage.css";

const AnnouncementsPage = memo(() => (
  <div className="d-page-container">
    <SectionHeader
      title="Announcements"
      subtitle="University communications from verified publishing data"
    />

    <DashboardCard
      className="s-announcements-unavailable"
      padding={false}
    >
      <section
        className="s-announcements-unavailable-content"
        role="status"
        aria-labelledby="s-announcements-unavailable-title"
      >
        <div className="s-announcements-unavailable-icon" aria-hidden="true">
          <Megaphone size={25} />
        </div>

        <div className="s-announcements-unavailable-copy">
          <div className="s-announcements-unavailable-label">
            <Info size={14} aria-hidden="true" />
            Backend capability unavailable
          </div>

          <h3 id="s-announcements-unavailable-title">
            Student announcements are not available yet
          </h3>

          <p>
            The current backend does not define an Announcement or Notification
            model or expose a Student announcements read endpoint.
          </p>
          <p>
            Sample messages, relative timestamps and category labels are
            intentionally not displayed because their content and publication
            status cannot be verified from the supported APIs.
          </p>
        </div>
      </section>
    </DashboardCard>
  </div>
));

export default AnnouncementsPage;
