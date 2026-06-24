import { ltsuLogo } from "../../assets/images/logo";
import Icon from "../../features/landing/components/Icon";
import { BRAND, FOOTER_LINKS } from "../../styles/tokens";

export default function Footer({ theme }) {
  const bg = theme === "dark" ? "#03070f" : "#0F2247";

  return (
    <footer
      style={{
        background: bg,
        color: "rgba(255,255,255,0.7)",
        padding: "80px 28px 36px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle BG texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at top left, rgba(201,168,76,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{ maxWidth: "1280px", margin: "0 auto", position: "relative" }}
      >
        {/* Top grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
            gap: "48px",
            marginBottom: "56px",
          }}
        >
          {/* Brand column */}
          <div>
            {/* Logo — same image, white background circle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              <img
                src={ltsuLogo}
                alt="LTSU"
                width="52px"
                height="52px"
                decoding="async"
                style={{
                  width: "52px",
                  height: "52px",
                  objectFit: "contain",
                  display: "block",
                  flexShrink: 0,
                  // Logo has transparent bg so works on dark footer too
                }}
                draggable={false}
              />
              <div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 900,
                    color: "white",
                    letterSpacing: "-0.3px",
                  }}
                >
                  LTSU
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.45)",
                    fontWeight: 500,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  University Portal
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: "13.5px",
                color: "rgba(255,255,255,0.45)",
                lineHeight: "1.75",
                marginBottom: "22px",
              }}
            >
              Lamrin Tech Skills University — India's premier tech skills
              university committed to industry-ready education, innovation, and
              digital transformation.
            </p>

            {/* Contact info */}
            {[
              { icon: "mapPin", text: BRAND.location },
              { icon: "phone", text: BRAND.phone },
              { icon: "mail", text: BRAND.email },
              { icon: "globe", text: "www.ltsu.ac.in" },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "9px",
                  marginBottom: "9px",
                }}
              >
                <Icon
                  name={item.icon}
                  size={13}
                  color="rgba(201,168,76,0.6)"
                  style={{ marginTop: "2px", flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.42)",
                    lineHeight: "1.5",
                  }}
                >
                  {item.text}
                </span>
              </div>
            ))}

            {/* Social links */}
            <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
              {[
                {
                  icon: "facebook",
                  href: "https://www.facebook.com/ltsuindia",
                },
                { icon: "twitter", href: "https://twitter.com/ltsuindia" },
                {
                  icon: "instagram",
                  href: "https://www.instagram.com/ltsuindia",
                },
                {
                  icon: "linkedin",
                  href: "https://www.linkedin.com/school/lamrin-tech-skills-university",
                },
                { icon: "youtube", href: "https://www.youtube.com/@ltsuindia" },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    color: "rgba(255,255,255,0.5)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(201,168,76,0.18)";
                    e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)";
                    e.currentTarget.style.color = "#C9A84C";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                  }}
                >
                  <Icon name={s.icon} size={14} color="currentColor" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, items]) => (
            <div key={group}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#C9A84C",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  marginBottom: "16px",
                }}
              >
                {group}
              </div>
              {items.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="footer-link"
                  onClick={(e) => e.preventDefault()}
                >
                  {item}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Accreditations */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            padding: "16px 0",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "24px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              "UGC Recognized",
              "AICTE Approved",
              "PCI Approved",
              "BCI Recognized",
              "Punjab Act 2021",
            ].map((b) => (
              <div
                key={b}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <div
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#C9A84C",
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.38)",
                    fontWeight: 500,
                  }}
                >
                  {b}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.32)" }}>
            © {new Date().getFullYear()} Lamrin Tech Skills University. All
            rights reserved.
          </div>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {[
              "Privacy Policy",
              "Terms of Use",
              "Cookie Policy",
              "Accessibility",
            ].map((item) => (
              <a
                key={item}
                href="#"
                className="footer-link"
                style={{ marginBottom: 0, fontSize: "12px" }}
                onClick={(e) => e.preventDefault()}
              >
                {item}
              </a>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 8px rgba(16,185,129,0.5)",
              }}
              className="animate-pulse-dot"
            />
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.32)" }}>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
