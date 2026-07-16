import React, { memo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import {
  studentGrowthData,
  deptDistributionData,
  monthlyAttendanceData,
  courseEnrollmentData,
} from "../data/mockAdminData";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="d-chart-tooltip">
        <p className="d-tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{ color: entry.color || "#1E3A8A" }}
            className="d-tooltip-value"
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ReportsPage = memo(() => (
  <div className="d-page-container">
    <SectionHeader
      title="Reports & Analytics"
      subtitle="University data insights"
    />

    <div className="d-grid-2">
      {/* Student Growth */}
      <DashboardCard padding={false}>
        <div
          className="p-4"
          style={{ borderBottom: "1px solid var(--d-border)" }}
        >
          <SectionHeader title="Student Growth" subtitle="Last 5 years" />
        </div>
        <div className="d-chart-wrapper p-4">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={studentGrowthData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--d-border)"
              />
              <XAxis dataKey="year" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="students"
                name="Students"
                stroke="#1E3A8A"
                strokeWidth={3}
                dot={{ fill: "#1E3A8A" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>

      {/* Department Distribution */}
      <DashboardCard padding={false}>
        <div
          className="p-4"
          style={{ borderBottom: "1px solid var(--d-border)" }}
        >
          <SectionHeader
            title="Department Distribution"
            subtitle="Student count"
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            gap: "32px",
            flexWrap: "wrap",
          }}
        >
          <ResponsiveContainer width="50%" height={200}>
            <PieChart>
              <Pie
                data={deptDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {deptDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {deptDistributionData.map((d) => (
              <div
                key={d.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: d.color,
                  }}
                ></div>
                <span>
                  {d.name} ({d.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </DashboardCard>

      {/* Monthly Attendance */}
      <DashboardCard padding={false}>
        <div
          className="p-4"
          style={{ borderBottom: "1px solid var(--d-border)" }}
        >
          <SectionHeader title="Monthly Attendance" subtitle="6 months trend" />
        </div>
        <div className="d-chart-wrapper p-4">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyAttendanceData} barCategoryGap="20%">
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--d-border)"
              />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis domain={[80, 100]} axisLine={false} tickLine={false} />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "var(--d-bg)", radius: 8 }}
              />
              <Bar
                dataKey="attendance"
                name="Attendance %"
                fill="#D4AF37"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>

      {/* Course Enrollment */}
      <DashboardCard padding={false}>
        <div
          className="p-4"
          style={{ borderBottom: "1px solid var(--d-border)" }}
        >
          <SectionHeader title="Course Enrollment" subtitle="Top courses" />
        </div>
        <div
          className="p-4"
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {courseEnrollmentData.map((c, i) => (
            <div key={c.name}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                  fontSize: "13px",
                }}
              >
                <span style={{ fontWeight: 600 }}>{c.name}</span>
                <span style={{ fontWeight: 700, color: "var(--d-primary)" }}>
                  {c.enrolled}
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 8,
                  background: "var(--d-bg)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(c.enrolled / 150) * 100}%`,
                    height: "100%",
                    background: "#294D9B",
                    borderRadius: 4,
                    transition: "width 1s ease",
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  </div>
));
export default ReportsPage;
