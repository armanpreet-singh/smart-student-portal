import { useRef }            from "react";
import { motion, useInView } from "framer-motion";
import Icon from "../components/Icon";
import SectionBackground from "../components/SectionBackground";
import { ltsuLogo }          from "../../../assets/images/logo";
import { ctaBg } from "../../../assets/images/bg";
import { BRAND }             from "../../../styles/tokens";

export default function FinalCTASection({ theme }) {
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <SectionBackground
      image={ctaBg}
      overlayLight="rgba(240,244,252,0.88)"
      overlayDark="rgba(2,5,14,0.92)"
      theme={theme}
      position="center center"
      style={{ padding: "80px 28px 100px", overflow: "hidden" }}
    >
      <div style={{ maxWidth: "920px", margin: "0 auto" }} ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{
            background:   "linear-gradient(135deg, #0F2247 0%, #1B3A6B 45%, #0d1e3d 100%)",
            borderRadius: "26px",
            padding:      "76px 56px",
            textAlign:    "center",
            position:     "relative",
            overflow:     "hidden",
          }}
        >
          {/* Decoration rings */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: "-50px", left: "-50px", width: "220px", height: "220px", borderRadius: "50%", border: "1px solid rgba(201,168,76,0.1)", background: "rgba(201,168,76,0.04)" }} />
            <div style={{ position: "absolute", bottom: "-40px", right: "-40px", width: "180px", height: "180px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)" }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "600px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.02)" }} />
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* LTSU Logo */}
            {/* CTA logo — no white circle */}
<motion.div
  initial={{ opacity: 0, scale: 0.85 }}
  animate={isInView ? { opacity: 1, scale: 1 } : {}}
  transition={{ delay: 0.15 }}
  style={{ display: "flex", justifyContent: "center", marginBottom: "22px" }}
>
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
</motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.22 }}
              style={{
                display:       "inline-flex",
                alignItems:    "center",
                gap:           "8px",
                background:    "rgba(201,168,76,0.14)",
                color:         "#F0C96B",
                padding:       "6px 16px",
                borderRadius:  "100px",
                fontSize:      "12px",
                fontWeight:    700,
                letterSpacing: "0.6px",
                textTransform: "uppercase",
                border:        "1px solid rgba(201,168,76,0.22)",
                marginBottom:  "22px",
              }}
            >
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 7px rgba(16,185,129,0.6)" }} />
              Portal Live · Join 5,200+ LTSU Students
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              style={{ fontSize: "clamp(1.9rem, 4vw, 2.9rem)", fontWeight: 900, color: "white", marginBottom: "18px", letterSpacing: "-0.5px", lineHeight: 1.18 }}
            >
              Empowering the LTSU Community Through{" "}
              <span className="gradient-text-gold">Digital Innovation</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.38 }}
              style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.68)", marginBottom: "44px", lineHeight: "1.8", maxWidth: "580px", margin: "0 auto 44px" }}
            >
              Experience a smarter, faster, and more connected university ecosystem at{" "}
              <span style={{ color: "#C9A84C", fontWeight: 600 }}>Lamrin Tech Skills University</span>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.46 }}
              style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}
            >
              <button className="btn-accent" style={{ padding: "16px 40px", fontSize: "16px" }}>
                <Icon name="monitor" size={20} />
                Login to Portal
              </button>
              <a href={BRAND.website} target="_blank" rel="noreferrer" className="btn-outline-white" style={{ padding: "14px 32px", fontSize: "14px" }}>
                Visit LTSU Website
                <Icon name="externalLink" size={16} />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
              style={{ display: "flex", justifyContent: "center", gap: "28px", marginTop: "44px", flexWrap: "wrap" }}
            >
              {[
                { icon: "shield",  text: "Secure & Encrypted" },
                { icon: "clock",   text: "24/7 Accessible"    },
                { icon: "zap",     text: "Real-Time Updates"  },
                { icon: "mapPin",  text: "Gharuan, Mohali"    },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <Icon name={item.icon} size={13} color="rgba(201,168,76,0.5)" />
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.42)", fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </SectionBackground>
  );
}