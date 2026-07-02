import toast from "react-hot-toast";
import Toast from "./Toast";

export const showSuccessToast = (title, message) => {
  toast.custom((t) => (
<Toast
  type="success"
  title={title}
  message={message}
  toastId={t.id}
/>
  ),{
     duration: 4000,
  });
};

export const showErrorToast = (title, message) => {
  toast.custom((t) => (
<Toast
  type="error"
  title={title}
  message={message}
  toastId={t.id}
/>
  ),{
     duration: 4000,
  });
};

export const showWarningToast = (title, message) => {
  toast.custom((t) => (
<Toast
  type="warning"
  title={title}
  message={message}
  toastId={t.id}
/>
  ),{
     duration: 4000,
  });
};

export const showInfoToast = (title, message) => {
  toast.custom((t) => (
    <Toast
      type="info"
      title={title}
      message={message}
  toastId={t.id}
    />
  ),{
     duration: 4000,  
  });
};