import React, { memo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import StatCard from "../../../features/dashboard/components/StatCard/StatCard";
import ProgressCard from "../../../features/dashboard/components/ProgressCard/ProgressCard";
import { deptAttendanceData } from "../data/mockAdminData";

const CustomTooltip = ({ active, payload, label }) =>
  active && payload && payload.length ? (
    <div className="d-chart-tooltip">
      <p className="d-tooltip-label">{label}</p>
      <p className="d-tooltip-value" style={{ color: "#1E3A8A" }}>
        {payload[0].value}%
      </p>
    </div>
  ) : null;

const AttendancePage = memo(() => (
  <div className="d-page-container">
    <SectionHeader
      title="Attendance Overview"
      subtitle="University-wide metrics"
    />
    <div className="d-grid-3">
      <StatCard
        title="Overall Attendance"
        value="89%"
        icon="UserCheck"
        trend="University wide"
        color="#16A34A"
      />
      <StatCard
        title="Highest"
        value="EE (92%)"
        icon="TrendingUp"
        trend="Top dept"
        color="#1E3A8A"
      />
      <StatCard
        title="Lowest"
        value="ME (85%)"
        icon="TrendingDown"
        trend="Needs focus"
        color="#DC2626"
      />
    </div>

    <div className="d-grid-main">
      <div className="d-col-8">
        <DashboardCard padding={false}>
          <div
            className="p-4"
            style={{ borderBottom: "1px solid var(--d-border)" }}
          >
            <SectionHeader title="Department-wise Attendance" />
          </div>
          <div className="d-chart-wrapper p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptAttendanceData} barCategoryGap="20%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--d-border)"
                />
                <XAxis
                  dataKey="dept"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--d-text-secondary)", fontSize: 12 }}
                />
                <YAxis
                  domain={[70, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--d-text-secondary)", fontSize: 12 }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "var(--d-bg)", radius: 8 }}
                />
                <Bar
                  dataKey="attendance"
                  name="Attendance %"
                  fill="#1E3A8A"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      </div>
      <div className="d-col-4">
        <DashboardCard>
          <SectionHeader title="Breakdown" subtitle="Percentage per dept" />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            {deptAttendanceData.map((d) => (
              <div key={d.dept}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                    fontSize: "13px",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{d.dept}</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color:
                        d.attendance >= 90
                          ? "#16A34A"
                          : d.attendance >= 85
                            ? "#F59E0B"
                            : "#DC2626",
                    }}
                  >
                    {d.attendance}%
                  </span>
                </div>
                <ProgressCard
                  value={d.attendance}
                  color={
                    d.attendance >= 90
                      ? "#16A34A"
                      : d.attendance >= 85
                        ? "#F59E0B"
                        : "#DC2626"
                  }
                  showLabel={false}
                />
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  </div>
));
export default AttendancePage;
