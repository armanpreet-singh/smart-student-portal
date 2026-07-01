import "./Toast.css";
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
  type = "success",
  title,
  message,
  onClose,
}) {
  return (
    <div
      className="ltsu-toast"
      style={{
        "--accent": COLORS[type],
      }}
    >
      {/* Header */}
      <div className="toast-header">
        <div className="toast-brand">
          <img
            src={ltsuLogo}
            alt="LTSU"
            className="toast-logo"
          />
          <span>LTSU Portal</span>
        </div>

        <button
          className="toast-close"
          onClick={onClose}
        >
          <X size={16} />
        </button>
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