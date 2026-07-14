import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardThemeProvider } from '../../dashboard/hooks/useDashboardTheme';
import { useDashboardTheme } from '../../dashboard/hooks/useDashboardTheme';
import TeacherSidebar from '../components/Sidebar/TeacherSidebar';
import TeacherTopbar from '../components/Topbar/TeacherTopbar';

// Reusing Student Dashboard CSS exactly to maintain strict design language
import '../../dashboard/styles/dashboard.css';
import '../../dashboard/styles/sidebar.css';
import '../../dashboard/styles/topbar.css';
import '../../dashboard/styles/cards.css';
import '../../dashboard/styles/pages.css';
import '../../dashboard/styles/responsive.css';

const TeacherContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark } = useDashboardTheme();

  return (
    // Using .d-layout class to inherit exact same styling
    <div className={`d-layout ${isDark ? 'dark-mode' : ''}`}>
      <div className={`d-sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
      <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="d-main-wrapper">
        <TeacherTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="d-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const TeacherLayout = () => {
  return (
    <DashboardThemeProvider>
      <TeacherContent />
    </DashboardThemeProvider>
  );
};

export default TeacherLayout;