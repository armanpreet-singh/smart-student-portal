import { motion }        from "framer-motion";
import Icon from "../components/Icon";
import HeroDashboard from "../components/HeroDashboard";
import SectionBackground from "../components/SectionBackground";
import { heroBg } from "../../../assets/images/bg";
import { BRAND }         from "../../../styles/tokens";

export default function HeroSection({ theme }) {
  return (
    <SectionBackground
      id="home"
      image={heroBg}
      overlayLight="rgba(240,244,250,0.86)"
      overlayDark="rgba(4,8,18,0.90)"
      theme={theme}
      position="center center"
     style={{
  minHeight:   "100vh",
  display:     "flex",
  alignItems:  "center",
  position:    "relative",
  overflow:    "hidden",
  paddingTop:  "120px",    // ← was 100px
  paddingBottom: "80px",
  background:  "transparent",
}}
    >
      {/* Radial accents */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "8%", left: "-5%", width: "550px", height: "550px", background: "radial-gradient(circle, rgba(27,58,107,0.08) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "8%", right: "-5%", width: "450px", height: "450px", background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)", borderRadius: "50%" }} />
      </div>

      <div style={{
        maxWidth:   "1380px", margin: "0 auto", padding: "0 28px",
        width:      "100%",
        display:    "grid",
        gridTemplateColumns: "1fr 1.4fr",
        gap:        "48px",
        alignItems: "center",
        position:   "relative", zIndex: 1,
      }} className="hero-grid">

        {/* ── Left content ── */}
        <div>
          {/* UGC badge */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            "8px",
              background:     "rgba(255,255,255,0.80)",
              color:          "#1B3A6B",
              border:         "1px solid rgba(27,58,107,0.2)",
              padding:        "6px 14px",
              borderRadius:   "100px",
              fontSize:       "12px",
              fontWeight:     700,
              letterSpacing:  "0.5px",
              marginBottom:   "24px",
              backdropFilter: "blur(12px)",
            }}>
              <div style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "#10b981",
                boxShadow:  "0 0 7px rgba(16,185,129,0.6)",
              }} className="animate-pulse-dot" />
              {BRAND.ugcRecognition}
            </div>
          </motion.div>

          {/* University tagline */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            style={{ fontSize: "13px", fontWeight: 700, color: "#C9A84C", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}
          >
            {BRAND.name}
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-1px", marginBottom: "22px", color: "var(--text-primary)" }}
          >
            One Digital Platform for the{" "}
            <span className="gradient-text">Entire LTSU Community</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18 }}
            className="section-subheading"
            style={{ marginBottom: "38px" }}
          >
            Manage attendance, academics, student records, faculty operations, examinations, announcements, and administrative workflows through a unified university management portal.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.26 }}
            style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}
          >
            <button className="btn-primary">
              <Icon name="monitor" size={18} />
              Access Portal
            </button>
            <button
  className="btn-secondary"
  onClick={() =>
    document.getElementById("features")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }
>
  Explore Features
  <Icon name="arrowRight" size={17} />
</button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.65, delay: 0.42 }}
            style={{
              display:     "flex",
              gap:         "36px",
              marginTop:   "48px",
              flexWrap:    "wrap",
              paddingTop:  "32px",
              borderTop:   "1px solid rgba(27,58,107,0.12)",
            }}
          >
            {[
              { value: "5,200+", label: "Students Enrolled"  },
              { value: "280+",   label: "Expert Faculty"     },
              { value: "12",     label: "Schools & Depts"    },
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#1B3A6B", letterSpacing: "-0.5px" }}>{stat.value}</div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500, marginTop: "2px" }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Right: Hero Dashboard ── */}
{/* Right column — remove padding constraints */}
<motion.div
  initial={{ opacity: 0, x: 48 }}
  animate={{ opacity: 1, x: 0  }}
  transition={{ duration: 0.8, delay: 0.2 }}
  style={{
    display:        "flex",
    justifyContent: "center",
    alignItems:     "center",
    // Remove the old paddingRight/paddingBottom that was shrinking it
    paddingTop:     "40px",
    paddingBottom:  "40px",
  }}
  className="hide-mobile"
>
  <HeroDashboard />
</motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        style={{
          position:  "absolute",
          bottom:    "28px",
          left:      "50%",
          transform: "translateX(-50%)",
          display:   "flex",
          flexDirection: "column",
          alignItems: "center",
          gap:       "6px",
          zIndex:    1,
        }}
      >
        <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.8px", textTransform: "uppercase", fontWeight: 600 }}>
          Scroll to explore
        </div>
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
          <Icon name="chevronDown" size={18} color="var(--text-muted)" />
        </motion.div>
      </motion.div>
    </SectionBackground>
  );
}