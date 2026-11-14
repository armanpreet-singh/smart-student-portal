import React, { memo } from "react";
import { CalendarClock, Info } from "lucide-react";

import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";

import "./TeacherTimetable.css";

const TeacherTimetable = memo(() => (
  <div className="d-page-container">
    <SectionHeader
      title="Weekly Timetable"
      subtitle="Teaching sessions from verified university scheduling data"
    />

    <DashboardCard
      className="t-timetable-unavailable"
      padding={false}
    >
      <section
        className="t-timetable-unavailable-content"
        role="status"
        aria-labelledby="t-timetable-unavailable-title"
      >
        <div className="t-timetable-unavailable-icon" aria-hidden="true">
          <CalendarClock size={25} />
        </div>

        <div className="t-timetable-unavailable-copy">
          <div className="t-timetable-unavailable-label">
            <Info size={14} aria-hidden="true" />
            Backend capability unavailable
          </div>

          <h3 id="t-timetable-unavailable-title">
            Teaching timetable data is not available yet
          </h3>

          <p>
            The current backend does not define a timetable, schedule or
            teaching-session model, or expose a Teacher timetable endpoint.
          </p>
          <p>
            Official teaching days, lecture times, rooms and recurring
            sessions cannot be verified from the supported APIs, so sample
            weekly schedules are intentionally not displayed.
          </p>
        </div>
      </section>
    </DashboardCard>
  </div>
));

export default TeacherTimetable;
