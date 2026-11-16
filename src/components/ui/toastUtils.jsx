import { toast } from "sonner";
import Toast from "./Toast";

const DEFAULT_DURATION = 4200;

export const showToast = (type, title, message, duration = DEFAULT_DURATION) => {
  const toastId = toast.custom((currentToastId) => (
    <Toast
      type={type}
      title={title}
      message={message}
      toastId={currentToastId}
      duration={duration}
    />
  ), {
    duration,
    position: "top-right"
  });

  return toastId;
};

export const showSuccessToast = (title, message, duration) =>
  showToast("success", title, message, duration);

export const showErrorToast = (title, message, duration) =>
  showToast("error", title, message, duration);

export const showWarningToast = (title, message, duration) =>
  showToast("warning", title, message, duration);

export const showInfoToast = (title, message, duration) =>
  showToast("info", title, message, duration);

export const showSuccessMessage = (message) =>
  showSuccessToast("Success", message);

export const showErrorMessage = (message) =>
  showErrorToast("Something went wrong", message);
