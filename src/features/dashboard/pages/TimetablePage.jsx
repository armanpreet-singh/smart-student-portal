import React from 'react';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import DashboardCard from '../components/DashboardCard/DashboardCard';
import { scheduleData } from '../data/mockDashboardData';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TimetablePage = () => (
  <div className="d-page-container">
    <SectionHeader title="Weekly Timetable" subtitle="Your regular class schedule" />
    <div className="d-timetable-grid">
      {days.map(day => (
        <div key={day} className="d-day-col">
          <h4 className="d-day-title">{day}</h4>
          {scheduleData.map(cls => (
            <DashboardCard key={`${day}-${cls.id}`} className={`d-tt-card ${cls.type.toLowerCase()}`}>
              <h5>{cls.subject}</h5>
              <p className="d-tt-time">{cls.time}</p>
              <p>{cls.room}</p>
            </DashboardCard>
          ))}
        </div>
      ))}
    </div>
  </div>
);
export default TimetablePage;