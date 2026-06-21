import { useState, useRef }                  from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Icon from "../components/Icon";
import { modulesBg } from "../../../assets/images/bg";
import SectionBackground from "../components/SectionBackground";
import { MODULE_CONFIGS }                    from "../../../styles/tokens";

export default function CoreModulesSection({ theme }) {
  const [active, setActive] = useState(0);
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const mod      = MODULE_CONFIGS[active];

  return (
    <SectionBackground
      id="modules"
      image={modulesBg}
      overlayLight="rgba(240,244,250,0.92)"
      overlayDark="rgba(2,5,14,0.94)"
      theme={theme}
      position="center center"
      style={{ padding: "100px 28px", overflow: "hidden" }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }} ref={ref}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "56px" }}
        >
          <div className="section-tag" style={{ margin: "0 auto 18px" }}>
            <Icon name="layers" size={13} />
            Core Modules
          </div>
          <h2 className="section-heading" style={{ marginBottom: "14px" }}>
            Six Powerful <span className="gradient-text">Integrated Modules</span>
          </h2>
          <p className="section-subheading" style={{ margin: "0 auto" }}>
            Everything Lamrin Tech Skills University needs — from student attendance to institutional analytics — in one seamlessly integrated platform.
          </p>
        </motion.div>

        {/* Tab bar */}
        <div className="tab-container" style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "6px", marginBottom: "44px" }}>
          {MODULE_CONFIGS.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setActive(i)}
              className={`tab-btn ${active === i ? "active" : ""}`}
            >
              <Icon name={m.icon} size={13} />
              {m.title.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Module content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.35 }}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "center" }}
            className="grid-2-col"
          >
            {/* Info */}
            <div>
              <div style={{
                width: "60px", height: "60px", borderRadius: "16px",
                background:  mod.gradient,
                display:     "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "22px",
                boxShadow:   `0 8px 22px ${mod.color}28`,
              }}>
                <Icon name={mod.icon} size={26} color="white" />
              </div>
              <h3 style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "14px" }}>
                {mod.title}
              </h3>
              <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: "1.75", marginBottom: "28px" }}>
                {mod.description}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {mod.features.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card"
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 14px" }}
                  >
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "8px",
                      background: `${mod.color}12`,
                      display:    "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Icon name={f.icon} size={14} color={mod.color} />
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{f.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Visual panel */}
            <div style={{
              background:   mod.gradient,
              borderRadius: "22px",
              padding:      "36px",
              position:     "relative",
              overflow:     "hidden",
              minHeight:    "380px",
            }}>
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.12)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                  <div style={{ background: "rgba(255,255,255,0.18)", borderRadius: "6px", padding: "3px 9px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 900, color: "white", letterSpacing: "0.5px" }}>LTSU</span>
                  </div>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>Module Preview</span>
                </div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "white", marginBottom: "6px" }}>{mod.title}</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", marginBottom: "28px" }}>Lamrin Tech Skills University</div>
                {mod.features.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      gap:            "11px",
                      padding:        "9px 13px",
                      background:     "rgba(255,255,255,0.1)",
                      borderRadius:   "9px",
                      marginBottom:   "7px",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <Icon name={f.icon} size={13} color="rgba(255,255,255,0.85)" />
                    <span style={{ fontSize: "13px", color: "white", fontWeight: 500 }}>{f.label}</span>
                    <div style={{ marginLeft: "auto", width: "5px", height: "5px", borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
                  </motion.div>
                ))}
              </div>
              <div style={{ position: "absolute", top: "-24px", right: "-24px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
              <div style={{ position: "absolute", bottom: "-16px", left: "-16px", width: "70px",  height: "70px",  borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </SectionBackground>
  );
}