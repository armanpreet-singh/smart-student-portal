import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarClock, Info } from "lucide-react";

import DashboardCard from "../components/DashboardCard/DashboardCard";
import SectionHeader from "../components/SectionHeader/SectionHeader";

import "./TimetablePage.css";

const TimetablePage = () => (
  <div className="d-page-container s-timetable-page">
    <SectionHeader
      title="Weekly Timetable"
      subtitle="Scheduled class days and times from verified university data"
    />

    <DashboardCard className="s-timetable-unavailable" padding={false}>
      <section
        className="s-timetable-unavailable-content"
        role="status"
        aria-labelledby="s-timetable-unavailable-title"
      >
        <div className="s-timetable-unavailable-icon" aria-hidden="true">
          <CalendarClock size={25} />
        </div>

        <div className="s-timetable-unavailable-copy">
          <div className="s-timetable-unavailable-label">
            <Info size={14} aria-hidden="true" />
            Backend capability unavailable
          </div>

          <h2 id="s-timetable-unavailable-title">
            Your weekly timetable is not available yet
          </h2>

          <p>
            The current backend does not define a timetable or class-session
            schedule model, and it does not expose a Student timetable read
            endpoint. The portal therefore cannot verify recurring class days,
            start times, durations, rooms or lab assignments.
          </p>
          <p>
            Repeated sample classes have been removed so this page does not
            present illustrative times or locations as your actual university
            schedule.
          </p>
        </div>
      </section>

      <div className="s-timetable-unavailable-footer">
        <span>
          Attendance history contains recorded sessions only. It does not
          identify future class meeting times or replace an official timetable.
        </span>
        <Link to="/dashboard/attendance">
          Review recorded attendance
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </DashboardCard>
  </div>
);

export default TimetablePage;
