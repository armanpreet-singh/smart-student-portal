import React, { memo } from "react";
import { Info, Megaphone } from "lucide-react";

import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";

import "./TeacherAnnouncements.css";

const TeacherAnnouncements = memo(() => (
  <div className="d-page-container">
    <SectionHeader
      title="Announcements"
      subtitle="Communications to students from verified publishing data"
    />

    <DashboardCard
      className="t-announcements-unavailable"
      padding={false}
    >
      <section
        className="t-announcements-unavailable-content"
        role="status"
        aria-labelledby="t-announcements-unavailable-title"
      >
        <div className="t-announcements-unavailable-icon" aria-hidden="true">
          <Megaphone size={25} />
        </div>

        <div className="t-announcements-unavailable-copy">
          <div className="t-announcements-unavailable-label">
            <Info size={14} aria-hidden="true" />
            Backend capability unavailable
          </div>

          <h3 id="t-announcements-unavailable-title">
            Teacher announcements are not available yet
          </h3>

          <p>
            The current backend does not define an Announcement or Notification
            model or expose Teacher announcement read or publish endpoints.
          </p>
          <p>
            Sample messages, target audiences, relative timestamps and
            sent or draft statuses are intentionally not displayed because
            their content and delivery state cannot be verified.
          </p>
        </div>
      </section>
    </DashboardCard>
  </div>
));

export default TeacherAnnouncements;
