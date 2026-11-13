import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Mail, RotateCw, Search, UserRound } from "lucide-react";

import { useAuth } from "../../auth/context/AuthContext";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import { fetchAdminTeachers } from "../api/adminTeachersApi";

import "./TeachersPage.css";

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
    <div className="a-teachers-state" role="status" aria-live="polite">
      <span className="a-teachers-spinner" aria-hidden="true" />
      <div>
        <h3>Loading teacher directory</h3>
        <p>Retrieving teacher accounts from the university service.</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="a-teachers-state a-teachers-error" role="alert">
      <div>
        <h3>Teacher directory unavailable</h3>
        <p>{message}</p>
      </div>
      <button
        type="button"
        className="d-btn-primary a-teachers-retry"
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
    <div className="a-teachers-empty">
      <UserRound size={30} aria-hidden="true" />
      <h3>{hasFilters ? "No matching teacher accounts" : "No teacher accounts found"}</h3>
      <p>
        {hasFilters
          ? "Try a different search term or account-status filter."
          : "The university service has not returned any teacher accounts."}
      </p>
    </div>
  );
}

function AccountStatus({ isActive }) {
  return (
    <span className={`a-teachers-badge ${isActive ? "active" : "inactive"}`}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function PasswordStatus({ mustChangePassword }) {
  return (
    <span className={`a-teachers-badge ${mustChangePassword ? "pending" : "complete"}`}>
      {mustChangePassword ? "Change required" : "Complete"}
    </span>
  );
}

const TeachersPage = () => {
  const { accessToken, refreshCurrentUser } = useAuth();

  const [draftSearch, setDraftSearch] = useState("");
  const [draftStatus, setDraftStatus] = useState("all");
  const [filters, setFilters] = useState({ search: "", isActive: "all" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [teachers, setTeachers] = useState([]);
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

    const loadTeachers = async () => {
      setRequestStatus("loading");
      setRequestError("");
      setTeachers([]);

      try {
        const result = await fetchAdminTeachers(accessToken, {
          page,
          pageSize,
          search: filters.search,
          isActive: filters.isActive,
        });

        if (!active) return;
        setTeachers(result.users);
        setPagination(result.pagination);
        setRequestStatus("success");
      } catch (error) {
        if (!active) return;

        if (error?.status === 401) {
          await refreshCurrentUser();
          if (!active) return;
        }

        setRequestError(
          error?.message || "Unable to load teacher directory records.",
        );
        setRequestStatus("error");
      }
    };

    loadTeachers();

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
        title="Teacher Directory"
        subtitle="Teacher accounts returned by the university administration service"
      />

      <DashboardCard className="a-teachers-filters">
        <form onSubmit={applyFilters}>
          <div className="a-teachers-filter-grid">
            <label className="d-form-group a-teachers-search">
              <span>Search teachers</span>
              <div className="a-teachers-search-wrap">
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

            <div className="a-teachers-filter-actions">
              <button
                type="button"
                className="a-teachers-clear"
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
            <p className="a-teachers-filter-error" role="alert">
              {filterError}
            </p>
          )}
        </form>
      </DashboardCard>

      <DashboardCard padding={false}>
        <div className="a-teachers-table-heading">
          <div>
            <h3>Teacher accounts</h3>
            <p>
              {requestStatus === "success"
                ? `${pagination.total.toLocaleString()} teachers found`
                : "Account records supplied by the university service"}
            </p>
          </div>
          <label className="a-teachers-page-size">
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

        {requestStatus === "success" && teachers.length === 0 && (
          <EmptyState hasFilters={hasFilters} />
        )}

        {requestStatus === "success" && teachers.length > 0 && (
          <div className="a-teachers-table-scroll">
            <table className="a-teachers-table">
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Email</th>
                  <th>Linked class</th>
                  <th>Account</th>
                  <th>Password setup</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>
                      <strong>{teacher.fullName}</strong>
                      <span className="a-teachers-username">
                        {teacher.username}
                      </span>
                    </td>
                    <td>
                      {teacher.email ? (
                        <span className="a-teachers-email">
                          <Mail size={13} aria-hidden="true" />
                          {teacher.email}
                        </span>
                      ) : (
                        <span className="a-teachers-muted">Not provided</span>
                      )}
                    </td>
                    <td>
                      {teacher.class ? (
                        <>
                          <strong>{teacher.class.code}</strong>
                          <span>{teacher.class.name}</span>
                        </>
                      ) : (
                        <span className="a-teachers-muted">Not linked</span>
                      )}
                    </td>
                    <td>
                      <AccountStatus isActive={teacher.isActive} />
                    </td>
                    <td>
                      <PasswordStatus
                        mustChangePassword={teacher.mustChangePassword}
                      />
                    </td>
                    <td className="a-teachers-created">
                      {formatCreatedAt(teacher.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {requestStatus === "success" && (
          <div className="a-teachers-pagination">
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

export default TeachersPage;
