import React from 'react';
import CourseCard from '../components/CourseCard/CourseCard';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import { coursesData } from '../data/mockDashboardData';

const CoursesPage = () => (
  <div className="d-page-container">
    <SectionHeader title="My Courses" subtitle="Semester 5 - CSE" />
    <div className="d-grid-3">
      {coursesData.map(course => <CourseCard key={course.id} {...course} />)}
    </div>
  </div>
);
export default CoursesPage;