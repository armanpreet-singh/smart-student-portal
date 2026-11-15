import React from "react";
import { GraduationCap, Info } from "lucide-react";

import DashboardCard from "../components/DashboardCard/DashboardCard";
import SectionHeader from "../components/SectionHeader/SectionHeader";

import "./ResultsPage.css";

const ResultsPage = () => (
  <div className="d-page-container s-results-page">
    <SectionHeader
      title="Academic Results"
      subtitle="Marks and semester outcomes from verified university records"
    />

    <DashboardCard className="s-results-unavailable" padding={false}>
      <section
        className="s-results-unavailable-content"
        role="status"
        aria-labelledby="s-results-unavailable-title"
      >
        <div className="s-results-unavailable-icon" aria-hidden="true">
          <GraduationCap size={25} />
        </div>

        <div className="s-results-unavailable-copy">
          <div className="s-results-unavailable-label">
            <Info size={14} aria-hidden="true" />
            Backend capability unavailable
          </div>

          <h2 id="s-results-unavailable-title">
            Academic results are not available yet
          </h2>

          <p>
            The current backend does not define examination, grade or academic
            result records, and it does not expose a Student results read
            endpoint. The portal therefore cannot verify semester SGPA or
            CGPA, marks, grades, credit totals, transcript details or result
            publication status.
          </p>
          <p>
            Sample semester performance rows and credit totals have been
            removed so illustrative values are not mistaken for your official
            academic record.
          </p>
        </div>
      </section>

      <div className="s-results-unavailable-footer">
        Academic results can be displayed when the backend provides an
        authenticated Student results contract and authoritative grade data.
      </div>
    </DashboardCard>
  </div>
);

export default ResultsPage;
