import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Icon from "../components/Icon";
import SectionBackground from "../components/SectionBackground";
import { ltsuLogo } from "../../../assets/images/logo";
import {
  ugcLogo,
  aicteLogo,
  ibmLogo,
  lntLogo,
  aiLogo,
  ncvetLogo
} from "../../../assets/images/partners";
import { identityBg } from "../../../assets/images/bg";
import { BRAND, DEPARTMENTS } from "../../../styles/tokens";

const BADGES = [
  {
    logo: ugcLogo,
    title: "UGC Recognized",
    desc: "State Private University · Punjab 2021",
    color: "#cec7c7",
  },
{
  logos: [ibmLogo, lntLogo],
  title: "Industry-Oriented",
  desc: "Skill-based curriculum for Industry 4.0",
  color: "#cec7c7",
},
  {
    logo: aiLogo,
    title: "Tech-First",
    desc: "AI, IoT, Robotics & Emerging Tech",
    color: "#cec7c7",
  },
  {
    logo: aicteLogo,
    title: "AICTE Approved",
    desc: "All technical programs approved",
    color: "#cec7c7",
  },
];

export default function UniversityIdentitySection({ theme }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <SectionBackground
      id="about-ltsu"
      image={identityBg}
      overlayLight="rgba(248,250,255,0.90)"
      overlayDark="rgba(4,8,20,0.92)"
      theme={theme}
      position="center center"
      style={{ padding: "100px 28px", overflow: "hidden" }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }} ref={ref}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "center",
          }}
          className="grid-2-col"
        >
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -36 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div className="section-tag">
              <Icon name="award" size={13} />
              About LTSU
            </div>
            <h2 className="section-heading" style={{ marginBottom: "18px" }}>
              Built for the{" "}
              <span className="gradient-text">Future of Education</span> at LTSU
            </h2>
            <p className="section-subheading" style={{ marginBottom: "32px" }}>
              Lamrin Tech Skills University is Punjab's premier private
              university focused on technical skill development, innovation, and
              industry-ready education — established under Punjab State Private
              University Act 2021.
            </p>

            {/* LTSU Logo card */}
            {/* Logo card — no white circle */}
            <div
              className="card"
              style={{
                padding: "28px",
                display: "flex",
                alignItems: "center",
                gap: "22px",
                marginBottom: "24px",
              }}
            >
              <img
                src={ltsuLogo}
                alt="LTSU Official Seal"
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "contain",
                  display: "block",
                  flexShrink: 0,
                }}
                draggable={false}
              />

              <div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 900,
                    color: "#1B3A6B",
                    letterSpacing: "-0.3px",
                  }}
                >
                  LTSU
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                  }}
                >
                  Lamrin Tech Skills University
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#C9A84C",
                    marginTop: "2px",
                    fontWeight: 500,
                    fontStyle: "italic",
                  }}
                >
                  "Enlightenment to Empowerment"
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    marginTop: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {["UGC", "AICTE", "Punjab 2021"].map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        background: "rgba(27,58,107,0.08)",
                        color: "#1B3A6B",
                        borderRadius: "100px",
                        border: "1px solid rgba(27,58,107,0.15)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Dept tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {DEPARTMENTS.slice(0, 6).map((dept) => (
                <span
                  key={dept}
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "5px 12px",
                    fontWeight: 500,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {dept.replace("School of ", "")}
                </span>
              ))}
              <span
                style={{
                  fontSize: "12px",
                  color: "#1B3A6B",
                  fontWeight: 600,
                  padding: "5px 12px",
                }}
              >
                +6 more →
              </span>
            </div>
          </motion.div>

          {/* Right — Badge grid */}
          <motion.div
            initial={{ opacity: 0, x: 36 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.18 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
  {BADGES.map((badge, i) => (
  <motion.div
    key={i}
    initial={{ opacity: 0, y: 18 }}
    animate={isInView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.55, delay: 0.28 + i * 0.1 }}
    className="card"
    style={{ padding: "22px" }}
  >
    <div
      style={{
        width: badge.logos ? "140px" : "64px",
        height: badge.logos ? "70px" : "64px",
        borderRadius: "16px",
        background: `${badge.color}12`,
        border: `1px solid ${badge.color}25`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "16px",
        padding: "10px",
      }}
    >
      {badge.logos ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "18px",
            width: "100%",
          }}
        >
          {badge.logos.map((logo, index) => (
            <img
              key={index}
              src={logo}
              alt=""
              style={{
                width: "42px",
                height: "42px",
                objectFit: "contain",
              }}
            />
          ))}
        </div>
      ) : badge.logo ? (
        <img
          src={badge.logo}
          alt={badge.title}
          style={{
            width: "46px",
            height: "46px",
            objectFit: "contain",
          }}
        />
      ) : (
        <Icon
          name={badge.icon}
          size={38}
          color={badge.color}
        />
      )}
    </div>

    <div
      style={{
        fontSize: "14px",
        fontWeight: 700,
        color: "var(--text-primary)",
        marginBottom: "5px",
      }}
    >
      {badge.title}
    </div>

    <div
      style={{
        fontSize: "12px",
        color: "var(--text-muted)",
        lineHeight: "1.5",
      }}
    >
      {badge.desc}
    </div>
  </motion.div>
))}
            </div>

            {/* Established banner */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.7 }}
              style={{
                marginTop: "14px",
                background: "linear-gradient(135deg, #0F2247 0%, #1B3A6B 100%)",
                borderRadius: "16px",
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: "-10px",
                  top: "-10px",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "rgba(201,168,76,0.1)",
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.6)",
                    marginBottom: "3px",
                  }}
                >
                  Established Under
                </div>
                <div
                  style={{ fontSize: "15px", fontWeight: 700, color: "white" }}
                >
                  Punjab State Private University Act 2021
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#C9A84C",
                    marginTop: "3px",
                  }}
                >
                  Rupnagar (Ropar) District, Punjab — 144533
                </div>
              </div>
              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 900,
                  color: "rgba(201,168,76,0.25)",
                  flexShrink: 0,
                }}
              >
                2021
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </SectionBackground>
  );
}
