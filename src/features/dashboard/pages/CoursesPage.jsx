import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Info } from "lucide-react";

import DashboardCard from "../components/DashboardCard/DashboardCard";
import SectionHeader from "../components/SectionHeader/SectionHeader";

import "./CoursesPage.css";

const CoursesPage = () => (
  <div className="d-page-container s-courses-page">
    <SectionHeader
      title="My Courses"
      subtitle="Course information for your authenticated student account"
    />

    <DashboardCard className="s-courses-unavailable" padding={false}>
      <div className="s-courses-unavailable-body">
        <span className="s-courses-unavailable-icon" aria-hidden="true">
          <BookOpen size={25} />
        </span>
        <div className="s-courses-unavailable-copy">
          <h2>Student course catalogue is not available yet</h2>
          <p>
            The current backend does not expose a Student-authorized course or
            subject listing endpoint. The Class and Subject catalogue routes
            are restricted to administrators, so this page cannot safely use
            those routes for a student session.
          </p>
          <p>
            Sample semester, instructor, course-progress and enrollment cards
            have been removed because they are not backed by your account data.
          </p>
        </div>
      </div>

      <div className="s-courses-unavailable-footer">
        <span className="s-courses-info">
          <Info size={15} aria-hidden="true" />
          <span>
            Subject names and available attendance totals can be reviewed in
            Attendance. That view is not a full course catalogue.
          </span>
        </span>
        <Link className="s-courses-attendance-link" to="/dashboard/attendance">
          Review subject attendance
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </DashboardCard>
  </div>
);

export default CoursesPage;
