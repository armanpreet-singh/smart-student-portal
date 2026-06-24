import { useRef }            from "react";
import { motion, useInView } from "framer-motion";
import { featuresBg } from "../../../assets/images/bg";
import Icon from "../components/Icon";
import SectionBackground from "../components/SectionBackground";
import { dashboardBg } from "../../../assets/images/bg";

const FEATURES = [
  { icon: "users",    title: "5,200+ Active Students",   desc: "All enrolled LTSU students across 12 schools on one platform",        color: "#1B3A6B" },
  { icon: "book",     title: "Academic Records",         desc: "Complete marks, grades, and transcript management for every student",  color: "#10b981" },
  { icon: "clock",    title: "Live Attendance",          desc: "Real-time class-wise attendance tracking and automated reporting",     color: "#C9A84C" },
  { icon: "barChart", title: "Performance Analytics",   desc: "Actionable insights to improve LTSU academic outcomes",               color: "#8b5cf6" },
  { icon: "bell",     title: "Smart Notifications",     desc: "Instant alerts for results, notices, exam schedules, and fee dues",    color: "#ef4444" },
  { icon: "shield",   title: "Secure Data Vault",       desc: "Role-based access and encrypted storage for all university data",     color: "#f59e0b" },
];

export default function FeaturesSection({ theme }) {
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
   <SectionBackground
id="features"
image={featuresBg}
overlayLight="rgba(248,250,255,0.72)"
overlayDark="rgba(3,6,16,0.80)"
theme={theme}
position="center center"
size="cover"
style={{
padding: "100px 28px",
overflow: "hidden",
}}

>

      <div style={{ maxWidth: "1280px", margin: "0 auto" }} ref={ref}>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "56px" }}
        >
          <div className="section-tag" style={{ margin: "0 auto 18px" }}>
            <Icon name="zap" size={13} />
            Platform Features
          </div>
          <h2 className="section-heading" style={{ marginBottom: "14px" }}>
            Everything LTSU Needs in{" "}
            <span className="gradient-text">One Platform</span>
          </h2>
          <p className="section-subheading" style={{ margin: "0 auto" }}>
            A comprehensive management system built specifically for Lamrin Tech Skills University's academic environment.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="grid-3-col">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="card"
              style={{ padding: "26px" }}
            >
              <div style={{
                width: "50px", height: "50px", borderRadius: "14px",
                background: `${f.color}10`,
                border:     `1px solid ${f.color}22`,
                display:    "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "14px",
              }}>
                <Icon name={f.icon} size={22} color={f.color} />
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "7px" }}>{f.title}</h3>
              <p  style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.65" }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionBackground>
  );
}