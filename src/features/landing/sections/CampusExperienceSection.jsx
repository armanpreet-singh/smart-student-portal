import { useRef }              from "react";
import { motion, useInView }   from "framer-motion";
import Icon from "../components/Icon";
import CampusIllustration      from "../components/CampusIllustration";
import SectionBackground from "../components/SectionBackground";
import { ltsuLogo }            from "../../../assets/images/logo";
import { campusBg } from "../../../assets/images/bg";
import { CAMPUS_EXPERIENCES, BRAND } from "../../../styles/tokens";

export default function CampusExperienceSection({ theme }) {
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <SectionBackground
id="campus"
image={campusBg}
overlayLight="rgba(240,244,250,0.70)"
overlayDark="rgba(2,5,12,0.78)"
theme={theme}
position="center center"
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
            <Icon name="cpu" size={13} />
            Campus Life at LTSU
          </div>
          <h2 className="section-heading" style={{ marginBottom: "14px" }}>
            Technology-Driven{" "}
            <span className="gradient-text">LTSU Campus</span>
          </h2>
          <p className="section-subheading" style={{ margin: "0 auto" }}>
            Explore a campus where innovation, technology, and academic excellence converge at Gharuan, Mohali.
          </p>
        </motion.div>

        {/* Campus cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", marginBottom: "36px" }} className="grid-5-col">
          {CAMPUS_EXPERIENCES.map((exp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.09 }}
              className="card"
              style={{ padding: "24px 18px", textAlign: "center" }}
            >
              <div style={{
                width: "84px", height: "84px", borderRadius: "50%",
                background: `${exp.color}10`,
                border:     `2px solid ${exp.color}18`,
                display:    "flex", alignItems: "center", justifyContent: "center",
                margin:     "0 auto 18px",
              }}>
                <CampusIllustration type={exp.type} color={exp.color} />
              </div>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "7px" }}>{exp.title}</h3>
              <p  style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.6" }}>{exp.desc}</p>
              <div style={{ width: "28px", height: "3px", background: `linear-gradient(90deg, ${exp.color}, ${exp.color}50)`, borderRadius: "2px", margin: "14px auto 0" }} />
            </motion.div>
          ))}
        </div>

        {/* LTSU Tech Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.55 }}
          style={{
            background:   "linear-gradient(135deg, #0F2247 0%, #1B3A6B 45%, #0d1e3d 100%)",
            borderRadius: "22px",
            padding:      "52px 44px",
            textAlign:    "center",
            position:     "relative",
            overflow:     "hidden",
          }}
        >
          {/* Decoration */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: "-40px", left: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.1)" }} />
            <div style={{ position: "absolute", bottom: "-30px", right: "-30px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
          </div>

          {/* LTSU Logo in banner */}
         <div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: "24px",
  }}
>
  <img
    src={ltsuLogo}
    alt="LTSU"
    width= "120px"
      height = "120px"
    loading="lazy"
    decoding="async"
    style={{
      width: "120px",
      height: "120px",
      objectFit: "contain",
      display: "block",
      filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))",
    }}
    draggable={false}
  />
</div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "10px" }}>
              Lamrin Tech Skills University · Gharuan, Mohali
            </div>
            <h3 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, color: "white", marginBottom: "14px" }}>
              Where Innovation Meets{" "}
              <span className="gradient-text-gold">Education</span>
            </h3>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.65)", maxWidth: "560px", margin: "0 auto 32px", lineHeight: "1.75" }}>
              LTSU's commitment to digital transformation ensures every student and faculty member has access to world-class academic tools — anywhere, anytime.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap" }}>
              {[
                { label: "AI-Powered Analytics",   icon: "cpu"      },
                { label: "Cloud-Based Records",    icon: "database" },
                { label: "Mobile-First Design",    icon: "monitor"  },
                { label: "Live Attendance Sync",   icon: "activity" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <Icon name={item.icon} size={14} color="#C9A84C" />
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </SectionBackground>
  );
}