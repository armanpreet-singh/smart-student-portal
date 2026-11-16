import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle
} from "lucide-react";
import "./Toast.css";

const COLORS = {
  success: "#16A34A",
  error: "#DC2626",
  warning: "#D97706",
  info: "#2563EB"
};

const STATUS_ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
};

export default function Toast({
  type = "info",
  title,
  message,
  toastId,
  duration = 4200
}) {
  const isError = type === "error";
  const StatusIcon = STATUS_ICONS[type] || STATUS_ICONS.info;

  return (
    <div
      className="ltsu-toast"
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      aria-atomic="true"
      style={{
        "--accent": COLORS[type] || COLORS.info,
        "--toast-duration": `${duration}ms`
      }}
    >
      <div className="toast-body">
        <span className="toast-status-icon" aria-hidden="true">
          <StatusIcon size={18} strokeWidth={2.2} />
        </span>

        <div className="toast-content">
          <h4>{title}</h4>
          <p>{message}</p>
        </div>

        <button
          className="toast-close"
          type="button"
          onClick={() => toast.dismiss(toastId)}
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>

      <div className="toast-progress" aria-hidden="true">
        <div className="toast-progress-fill" />
      </div>
    </div>
  );
}
