import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  GraduationCap,
  History,
  RefreshCw,
  Users,
} from "lucide-react";

import { useAuth } from "../../auth/context/AuthContext";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import { getGreeting } from "../../../features/dashboard/utils/formatHelpers";
import { fetchAdminStudents } from "../api/adminStudentsApi";
import { fetchAdminTeachers } from "../api/adminTeachersApi";
import {
  fetchAdminClasses,
  fetchAdminSubjects,
} from "../api/adminCatalogueApi";

import "./AdminHome.css";

const COUNT_PAGE_SIZE = 1;

const metrics = [
  {
    key: "students",
    label: "Student accounts",
    detail: "All account statuses",
    icon: Users,
    iconClass: "students",
  },
  {
    key: "teachers",
    label: "Teacher accounts",
    detail: "All account statuses",
    icon: GraduationCap,
    iconClass: "teachers",
  },
  {
    key: "classes",
    label: "Classes",
    detail: "Active and inactive",
    icon: Building2,
    iconClass: "classes",
  },
  {
    key: "subjects",
    label: "Subjects",
    detail: "Active and inactive",
    icon: BookOpen,
    iconClass: "subjects",
  },
];

const quickLinks = [
  {
    to: "/admin/students",
    label: "Manage students",
    description: "Search accounts, provision students and manage status",
    icon: Users,
  },
  {
    to: "/admin/teachers",
    label: "Manage teachers",
    description: "Search accounts, provision teachers and manage status",
    icon: GraduationCap,
  },
  {
    to: "/admin/courses",
    label: "Browse catalogue",
    description: "Review classes and their subjects",
    icon: BookOpen,
  },
  {
    to: "/admin/teacher-subject-assignments",
    label: "Teaching assignments",
    description: "Assign an active teacher to an eligible subject",
    icon: ClipboardList,
  },
  {
    to: "/admin/reports",
    label: "Attendance reports",
    description: "Review backend-reported attendance summaries",
    icon: BarChart3,
  },
  {
    to: "/admin/audit-logs",
    label: "Admin audit logs",
    description: "Review a searchable record of administrative activity",
    icon: History,
  },
];

function formatCount(value) {
  return new Intl.NumberFormat().format(value);
}

function formatRefreshTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function MetricCard({ metric, value }) {
  const Icon = metric.icon;

  return (
    <DashboardCard className="a-admin-overview-metric">
      <div className={`a-admin-overview-metric-icon ${metric.iconClass}`}>
        <Icon size={21} aria-hidden="true" />
      </div>
      <div className="a-admin-overview-metric-content">
        <p>{metric.label}</p>
        <strong>{formatCount(value)}</strong>
        <span>{metric.detail}</span>
      </div>
    </DashboardCard>
  );
}

function LoadingOverview() {
  return (
    <div className="a-admin-overview-grid" role="status" aria-live="polite" aria-label="Loading directory totals">
      {metrics.map((metric) => (
        <DashboardCard className="a-admin-overview-metric" key={metric.key}>
          <div className="a-admin-overview-skeleton-icon" />
          <div className="a-admin-overview-skeleton-copy">
            <span />
            <strong />
            <span />
          </div>
        </DashboardCard>
      ))}
    </div>
  );
}

const AdminHome = () => {
  const { accessToken, user, refreshCurrentUser } = useAuth();
  const [overview, setOverview] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadOverview() {
      setStatus("loading");
      setError("");

      try {
        // Request one row per directory. The backend pagination.total value
        // is the authoritative count; the dashboard does not download records.
        const [students, teachers, classes, subjects] = await Promise.all([
          fetchAdminStudents(accessToken, {
            page: 1,
            pageSize: COUNT_PAGE_SIZE,
          }),
          fetchAdminTeachers(accessToken, {
            page: 1,
            pageSize: COUNT_PAGE_SIZE,
          }),
          fetchAdminClasses(accessToken, {
            page: 1,
            pageSize: COUNT_PAGE_SIZE,
          }),
          fetchAdminSubjects(accessToken, {
            page: 1,
            pageSize: COUNT_PAGE_SIZE,
          }),
        ]);

        if (!active) return;

        setOverview({
          students: students.pagination.total,
          teachers: teachers.pagination.total,
          classes: classes.pagination.total,
          subjects: subjects.pagination.total,
        });
        setLastUpdated(new Date().toISOString());
        setStatus("success");
      } catch (loadError) {
        if (!active) return;

        if (loadError?.status === 401) {
          await refreshCurrentUser();
          if (!active) return;
        }

        setError(
          loadError?.message ||
            "Unable to load the current directory totals. Please retry.",
        );
        setStatus("error");
      }
    }

    loadOverview();

    return () => {
      active = false;
    };
  }, [accessToken, refreshCurrentUser, retryCount]);

  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const displayName =
    typeof user?.fullName === "string" && user.fullName.trim()
      ? user.fullName.trim()
      : "Administrator";

  return (
    <div className="d-page-container a-admin-home">
      <section className="a-admin-home-hero" aria-label="Administrator welcome">
        <div>
          <p className="a-admin-home-greeting">{getGreeting()}, Administrator</p>
          <h1>{displayName}</h1>
          <p className="a-admin-home-date">{dateLabel}</p>
        </div>
        <div className="a-admin-home-hero-mark" aria-hidden="true">
          <Building2 size={34} />
        </div>
      </section>

      <div className="a-admin-overview-heading">
        <SectionHeader
          title="Directory overview"
          subtitle="Current record totals returned by the administration service"
        />
        {status === "success" && (
          <span className="a-admin-overview-updated">
            Updated {formatRefreshTime(lastUpdated)}
          </span>
        )}
      </div>

      {status === "loading" && <LoadingOverview />}

      {status === "error" && (
        <div className="a-admin-overview-error" role="alert">
          <div>
            <strong>Directory totals are unavailable</strong>
            <p>{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setRetryCount((value) => value + 1)}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {status === "success" && overview && (
        <>
          <div className="a-admin-overview-grid" aria-live="polite">
            {metrics.map((metric) => (
              <MetricCard
                key={metric.key}
                metric={metric}
                value={overview[metric.key]}
              />
            ))}
          </div>
          <p className="a-admin-overview-note">
            Totals include active and inactive records. They represent account,
            class and subject directory entries—not student enrolment,
            department staffing, course workload or other unprovided
            institutional aggregates.
          </p>
        </>
      )}

      <SectionHeader
        title="Quick access"
        subtitle="Open a supported administration workflow"
      />
      <div className="a-admin-home-links">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link className="a-admin-home-link" to={item.to} key={item.to}>
              <span className="a-admin-home-link-icon">
                <Icon size={19} aria-hidden="true" />
              </span>
              <span className="a-admin-home-link-copy">
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
              <ArrowRight
                className="a-admin-home-link-arrow"
                size={17}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AdminHome;
