import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardThemeProvider } from '../../../features/dashboard/hooks/useDashboardTheme';
import { useDashboardTheme } from '../../../features/dashboard/hooks/useDashboardTheme';
import AdminSidebar from '../components/Sidebar/AdminSidebar';
import AdminTopbar from '../components/Topbar/AdminTopbar';

import '../../../features/dashboard/styles/dashboard.css';
import '../../../features/dashboard/styles/sidebar.css';
import '../../../features/dashboard/styles/topbar.css';
import '../../../features/dashboard/styles/cards.css';
import '../../../features/dashboard/styles/pages.css';
import '../../../features/dashboard/styles/responsive.css';

const AdminContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark } = useDashboardTheme();

  return (
    <div className={`d-layout ${isDark ? 'dark-mode' : ''}`}>
      <div className={`d-sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="d-main-wrapper">
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="d-content"><Outlet /></main>
      </div>
    </div>
  );
};

const AdminLayout = () => (
  <DashboardThemeProvider>
    <AdminContent />
  </DashboardThemeProvider>
);

export default AdminLayout;