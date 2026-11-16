import React, { memo, useEffect, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";

import { useAuth } from "../../auth/context/AuthContext";
import { fetchAdminTeacherSubjectAssignments } from "../api/adminTeacherSubjectAssignmentsApi";

import "./TeacherSubjectAssignmentsDirectory.css";

const PAGE_SIZE = 10;

function formatAssignedAt(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function StateMessage({ children, error = false }) {
  return (
    <div className={`a-assignment-directory-state${error ? " error" : ""}`} role={error ? "alert" : "status"}>
      {error ? <AlertCircle size={20} aria-hidden="true" /> : null}
      <span>{children}</span>
    </div>
  );
}

function StatusLabel({ active, label }) {
  return (
    <span className={`a-assignment-directory-status ${active ? "active" : "inactive"}`}>
      {label}: {active ? "Active" : "Inactive"}
    </span>
  );
}

const TeacherSubjectAssignmentsDirectory = memo(({ refreshKey = 0 }) => {
  const { accessToken, refreshCurrentUser } = useAuth();
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [loadState, setLoadState] = useState("loading");
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    setLoadState("loading");
    setError("");
    setRows([]);

    fetchAdminTeacherSubjectAssignments(accessToken, {
      page,
      pageSize: PAGE_SIZE,
      search,
    })
      .then((result) => {
        if (!active) return;
        setRows(result.assignments);
        setPagination(result.pagination);
        setLoadState("success");
      })
      .catch(async (cause) => {
        if (!active) return;
        if (cause?.status === 401) {
          await refreshCurrentUser();
          if (!active) return;
        }
        setError(cause?.message || "Unable to load existing teacher-subject assignments.");
        setLoadState("error");
      });

    return () => {
      active = false;
    };
  }, [accessToken, page, refreshCurrentUser, refreshKey, retryCount, search]);

  const applySearch = (event) => {
    event.preventDefault();
    setSearch(draftSearch.trim());
    setPage(1);
  };

  const clearSearch = () => {
    setDraftSearch("");
    setSearch("");
    setPage(1);
  };

  const startRecord =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const endRecord = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <section className="a-assignment-directory" aria-labelledby="a-assignment-directory-title">
      <div className="a-assignment-directory-heading">
        <div>
          <h3 id="a-assignment-directory-title">Existing assignments</h3>
          <p>Current Teacher-to-Subject links, including inactive related accounts or catalogue records.</p>
        </div>
        {loadState === "success" && (
          <span className="a-assignment-directory-total">
            {pagination.total.toLocaleString()} total
          </span>
        )}
      </div>

      <form className="a-assignment-directory-search" onSubmit={applySearch}>
        <label htmlFor="a-assignment-directory-search">Search assignments</label>
        <div className="a-assignment-directory-search-controls">
          <div className="a-assignment-directory-search-input">
            <Search size={16} aria-hidden="true" />
            <input
              id="a-assignment-directory-search"
              type="search"
              maxLength={80}
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
              placeholder="Teacher, username, subject or class"
            />
          </div>
          <button type="submit" className="d-btn-primary">
            Search
          </button>
          <button
            type="button"
            className="a-assignment-directory-clear"
            onClick={clearSearch}
            disabled={!draftSearch && !search}
          >
            Clear
          </button>
        </div>
      </form>

      {loadState === "loading" && (
        <StateMessage>Loading existing assignments…</StateMessage>
      )}

      {loadState === "error" && (
        <div className="a-assignment-directory-error" role="alert">
          <StateMessage error>{error}</StateMessage>
          <button
            type="button"
            className="d-btn-primary"
            onClick={() => setRetryCount((value) => value + 1)}
          >
            <RefreshCw size={15} aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {loadState === "success" && rows.length === 0 && (
        <StateMessage>
          {search
            ? "No assignments match this search."
            : "No teacher-subject assignments have been created yet."}
        </StateMessage>
      )}

      {loadState === "success" && rows.length > 0 && (
        <>
          <div className="a-assignment-directory-table-wrap">
            <table className="a-assignment-directory-table">
              <thead>
                <tr>
                  <th scope="col">Teacher</th>
                  <th scope="col">Subject and class</th>
                  <th scope="col">Current status</th>
                  <th scope="col">Assigned</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>
                      <strong>{assignment.teacher.fullName}</strong>
                      <small>@{assignment.teacher.username}</small>
                    </td>
                    <td>
                      <strong>{assignment.subject.code} — {assignment.subject.name}</strong>
                      <small>
                        {assignment.subject.class.code} — {assignment.subject.class.name}
                        {" · "}{assignment.subject.class.academicYear}
                      </small>
                    </td>
                    <td>
                      <div className="a-assignment-directory-status-list">
                        <StatusLabel label="Teacher" active={assignment.teacher.isActive} />
                        <StatusLabel label="Subject" active={assignment.subject.isActive} />
                        <StatusLabel label="Class" active={assignment.subject.class.isActive} />
                      </div>
                    </td>
                    <td>{formatAssignedAt(assignment.assignedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="a-assignment-directory-pagination">
            <span>
              Showing {startRecord.toLocaleString()}–{endRecord.toLocaleString()} of {pagination.total.toLocaleString()}
            </span>
            <div>
              <button
                type="button"
                className="a-assignment-directory-page-button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page <= 1}
                aria-label="Previous assignment page"
              >
                <ChevronLeft size={17} aria-hidden="true" />
                Previous
              </button>
              <span>Page {pagination.page} of {Math.max(pagination.totalPages, 1)}</span>
              <button
                type="button"
                className="a-assignment-directory-page-button"
                onClick={() => setPage((value) => value + 1)}
                disabled={page >= pagination.totalPages}
                aria-label="Next assignment page"
              >
                Next
                <ChevronRight size={17} aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
});

export default TeacherSubjectAssignmentsDirectory;
