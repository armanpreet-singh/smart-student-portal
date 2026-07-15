import React, { memo } from "react";
import { NavLink } from "react-router-dom";
import ltsuLogo from "../../../../assets/images/logo/ltsu-logo.webp";
import {
  X,
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Building,
  UserCheck,
  Megaphone,
  CalendarDays,
  BarChart3,
  Settings,
  Brain,
  QrCode,
  Sparkles,
} from "lucide-react";

const NavItem = memo(({ to, icon: Icon, children, disabled }) => (
  <li>
    {disabled ? (
      <div className="d-nav-link disabled">
        <Icon size={20} />
        <span>{children}</span>
        <span className="d-badge-soon">Soon</span>
      </div>
    ) : (
      <NavLink
        to={to}
        className={({ isActive }) => `d-nav-link ${isActive ? "active" : ""}`}
        end={to === "/admin"}
      >
        <Icon size={20} />
        <span>{children}</span>
      </NavLink>
    )}
  </li>
));

const AdminSidebar = memo(({ isOpen, onClose }) => (
  <aside className={`d-sidebar ${isOpen ? "open" : ""}`}>
    <div className="d-sidebar-header">
      <div className="d-logo">
        <div className="d-logo-icon">
         <img
           src={ltsuLogo}
           alt="LTSU Logo"
           className="d-logo-image"
         />
       </div>
        <div>
          <h2>LTSU</h2>
          <p>Admin Portal</p>
        </div>
      </div>
      <button className="d-close-btn" onClick={onClose}>
        <X size={20} />
      </button>
    </div>
    <nav className="d-sidebar-nav">
      <ul>
        <NavItem to="/admin" icon={LayoutDashboard}>
          Dashboard
        </NavItem>
        <NavItem to="/admin/students" icon={Users}>
          Students
        </NavItem>
        <NavItem to="/admin/teachers" icon={GraduationCap}>
          Teachers
        </NavItem>
        <NavItem to="/admin/courses" icon={BookOpen}>
          Courses
        </NavItem>
        <NavItem to="/admin/departments" icon={Building}>
          Departments
        </NavItem>
        <NavItem to="/admin/attendance" icon={UserCheck}>
          Attendance
        </NavItem>
        <NavItem to="/admin/announcements" icon={Megaphone}>
          Announcements
        </NavItem>
        <NavItem to="/admin/calendar" icon={CalendarDays}>
          Academic Calendar
        </NavItem>
        <NavItem to="/admin/reports" icon={BarChart3}>
          Reports & Analytics
        </NavItem>
        <NavItem to="/admin/settings" icon={Settings}>
          System Settings
        </NavItem>
      </ul>
      <div className="d-nav-divider"></div>
      <p className="d-nav-section-title">Upcoming Features</p>
      <ul>
        <NavItem to="#" icon={Brain} disabled>
          AI Analytics
        </NavItem>
        <NavItem to="#" icon={QrCode} disabled>
          QR Campus Access
        </NavItem>
      </ul>
    </nav>
  </aside>
));

export default AdminSidebar;
