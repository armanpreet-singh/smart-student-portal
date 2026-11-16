import { toast } from "sonner";
import { X } from "lucide-react";
import { ltsuLogo } from "../../assets/images/logo";
import "./Toast.css";

const COLORS = {
  success: "#16A34A",
  error: "#DC2626",
  warning: "#D97706",
  info: "#2563EB"
};

export default function Toast({
  type = "info",
  title,
  message,
  toastId,
  duration = 4200
}) {
  const isError = type === "error";

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
        <div className="toast-logo" aria-hidden="true">
          <img src={ltsuLogo} alt="" />
        </div>

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
          <X size={17} />
        </button>
      </div>

      <div className="toast-progress" aria-hidden="true">
        <div className="toast-progress-fill" />
      </div>
    </div>
  );
}
