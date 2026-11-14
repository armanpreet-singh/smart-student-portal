import React, { memo } from "react";
import { CalendarDays, Info } from "lucide-react";

import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";

import "./TeacherCalendar.css";

const TeacherCalendar = memo(() => (
  <div className="d-page-container">
    <SectionHeader
      title="Academic Calendar"
      subtitle="Academic dates and deadlines from verified university data"
    />

    <DashboardCard
      className="t-calendar-unavailable"
      padding={false}
    >
      <section
        className="t-calendar-unavailable-content"
        role="status"
        aria-labelledby="t-calendar-unavailable-title"
      >
        <div className="t-calendar-unavailable-icon" aria-hidden="true">
          <CalendarDays size={25} />
        </div>

        <div className="t-calendar-unavailable-copy">
          <div className="t-calendar-unavailable-label">
            <Info size={14} aria-hidden="true" />
            Backend capability unavailable
          </div>

          <h3 id="t-calendar-unavailable-title">
            Academic calendar data is not available yet
          </h3>

          <p>
            The current backend does not define a Calendar or Event model or
            expose a Teacher calendar read endpoint.
          </p>
          <p>
            Official academic dates, faculty events, examinations and
            deadlines cannot be verified from the supported APIs, so fixed
            sample events are intentionally not displayed.
          </p>
        </div>
      </section>
    </DashboardCard>
  </div>
));

export default TeacherCalendar;
