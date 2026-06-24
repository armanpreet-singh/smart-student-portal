import { useState, useRef }                  from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Icon from "../components/Icon";
import SectionBackground from "../components/SectionBackground";
import { testimonialsBg } from "../../../assets/images/bg";
import { TESTIMONIALS }                      from "../../../styles/tokens";

export default function TestimonialsSection({ theme }) {
  const [active, setActive] = useState(0);
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const t        = TESTIMONIALS[active];

  return (
    <SectionBackground
      id="contact"
      image={testimonialsBg}
      overlayLight="rgba(240,244,250,0.90)"
      overlayDark="rgba(3,6,14,0.93)"
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
            <Icon name="star" size={13} />
            Community Voices
          </div>
          <h2 className="section-heading" style={{ marginBottom: "14px" }}>
            What the{" "}
            <span className="gradient-text">LTSU Community Says</span>
          </h2>
          <p className="section-subheading" style={{ margin: "0 auto" }}>
            Real experiences from students, faculty, and administrators at Lamrin Tech Skills University.
          </p>
        </motion.div>

        {/* Featured testimonial */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.38 }}
            className="card"
            style={{ padding: "44px", marginBottom: "28px", position: "relative", overflow: "hidden" }}
          >
            {/* Top accent */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${t.color}, ${t.color}40, transparent)` }} />
            {/* Giant quote */}
            <div style={{ position: "absolute", top: "16px", right: "28px", fontSize: "90px", color: `${t.color}10`, fontWeight: 900, lineHeight: 1, userSelect: "none" }}>"</div>

            <div style={{ display: "flex", gap: "22px", alignItems: "flex-start", marginBottom: "22px", position: "relative" }}>
              <div style={{
                width: "62px", height: "62px", borderRadius: "50%",
                background: `linear-gradient(135deg, ${t.color}, ${t.color}90)`,
                display:    "flex", alignItems: "center", justifyContent: "center",
                fontSize:   "20px", color: "white", fontWeight: 800,
                flexShrink: 0,
                border:     `3px solid ${t.color}30`,
              }}>
                {t.avatar}
              </div>
              <div>
                <div style={{ display: "flex", gap: "3px", marginBottom: "5px" }}>
                  {[...Array(t.rating)].map((_, i) => (
                    <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill="#C9A84C" stroke="#C9A84C" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)" }}>{t.name}</div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{t.role}</div>
                <span style={{
                  display:      "inline-block",
                  marginTop:    "5px",
                  padding:      "2px 10px",
                  background:   `${t.color}12`,
                  color:        t.color,
                  borderRadius: "100px",
                  fontSize:     "11px",
                  fontWeight:   700,
                }}>
                  {t.type}
                </span>
              </div>
            </div>
            <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", lineHeight: "1.82", fontStyle: "italic", position: "relative" }}>
              "{t.text}"
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Selector grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }} className="grid-3-col">
          {TESTIMONIALS.map((item, i) => (
            <motion.button
              key={i}
              onClick={() => setActive(i)}
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.28 + i * 0.05 }}
              style={{
                background:   active === i ? `${item.color}09` : "var(--bg-card)",
                border:       `1.5px solid ${active === i ? item.color : "var(--border)"}`,
                borderRadius: "12px",
                padding:      "15px",
                cursor:       "pointer",
                textAlign:    "left",
                fontFamily:   "inherit",
                transition:   "all 0.25s ease",
                backdropFilter: "blur(6px)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "50%",
                  background: `linear-gradient(135deg, ${item.color}, ${item.color}90)`,
                  display:    "flex", alignItems: "center", justifyContent: "center",
                  fontSize:   "12px", color: "white", fontWeight: 800, flexShrink: 0,
                }}>
                  {item.avatar}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{item.name}</div>
                  <div style={{ fontSize: "11px", color: item.color, fontWeight: 600 }}>{item.type}</div>
                </div>
              </div>
              <p style={{
                fontSize:        "12px",
                color:           "var(--text-muted)",
                lineHeight:      "1.55",
                overflow:        "hidden",
                display:         "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}>
                "{item.text}"
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </SectionBackground>
  );
}