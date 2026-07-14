import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import TeacherLayout from "../layouts/TeacherLayout";

const TeacherHome = lazy(() => import("../pages/TeacherHome"));
// Lazy load other pages as you build them
const TeacherClasses = lazy(() => import("../pages/TeacherClasses"));
const TeacherAttendance = lazy(() => import("../pages/TeacherAttendance"));
const TeacherAssignments = lazy(() => import("../pages/TeacherAssignments"));
const TeacherStudents = lazy(() => import("../pages/TeacherStudents"));
const TeacherAnnouncements = lazy(
  () => import("../pages/TeacherAnnouncements"),
);
const TeacherTimetable = lazy(() => import("../pages/TeacherTimetable"));
const TeacherResources = lazy(() => import("../pages/TeacherResources"));
const TeacherCalendar = lazy(() => import("../pages/TeacherCalendar"));
const TeacherProfile = lazy(() => import("../pages/TeacherProfile"));
const TeacherSettings = lazy(() => import("../pages/TeacherSettings"));

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

const TeacherRoutes = () => (
  <Routes>
    <Route path="/" element={<TeacherLayout />}>
      <Route
        index
        element={
          <Suspense fallback={<Fallback />}>
            <TeacherHome />
          </Suspense>
        }
      />
      <Route
        path="classes"
        element={
          <Suspense fallback={<Fallback />}>
            <TeacherClasses />
          </Suspense>
        }
      />
      <Route
        path="attendance"
        element={
          <Suspense fallback={<Fallback />}>
            <TeacherAttendance />
          </Suspense>
        }
      />
      <Route
        path="assignments"
        element={
          <Suspense fallback={<Fallback />}>
            <TeacherAssignments />
          </Suspense>
        }
      />
      <Route
        path="students"
        element={
          <Suspense fallback={<Fallback />}>
            <TeacherStudents />
          </Suspense>
        }
      />
      <Route
        path="announcements"
        element={
          <Suspense fallback={<Fallback />}>
            <TeacherAnnouncements />
          </Suspense>
        }
      />
      <Route
        path="timetable"
        element={
          <Suspense fallback={<Fallback />}>
            <TeacherTimetable />
          </Suspense>
        }
      />
      <Route
        path="resources"
        element={
          <Suspense fallback={<Fallback />}>
            <TeacherResources />
          </Suspense>
        }
      />
      <Route
        path="calendar"
        element={
          <Suspense fallback={<Fallback />}>
            <TeacherCalendar />
          </Suspense>
        }
      />
      <Route
        path="profile"
        element={
          <Suspense fallback={<Fallback />}>
            <TeacherProfile />
          </Suspense>
        }
      />
      <Route
        path="settings"
        element={
          <Suspense fallback={<Fallback />}>
            <TeacherSettings />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);

export default TeacherRoutes;
