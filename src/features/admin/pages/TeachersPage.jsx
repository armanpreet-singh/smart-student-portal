import React, { useEffect, useState } from "react";
import { CheckCircle, ChevronLeft, ChevronRight, Mail, RotateCw, Search, UserRound, UserPlus, X } from "lucide-react";

import { useAuth } from "../../auth/context/AuthContext";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import { fetchAdminTeachers } from "../api/adminTeachersApi";
import { createAdminTeacher } from "../api/adminTeacherProvisioningApi";

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
  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState("idle");
  const [createError, setCreateError] = useState("");
  const [createFieldErrors, setCreateFieldErrors] = useState({});
  const [createSuccessMessage, setCreateSuccessMessage] = useState("");
  const [createForm, setCreateForm] = useState({
    fullName: "",
    username: "",
    email: "",
    temporaryPassword: "",
    confirmPassword: "",
  });

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

  useEffect(() => {
    if (!createOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape" && createStatus !== "submitting") {
        closeCreateDialog();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [createOpen, createStatus]);

  const updateCreateField = (field, value) => {
    setCreateForm((current) => ({ ...current, [field]: value }));
    setCreateFieldErrors((current) => ({ ...current, [field]: "" }));
    setCreateError("");
  };

  const closeCreateDialog = () => {
    if (createStatus === "submitting") return;
    setCreateOpen(false);
    setCreateForm({
      fullName: "",
      username: "",
      email: "",
      temporaryPassword: "",
      confirmPassword: "",
    });
    setCreateError("");
    setCreateFieldErrors({});
  };

  const handleCreateTeacher = async (event) => {
    event.preventDefault();
    setCreateError("");

    const errors = {};
    const fullName = createForm.fullName.trim();
    const username = createForm.username.trim();
    const email = createForm.email.trim();
    const passwordBytes = new TextEncoder().encode(
      createForm.temporaryPassword,
    ).length;

    if (fullName.length < 2 || fullName.length > 120) {
      errors.fullName = "Full name must be between 2 and 120 characters.";
    }
    if (
      username.length < 3 ||
      username.length > 40 ||
      !/^[a-zA-Z0-9._-]+$/.test(username)
    ) {
      errors.username =
        "Use 3–40 characters: letters, numbers, dots, underscores or hyphens.";
    }
    if (
      email &&
      (email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ) {
      errors.email = "Enter a valid email address (254 characters or fewer).";
    }
    if (createForm.temporaryPassword.length < 12) {
      errors.temporaryPassword =
        "Temporary password must be at least 12 characters.";
    } else if (passwordBytes > 72) {
      errors.temporaryPassword =
        "Temporary password must be no more than 72 UTF-8 bytes.";
    }
    if (createForm.temporaryPassword !== createForm.confirmPassword) {
      errors.confirmPassword = "The passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setCreateFieldErrors(errors);
      return;
    }

    setCreateFieldErrors({});
    setCreateStatus("submitting");

    try {
      const created = await createAdminTeacher(accessToken, createForm);
      setCreateSuccessMessage(
        `Teacher account created for ${created.fullName} (${created.username}). It is active and must change its temporary password at first sign-in.`,
      );
      setCreateOpen(false);
      setCreateForm({
        fullName: "",
        username: "",
        email: "",
        temporaryPassword: "",
        confirmPassword: "",
      });
      setRetryCount((value) => value + 1);
    } catch (error) {
      if (error?.status === 401) {
        await refreshCurrentUser();
      }
      setCreateFieldErrors(error?.fieldErrors || {});
      setCreateError(
        error?.message || "Unable to create the teacher account.",
      );
    } finally {
      setCreateStatus("idle");
    }
  };

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
        action={
          <button
            type="button"
            className="d-btn-primary a-teachers-add-button"
            onClick={() => {
              setCreateSuccessMessage("");
              setCreateError("");
              setCreateFieldErrors({});
              setCreateOpen(true);
            }}
          >
            <UserPlus size={16} />
            Add Teacher
          </button>
        }
      />

      {createSuccessMessage && (
        <div className="a-teachers-create-success" role="status">
          <CheckCircle size={18} aria-hidden="true" />
          <p>{createSuccessMessage}</p>
        </div>
      )}

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

      {createOpen && (
        <div
          className="a-teacher-create-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              createStatus !== "submitting"
            ) {
              closeCreateDialog();
            }
          }}
        >
          <section
            className="a-teacher-create-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="a-teacher-create-title"
          >
            <div className="a-teacher-create-heading">
              <div>
                <h2 id="a-teacher-create-title">Create Teacher Account</h2>
                <p>
                  New accounts are active and must change the temporary
                  password at first sign-in.
                </p>
              </div>
              <button
                type="button"
                className="a-teacher-create-close"
                aria-label="Close create teacher form"
                onClick={closeCreateDialog}
                disabled={createStatus === "submitting"}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} noValidate>
              <div className="a-teacher-create-fields">
                <label className="a-teacher-create-field">
                  <span>Full name</span>
                  <input
                    type="text"
                    autoComplete="name"
                    autoFocus
                    minLength={2}
                    maxLength={120}
                    value={createForm.fullName}
                    onChange={(event) =>
                      updateCreateField("fullName", event.target.value)
                    }
                    aria-invalid={Boolean(createFieldErrors.fullName)}
                    required
                  />
                  {createFieldErrors.fullName && (
                    <small role="alert">{createFieldErrors.fullName}</small>
                  )}
                </label>

                <label className="a-teacher-create-field">
                  <span>Username</span>
                  <input
                    type="text"
                    autoComplete="off"
                    minLength={3}
                    maxLength={40}
                    value={createForm.username}
                    onChange={(event) =>
                      updateCreateField("username", event.target.value)
                    }
                    aria-invalid={Boolean(createFieldErrors.username)}
                    required
                  />
                  <small>3–40 characters: letters, numbers, . _ -</small>
                  {createFieldErrors.username && (
                    <small role="alert">{createFieldErrors.username}</small>
                  )}
                </label>

                <label className="a-teacher-create-field">
                  <span>Email <em>Optional</em></span>
                  <input
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    value={createForm.email}
                    onChange={(event) =>
                      updateCreateField("email", event.target.value)
                    }
                    aria-invalid={Boolean(createFieldErrors.email)}
                  />
                  {createFieldErrors.email && (
                    <small role="alert">{createFieldErrors.email}</small>
                  )}
                </label>

                <label className="a-teacher-create-field">
                  <span>Temporary password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={createForm.temporaryPassword}
                    onChange={(event) =>
                      updateCreateField("temporaryPassword", event.target.value)
                    }
                    aria-invalid={Boolean(createFieldErrors.temporaryPassword)}
                    required
                  />
                  <small>At least 12 characters and no more than 72 UTF-8 bytes.</small>
                  {createFieldErrors.temporaryPassword && (
                    <small role="alert">
                      {createFieldErrors.temporaryPassword}
                    </small>
                  )}
                </label>

                <label className="a-teacher-create-field">
                  <span>Confirm temporary password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={createForm.confirmPassword}
                    onChange={(event) =>
                      updateCreateField("confirmPassword", event.target.value)
                    }
                    aria-invalid={Boolean(createFieldErrors.confirmPassword)}
                    required
                  />
                  {createFieldErrors.confirmPassword && (
                    <small role="alert">{createFieldErrors.confirmPassword}</small>
                  )}
                </label>
              </div>

              <p className="a-teacher-create-note">
                Teacher accounts are not linked to a class during creation.
                Assign subjects separately through the approved assignment workflow.
              </p>

              {createError && (
                <p className="a-teacher-create-error" role="alert">
                  {createError}
                </p>
              )}

              <div className="a-teacher-create-actions">
                <button
                  type="button"
                  className="a-teachers-clear"
                  onClick={closeCreateDialog}
                  disabled={createStatus === "submitting"}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="d-btn-primary"
                  disabled={createStatus === "submitting"}
                >
                  {createStatus === "submitting" ? "Creating account…" : "Create Teacher"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default TeachersPage;
