import React, { memo } from 'react';
import ltsuLogo from "../../../../assets/images/logo/ltsu-logo.webp";
import { NavLink } from 'react-router-dom';
import { X, LayoutDashboard, BookOpen, UserCheck, FileText, Users, Megaphone, Clock, FolderOpen, CalendarDays, QrCode, Bot, Sparkles } from 'lucide-react';

const NavItem = memo(({ to, icon: Icon, children, disabled }) => (
  <li>
    {disabled ? (
      <div className="d-nav-link disabled">
        <Icon size={20} />
        <span>{children}</span>
        <span className="d-badge-soon">Soon</span>
      </div>
    ) : (
      <NavLink to={to} className={({ isActive }) => `d-nav-link ${isActive ? 'active' : ''}`} end={to === '/teacher'}>
        <Icon size={20} />
        <span>{children}</span>
      </NavLink>
    )}
  </li>
));

const TeacherSidebar = memo(({ isOpen, onClose }) => {
  return (
    <aside className={`d-sidebar ${isOpen ? 'open' : ''}`}>
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
            <p>Faculty Portal</p>
          </div>
        </div>
        <button className="d-close-btn" onClick={onClose}><X size={20} /></button>
      </div>

      <nav className="d-sidebar-nav">
        <ul>
          <NavItem to="/teacher" icon={LayoutDashboard}>Dashboard</NavItem>
          <NavItem to="/teacher/classes" icon={BookOpen}>My Classes</NavItem>
          <NavItem to="/teacher/attendance" icon={UserCheck}>Attendance</NavItem>
          <NavItem to="/teacher/assignments" icon={FileText}>Assignments</NavItem>
          <NavItem to="/teacher/students" icon={Users}>Students</NavItem>
          <NavItem to="/teacher/announcements" icon={Megaphone}>Announcements</NavItem>
          <NavItem to="/teacher/timetable" icon={Clock}>Timetable</NavItem>
          <NavItem to="/teacher/resources" icon={FolderOpen}>Learning Resources</NavItem>
          <NavItem to="/teacher/calendar" icon={CalendarDays}>Academic Calendar</NavItem>
        </ul>
        
        <div className="d-nav-divider"></div>
        <p className="d-nav-section-title">Upcoming Features</p>
        <ul>
          <NavItem to="#" icon={QrCode} disabled>QR Attendance</NavItem>
          <NavItem to="#" icon={Bot} disabled>LTSU AI Assistant</NavItem>
        </ul>
      </nav>
    </aside>
  );
});

export default TeacherSidebar;