import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";

const AdminHome = lazy(() => import("../pages/AdminHome"));
const StudentsPage = lazy(() => import("../pages/StudentsPage"));
const TeachersPage = lazy(() => import("../pages/TeachersPage"));
const CoursesPage = lazy(() => import("../pages/CoursesPage"));
const DepartmentsPage = lazy(() => import("../pages/DepartmentsPage"));
const AttendancePage = lazy(() => import("../pages/AttendancePage"));
const AnnouncementsPage = lazy(() => import("../pages/AnnouncementsPage"));
const CalendarPage = lazy(() => import("../pages/CalendarPage"));
const ReportsPage = lazy(() => import("../pages/ReportsPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));

const Fallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "50vh",
      color: "var(--d-text-secondary)",
    }}
  >
    Loading...
  </div>
);

const AdminRoutes = () => (
  <Routes>
    <Route path="/" element={<AdminLayout />}>
      <Route
        index
        element={
          <Suspense fallback={<Fallback />}>
            <AdminHome />
          </Suspense>
        }
      />
      <Route
        path="students"
        element={
          <Suspense fallback={<Fallback />}>
            <StudentsPage />
          </Suspense>
        }
      />
      <Route
        path="teachers"
        element={
          <Suspense fallback={<Fallback />}>
            <TeachersPage />
          </Suspense>
        }
      />
      <Route
        path="courses"
        element={
          <Suspense fallback={<Fallback />}>
            <CoursesPage />
          </Suspense>
        }
      />
      <Route
        path="departments"
        element={
          <Suspense fallback={<Fallback />}>
            <DepartmentsPage />
          </Suspense>
        }
      />
      <Route
        path="attendance"
        element={
          <Suspense fallback={<Fallback />}>
            <AttendancePage />
          </Suspense>
        }
      />
      <Route
        path="announcements"
        element={
          <Suspense fallback={<Fallback />}>
            <AnnouncementsPage />
          </Suspense>
        }
      />
      <Route
        path="calendar"
        element={
          <Suspense fallback={<Fallback />}>
            <CalendarPage />
          </Suspense>
        }
      />
      <Route
        path="reports"
        element={
          <Suspense fallback={<Fallback />}>
            <ReportsPage />
          </Suspense>
        }
      />
      <Route
        path="profile"
        element={
          <Suspense fallback={<Fallback />}>
            <ProfilePage />
          </Suspense>
        }
      />
      <Route
        path="settings"
        element={
          <Suspense fallback={<Fallback />}>
            <SettingsPage />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);

export default AdminRoutes;
