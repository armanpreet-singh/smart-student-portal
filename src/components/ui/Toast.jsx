import "./Toast.css";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { ltsuLogo } from "../../assets/images/logo";
import { motion } from "framer-motion";



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
<motion.div
  className="ltsu-toast"
  style={{
    "--accent": COLORS[type],
  }}
  initial={{
    opacity: 0,
    x: 60,
    scale: 0.9,
  }}
  animate={{
    opacity: 1,
    x: 0,
    scale: 1,
  }}
  transition={{
    duration: 0.35,
    ease: [0.22, 1, 0.36, 1],
  }}
>
    {/* Body */}
    <div className="toast-body">

      {/* Logo */}
      <motion.div className="toast-logo">
        <img
          src={ltsuLogo}
          alt="LTSU Logo"
        />
      </motion.div>

      {/* Content */}
      <div className="toast-content">
        <h4
          style={{
            color: COLORS[type],
          }}
        >
          {title}
        </h4>

        <p>{message}</p>
      </div>

      {/* Close Button */}
      <button
        className="toast-close"
        type="button"
        onClick={() => toast.dismiss(toastId)}
        aria-label="Close notification"
      >
        <X size={18} />
      </button>

    </div>

    {/* Progress Bar */}
    <div className="toast-progress">
      <div className="toast-progress-fill" />
    </div>
  </motion.div>
);
}