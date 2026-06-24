import { motion } from "framer-motion";
import { dashboardPreview } from "../../../assets/images/misc";

export default function HeroDashboard() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        // Allow the container to be wider
        maxWidth: "820px",
      }}
    >
      {/* ── Main Dashboard Screenshot Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.85, delay: 0.3, ease: "easeOut" }}
        className="glass-card animate-float"
        style={{
          padding: "10px 10px 6px 10px",
          position: "relative",
          overflow: "hidden",
          boxShadow: [
            "0 40px 100px rgba(27,58,107,0.28)",
            "0 16px 40px  rgba(27,58,107,0.18)",
            "0 4px  12px  rgba(27,58,107,0.10)",
          ].join(", "),
          // Thin accent border on top
          borderTop: "2px solid rgba(201,168,76,0.5)",
        }}
      >
        {/* ── Fake browser chrome ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 14px 10px",
            borderBottom: "1px solid var(--border)",
            marginBottom: "8px",
            gap: "12px",
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: "7px", flexShrink: 0 }}>
            {[
              { color: "#ef4444", hover: "#dc2626" },
              { color: "#f59e0b", hover: "#d97706" },
              { color: "#10b981", hover: "#059669" },
            ].map((dot, i) => (
              <div
                key={i}
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: dot.color,
                  boxShadow: `0 0 6px ${dot.color}60`,
                  flexShrink: 0,
                }}
              />
            ))}
          </div>

          {/* URL bar */}
          <div
            style={{
              flex: 1,
              background: "var(--border)",
              borderRadius: "8px",
              padding: "5px 14px",
              fontSize: "12px",
              color: "var(--text-muted)",
              textAlign: "center",
              fontFamily: "monospace",
              letterSpacing: "0.2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            {/* Lock icon */}
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            portal.ltsu.ac.in/dashboard
          </div>

          {/* LIVE badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: "100px",
              padding: "4px 11px",
              fontSize: "11px",
              fontWeight: 700,
              color: "#10b981",
              flexShrink: 0,
              letterSpacing: "0.3px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 7px rgba(16,185,129,0.7)",
              }}
              className="animate-pulse-dot"
            />
            LIVE
          </div>
        </div>

        {/* ── Real Dashboard Screenshot ── */}
        <div
          style={{
            borderRadius: "10px",
            overflow: "hidden",
            lineHeight: 0,
            // Give it a subtle inner border
            border: "1px solid var(--border)",
            // Fixed height so the image fills properly
            maxHeight: "480px",
          }}
        >
          <img
            src={dashboardPreview}
            alt="LTSU University Portal — Real Dashboard Preview"
           
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "cover",
              objectPosition: "top center",
              // Show from the top so most important UI is visible
            }}
            loading="eager"
            draggable={false}
          />
        </div>

        {/* ── Gradient fade at bottom of screenshot ── */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "80px",
            background:
              "linear-gradient(to top, var(--glass-bg) 0%, transparent 100%)",
            borderRadius: "0 0 16px 16px",
            pointerEvents: "none",
          }}
        />
      </motion.div>

      {/* ── Floating Badge: Results Published (top-right) ── */}
      <motion.div
        initial={{ opacity: 0, x: 24, y: -16 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
        className="glass-card animate-float-delay"
        style={{
          padding: "14px 18px",
          position: "absolute",
          top: "-28px",
          right: "-32px",
          zIndex: 20,
          minWidth: "210px",
          boxShadow: "0 12px 32px rgba(27,58,107,0.18)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              background: "linear-gradient(135deg, #1B3A6B, #2A52A0)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 14px rgba(27,58,107,0.35)",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Results Published
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                marginTop: "2px",
              }}
            >
              Semester V — LTSU
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Floating Badge: Students Online (bottom-left) ── */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
        className="glass-card"
        style={{
          padding: "12px 16px",
          position: "absolute",
          bottom: "48px",
          left: "-36px",
          zIndex: 20,
          minWidth: "190px",
          boxShadow: "0 12px 32px rgba(27,58,107,0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Avatar stack */}
          <div style={{ display: "flex", flexShrink: 0 }}>
            {[
              { letter: "A", color: "#1B3A6B" },
              { letter: "S", color: "#C9A84C" },
              { letter: "R", color: "#10b981" },
            ].map((av, i) => (
              <div
                key={i}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${av.color}, ${av.color}cc)`,
                  border: "2px solid var(--glass-bg)",
                  marginLeft: i === 0 ? 0 : "-10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  color: "white",
                  fontWeight: 800,
                  zIndex: 3 - i,
                  position: "relative",
                }}
              >
                {av.letter}
              </div>
            ))}
          </div>
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              1,240 Online
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                marginTop: "1px",
              }}
            >
              Students active now
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Floating Badge: 99.1% Uptime (bottom-right) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.4, ease: "easeOut" }}
        className="glass-card"
        style={{
          padding: "10px 16px",
          position: "absolute",
          bottom: "-24px",
          right: "-24px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          zIndex: 20,
          boxShadow: "0 12px 32px rgba(27,58,107,0.15)",
        }}
      >
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: "#10b981",
            boxShadow: "0 0 10px rgba(16,185,129,0.7)",
            flexShrink: 0,
          }}
          className="animate-pulse-dot"
        />
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          99.1% Uptime
        </span>
      </motion.div>

      {/* ── Decorative glow behind entire card ── */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          right: "5%",
          bottom: "10%",
          background:
            "radial-gradient(ellipse at center, rgba(27,58,107,0.12) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(30px)",
          zIndex: -1,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
