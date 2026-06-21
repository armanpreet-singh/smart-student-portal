import { ltsuLogo } from "../../../assets/images/logo";

export default function LTSULogo({ size = "normal", showText = true }) {
  const isSmall = size === "small";
  const imgSize = isSmall ? 72 : 90;

  return (
    <div style={{
      display:    "flex",
      alignItems: "center",
      gap:        isSmall ? "14px" : "18px",
    }}>
      <img
        src={ltsuLogo}
        alt="Lamrin Tech Skills University Official Seal"
        style={{
          width:      imgSize,
          height:     imgSize,
          objectFit:  "contain",
          display:    "block",
          flexShrink: 0,
        }}
        draggable={false}
      />

      {showText && (
        <div>
          <div style={{
            fontSize:      isSmall ? "22px" : "26px",
            fontWeight:    900,
            letterSpacing: "-0.5px",
            color:         "var(--text-primary)",
            lineHeight:    1.1,
            fontFamily:    "Inter, sans-serif",
          }}>
            LTSU
          </div>
          <div style={{
            fontSize:      isSmall ? "11px" : "12px",
            fontWeight:    600,
            color:         "var(--text-muted)",
            letterSpacing: "0.8px",
            lineHeight:    1.3,
            textTransform: "uppercase",
            fontFamily:    "Inter, sans-serif",
            marginTop:     "2px",
          }}>
            University Portal
          </div>
        </div>
      )}
    </div>
  );
} 