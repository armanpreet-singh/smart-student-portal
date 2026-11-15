import React from "react";
import { ArrowRight, ClipboardList, Info } from "lucide-react";
import { Link } from "react-router-dom";

import DashboardCard from "../components/DashboardCard/DashboardCard";
import SectionHeader from "../components/SectionHeader/SectionHeader";

import "./AssignmentsPage.css";

const AssignmentsPage = () => (
  <div className="d-page-container s-assignments-page">
    <SectionHeader
      title="Assignments"
      subtitle="Assignment details and submission status from verified university data"
    />

    <DashboardCard className="s-assignments-unavailable" padding={false}>
      <section
        className="s-assignments-unavailable-content"
        role="status"
        aria-labelledby="s-assignments-unavailable-title"
      >
        <div className="s-assignments-unavailable-icon" aria-hidden="true">
          <ClipboardList size={25} />
        </div>

        <div className="s-assignments-unavailable-copy">
          <div className="s-assignments-unavailable-label">
            <Info size={14} aria-hidden="true" />
            Backend capability unavailable
          </div>

          <h2 id="s-assignments-unavailable-title">
            Assignment information is not available yet
          </h2>

          <p>
            The current backend does not define Assignment or Submission
            records, and it does not expose a Student assignment listing
            endpoint. The portal therefore cannot verify assignment titles,
            instructions, due dates, attached files, submission status or
            grading results.
          </p>
          <p>
            Sample assignment cards and locally labelled pending or overdue
            states have been removed so they are not mistaken for official
            coursework.
          </p>
        </div>
      </section>

      <div className="s-assignments-unavailable-footer">
        <span>
          Assignment tracking and submissions can be added when an
          authenticated Student API and its submission lifecycle are available.
        </span>
        <Link to="/dashboard/courses">
          View course availability
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </DashboardCard>
  </div>
);

export default AssignmentsPage;
