import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Building2, ChevronLeft, ChevronRight, RotateCw, Search } from "lucide-react";

import { useAuth } from "../../auth/context/AuthContext";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import {
  fetchAdminClasses,
  fetchAdminSubjects,
  fetchAllAdminClasses,
} from "../api/adminCatalogueApi";

import "./CoursesPage.css";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function LoadingState({ message }) {
  return (
    <div className="a-catalogue-state" role="status" aria-live="polite">
      <span className="a-catalogue-spinner" aria-hidden="true" />
      <div>
        <h3>Loading catalogue</h3>
        <p>{message}</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="a-catalogue-state a-catalogue-error" role="alert">
      <div>
        <h3>Catalogue unavailable</h3>
        <p>{message}</p>
      </div>
      <button type="button" className="d-btn-primary a-catalogue-retry" onClick={onRetry}>
        <RotateCw size={16} />
        Retry
      </button>
    </div>
  );
}

function EmptyState({ kind, hasFilters }) {
  const isClasses = kind === "classes";
  return (
    <div className="a-catalogue-empty">
      {isClasses ? <Building2 size={28} /> : <BookOpen size={28} />}
      <h3>{hasFilters ? "No matching records" : isClasses ? "No classes are available" : "No subjects are available"}</h3>
      <p>
        {hasFilters
          ? "Try changing the search text or filters."
          : isClasses
            ? "The university service did not return any class records."
            : "The university service did not return any subject records."}
      </p>
    </div>
  );
}

function ActiveBadge({ isActive }) {
  return (
    <span className={`a-catalogue-active-badge ${isActive ? "active" : "inactive"}`}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

const CoursesPage = () => {
  const { accessToken, refreshCurrentUser } = useAuth();

  const [activeTab, setActiveTab] = useState("classes");
  const [classOptions, setClassOptions] = useState([]);
  const [optionsStatus, setOptionsStatus] = useState("loading");
  const [optionsError, setOptionsError] = useState("");
  const [optionsRetry, setOptionsRetry] = useState(0);

  const [draftFilters, setDraftFilters] = useState({
    search: "",
    isActive: "all",
    classId: "",
  });
  const [filters, setFilters] = useState({
    search: "",
    isActive: "all",
    classId: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [rows, setRows] = useState([]);
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

    const loadClassOptions = async () => {
      setOptionsStatus("loading");
      setOptionsError("");

      try {
        const classes = await fetchAllAdminClasses(accessToken);
        if (!active) return;
        setClassOptions(classes);
        setOptionsStatus("success");
      } catch (error) {
        if (!active) return;

        if (error?.status === 401) {
          await refreshCurrentUser();
          if (!active) return;
        }

        setOptionsError(
          error?.message || "Unable to load class filter choices.",
        );
        setOptionsStatus("error");
      }
    };

    loadClassOptions();

    return () => {
      active = false;
    };
  }, [accessToken, refreshCurrentUser, optionsRetry]);

  useEffect(() => {
    let active = true;

    const loadPage = async () => {
      setRequestStatus("loading");
      setRequestError("");
      setRows([]);

      const requestFilters = {
        page,
        pageSize,
        search: filters.search,
        isActive: filters.isActive,
        ...(activeTab === "subjects" && filters.classId
          ? { classId: filters.classId }
          : {}),
      };

      try {
        const result =
          activeTab === "classes"
            ? await fetchAdminClasses(accessToken, requestFilters)
            : await fetchAdminSubjects(accessToken, requestFilters);

        if (!active) return;
        setRows(result.rows);
        setPagination(result.pagination);
        setRequestStatus("success");
      } catch (error) {
        if (!active) return;

        if (error?.status === 401) {
          await refreshCurrentUser();
          if (!active) return;
        }

        setRequestError(
          error?.message || "Unable to load catalogue records.",
        );
        setRequestStatus("error");
      }
    };

    loadPage();

    return () => {
      active = false;
    };
  }, [
    accessToken,
    activeTab,
    filters.search,
    filters.isActive,
    filters.classId,
    page,
    pageSize,
    retryCount,
    refreshCurrentUser,
  ]);

  const selectedClass = useMemo(
    () => classOptions.find((item) => item.id === filters.classId),
    [classOptions, filters.classId],
  );

  const hasFilters = Boolean(
    filters.search || filters.isActive !== "all" ||
    (activeTab === "subjects" && filters.classId),
  );

  const updateDraft = (field, value) => {
    setDraftFilters((current) => ({ ...current, [field]: value }));
    setFilterError("");
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setFilterError("");

    if (draftFilters.search.trim().length > 80) {
      setFilterError("Search must be 80 characters or fewer.");
      return;
    }

    if (
      activeTab === "subjects" &&
      draftFilters.classId &&
      !classOptions.some((item) => item.id === draftFilters.classId)
    ) {
      setFilterError("Choose a class returned by the university directory.");
      return;
    }

    setFilters({
      search: draftFilters.search.trim(),
      isActive: draftFilters.isActive,
      classId: draftFilters.classId,
    });
    setPage(1);
  };

  const clearFilters = () => {
    const cleared = { search: "", isActive: "all", classId: "" };
    setDraftFilters(cleared);
    setFilters(cleared);
    setPage(1);
    setFilterError("");
  };

  const changeTab = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setPage(1);
    setFilterError("");
  };

  const startRecord = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const endRecord = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <div className="d-page-container">
      <SectionHeader
        title="Class & Subject Catalogue"
        subtitle="University academic directory from the administration service"
      />

      <div className="a-catalogue-tabs" role="tablist" aria-label="Catalogue type">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "classes"}
          className={activeTab === "classes" ? "active" : ""}
          onClick={() => changeTab("classes")}
        >
          <Building2 size={17} />
          Classes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "subjects"}
          className={activeTab === "subjects" ? "active" : ""}
          onClick={() => changeTab("subjects")}
        >
          <BookOpen size={17} />
          Subjects
        </button>
      </div>

      <DashboardCard className="a-catalogue-filters">
        <form onSubmit={applyFilters}>
          <div className="a-catalogue-filter-grid">
            <label className="d-form-group a-catalogue-search">
              <span>Search {activeTab}</span>
              <div className="a-catalogue-search-wrap">
                <Search size={17} aria-hidden="true" />
                <input
                  type="search"
                  value={draftFilters.search}
                  maxLength={80}
                  placeholder={
                    activeTab === "classes"
                      ? "Search class code, name or academic year"
                      : "Search subject code, name or description"
                  }
                  onChange={(event) => updateDraft("search", event.target.value)}
                />
              </div>
            </label>

            <label className="d-form-group">
              <span>Status</span>
              <select
                value={draftFilters.isActive}
                onChange={(event) => updateDraft("isActive", event.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="true">Active only</option>
                <option value="false">Inactive only</option>
              </select>
            </label>

            {activeTab === "subjects" && (
              <label className="d-form-group">
                <span>Class</span>
                <select
                  value={draftFilters.classId}
                  disabled={optionsStatus !== "success"}
                  onChange={(event) => updateDraft("classId", event.target.value)}
                >
                  <option value="">All classes</option>
                  {classOptions.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.code} — {item.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="a-catalogue-filter-actions">
              <button type="button" className="a-catalogue-clear" onClick={clearFilters}>
                Clear
              </button>
              <button type="submit" className="d-btn-primary">
                Apply filters
              </button>
            </div>
          </div>

          {filterError && <p className="a-catalogue-filter-error" role="alert">{filterError}</p>}

          {activeTab === "subjects" && optionsStatus === "error" && (
            <div className="a-catalogue-options-warning" role="alert">
              <span>{optionsError} The subject list can still be viewed without the class filter.</span>
              <button
                type="button"
                onClick={() => setOptionsRetry((value) => value + 1)}
              >
                Retry class choices
              </button>
            </div>
          )}
        </form>
      </DashboardCard>

      <DashboardCard padding={false}>
        <div className="a-catalogue-table-heading">
          <div>
            <h3>{activeTab === "classes" ? "Class directory" : "Subject directory"}</h3>
            <p>
              {requestStatus === "success"
                ? `${pagination.total.toLocaleString()} ${activeTab} found`
                : "Records supplied by the university service"}
            </p>
          </div>
          <label className="a-catalogue-page-size">
            <span>Rows</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option value={size} key={size}>{size}</option>
              ))}
            </select>
          </label>
        </div>

        {requestStatus === "loading" && (
          <LoadingState message={`Retrieving the ${activeTab} directory.`} />
        )}

        {requestStatus === "error" && (
          <ErrorState
            message={requestError}
            onRetry={() => setRetryCount((value) => value + 1)}
          />
        )}

        {requestStatus === "success" && rows.length === 0 && (
          <EmptyState kind={activeTab} hasFilters={hasFilters} />
        )}

        {requestStatus === "success" && rows.length > 0 && activeTab === "classes" && (
          <div className="a-catalogue-table-scroll">
            <table className="a-catalogue-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Code</th>
                  <th>Academic year</th>
                  <th>Students</th>
                  <th>Subjects</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td className="a-catalogue-code">{item.code}</td>
                    <td>{item.academicYear}</td>
                    <td>{item._count.students.toLocaleString()}</td>
                    <td>{item._count.subjects.toLocaleString()}</td>
                    <td><ActiveBadge isActive={item.isActive} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {requestStatus === "success" && rows.length > 0 && activeTab === "subjects" && (
          <div className="a-catalogue-table-scroll">
            <table className="a-catalogue-table a-catalogue-subject-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Code</th>
                  <th>Class</th>
                  <th>Academic year</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td className="a-catalogue-code">{item.code}</td>
                    <td>
                      <strong>{item.class.code}</strong>
                      <span>{item.class.name}</span>
                    </td>
                    <td>{item.class.academicYear}</td>
                    <td className="a-catalogue-description">{item.description || "—"}</td>
                    <td><ActiveBadge isActive={item.isActive} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {requestStatus === "success" && (
          <div className="a-catalogue-pagination">
            <p>
              {pagination.total === 0
                ? "No records to display"
                : `Showing ${startRecord.toLocaleString()}–${endRecord.toLocaleString()} of ${pagination.total.toLocaleString()}`}
            </p>
            <div>
              <button
                type="button"
                aria-label="Previous page"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page <= 1}
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
                disabled={pagination.totalPages === 0 || page >= pagination.totalPages}
              >
                Next
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </DashboardCard>

      {selectedClass && activeTab === "subjects" && (
        <p className="a-catalogue-selected-class">
          Filtering subjects for <strong>{selectedClass.code} — {selectedClass.name}</strong>.
        </p>
      )}
    </div>
  );
};

export default CoursesPage;
