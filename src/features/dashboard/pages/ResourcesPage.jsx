import React, { useState } from 'react';
import ResourceCard from '../components/ResourceCard/ResourceCard';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import { resourcesData } from '../data/mockDashboardData';

const types = ["All", "Lecture Notes", "PPT", "Lab Manual", "Recorded Lecture", "Previous Year Papers"];
const ResourcesPage = () => {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? resourcesData : resourcesData.filter(r => r.type === active);

  return (
    <div className="d-page-container">
      <SectionHeader title="Learning Resources" subtitle="Download study materials" />
      <div className="d-filter-tabs">
        {types.map(t => <button key={t} className={`d-tab ${active === t ? 'active' : ''}`} onClick={() => setActive(t)}>{t}</button>)}
      </div>
      <div className="d-list-stack">
        {filtered.map(res => <ResourceCard key={res.id} {...res} />)}
      </div>
    </div>
  );
};
export default ResourcesPage;