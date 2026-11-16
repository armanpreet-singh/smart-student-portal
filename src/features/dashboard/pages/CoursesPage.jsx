import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, Info, RefreshCw } from "lucide-react";

import { useAuth } from "../../auth/context/AuthContext";
import DashboardCard from "../components/DashboardCard/DashboardCard";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import { fetchStudentCourses } from "../api/studentCoursesApi";

import "./CoursesPage.css";

function LoadingState() {
  return (
    <DashboardCard className="s-courses-state" padding={false} role="status">
      <span className="s-courses-spinner" aria-hidden="true" />
      <div>
        <h3>Loading your courses</h3>
        <p>Retrieving subjects assigned to your class.</p>
      </div>
    </DashboardCard>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <DashboardCard className="s-courses-state s-courses-error" padding={false}>
      <Info size={25} aria-hidden="true" />
      <div className="s-courses-state-copy">
        <h3>Course catalogue unavailable</h3>
        <p>{message}</p>
        <button type="button" className="s-courses-retry" onClick={onRetry}>
          <RefreshCw size={15} aria-hidden="true" />
          Retry
        </button>
      </div>
    </DashboardCard>
  );
}

const CoursesPage = memo(() => {
  const { accessToken, refreshCurrentUser } = useAuth();
  const [catalogue, setCatalogue] = useState(null);
  const [requestStatus, setRequestStatus] = useState("loading");
  const [requestError, setRequestError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [search, setSearch] = useState("");

  const loadCourses = useCallback(async (signal) => {
    setRequestStatus("loading");
    setRequestError("");
    setCatalogue(null);

    try {
      const result = await fetchStudentCourses(accessToken);
      if (signal.aborted) return;
      setCatalogue(result);
      setRequestStatus("success");
    } catch (error) {
      if (signal.aborted) return;
      if (error?.status === 401) {
        await refreshCurrentUser();
        if (signal.aborted) return;
      }
      setRequestError(error?.message || "Unable to load your courses. Please retry.");
      setRequestStatus("error");
    }
  }, [accessToken, refreshCurrentUser]);

  useEffect(() => {
    const controller = new AbortController();
    loadCourses(controller.signal);
    return () => controller.abort();
  }, [loadCourses, retryCount]);

  const courses = catalogue?.courses || [];
  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return courses;
    return courses.filter((course) =>
      [course.name, course.code, course.description || ""]
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [courses, search]);

  const classInfo = catalogue?.class || null;

  return (
    <div className="d-page-container s-courses-page">
      <SectionHeader
        title="My Courses"
        subtitle="Active subjects assigned to your Student class"
      />

      {requestStatus === "loading" && <LoadingState />}

      {requestStatus === "error" && (
        <ErrorState
          message={requestError}
          onRetry={() => setRetryCount((value) => value + 1)}
        />
      )}

      {requestStatus === "success" && !classInfo && (
        <DashboardCard className="s-courses-empty" padding={false}>
          <BookOpen size={28} aria-hidden="true" />
          <div>
            <h3>No class is assigned to your account</h3>
            <p>
              Your Student account is active, but it is not linked to an active
              class. Contact the administrator to have your class assignment checked.
            </p>
          </div>
        </DashboardCard>
      )}

      {requestStatus === "success" && classInfo && (
        <>
          <DashboardCard className="s-courses-class" padding={false}>
            <div className="s-courses-class-icon" aria-hidden="true">
              <BookOpen size={22} />
            </div>
            <div className="s-courses-class-details">
              <span className="s-courses-eyebrow">Your assigned class</span>
              <h2>{classInfo.name}</h2>
              <p>{classInfo.code} <span aria-hidden="true">•</span> {classInfo.academicYear}</p>
            </div>
            <div className="s-courses-count">
              <strong>{courses.length}</strong>
              <span>{courses.length === 1 ? "Active subject" : "Active subjects"}</span>
            </div>
          </DashboardCard>

          {courses.length > 0 && (
            <div className="s-courses-toolbar">
              <label htmlFor="student-course-search">Search your subjects</label>
              <input
                id="student-course-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by subject name, code or description"
              />
            </div>
          )}

          {courses.length === 0 ? (
            <DashboardCard className="s-courses-empty" padding={false}>
              <BookOpen size={28} aria-hidden="true" />
              <div>
                <h3>No active subjects are available</h3>
                <p>
                  Your class is assigned, but there are no active subjects in its
                  catalogue yet. Contact the administrator if this is unexpected.
                </p>
              </div>
            </DashboardCard>
          ) : filteredCourses.length === 0 ? (
            <DashboardCard className="s-courses-empty" padding={false}>
              <Info size={24} aria-hidden="true" />
              <div>
                <h3>No subjects match your search</h3>
                <p>Try another subject name, code or keyword.</p>
              </div>
            </DashboardCard>
          ) : (
            <div className="s-courses-grid">
              {filteredCourses.map((course) => (
                <DashboardCard className="s-course-card" key={course.id}>
                  <div className="s-course-card-top">
                    <span className="s-course-icon" aria-hidden="true">
                      <BookOpen size={19} />
                    </span>
                    <span className="s-course-code">{course.code}</span>
                  </div>
                  <h3>{course.name}</h3>
                  <p className="s-course-description">
                    {course.description || "No course description has been provided."}
                  </p>
                  <div className="s-course-card-footer">
                    <span><CalendarDays size={14} aria-hidden="true" /> {classInfo.academicYear}</span>
                    <span>{classInfo.code}</span>
                  </div>
                </DashboardCard>
              ))}
            </div>
          )}

          <p className="s-courses-scope-note">
            This catalogue shows active subjects associated with your assigned class.
            It does not represent course registration, credits or enrolment status.
          </p>
        </>
      )}
    </div>
  );
});

export default CoursesPage;
