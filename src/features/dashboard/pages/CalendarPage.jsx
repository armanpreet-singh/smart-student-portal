import React from 'react';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import DashboardCard from '../components/DashboardCard/DashboardCard';
import { calendarData } from '../data/mockDashboardData';

const CalendarPage = () => (
  <div className="d-page-container">
    <SectionHeader title="Academic Calendar" subtitle="Important dates and events" />
    <div className="d-cal-list">
      {calendarData.map(ev => (
        <DashboardCard key={ev.id} className="d-cal-event">
          <div className="d-cal-date">
            <span className="d-cal-day">{new Date(ev.date).getDate()}</span>
            <span className="d-cal-month">{new Date(ev.date).toLocaleString('default', { month: 'short' })}</span>
          </div>
          <div className="d-cal-info">
            <h4>{ev.title}</h4>
            <span className={`d-type-badge ${ev.type}`}>{ev.type}</span>
          </div>
        </DashboardCard>
      ))}
    </div>
  </div>
);
export default CalendarPage;