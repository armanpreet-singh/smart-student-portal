import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

const ICONS = {
  success: <CheckCircle2 size={22} />,
  error: <XCircle size={22} />,
  warning: <AlertTriangle size={22} />,
  info: <Info size={22} />,
};

const COLORS = {
  success: "#16a34a",
  error: "#dc2626",
  warning: "#d97706",
  info: "#2563eb",
};

export default function Toast({
  type = "success",
  title,
  message,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",

        minWidth: "340px",
        maxWidth: "420px",

        padding: "16px 18px",

        background: "#fff",
        borderRadius: "16px",

        borderLeft: `5px solid ${COLORS[type]}`,

        boxShadow: "0 16px 40px rgba(0,0,0,.14)",

        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          color: COLORS[type],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {ICONS[type]}
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#1B3A6B",
            marginBottom: "3px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "#64748B",
            lineHeight: 1.5,
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
}