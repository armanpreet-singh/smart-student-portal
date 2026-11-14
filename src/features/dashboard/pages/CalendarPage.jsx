import React from "react";
import { CalendarDays, Info } from "lucide-react";

import SectionHeader from "../components/SectionHeader/SectionHeader";
import DashboardCard from "../components/DashboardCard/DashboardCard";

import "./CalendarPage.css";

const CalendarPage = () => (
  <div className="d-page-container">
    <SectionHeader
      title="Academic Calendar"
      subtitle="Important dates and events from verified university data"
    />

    <DashboardCard
      className="s-calendar-unavailable"
      padding={false}
    >
      <section
        className="s-calendar-unavailable-content"
        role="status"
        aria-labelledby="s-calendar-unavailable-title"
      >
        <div className="s-calendar-unavailable-icon" aria-hidden="true">
          <CalendarDays size={25} />
        </div>

        <div className="s-calendar-unavailable-copy">
          <div className="s-calendar-unavailable-label">
            <Info size={14} aria-hidden="true" />
            Backend capability unavailable
          </div>

          <h3 id="s-calendar-unavailable-title">
            Academic calendar data is not available yet
          </h3>

          <p>
            The current backend does not define a Calendar or Event model or
            expose a Student calendar read endpoint.
          </p>
          <p>
            Official examination dates, university events and holidays cannot
            be verified from the supported APIs, so fixed sample dates are
            intentionally not displayed.
          </p>
        </div>
      </section>
    </DashboardCard>
  </div>
);

export default CalendarPage;
