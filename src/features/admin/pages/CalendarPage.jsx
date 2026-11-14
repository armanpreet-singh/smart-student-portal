import React, { memo } from "react";
import { CalendarDays, Info } from "lucide-react";

import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";

import "./CalendarPage.css";

const CalendarPage = memo(() => (
  <div className="d-page-container">
    <SectionHeader
      title="Academic Calendar"
      subtitle="University dates from verified calendar data"
    />

    <DashboardCard
      className="a-calendar-unavailable"
      padding={false}
    >
      <section
        className="a-calendar-unavailable-content"
        role="status"
        aria-labelledby="a-calendar-unavailable-title"
      >
        <div className="a-calendar-unavailable-icon" aria-hidden="true">
          <CalendarDays size={25} />
        </div>

        <div className="a-calendar-unavailable-copy">
          <div className="a-calendar-unavailable-label">
            <Info size={14} aria-hidden="true" />
            Backend capability unavailable
          </div>

          <h3 id="a-calendar-unavailable-title">
            Academic calendar data is not available yet
          </h3>

          <p>
            The current backend does not define a Calendar or Event model or
            expose an Admin calendar read endpoint.
          </p>
          <p>
            Official university dates, holidays and event details cannot be
            verified from the supported APIs, so fixed sample events are
            intentionally not displayed.
          </p>
        </div>
      </section>
    </DashboardCard>
  </div>
));

export default CalendarPage;
