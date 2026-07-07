import React from 'react';
import AnnouncementCard from '../components/AnnouncementCard/AnnouncementCard';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import { announcementsData } from '../data/mockDashboardData';

const AnnouncementsPage = () => (
  <div className="d-page-container">
    <SectionHeader title="Announcements" subtitle="Latest from the university" />
    <div className="d-list-stack">
      {announcementsData.map(ann => <AnnouncementCard key={ann.id} {...ann} />)}
    </div>
  </div>
);
export default AnnouncementsPage;