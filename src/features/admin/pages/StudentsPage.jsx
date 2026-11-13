import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Mail, RotateCw, Search, UserRound } from "lucide-react";

import { useAuth } from "../../auth/context/AuthContext";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import { fetchAdminStudents } from "../api/adminStudentsApi";

import "./StudentsPage.css";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function formatCreatedAt(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function LoadingState() {
  return (
    <div className="a-students-state" role="status" aria-live="polite">
      <span className="a-students-spinner" aria-hidden="true" />
      <div>
        <h3>Loading student directory</h3>
        <p>Retrieving student accounts from the university service.</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="a-students-state a-students-error" role="alert">
      <div>
        <h3>Student directory unavailable</h3>
        <p>{message}</p>
      </div>
      <button
        type="button"
        className="d-btn-primary a-students-retry"
        onClick={onRetry}
      >
        <RotateCw size={16} />
        Retry
      </button>
    </div>
  );
}

function EmptyState({ hasFilters }) {
  return (
    <div className="a-students-empty">
      <UserRound size={30} aria-hidden="true" />
      <h3>{hasFilters ? "No matching student accounts" : "No student accounts found"}</h3>
      <p>
        {hasFilters
          ? "Try a different search term or account-status filter."
          : "The university service has not returned any student accounts."}
      </p>
    </div>
  );
}

function AccountStatus({ isActive }) {
  return (
    <span className={`a-students-badge ${isActive ? "active" : "inactive"}`}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function PasswordStatus({ mustChangePassword }) {
  return (
    <span className={`a-students-badge ${mustChangePassword ? "pending" : "complete"}`}>
      {mustChangePassword ? "Change required" : "Complete"}
    </span>
  );
}

const StudentsPage = () => {
  const { accessToken, refreshCurrentUser } = useAuth();

  const [draftSearch, setDraftSearch] = useState("");
  const [draftStatus, setDraftStatus] = useState("all");
  const [filters, setFilters] = useState({ search: "", isActive: "all" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [requestStatus, setRequestStatus] = useState("loading");
  const [requestError, setRequestError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [filterError, setFilterError] = useState("");

  useEffect(() => {
    let active = true;

    const loadStudents = async () => {
      setRequestStatus("loading");
      setRequestError("");
      setStudents([]);

      try {
        const result = await fetchAdminStudents(accessToken, {
          page,
          pageSize,
          search: filters.search,
          isActive: filters.isActive,
        });

        if (!active) return;
        setStudents(result.users);
        setPagination(result.pagination);
        setRequestStatus("success");
      } catch (error) {
        if (!active) return;

        if (error?.status === 401) {
          await refreshCurrentUser();
          if (!active) return;
        }

        setRequestError(
          error?.message || "Unable to load student directory records.",
        );
        setRequestStatus("error");
      }
    };

    loadStudents();

    return () => {
      active = false;
    };
  }, [
    accessToken,
    filters.search,
    filters.isActive,
    page,
    pageSize,
    retryCount,
    refreshCurrentUser,
  ]);

  const hasFilters = Boolean(
    filters.search || filters.isActive !== "all",
  );

  const applyFilters = (event) => {
    event.preventDefault();
    setFilterError("");

    if (draftSearch.trim().length > 80) {
      setFilterError("Search must be 80 characters or fewer.");
      return;
    }

    setFilters({
      search: draftSearch.trim(),
      isActive: draftStatus,
    });
    setPage(1);
  };

  const clearFilters = () => {
    setDraftSearch("");
    setDraftStatus("all");
    setFilters({ search: "", isActive: "all" });
    setPage(1);
    setFilterError("");
  };

  const startRecord =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.pageSize + 1;
  const endRecord = Math.min(
    pagination.page * pagination.pageSize,
    pagination.total,
  );

  return (
    <div className="d-page-container">
      <SectionHeader
        title="Student Directory"
        subtitle="Student accounts returned by the university administration service"
      />

      <DashboardCard className="a-students-filters">
        <form onSubmit={applyFilters}>
          <div className="a-students-filter-grid">
            <label className="d-form-group a-students-search">
              <span>Search students</span>
              <div className="a-students-search-wrap">
                <Search size={17} aria-hidden="true" />
                <input
                  type="search"
                  value={draftSearch}
                  maxLength={80}
                  placeholder="Search by name, username or email"
                  onChange={(event) => {
                    setDraftSearch(event.target.value);
                    setFilterError("");
                  }}
                />
              </div>
            </label>

            <label className="d-form-group">
              <span>Account status</span>
              <select
                value={draftStatus}
                onChange={(event) => setDraftStatus(event.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="true">Active only</option>
                <option value="false">Inactive only</option>
              </select>
            </label>

            <div className="a-students-filter-actions">
              <button
                type="button"
                className="a-students-clear"
                onClick={clearFilters}
              >
                Clear
              </button>
              <button type="submit" className="d-btn-primary">
                Apply filters
              </button>
            </div>
          </div>

          {filterError && (
            <p className="a-students-filter-error" role="alert">
              {filterError}
            </p>
          )}
        </form>
      </DashboardCard>

      <DashboardCard padding={false}>
        <div className="a-students-table-heading">
          <div>
            <h3>Student accounts</h3>
            <p>
              {requestStatus === "success"
                ? `${pagination.total.toLocaleString()} students found`
                : "Account records supplied by the university service"}
            </p>
          </div>
          <label className="a-students-page-size">
            <span>Rows</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option value={size} key={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>

        {requestStatus === "loading" && <LoadingState />}

        {requestStatus === "error" && (
          <ErrorState
            message={requestError}
            onRetry={() => setRetryCount((value) => value + 1)}
          />
        )}

        {requestStatus === "success" && students.length === 0 && (
          <EmptyState hasFilters={hasFilters} />
        )}

        {requestStatus === "success" && students.length > 0 && (
          <div className="a-students-table-scroll">
            <table className="a-students-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Class</th>
                  <th>Account</th>
                  <th>Password setup</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.fullName}</strong>
                      <span className="a-students-username">
                        {student.username}
                      </span>
                    </td>
                    <td>
                      {student.email ? (
                        <span className="a-students-email">
                          <Mail size={13} aria-hidden="true" />
                          {student.email}
                        </span>
                      ) : (
                        <span className="a-students-muted">Not provided</span>
                      )}
                    </td>
                    <td>
                      {student.class ? (
                        <>
                          <strong>{student.class.code}</strong>
                          <span>{student.class.name}</span>
                        </>
                      ) : (
                        <span className="a-students-muted">Not assigned</span>
                      )}
                    </td>
                    <td>
                      <AccountStatus isActive={student.isActive} />
                    </td>
                    <td>
                      <PasswordStatus
                        mustChangePassword={student.mustChangePassword}
                      />
                    </td>
                    <td className="a-students-created">
                      {formatCreatedAt(student.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {requestStatus === "success" && (
          <div className="a-students-pagination">
            <p>
              {pagination.total === 0
                ? "No records to display"
                : `Showing ${startRecord.toLocaleString()}–${endRecord.toLocaleString()} of ${pagination.total.toLocaleString()}`}
            </p>
            <div>
              <button
                type="button"
                aria-label="Previous page"
                onClick={() =>
                  setPage((value) => Math.max(1, value - 1))
                }
                disabled={pagination.page <= 1}
              >
                <ChevronLeft size={17} />
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                aria-label="Next page"
                onClick={() => setPage((value) => value + 1)}
                disabled={
                  pagination.totalPages === 0 ||
                  pagination.page >= pagination.totalPages
                }
              >
                Next
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </DashboardCard>
    </div>
  );
};

export default StudentsPage;
