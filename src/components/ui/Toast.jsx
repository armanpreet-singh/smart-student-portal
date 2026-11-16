import { useReducedMotion, motion } from "framer-motion";
import toast from "react-hot-toast";
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
  visible = true,
  duration = 4000
}) {
  const prefersReducedMotion = useReducedMotion();
  const isError = type === "error";

  return (
    <motion.div
      className="ltsu-toast"
      data-visible={visible ? "true" : "false"}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      aria-atomic="true"
      style={{
        "--accent": COLORS[type] || COLORS.info,
        "--toast-duration": `${duration}ms`
      }}
      initial={prefersReducedMotion ? false : { opacity: 0, x: 28, scale: 0.97 }}
      animate={visible
        ? { opacity: 1, x: 0, scale: 1 }
        : { opacity: 0, x: 18, scale: 0.985 }}
      transition={prefersReducedMotion
        ? { duration: 0 }
        : {
            opacity: { duration: visible ? 0.18 : 0.14, ease: "easeOut" },
            x: { duration: visible ? 0.24 : 0.16, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: visible ? 0.24 : 0.16, ease: "easeOut" }
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
    </motion.div>
  );
}
