import React, { useMemo } from 'react';
import { FileText, BookOpen, CalendarDays, Megaphone } from 'lucide-react';
import Hero from '../Hero/Hero';
import StatCard from '../components/StatCard/StatCard';
import ScheduleCard from '../components/ScheduleCard/ScheduleCard';
import CourseCard from '../components/CourseCard/CourseCard';
import AssignmentCard from '../components/AssignmentCard/AssignmentCard';
import InsightCard from '../components/InsightCard/InsightCard';
import AnnouncementCard from '../components/AnnouncementCard/AnnouncementCard';
import ResourceCard from '../components/ResourceCard/ResourceCard';
import ActivityCard from '../components/ActivityCard/ActivityCard';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import DashboardCard from '../components/DashboardCard/DashboardCard';
import { statsData, scheduleData, coursesData, assignmentsData, insightsData, announcementsData, resourcesData, activityData } from '../data/mockDashboardData';

const DashboardHome = () => {
  const topCourses = useMemo(() => coursesData.slice(0, 4), []);
  const topAssignments = useMemo(() => assignmentsData.slice(0, 2), []);

  return (
    <div className="d-page-container">
      <Hero />
      
      <div className="d-grid-4">
        {statsData.map(stat => <StatCard key={stat.id} {...stat} />)}
      </div>

      <div className="d-grid-main">
        <div className="d-col-8">
          <SectionHeader title="Today's Schedule" subtitle="Your classes for today" />
          <div className="d-timeline">
            {scheduleData.map(item => <ScheduleCard key={item.id} {...item} />)}
          </div>

          <SectionHeader title="Active Courses" subtitle="Current semester overview" action={<button className="d-link-btn">View All</button>} />
          <div className="d-grid-2">
            {topCourses.map(course => <CourseCard key={course.id} {...course} />)}
          </div>

          <SectionHeader title="Learning Resources" subtitle="Recently added materials" action={<button className="d-link-btn">Browse All</button>} />
          <div className="d-list-stack">
            {resourcesData.slice(0, 3).map(res => <ResourceCard key={res.id} {...res} />)}
          </div>
        </div>

        <div className="d-col-4">
          <DashboardCard padding={false} className="d-insights-wrapper">
            <div className="p-4" style={{ borderBottom: '1px solid var(--d-border)' }}>
              <SectionHeader title="Smart Insights" subtitle="Powered by LTSU AI" />
            </div>
            <div className="p-4 d-insights-stack">
              {insightsData.map(insight => <InsightCard key={insight.id} {...insight} />)}
            </div>
          </DashboardCard>

          <SectionHeader title="Upcoming Assignments" action={<button className="d-link-btn">View All</button>} />
          <div className="d-list-stack">
            {topAssignments.map(asg => <AssignmentCard key={asg.id} {...asg} />)}
          </div>

          <SectionHeader title="Announcements" />
          <div className="d-list-stack">
            {announcementsData.map(ann => <AnnouncementCard key={ann.id} {...ann} />)}
          </div>

          <SectionHeader title="Recent Activity" />
          <DashboardCard>
            <div className="d-activity-stack">
              {activityData.map(act => <ActivityCard key={act.id} {...act} />)}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;