import React, { memo } from "react";
import { Info } from "lucide-react";
import { Link } from "react-router-dom";

import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";

import "./TeacherAssignments.css";

const TeacherAssignments = memo(() => {
  return (
    <div className="d-page-container">
      <SectionHeader
        title="Assignments"
        subtitle="Assignment management is not available from the current backend."
      />

      <DashboardCard className="t-assignments-unavailable" padding={false}>
        <section
          className="t-assignments-unavailable-content"
          role="status"
          aria-labelledby="t-assignments-unavailable-title"
        >
          <div className="t-assignments-unavailable-icon" aria-hidden="true">
            <Info size={25} />
          </div>

          <div className="t-assignments-unavailable-copy">
            <div className="t-assignments-unavailable-label">
              <Info size={14} aria-hidden="true" />
              Capability not available
            </div>

            <h3 id="t-assignments-unavailable-title">
              Teacher assignments are not available yet
            </h3>

            <p>
              The current backend does not provide an Assignment or Submission
              data model, or Teacher endpoints for creating assignments,
              tracking submissions, grading work or publishing results.
            </p>
            <p>
              Sample assignment titles, deadlines, submission totals, grading
              statuses and completion percentages have been removed rather than
              displaying unverified academic information.
            </p>

            <nav
              className="t-assignments-supported-links"
              aria-label="Available Teacher workflows"
            >
              <Link to="/teacher/classes">View My Classes</Link>
              <Link to="/teacher/students">View Students</Link>
            </nav>
          </div>
        </section>
      </DashboardCard>
    </div>
  );
});

export default TeacherAssignments;
