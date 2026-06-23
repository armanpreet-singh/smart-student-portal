import { useState, useRef,useEffect}                  from "react";
import { motion, useInView } from "framer-motion";
import Icon from "../components/Icon";
import DashboardPreview                      from "../components/DashboardPreview";
import SectionBackground from "../components/SectionBackground";
import { dashboardBg } from "../../../assets/images/bg";
import {
  studentDashboard,
  facultyDashboard,
  adminDashboard,
} from "../../../assets/images/dashboard";

const TABS = [
  { label: "Student Dashboard", type: "student" },
  { label: "Faculty Dashboard", type: "faculty" },
  { label: "Admin Dashboard",   type: "admin"   },
];

const DASHBOARD_IMAGES = {
  student: studentDashboard,
  faculty: facultyDashboard,
  admin: adminDashboard,
};

export default function DashboardShowcaseSection({ theme }) {
  const [activeTab, setActiveTab] = useState(0);
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <SectionBackground
      id="dashboard"
      image={dashboardBg}
      overlayLight="rgba(248,250,255,0.91)"
      overlayDark="rgba(3,6,16,0.93)"
      theme={theme}
      position="center center"
      style={{ padding: "100px 28px", overflow: "hidden" }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }} ref={ref}>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "56px" }}
        >
          <div className="section-tag" style={{ margin: "0 auto 18px" }}>
            <Icon name="monitor" size={13} />
            Dashboard Showcase
          </div>
          <h2 className="section-heading" style={{ marginBottom: "14px" }}>
            Premium <span className="gradient-text">Role-Based Dashboards</span>
          </h2>
          <p className="section-subheading" style={{ margin: "0 auto" }}>
            Every LTSU user gets a tailored dashboard with exactly the information and tools they need.
          </p>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "36px" }}>
          {TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`tab-btn ${activeTab === i ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Preview */}
<div
  style={{
    position: "relative",
    width: "100%",
  }}
>
  {TABS.map((tab, i) => (
    <motion.img
      key={tab.type}
      src={DASHBOARD_IMAGES[tab.type]}
      alt={tab.label}
      style={{
        width: "100%",
        borderRadius: "24px",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-lg)",
        display: activeTab === i ? "block" : "none",
      }}
    />
  ))}
</div>

        {/* Feature pills */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px", marginTop: "36px" }} className="grid-3-col">
          {[
            { icon: "zap",     title: "Real-time Sync",      desc: "All LTSU portals update instantly across all devices"   },
            { icon: "shield",  title: "Role-Based Security",  desc: "Students, faculty, and admin see only what they need"  },
            { icon: "monitor", title: "Fully Responsive",    desc: "Works seamlessly on desktop, tablet, and mobile"       },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="card"
              style={{ padding: "20px", display: "flex", gap: "14px", alignItems: "flex-start" }}
            >
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "rgba(27,58,107,0.08)",
                display:    "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon name={item.icon} size={18} color="#1B3A6B" />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>{item.title}</div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{item.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionBackground>
  );
}