import toast from "react-hot-toast";
import Toast from "./Toast";

export const showSuccessToast = (title, message) => {
  toast.custom(() => (
    <Toast
      type="success"
      title={title}
      message={message}
    />
  ));
};

export const showErrorToast = (title, message) => {
  toast.custom(() => (
    <Toast
      type="error"
      title={title}
      message={message}
    />
  ));
};

export const showWarningToast = (title, message) => {
  toast.custom(() => (
    <Toast
      type="warning"
      title={title}
      message={message}
    />
  ));
};

export const showInfoToast = (title, message) => {
  toast.custom(() => (
    <Toast
      type="info"
      title={title}
      message={message}
    />
  ));
};