import React, { memo } from "react";
import { Info, Megaphone } from "lucide-react";

import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";

import "./AnnouncementsPage.css";

const AnnouncementsPage = memo(() => (
  <div className="d-page-container">
    <SectionHeader
      title="Announcements"
      subtitle="University communications from verified publishing data"
    />

    <DashboardCard
      className="a-announcements-unavailable"
      padding={false}
    >
      <section
        className="a-announcements-unavailable-content"
        role="status"
        aria-labelledby="a-announcements-unavailable-title"
      >
        <div className="a-announcements-unavailable-icon" aria-hidden="true">
          <Megaphone size={25} />
        </div>

        <div className="a-announcements-unavailable-copy">
          <div className="a-announcements-unavailable-label">
            <Info size={14} aria-hidden="true" />
            Backend capability unavailable
          </div>

          <h3 id="a-announcements-unavailable-title">
            Announcement publishing is not supported yet
          </h3>

          <p>
            The current backend does not define an Announcement model or expose
            an Admin announcement read or publish endpoint.
          </p>
          <p>
            Sample messages, audience targets, sent or scheduled labels, and
            publishing controls are intentionally not displayed because their
            content and delivery status cannot be verified.
          </p>
        </div>
      </section>
    </DashboardCard>
  </div>
));

export default AnnouncementsPage;
