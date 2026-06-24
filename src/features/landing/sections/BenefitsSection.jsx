import { useRef }            from "react";
import { motion, useInView } from "framer-motion";
import Icon from "../components/Icon";
import StatCard              from "../components/StatCard";
import SectionBackground from "../components/SectionBackground";
import { benefitsBg } from "../../../assets/images/bg";
import { UNIVERSITY_STATS }  from "../../../styles/tokens";

const WHY_CARDS = [
  { icon: "layout",       title: "Unified Experience",   desc: "One LTSU login for all academic and administrative activities. No more switching between systems.",            color: "#1B3A6B", bg: "rgba(27,58,107,0.05)"  },
  { icon: "zap",          title: "Improved Efficiency",  desc: "Reduce paperwork and manual processes. Automate routine tasks and focus on quality education.",              color: "#C9A84C", bg: "rgba(201,168,76,0.05)" },
  { icon: "messageSquare",title: "Better Communication", desc: "Keep LTSU students, faculty, and administration seamlessly connected via real-time notifications.",          color: "#10b981", bg: "rgba(16,185,129,0.05)" },
  { icon: "shield",       title: "Secure & Reliable",   desc: "Role-based access control with end-to-end encryption ensures every LTSU user's data stays protected.",       color: "#8b5cf6", bg: "rgba(139,92,246,0.05)" },
];

export default function BenefitsSection({ theme }) {
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
  <SectionBackground
id="about"
image={benefitsBg}
overlayLight="rgba(240,244,250,0.74)"
overlayDark="rgba(4,8,18,0.80)"
theme={theme}
position="center top"
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
            Why LTSU Portal
          </div>
          <h2 className="section-heading" style={{ marginBottom: "14px" }}>
            Measurable <span className="gradient-text">Impact at LTSU</span>
          </h2>
          <p className="section-subheading" style={{ margin: "0 auto" }}>
            Real numbers reflecting our commitment to transforming the Lamrin Tech Skills University experience.
          </p>
        </motion.div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "72px" }} className="grid-4-col">
          {UNIVERSITY_STATS.map((stat, i) => (
            <StatCard key={i} value={stat.value} suffix={stat.suffix} label={stat.label} icon={stat.icon} color={stat.color} delay={i * 0.1} />
          ))}
        </div>

        {/* Why cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }} className="grid-2-col">
          {WHY_CARDS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
              className="card"
              style={{ padding: "30px", background: `color-mix(in srgb, var(--bg-card) 90%, ${item.color} 10%)` }}
            >
              <div style={{
                width: "52px", height: "52px", borderRadius: "14px",
                background: `${item.color}12`,
                border:     `1px solid ${item.color}25`,
                display:    "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "18px",
              }}>
                <Icon name={item.icon} size={23} color={item.color} />
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px" }}>{item.title}</h3>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.7" }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionBackground>
  );
}