import React, { memo } from "react";
import { Info, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";

import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import { useAuth } from "../../auth/context/AuthContext";

import "./TeacherHome.css";

const TeacherHome = memo(() => {
  const { user } = useAuth();

  return (
    <div className="d-page-container">
      <SectionHeader
        title="Teacher Dashboard"
        subtitle={user?.fullName ? `Welcome, ${user.fullName}` : "Your teaching workspace"}
      />

      <DashboardCard
        className="t-dashboard-unavailable"
        padding={false}
      >
        <section
          className="t-dashboard-unavailable-content"
          role="status"
          aria-labelledby="t-dashboard-unavailable-title"
        >
          <div className="t-dashboard-unavailable-icon" aria-hidden="true">
            <Info size={25} />
          </div>

          <div className="t-dashboard-unavailable-copy">
            <div className="t-dashboard-unavailable-label">
              <Info size={14} aria-hidden="true" />
              Dashboard data not available
            </div>

            <h3 id="t-dashboard-unavailable-title">
              Your teaching overview is not available yet
            </h3>

            <p>
              The current backend supports assigned-subject lookup, subject
              rosters and attendance marking. It does not expose the timetable,
              dashboard aggregate, assignment, grading, results or insight
              endpoints needed to populate this overview.
            </p>
            <p>
              Sample schedule entries, class and student totals, pending-work
              counts, generated alerts and unverified staff details are
              intentionally not displayed.
            </p>

            <Link
              className="d-btn-primary t-dashboard-attendance-link"
              to="/teacher/attendance"
            >
              <ClipboardCheck size={17} aria-hidden="true" />
              Open Attendance Workflow
            </Link>
          </div>
        </section>
      </DashboardCard>
    </div>
  );
});

export default TeacherHome;
