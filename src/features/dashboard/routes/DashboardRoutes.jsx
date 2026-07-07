
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

const DashboardHome = lazy(() => import('../pages/DashboardHome'));
const CoursesPage = lazy(() => import('../pages/CoursesPage'));
const AttendancePage = lazy(() => import('../pages/AttendancePage'));
const TimetablePage = lazy(() => import('../pages/TimetablePage'));
const AssignmentsPage = lazy(() => import('../pages/AssignmentsPage'));
const ResultsPage = lazy(() => import('../pages/ResultsPage'));
const ResourcesPage = lazy(() => import('../pages/ResourcesPage'));
const AnnouncementsPage = lazy(() => import('../pages/AnnouncementsPage'));
const CalendarPage = lazy(() => import('../pages/CalendarPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

const Fallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--d-text-secondary)' }}>
    Loading...
  </div>
);

const DashboardRoutes = () => (
  <Routes>
    <Route path="/" element={<DashboardLayout />}>
      <Route index element={<Suspense fallback={<Fallback/>}><DashboardHome /></Suspense>} />
      <Route path="courses" element={<Suspense fallback={<Fallback/>}><CoursesPage /></Suspense>} />
      <Route path="attendance" element={<Suspense fallback={<Fallback/>}><AttendancePage /></Suspense>} />
      <Route path="timetable" element={<Suspense fallback={<Fallback/>}><TimetablePage /></Suspense>} />
      <Route path="assignments" element={<Suspense fallback={<Fallback/>}><AssignmentsPage /></Suspense>} />
      <Route path="results" element={<Suspense fallback={<Fallback/>}><ResultsPage /></Suspense>} />
      <Route path="resources" element={<Suspense fallback={<Fallback/>}><ResourcesPage /></Suspense>} />
      <Route path="announcements" element={<Suspense fallback={<Fallback/>}><AnnouncementsPage /></Suspense>} />
      <Route path="calendar" element={<Suspense fallback={<Fallback/>}><CalendarPage /></Suspense>} />
      <Route path="profile" element={<Suspense fallback={<Fallback/>}><ProfilePage /></Suspense>} />
      <Route path="settings" element={<Suspense fallback={<Fallback/>}><SettingsPage /></Suspense>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);

export default DashboardRoutes;