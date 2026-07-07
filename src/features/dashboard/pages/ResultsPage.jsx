import React from 'react';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import DashboardCard from '../components/DashboardCard/DashboardCard';
import { resultsData } from '../data/mockDashboardData';

const ResultsPage = () => (
  <div className="d-page-container">
    <SectionHeader title="Academic Results" subtitle="Semester-wise performance" />
    <div className="d-results-list">
      {resultsData.map(r => (
        <DashboardCard key={r.semester} className="d-result-row">
          <div className="d-result-sem">{r.semester} Sem</div>
          <div className="d-result-details">
            <h4>SGPA: {r.sgpa || 'N/A'}</h4>
            <p>Credits: {r.credits}</p>
          </div>
          {r.sgpa && <div className="d-result-badge" style={{ color: r.sgpa >= 9 ? '#D4AF37' : r.sgpa >= 8 ? '#1E3A8A' : '#F59E0B' }}>{r.sgpa}</div>}
        </DashboardCard>
      ))}
    </div>
  </div>
);
export default ResultsPage;