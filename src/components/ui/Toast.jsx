import "./Toast.css";
import toast from "react-hot-toast";
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { ltsuLogo } from "../../assets/images/logo";

const ICONS = {
  success: <CheckCircle2 size={20} />,
  error: <XCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />,
};

const COLORS = {
  success: "#16A34A",
  error: "#DC2626",
  warning: "#D97706",
  info: "#2563EB",
};

export default function Toast({
  type,
  title,
  message,
  toastId,
}) {
  return (
    <div
      className="ltsu-toast"
      style={{
        "--accent": COLORS[type],
      }}
    >
      {/* Header */}
     <div className="toast-brand">
  <div className="toast-logo">
    <img src={ltsuLogo} alt="LTSU" />
  </div>

  <div className="toast-brand-text">
    <strong>LTSU Portal</strong>
    <span>Lamrin Tech Skills University</span>
  </div>
</div>

      {/* Body */}
      <div className="toast-body">
        <div className="toast-icon">
          {ICONS[type]}
        </div>

        <div className="toast-content">
          <h4>{title}</h4>
          <p>{message}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="toast-progress">
        <div className="toast-progress-fill" />
      </div>
    </div>
  );
}