import React, {
  memo,
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardTheme } from "../../../../features/dashboard/hooks/useDashboardTheme";
import { adminData } from "../../data/mockAdminData";

const AdminTopbar = memo(({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useDashboardTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const breadcrumbs = useMemo(() => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    if (pathnames.length <= 1) return [{ name: "Dashboard", path: "/admin" }];
    return [
      { name: "Dashboard", path: "/admin" },
      {
        name:
          pathnames[pathnames.length - 1].charAt(0).toUpperCase() +
          pathnames[pathnames.length - 1].slice(1),
        path: location.pathname,
      },
    ];
  }, [location.pathname]);

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const esc = (e) => {
      if (e.key === "Escape") setIsDropdownOpen(false);
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);
  useEffect(() => {
    const click = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

  return (
    <header className="d-topbar">
      <div className="d-topbar-left">
        <button
          className="d-menu-btn"
          onClick={onMenuClick}
          aria-label="Open Menu"
        >
          <Menu size={24} />
        </button>
        <nav className="d-breadcrumb" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && <span className="d-breadcrumb-sep">/</span>}
              <Link
                to={crumb.path}
                className={index === breadcrumbs.length - 1 ? "active" : ""}
              >
                {crumb.name}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>
      <div className="d-topbar-right">
        <div className="d-search-box">
          <Search size={16} />
          <input type="text" placeholder="Search..." />
        </div>
        <button
          className="d-icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="d-icon-btn bell" aria-label="Notifications">
          <Bell size={20} />
          <span className="d-notification-dot"></span>
        </button>
        <div className="d-avatar-wrapper" ref={dropdownRef}>
          <button
            className="d-topbar-avatar"
            onClick={() => setIsDropdownOpen((p) => !p)}
            aria-expanded={isDropdownOpen}
            aria-label="User Menu"
          >
            <img src={adminData.avatar} alt="User" />
          </button>
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                className="d-avatar-dropdown"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                role="menu"
              >
                <div className="d-dropdown-header">
                  <img
                    src={adminData.avatar}
                    alt="Avatar"
                    className="d-dropdown-avatar"
                  />
                  <div className="d-dropdown-user-info">
                    <p className="d-dropdown-name">{adminData.name}</p>
                    <p className="d-dropdown-sub">{adminData.role}</p>
                    <p className="d-dropdown-sub">{adminData.employeeId}</p>
                    <p className="d-dropdown-sub">{adminData.department}</p>
                  </div>
                </div>
                <div className="d-dropdown-divider"></div>
                <Link
                  to="/admin/profile"
                  className="d-dropdown-item"
                  role="menuitem"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User size={16} />
                  <span>My Profile</span>
                  <ChevronRight size={14} className="d-dropdown-arrow" />
                </Link>
                <Link
                  to="/admin/settings"
                  className="d-dropdown-item"
                  role="menuitem"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings size={16} />
                  <span>Account Settings</span>
                  <ChevronRight size={14} className="d-dropdown-arrow" />
                </Link>
                <button
                  className="d-dropdown-item"
                  role="menuitem"
                  onClick={() => {
                    toggleTheme();
                    setIsDropdownOpen(false);
                  }}
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  <span>Appearance</span>
                  <ChevronRight size={14} className="d-dropdown-arrow" />
                </button>
                <button
                  className="d-dropdown-item"
                  role="menuitem"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <HelpCircle size={16} />
                  <span>Help & Support</span>
                  <ChevronRight size={14} className="d-dropdown-arrow" />
                </button>
                <div className="d-dropdown-divider"></div>
                <button
                  className="d-dropdown-item logout"
                  role="menuitem"
                  onClick={() => navigate("/")}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
});
export default AdminTopbar;
