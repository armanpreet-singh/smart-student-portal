// src/features/dashboard/pages/AttendancePage.jsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { UserCheck, XCircle, Target, CheckCircle, AlertTriangle, TrendingUp, Crosshair, Clock, MapPin } from 'lucide-react';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import DashboardCard from '../components/DashboardCard/DashboardCard';
import ProgressCard from '../components/ProgressCard/ProgressCard';
import { attendanceData, weeklyChartData, monthlyTrendData, todayAttendanceStatus, attendanceInsightsData } from '../data/mockDashboardData';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="d-chart-tooltip">
        <p className="d-tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="d-tooltip-value">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const getProgressColor = (percentage) => {
  if (percentage >= 80) return "#16A34A";
  if (percentage >= 75) return "#F59E0B";
  return "#DC2626";
};

const getStatusBadge = (percentage) => {
  if (percentage >= 80) return <span className="d-status-badge safe">Safe</span>;
  if (percentage >= 75) return <span className="d-status-badge warning">Warning</span>;
  return <span className="d-status-badge danger">Danger</span>;
};

const insightIcons = { check: CheckCircle, alert: AlertTriangle, trend: TrendingUp, target: Crosshair };

const AttendancePage = () => {
  const summaryCards = useMemo(() => [
    { title: "Overall Attendance", value: `${attendanceData.overall}%`, icon: UserCheck, color: "#1E3A8A" },
    { title: "Classes Attended", value: attendanceData.totalAttended, icon: CheckCircle, color: "#16A34A" },
    { title: "Classes Missed", value: attendanceData.totalMissed, icon: XCircle, color: "#DC2626" },
    { title: "Minimum Required", value: "75%", icon: Target, color: "#F59E0B" }
  ], []);

  return (
    <div className="d-page-container">
      <SectionHeader title="Attendance Overview" subtitle="Track your academic attendance metrics" />
      
      {/* Summary Cards */}
      <div className="d-attend-summary-grid">
        {summaryCards.map((card, index) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <DashboardCard className="d-attend-summary-card">
              <div className="d-summary-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                <card.icon size={20} />
              </div>
              <div>
                <p className="d-summary-title">{card.title}</p>
                <h3 className="d-summary-value">{card.value}</h3>
              </div>
            </DashboardCard>
          </motion.div>
        ))}
      </div>

      <div className="d-grid-main">
        <div className="d-col-8">
          {/* Weekly Bar Chart */}
          <DashboardCard padding={false}>
            <div className="p-4" style={{ borderBottom: '1px solid var(--d-border)' }}>
              <SectionHeader title="Weekly Attendance" subtitle="Present vs Absent this week" />
            </div>
            <div className="d-chart-wrapper p-4">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyChartData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--d-border)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--d-text-secondary)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--d-text-secondary)', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--d-bg)', radius: 8 }} />
                  <Bar dataKey="present" name="Present" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" name="Absent" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>

          {/* Monthly Trend Chart */}
          <DashboardCard padding={false}>
            <div className="p-4" style={{ borderBottom: '1px solid var(--d-border)' }}>
              <SectionHeader title="Monthly Trend" subtitle="Last 6 months attendance percentage" />
            </div>
            <div className="d-chart-wrapper p-4">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--d-border)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--d-text-secondary)', fontSize: 12 }} />
                  <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{ fill: 'var(--d-text-secondary)', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="attendance" name="Attendance %" stroke="#D4AF37" strokeWidth={3} dot={{ fill: "#D4AF37", r: 4 }} activeDot={{ r: 6, fill: "#D4AF37" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>

          {/* Detailed Subject Table */}
          <DashboardCard padding={false}>
            <div className="p-4" style={{ borderBottom: '1px solid var(--d-border)' }}>
              <SectionHeader title="Subject Details" subtitle="Comprehensive breakdown" />
            </div>
            <div className="d-attend-table-container">
              <div className="d-attend-table-header">
                <span>Subject</span>
                <span>Faculty</span>
                <span>Attended</span>
                <span>Total</span>
                <span>Percentage</span>
                <span>Progress</span>
                <span>Status</span>
              </div>
              {attendanceData.details.map((sub, i) => {
                const pct = Math.round((sub.attended / sub.total) * 100);
                return (
                  <motion.div 
                    key={sub.code} 
                    className="d-attend-table-row"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span className="d-subject-name-cell">
                      <span className="d-sub-code">{sub.code}</span>
                      {sub.name}
                    </span>
                    <span className="d-faculty-cell">{sub.faculty}</span>
                    <span>{sub.attended}</span>
                    <span>{sub.total}</span>
                    <span style={{ fontWeight: 600, color: getProgressColor(pct) }}>{pct}%</span>
                    <span className="d-progress-cell">
                      <ProgressCard value={pct} color={getProgressColor(pct)} showLabel={false} />
                    </span>
                    <span>{getStatusBadge(pct)}</span>
                  </motion.div>
                );
              })}
            </div>
          </DashboardCard>
        </div>

        <div className="d-col-4">
          {/* Today's Status */}
          <DashboardCard className="d-today-status-card">
            <h4 className="d-card-title-sm">Today's Status</h4>
            <div className="d-today-stats">
              <div className="d-today-stat">
                <span className="d-today-num">{todayAttendanceStatus.present}</span>
                <span className="d-today-label">Present</span>
              </div>
              <div className="d-today-divider"></div>
              <div className="d-today-stat">
                <span className="d-today-num text-danger">{todayAttendanceStatus.absent}</span>
                <span className="d-today-label">Absent</span>
              </div>
              <div className="d-today-divider"></div>
              <div className="d-today-stat">
                <span className="d-today-num">{todayAttendanceStatus.totalClasses}</span>
                <span className="d-today-label">Total</span>
              </div>
            </div>
            <div className="d-upcoming-class">
              <div className="d-upcoming-icon"><Clock size={16} /></div>
              <div className="d-upcoming-info">
                <p className="d-upcoming-label">Upcoming Class</p>
                <h5>{todayAttendanceStatus.upcoming.subject}</h5>
                <p className="d-upcoming-meta"><MapPin size={12} /> {todayAttendanceStatus.upcoming.room} • {todayAttendanceStatus.upcoming.time}</p>
              </div>
            </div>
          </DashboardCard>

          {/* Subject Progress Bars */}
          <DashboardCard>
            <SectionHeader title="Subject Progress" subtitle="Quick overview" />
            <div className="d-subject-progress-list">
              {attendanceData.details.map(sub => {
                const pct = Math.round((sub.attended / sub.total) * 100);
                return (
                  <div key={sub.code} className="d-subject-progress-item">
                    <div className="d-sp-header">
                      <span className="d-sp-name">{sub.name}</span>
                      <span className="d-sp-pct" style={{ color: getProgressColor(pct) }}>{pct}%</span>
                    </div>
                    <ProgressCard value={pct} color={getProgressColor(pct)} showLabel={false} />
                    <p className="d-sp-classes">{sub.attended} out of {sub.total} classes</p>
                  </div>
                );
              })}
            </div>
          </DashboardCard>

          {/* Insights */}
          <DashboardCard>
            <SectionHeader title="Attendance Insights" subtitle="Smart suggestions" />
            <div className="d-insights-list">
              {attendanceInsightsData.map(item => {
                const Icon = insightIcons[item.icon];
                return (
                  <motion.div 
                    key={item.id} 
                    className={`d-insight-item ${item.type}`}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: item.id * 0.1 }}
                  >
                    <Icon size={16} className="d-insight-icon-sm" />
                    <p>{item.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;