import React, { memo } from "react";
import { Building2, Info } from "lucide-react";

import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";

import "./DepartmentsPage.css";

const DepartmentsPage = memo(() => (
  <div className="d-page-container">
    <SectionHeader
      title="Departments"
      subtitle="Department information from verified university data"
    />

    <DashboardCard
      className="a-departments-unavailable"
      padding={false}
    >
      <section className="a-departments-unavailable-content" role="status">
        <div className="a-departments-unavailable-icon" aria-hidden="true">
          <Building2 size={25} />
        </div>

        <div className="a-departments-unavailable-copy">
          <div className="a-departments-unavailable-label">
            <Info size={14} aria-hidden="true" />
            Backend capability unavailable
          </div>

          <h3 id="a-departments-unavailable-title">
            Department directory is not supported yet
          </h3>

          <p>
            The current backend does not define a Department model or expose
            an Admin department read endpoint.
          </p>
          <p>
            Department names, Heads of Department, student totals and faculty
            totals cannot be verified from the supported APIs, so they are
            intentionally not displayed here.
          </p>
        </div>
      </section>
    </DashboardCard>
  </div>
));

export default DepartmentsPage;
