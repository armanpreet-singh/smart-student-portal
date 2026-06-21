import { motion } from "framer-motion";
import Icon from "../components/Icon";
import { DASHBOARD_CONFIGS } from "../../../styles/tokens";

export default function DashboardPreview({ type, isActive }) {
  const cfg = DASHBOARD_CONFIGS[type];

  return (
    <motion.div
      animate={isActive ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0.25, scale: 0.92, y: 16 }}
      transition={{ duration: 0.4 }}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: isActive ? "var(--shadow-xl)" : "none",
      }}
    >
      {/* Header */}
      <div style={{ background: cfg.gradient, padding: "22px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Inline LTSU wordmark */}
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "6px", padding: "4px 8px" }}>
              <span style={{ fontSize: "11px", fontWeight: 900, color: "white", letterSpacing: "0.5px" }}>LTSU</span>
            </div>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {cfg.title}
            </span>
          </div>
          <div style={{ display: "flex", gap: "5px" }}>
            {["rgba(255,255,255,0.25)", "rgba(255,255,255,0.45)", "rgba(255,255,255,0.75)"].map((c, i) => (
              <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: c }} />
            ))}
          </div>
        </div>
        <div style={{ fontSize: "19px", fontWeight: 800, color: "white" }}>{cfg.name}</div>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", marginTop: "3px" }}>{cfg.id}</div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "var(--border)" }}>
        {cfg.stats.map((stat, i) => (
          <div key={i} style={{ background: "var(--bg-card)", padding: "16px 10px", textAlign: "center" }}>
            <Icon name={stat.icon} size={14} color={stat.color} />
            <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", marginTop: "6px", marginBottom: "3px" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Performance */}
      <div style={{ padding: "20px 24px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "16px" }}>
          Performance Overview
        </div>
        {cfg.items.map((item, i) => (
          <div key={i} style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>{item.label}</span>
              <span style={{ fontSize: "12px", color: item.color, fontWeight: 700 }}>{item.progress}%</span>
            </div>
            <div className="progress-bar">
              <motion.div
                initial={{ width: 0 }}
                animate={isActive ? { width: `${item.progress}%` } : { width: 0 }}
                transition={{ duration: 1.2, delay: i * 0.18, ease: "easeOut" }}
                style={{
                  height: "100%",
                  borderRadius: "3px",
                  background: `linear-gradient(90deg, ${item.color}70, ${item.color})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}