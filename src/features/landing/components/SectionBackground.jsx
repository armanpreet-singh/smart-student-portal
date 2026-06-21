
export default function SectionBackground({
  image,
  overlayLight = "rgba(255,255,255,0.88)",
  overlayDark  = "rgba(13,5,8,0.92)",
  gradientLight,
  gradientDark,
  blur         = 0,
  position     = "center center",
  size         = "cover",
  id,
  style        = {},
  children,
  theme,
}) {
  const isDark = theme === "dark";

  const overlay = isDark
    ? (gradientDark  || overlayDark)
    : (gradientLight || overlayLight);

  return (
    <div
      id={id}
      style={{
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* ── Background Image Layer ── */}
      <div
        aria-hidden="true"
        style={{
          position:           "absolute",
          inset:              0,
          backgroundImage:    image ? `url(${image})` : "none",
          backgroundSize:     size,
          backgroundPosition: position,
          backgroundRepeat:   "no-repeat",
          backgroundAttachment: "scroll",
          filter:             blur > 0 ? `blur(${blur}px)` : "none",
          transform:          blur > 0 ? "scale(1.05)" : "none",
          zIndex:             0,
        }}
      />

      {/* ── Color / Gradient Overlay Layer ── */}
      <div
        aria-hidden="true"
        style={{
          position:   "absolute",
          inset:      0,
          background: overlay,
          zIndex:     1,
        }}
      />

      {/* ── Content Layer ── */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}