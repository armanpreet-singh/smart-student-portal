
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardThemeProvider } from '../hooks/useDashboardTheme';
import Sidebar from '../components/Sidebar/Sidebar';
import Topbar from '../components/Topbar/Topbar';
import '../styles/dashboard.css';
import '../styles/sidebar.css';
import '../styles/topbar.css';
import '../styles/cards.css';
import '../styles/pages.css';
import '../styles/responsive.css';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardThemeProvider>
      <div className="d-layout">
        <div className={`d-sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="d-main-wrapper">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="d-content">
            <Outlet />
          </main>
        </div>
      </div>
    </DashboardThemeProvider>
  );
};

export default DashboardLayout;