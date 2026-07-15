import React, { memo } from 'react';
import ltsuLogo from "../../../../assets/images/logo/ltsu-logo.webp";
import { NavLink } from 'react-router-dom';
import { X, LayoutDashboard, BookOpen, UserCheck, Clock, FileText, FolderOpen, Megaphone, CalendarDays, QrCode, Bot, Sparkles } from 'lucide-react';

const NavItem = memo(({ to, icon: Icon, children, disabled }) => (
  <li>
    {disabled ? (
      <div className="d-nav-link disabled">
        <Icon size={20} />
        <span>{children}</span>
        <span className="d-badge-soon">Soon</span>
      </div>
    ) : (
      <NavLink to={to} className={({ isActive }) => `d-nav-link ${isActive ? 'active' : ''}`} end={to === '/dashboard'}>
        <Icon size={20} />
        <span>{children}</span>
      </NavLink>
    )}
  </li>
));

const Sidebar = memo(({ isOpen, onClose }) => {
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
            <p>Smart Portal</p>
          </div>
        </div>
        <button className="d-close-btn" onClick={onClose}><X size={20} /></button>
      </div>

      <nav className="d-sidebar-nav">
        <ul>
          <NavItem to="/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
          <NavItem to="/dashboard/courses" icon={BookOpen}>My Courses</NavItem>
          <NavItem to="/dashboard/attendance" icon={UserCheck}>Attendance</NavItem>
          <NavItem to="/dashboard/timetable" icon={Clock}>Timetable</NavItem>
          <NavItem to="/dashboard/assignments" icon={FileText}>Assignments</NavItem>
          <NavItem to="/dashboard/resources" icon={FolderOpen}>Learning Resources</NavItem>
          <NavItem to="/dashboard/announcements" icon={Megaphone}>Announcements</NavItem>
          <NavItem to="/dashboard/calendar" icon={CalendarDays}>Academic Calendar</NavItem>
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

export default Sidebar;