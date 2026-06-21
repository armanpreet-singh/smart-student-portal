import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Icon from "./Icon";
import { useCounter } from "../../../hooks/useCounter";

export default function StatCard({ value, label, icon, suffix = "", color = "#7B1C1C", delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const isNumeric = !isNaN(parseInt(value));
  const numVal = parseInt(value) || 0;
  const count = useCounter(numVal, 2000, isInView && isNumeric);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "20px",
        padding: "36px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = `0 20px 40px ${color}20`;
        e.currentTarget.style.borderColor = `${color}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
        e.currentTarget.style.borderColor = "";
      }}
    >
      {/* Top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

      <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: `${color}12`, border: `1px solid ${color}20`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
        <Icon name={icon} size={24} color={color} />
      </div>

      <div style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, color, marginBottom: "8px", letterSpacing: "-1px", lineHeight: 1 }}>
        {isNumeric ? count.toLocaleString() : value}{suffix}
      </div>
      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
    </motion.div>
  );
}