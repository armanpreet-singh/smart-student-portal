import { useState, useEffect }    from "react";
import { Link } from "react-router-dom";
import LTSULogo from "../../features/landing/components/LTSULogo";
import { motion, AnimatePresence } from "framer-motion";
import { ltsuLogo } from "../../assets/images/logo";
import Icon                       from "../../features/landing/components/Icon";
import { NAV_ITEMS }              from "../../styles/tokens";

export default function Navigation({ theme, toggleTheme }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        role="banner"
        style={{
          position:             "fixed",
          top: 0, left: 0, right: 0,
          zIndex:               1000,
          // ── Taller navbar to accommodate bigger logo ──
          padding:              scrolled ? "8px 0" : "12px 0",
          background:           scrolled ? "var(--nav-bg)" : "transparent",
          backdropFilter:       scrolled ? "blur(10px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(10px)" : "none",
          borderBottom:         scrolled ? "1px solid var(--border)" : "none",
          transition:           "all 0.4s ease",
        }}
      >
        <div style={{
          maxWidth:       "1380px",
          margin:         "0 auto",
          padding:        "0 32px",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          // ── Fixed height so logo always has room ──
          minHeight:      "88px",
        }}>

          {/* ── Logo ── */}
          <LTSULogo size="small" />

          {/* ── Desktop Nav ── */}
         <nav
  className="hide-mobile"
  aria-label="Main navigation"
  style={{
    display: "flex",
    gap: "4px",
    alignItems: "center",
  }}
>
  {NAV_ITEMS.map((item) => (
    <button
      key={item.id}
      onClick={() => scrollTo(item.id)}
      onMouseEnter={() => setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
      className="nav-link"
      style={{
        fontFamily: "inherit",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: 500,
        padding: "10px 18px",
        borderRadius: "9px",

        background:
          hoveredItem === item.id
            ? theme === "dark"
              ? "rgba(201,168,76,0.08)"
              : "rgba(27,58,107,0.08)"
            : "transparent",

        color:
          hoveredItem === item.id
            ? theme === "dark"
              ? "#C9A84C"
              : "#1B3A6B"
            : "var(--text-secondary)",

        border:
          hoveredItem === item.id
            ? theme === "dark"
              ? "1px solid rgba(201,168,76,0.15)"
              : "1px solid transparent"
            : "1px solid transparent",

        boxShadow:
          hoveredItem === item.id
            ? theme === "dark"
              ? "0 4px 14px rgba(201,168,76,0.12)"
              : "none"
            : "none",

        transform:
          hoveredItem === item.id
            ? "translateY(-1px)"
            : "translateY(0)",

        transition: "all 0.25s ease",
      }}
    >
      {item.label}
    </button>
  ))}
</nav>

          {/* ── Right side actions ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

            {/* Visit website */}
            <a
              href="https://www.ltsu.ac.in/"
              target="_blank"
              rel="noreferrer"
              className="hide-mobile"
              style={{
                fontSize:       "14px",
                fontWeight:     500,
                color:          "var(--text-secondary)",
                textDecoration: "none",
                display:        "flex",
                alignItems:     "center",
                gap:            "5px",
                transition:     "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1B3A6B")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              ltsu.ac.in
              <Icon name="externalLink" size={13} />
            </a>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                background:     "var(--bg-card)",
                border:         "1px solid var(--border)",
                color:          "var(--text-secondary)",
                cursor:         "pointer",
                padding:        "10px",
                borderRadius:   "11px",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                transition:     "all 0.2s",
                backdropFilter: "blur(8px)",
              }}
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
            </button>

            {/* Login CTA */}
           <Link
  to="/login"
  className="btn-primary hide-mobile"
  style={{
    padding: "12px 26px",
    fontSize: "14px",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  Login to Portal
</Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="show-mobile"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              style={{
                background:   "var(--bg-card)",
                border:       "1px solid var(--border)",
                color:        "var(--text-primary)",
                cursor:       "pointer",
                padding:      "10px",
                borderRadius: "11px",
                display:      "flex",
              }}
            >
              <Icon name={mobileOpen ? "x" : "menu"} size={22} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,   scale: 1    }}
            exit={{    opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            style={{
              position:       "fixed",
              top:            "100px",       // pushed down to clear bigger nav
              left:           "16px",
              right:          "16px",
              zIndex:         999,
              background:     "var(--bg-card)",
              border:         "1px solid var(--border)",
              borderRadius:   "18px",
              padding:        "14px",
              boxShadow:      "var(--shadow-xl)",
              backdropFilter: "blur(10px)",
            }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                style={{
                  display:      "block",
                  width:        "100%",
                  padding:      "14px 18px",
                  background:   "none",
                  border:       "none",
                  textAlign:    "left",
                  fontFamily:   "inherit",
                  fontSize:     "16px",
                  fontWeight:   500,
                  color:        "var(--text-primary)",
                  cursor:       "pointer",
                  borderRadius: "11px",
                  marginBottom: "2px",
                  transition:   "background 0.15s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "rgba(27,58,107,0.06)")}
                onMouseLeave={(e) => (e.target.style.background = "none")}
              >
                {item.label}
              </button>
            ))}
            <div style={{
              borderTop:   "1px solid var(--border)",
              marginTop:   "10px",
              paddingTop:  "12px",
            }}>
              <Link
  to="/login"
  className="btn-primary"
  style={{
    width: "100%",
    fontSize: "15px",
    justifyContent: "center",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  Login to Portal
</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}