import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search, X, LoaderCircle, ArrowUpRight, BookOpen, CalendarDays,
  ClipboardList, FileText, FolderOpen, GraduationCap, LayoutDashboard,
  Megaphone, Users, UserRound, Settings, ShieldCheck, Clock3, SearchX
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { fetchStudentCourses } from "../../dashboard/api/studentCoursesApi";
import { fetchStudentAssignments } from "../../dashboard/api/studentAssignmentsApi";
import { fetchStudentAttendance } from "../../dashboard/api/studentAttendanceApi";
import { fetchTeacherAssignedSubjects } from "../../teacher/api/teacherSubjectsApi";
import { fetchTeacherAssignments } from "../../teacher/api/teacherAssignmentsApi";
import { fetchAdminStudents } from "../../admin/api/adminStudentsApi";
import { fetchAdminTeachers } from "../../admin/api/adminTeachersApi";
import { fetchAdminClasses, fetchAdminSubjects } from "../../admin/api/adminCatalogueApi";
import { fetchAnnouncements } from "../announcements/announcementsApi";
import { fetchLearningResources } from "../resources/learningResourcesApi";
import "./GlobalSearch.css";

const PAGE_INDEX = {
  STUDENT: [
    { title: "Dashboard", subtitle: "Your student overview", href: "/dashboard", keywords: "home overview", Icon: LayoutDashboard },
    { title: "My Courses", subtitle: "Subjects and course catalogue", href: "/dashboard/courses", keywords: "subjects classes course", Icon: BookOpen },
    { title: "Syllabus Tracker", subtitle: "Semester V topics and subject-wise progress", href: "/dashboard/syllabus", keywords: "curriculum topics syllabus coverage completed progress", Icon: GraduationCap },
    { title: "Attendance", subtitle: "Subject-wise attendance and records", href: "/dashboard/attendance", keywords: "present absent percentage register", Icon: CalendarDays },
    { title: "Timetable", subtitle: "Your class schedule", href: "/dashboard/timetable", keywords: "schedule periods time", Icon: Clock3 },
    { title: "Assignments", subtitle: "Coursework and submissions", href: "/dashboard/assignments", keywords: "homework due date task", Icon: ClipboardList },
    { title: "Learning Resources", subtitle: "Notes and study materials", href: "/dashboard/resources", keywords: "notes files documents", Icon: FolderOpen },
    { title: "Announcements", subtitle: "University and class notices", href: "/dashboard/announcements", keywords: "notice update news", Icon: Megaphone },
    { title: "Academic Calendar", subtitle: "Academic events and dates", href: "/dashboard/calendar", keywords: "calendar events holidays", Icon: CalendarDays },
    { title: "My Profile", subtitle: "Your account details", href: "/dashboard/profile", keywords: "account personal details", Icon: UserRound },
    { title: "Account Settings", subtitle: "Preferences and security", href: "/dashboard/settings", keywords: "settings preferences security", Icon: Settings },
    { title: "Help & Support", subtitle: "Help articles and troubleshooting", href: "/dashboard/help", keywords: "support faq help", Icon: ShieldCheck }
  ],
  TEACHER: [
    { title: "Dashboard", subtitle: "Your faculty overview", href: "/teacher", keywords: "home overview", Icon: LayoutDashboard },
    { title: "My Classes", subtitle: "Subjects assigned to you", href: "/teacher/classes", keywords: "subjects classes roster", Icon: BookOpen },
    { title: "Syllabus Tracker", subtitle: "Mark Semester V topics covered", href: "/teacher/syllabus", keywords: "curriculum topics syllabus coverage completed progress", Icon: GraduationCap },
    { title: "Attendance", subtitle: "Mark and review class attendance", href: "/teacher/attendance", keywords: "present absent register", Icon: CalendarDays },
    { title: "Assignments", subtitle: "Create and manage coursework", href: "/teacher/assignments", keywords: "homework task submissions", Icon: ClipboardList },
    { title: "Students", subtitle: "Students in your assigned classes", href: "/teacher/students", keywords: "student roster roll number", Icon: Users },
    { title: "Announcements", subtitle: "Class and university notices", href: "/teacher/announcements", keywords: "notice update news", Icon: Megaphone },
    { title: "Timetable", subtitle: "Your teaching schedule", href: "/teacher/timetable", keywords: "schedule periods time", Icon: Clock3 },
    { title: "Learning Resources", subtitle: "Upload and manage notes", href: "/teacher/resources", keywords: "notes files documents", Icon: FolderOpen },
    { title: "Academic Calendar", subtitle: "Academic events and dates", href: "/teacher/calendar", keywords: "calendar events holidays", Icon: CalendarDays },
    { title: "My Profile", subtitle: "Your faculty account details", href: "/teacher/profile", keywords: "account personal details", Icon: UserRound },
    { title: "Account Settings", subtitle: "Preferences and security", href: "/teacher/settings", keywords: "settings preferences security", Icon: Settings },
    { title: "Help & Support", subtitle: "Help articles and troubleshooting", href: "/teacher/help", keywords: "support faq help", Icon: ShieldCheck }
  ],
  ADMIN: [
    { title: "Dashboard", subtitle: "Administration overview", href: "/admin", keywords: "home overview", Icon: LayoutDashboard },
    { title: "Students", subtitle: "Student directory and accounts", href: "/admin/students", keywords: "student users roll number", Icon: Users },
    { title: "Teachers", subtitle: "Faculty directory and accounts", href: "/admin/teachers", keywords: "teacher faculty staff", Icon: GraduationCap },
    { title: "Courses", subtitle: "Classes and subject catalogue", href: "/admin/courses", keywords: "subjects classes catalogue", Icon: BookOpen },
    { title: "Teaching Assignments", subtitle: "Assign teachers to subjects", href: "/admin/teacher-subject-assignments", keywords: "teacher subject allocation", Icon: ClipboardList },
    { title: "Departments", subtitle: "Department directory", href: "/admin/departments", keywords: "department organisation", Icon: FolderOpen },
    { title: "Attendance", subtitle: "Attendance records and oversight", href: "/admin/attendance", keywords: "present absent register", Icon: CalendarDays },
    { title: "Announcements", subtitle: "Manage portal announcements", href: "/admin/announcements", keywords: "notice update news", Icon: Megaphone },
    { title: "Academic Calendar", subtitle: "Academic events and dates", href: "/admin/calendar", keywords: "calendar events", Icon: CalendarDays },
    { title: "Reports & Analytics", subtitle: "Institution-level reports", href: "/admin/reports", keywords: "reports statistics analytics", Icon: FileText },
    { title: "System Settings", subtitle: "Portal configuration", href: "/admin/settings", keywords: "settings configuration", Icon: Settings },
    { title: "My Profile", subtitle: "Administrator account details", href: "/admin/profile", keywords: "account personal details", Icon: UserRound }
  ]
};

function matches(item, query) {
  return [item.title, item.subtitle, item.keywords, item.group]
    .filter(Boolean).join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
}

function makeResult(id, title, subtitle, group, href, Icon, keywords = "") {
  return { id, title, subtitle, group, href, Icon, keywords };
}

async function loadStudentIndex(accessToken) {
  const settled = await Promise.allSettled([
    fetchStudentCourses(accessToken),
    fetchStudentAssignments(accessToken),
    fetchStudentAttendance(accessToken),
    fetchAnnouncements(accessToken, "student"),
    fetchLearningResources(accessToken, "student")
  ]);
  const results = [];
  const [courses, assignments, attendance, announcements, resources] = settled;

  if (courses.status === "fulfilled") {
    for (const item of courses.value.courses || []) {
      results.push(makeResult("student-course-" + item.id, item.name,
        item.code + " · " + (item.class?.name || "Course"), "Courses",
        "/dashboard/courses", BookOpen, item.code));
    }
  }
  if (assignments.status === "fulfilled") {
    for (const item of assignments.value || []) {
      results.push(makeResult("student-assignment-" + item.id, item.title,
        (item.subject?.code || "") + " · " + (item.subject?.name || "Assignment"),
        "Assignments", "/dashboard/assignments", ClipboardList,
        (item.instructions || "") + " " + (item.subject?.name || "")));
    }
  }
  if (attendance.status === "fulfilled") {
    for (const item of attendance.value.subjects || []) {
      results.push(makeResult("student-attendance-" + item.subject.id, item.subject.name,
        item.subject.code + " · " + (item.summary.attendancePercentage ?? "—") + "% attendance",
        "Attendance", "/dashboard/attendance", CalendarDays, item.subject.code));
    }
  }
  if (announcements.status === "fulfilled") {
    for (const item of announcements.value || []) {
      results.push(makeResult("student-announcement-" + item.id, item.title,
        item.message, "Announcements", "/dashboard/announcements", Megaphone));
    }
  }
  if (resources.status === "fulfilled") {
    for (const item of resources.value || []) {
      results.push(makeResult("student-resource-" + item.id, item.title,
        item.subject.code + " · " + item.subject.name, "Learning Resources",
        "/dashboard/resources", FolderOpen, item.description));
    }
  }
  return results;
}

async function loadTeacherIndex(accessToken) {
  const settled = await Promise.allSettled([
    fetchTeacherAssignedSubjects(accessToken),
    fetchTeacherAssignments(accessToken),
    fetchAnnouncements(accessToken, "teacher"),
    fetchLearningResources(accessToken, "teacher")
  ]);
  const results = [];
  const [subjects, assignments, announcements, resources] = settled;

  if (subjects.status === "fulfilled") {
    for (const record of subjects.value || []) {
      const subject = record.subject;
      results.push(makeResult("teacher-subject-" + subject.id, subject.name,
        subject.code + " · " + (subject.class?.name || "Assigned subject"),
        "My Classes", "/teacher/classes", BookOpen, subject.code));
    }
  }
  if (assignments.status === "fulfilled") {
    for (const item of assignments.value || []) {
      results.push(makeResult("teacher-assignment-" + item.id, item.title,
        item.subject.code + " · " + item.subject.name, "Assignments",
        "/teacher/assignments", ClipboardList, item.instructions));
    }
  }
  if (announcements.status === "fulfilled") {
    for (const item of announcements.value || []) {
      results.push(makeResult("teacher-announcement-" + item.id, item.title,
        item.message, "Announcements", "/teacher/announcements", Megaphone));
    }
  }
  if (resources.status === "fulfilled") {
    for (const item of resources.value || []) {
      results.push(makeResult("teacher-resource-" + item.id, item.title,
        item.subject.code + " · " + item.subject.name, "Learning Resources",
        "/teacher/resources", FolderOpen, item.description));
    }
  }
  return results;
}

async function searchAdminIndex(accessToken, query) {
  const settled = await Promise.allSettled([
    fetchAdminStudents(accessToken, { page: 1, pageSize: 8, search: query }),
    fetchAdminTeachers(accessToken, { page: 1, pageSize: 8, search: query }),
    fetchAdminClasses(accessToken, { page: 1, pageSize: 8, search: query }),
    fetchAdminSubjects(accessToken, { page: 1, pageSize: 8, search: query })
  ]);
  const results = [];
  const [students, teachers, classes, subjects] = settled;

  if (students.status === "fulfilled") {
    for (const item of students.value.users || []) {
      results.push(makeResult("admin-student-" + item.id, item.fullName,
        "Student · " + item.username + (item.rollNumber ? " · " + item.rollNumber : ""),
        "Students", "/admin/students", Users, item.username));
    }
  }
  if (teachers.status === "fulfilled") {
    for (const item of teachers.value.users || []) {
      results.push(makeResult("admin-teacher-" + item.id, item.fullName,
        "Teacher · " + item.username, "Teachers", "/admin/teachers",
        GraduationCap, item.username));
    }
  }
  if (classes.status === "fulfilled") {
    for (const item of classes.value.rows || []) {
      results.push(makeResult("admin-class-" + item.id, item.name,
        item.code + " · " + item.academicYear, "Classes", "/admin/courses",
        BookOpen, item.code));
    }
  }
  if (subjects.status === "fulfilled") {
    for (const item of subjects.value.rows || []) {
      results.push(makeResult("admin-subject-" + item.id, item.name,
        item.code + " · " + (item.class?.name || "Subject"), "Subjects",
        "/admin/courses", BookOpen, item.code));
    }
  }
  return results;
}

const GlobalSearch = ({ role = "STUDENT" }) => {
  const { accessToken, sessionStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const sequenceRef = useRef(0);
  const indexCacheRef = useRef(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [remoteResults, setRemoteResults] = useState([]);
  const [loadState, setLoadState] = useState("idle");
  const [searchError, setSearchError] = useState("");

  const pages = PAGE_INDEX[role] || PAGE_INDEX.STUDENT;
  const pageResults = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    return pages.filter((page) => matches(page, trimmed)).map((page) => ({
      ...page, id: "page-" + page.href, group: "Pages"
    }));
  }, [pages, query]);

  const results = useMemo(() => {
    const combined = [...pageResults, ...remoteResults.filter((item) => matches(item, query))];
    const unique = new Map();
    for (const item of combined) if (!unique.has(item.id)) unique.set(item.id, item);
    return [...unique.values()].slice(0, 12);
  }, [pageResults, query, remoteResults]);

  useEffect(() => {
    setQuery("");
    setRemoteResults([]);
    setLoadState("idle");
    setSearchError("");
    indexCacheRef.current = null;
    setIsOpen(false);
  }, [location.pathname, role]);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    const handleOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!isOpen || trimmed.length < 2 || sessionStatus !== "authenticated" || !accessToken) {
      setRemoteResults([]);
      setLoadState("idle");
      setSearchError("");
      return undefined;
    }

    const requestId = ++sequenceRef.current;
    setSelectedIndex(0);
    setSearchError("");
    const timer = window.setTimeout(async () => {
      if (role !== "ADMIN" && indexCacheRef.current) {
        if (requestId === sequenceRef.current) {
          setRemoteResults(indexCacheRef.current);
          setLoadState("success");
        }
        return;
      }
      setLoadState("loading");
      try {
        const found = role === "ADMIN"
          ? await searchAdminIndex(accessToken, trimmed)
          : role === "TEACHER"
            ? await loadTeacherIndex(accessToken)
            : await loadStudentIndex(accessToken);
        if (requestId !== sequenceRef.current) return;
        if (role !== "ADMIN") indexCacheRef.current = found;
        setRemoteResults(found);
        setLoadState("success");
      } catch (error) {
        if (requestId !== sequenceRef.current) return;
        setRemoteResults([]);
        setSearchError(error?.message || "Search is temporarily unavailable.");
        setLoadState("error");
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      sequenceRef.current += 1;
    };
  }, [accessToken, isOpen, query, role, sessionStatus]);

  useEffect(() => {
    setSelectedIndex((current) => Math.min(current, Math.max(results.length - 1, 0)));
  }, [results.length]);

  const openResult = useCallback((item) => {
    setIsOpen(false);
    setQuery("");
    navigate(item.href);
  }, [navigate]);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown" && results.length) {
      event.preventDefault();
      setSelectedIndex((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp" && results.length) {
      event.preventDefault();
      setSelectedIndex((current) => (current - 1 + results.length) % results.length);
    } else if (event.key === "Enter" && results[selectedIndex]) {
      event.preventDefault();
      openResult(results[selectedIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery("");
    setRemoteResults([]);
    setLoadState("idle");
    setSearchError("");
    inputRef.current?.focus();
  };

  const groups = useMemo(() => {
    const buckets = new Map();
    for (const item of results) {
      if (!buckets.has(item.group)) buckets.set(item.group, []);
      buckets.get(item.group).push(item);
    }
    return [...buckets.entries()];
  }, [results]);

  return (
    <div className="d-search-box d-global-search" ref={wrapperRef}>
      <Search size={16} aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        placeholder="Search pages and records..."
        aria-label="Search portal pages and records"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls="d-global-search-results"
        role="combobox"
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
          setSelectedIndex(0);
        }}
        onKeyDown={handleKeyDown}
      />
      {query && (
        <button type="button" className="d-global-search-clear" onClick={clearSearch} aria-label="Clear search">
          <X size={15} />
        </button>
      )}

      {isOpen && (
        <div className="d-global-search-panel" id="d-global-search-results" role="listbox" aria-label="Search results">
          {!query.trim() && (
            <div className="d-global-search-hint">
              <strong>Search your portal</strong>
              <span>Find pages and records by name, subject, code or title.</span>
              <small><kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> to focus search · <kbd>Esc</kbd> to close</small>
            </div>
          )}
          {query.trim().length === 1 && <div className="d-global-search-hint">Type one more character to search.</div>}
          {query.trim().length >= 2 && loadState === "loading" && (
            <div className="d-global-search-state"><LoaderCircle size={17} className="d-global-search-spin" /> Searching your portal…</div>
          )}
          {query.trim().length >= 2 && loadState === "error" && (
            <div className="d-global-search-error" role="status">{searchError} Page navigation results may still be available below.</div>
          )}
          {groups.map(([group, items]) => (
            <section className="d-global-search-group" key={group} aria-label={group}>
              <h3>{group}</h3>
              {items.map((item) => {
                const Icon = item.Icon || Search;
                const index = results.findIndex((result) => result.id === item.id);
                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === selectedIndex}
                    className={"d-global-search-result " + (index === selectedIndex ? "is-selected" : "")}
                    key={item.id}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => openResult(item)}
                  >
                    <span className="d-global-search-result-icon"><Icon size={17} /></span>
                    <span className="d-global-search-result-copy">
                      <strong>{item.title}</strong>
                      <small>{item.subtitle}</small>
                    </span>
                    <ArrowUpRight size={15} className="d-global-search-open" />
                  </button>
                );
              })}
            </section>
          ))}
          {query.trim().length >= 2 && loadState !== "loading" && results.length === 0 && (
            <div className="d-global-search-empty">
              <SearchX size={20} />
              <strong>No results found</strong>
              <span>Try a different page name, subject, student, teacher or keyword.</span>
            </div>
          )}
          <div className="d-global-search-footer">
            <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
            <span><kbd>Enter</kbd> Open</span>
            <span><kbd>Esc</kbd> Close</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
