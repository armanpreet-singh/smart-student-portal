import React, { useEffect, useState } from "react";
import { CheckCircle, ChevronLeft, ChevronRight, Mail, RotateCw, Search, UserRound, UserPlus, X } from "lucide-react";

import { useAuth } from "../../auth/context/AuthContext";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import { fetchAdminStudents } from "../api/adminStudentsApi";
import {
  createAdminStudent,
  fetchActiveStudentClassOptions,
} from "../api/adminStudentProvisioningApi";

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
  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState("idle");
  const [createError, setCreateError] = useState("");
  const [createFieldErrors, setCreateFieldErrors] = useState({});
  const [createSuccessMessage, setCreateSuccessMessage] = useState("");
  const [createForm, setCreateForm] = useState({
    fullName: "",
    username: "",
    email: "",
    classId: "",
    temporaryPassword: "",
    confirmPassword: "",
  });
  const [classOptions, setClassOptions] = useState([]);
  const [classStatus, setClassStatus] = useState("idle");
  const [classRetry, setClassRetry] = useState(0);

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

  useEffect(() => {
    if (!createOpen) return undefined;

    let active = true;
    setClassStatus("loading");

    const loadClassOptions = async () => {
      try {
        const options = await fetchActiveStudentClassOptions(accessToken);
        if (!active) return;
        setClassOptions(options);
        setClassStatus("success");
      } catch (error) {
        if (!active) return;

        if (error?.status === 401) {
          await refreshCurrentUser();
          if (!active) return;
        }

        setClassStatus("error");
      }
    };

    loadClassOptions();

    return () => {
      active = false;
    };
  }, [accessToken, createOpen, classRetry, refreshCurrentUser]);

  useEffect(() => {
    if (!createOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape" && createStatus !== "submitting") {
        setCreateOpen(false);
        setCreateForm({
          fullName: "",
          username: "",
          email: "",
          classId: "",
          temporaryPassword: "",
          confirmPassword: "",
        });
        setCreateError("");
        setCreateFieldErrors({});
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
      classId: "",
      temporaryPassword: "",
      confirmPassword: "",
    });
    setCreateError("");
    setCreateFieldErrors({});
  };

  const handleCreateStudent = async (event) => {
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
        !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email))
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
      const created = await createAdminStudent(accessToken, createForm);
      setCreateSuccessMessage(
        `Student account created for ${created.fullName} (${created.username}). It is active and must change its temporary password at first sign-in.`,
      );
      setCreateOpen(false);
      setCreateForm({
        fullName: "",
        username: "",
        email: "",
        classId: "",
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
        error?.message || "Unable to create the student account.",
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
        title="Student Directory"
        subtitle="Student accounts returned by the university administration service"
        action={
          <button
            type="button"
            className="d-btn-primary a-students-add-button"
            onClick={() => {
              setCreateSuccessMessage("");
              setCreateError("");
              setCreateFieldErrors({});
              setCreateOpen(true);
            }}
          >
            <UserPlus size={16} />
            Add Student
          </button>
        }
      />

      {createSuccessMessage && (
        <div className="a-students-create-success" role="status">
          <CheckCircle size={18} aria-hidden="true" />
          <p>{createSuccessMessage}</p>
        </div>
      )}

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

      {createOpen && (
        <div
          className="a-student-create-backdrop"
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
            className="a-student-create-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="a-student-create-title"
          >
            <div className="a-student-create-heading">
              <div>
                <h2 id="a-student-create-title">Create Student Account</h2>
                <p>
                  New accounts are active and must change the temporary
                  password at first sign-in.
                </p>
              </div>
              <button
                type="button"
                className="a-student-create-close"
                aria-label="Close create student form"
                onClick={closeCreateDialog}
                disabled={createStatus === "submitting"}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} noValidate>
              <div className="a-student-create-fields">
                <label className="a-student-create-field">
                  <span>Full name</span>
                  <input
                    type="text"
                    autoComplete="name"
                    autoFocus
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

                <label className="a-student-create-field">
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

                <label className="a-student-create-field">
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

                <label className="a-student-create-field">
                  <span>Class <em>Optional</em></span>
                  <select
                    value={createForm.classId}
                    onChange={(event) =>
                      updateCreateField("classId", event.target.value)
                    }
                    disabled={classStatus === "loading" || classStatus === "error"}
                  >
                    <option value="">
                      {classStatus === "loading"
                        ? "Loading active classes…"
                        : "No class assigned"}
                    </option>
                    {classOptions.map((classItem) => (
                      <option value={classItem.id} key={classItem.id}>
                        {classItem.code} — {classItem.name}
                      </option>
                    ))}
                  </select>
                  {classStatus === "success" && (
                    <small>Only active classes can be assigned.</small>
                  )}
                  {classStatus === "error" && (
                    <small className="a-student-create-class-error">
                      Active classes could not be loaded. Class is optional;
                      retry or continue without a class.
                      <button
                        type="button"
                        onClick={() => setClassRetry((value) => value + 1)}
                      >
                        Retry
                      </button>
                    </small>
                  )}
                </label>

                <label className="a-student-create-field">
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

                <label className="a-student-create-field">
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

              {createError && (
                <p className="a-student-create-error" role="alert">
                  {createError}
                </p>
              )}

              <div className="a-student-create-actions">
                <button
                  type="button"
                  className="a-students-clear"
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
                  {createStatus === "submitting" ? "Creating account…" : "Create Student"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
