import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, LogOut, ShieldCheck } from "lucide-react";

import {
  changeCurrentPassword,
  getPortalPath,
} from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { ltsuLogo } from "../../../assets/images/logo";
import FeaturePanel from "../components/FeaturePanel";
import {
  showErrorToast,
  showSuccessToast,
} from "../../../components/ui/toastUtils";

import "./LoginPage.css";
import "./PasswordChangePage.css";

function passwordByteLength(value) {
  return new TextEncoder().encode(value).length;
}

function PasswordField({
  id,
  label,
  autoComplete,
  visible,
  onToggle,
  error,
  registerProps,
}) {
  return (
    <div className="login-field-group">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="login-field-wrap">
        <span className="login-field-icon" aria-hidden="true">
          <Lock size={18} />
        </span>
        <input
          id={id}
          className="login-field-input has-icon"
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...registerProps}
        />
        <button
          type="button"
          className="pw-toggle"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p className="login-error" id={`${id}-error`} role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

export default function PasswordChangePage({ theme = "light" }) {
  const navigate = useNavigate();
  const { accessToken, user, refreshCurrentUser, logout } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values) => {
    clearErrors();

    try {
      const updatedUser = await changeCurrentPassword(accessToken, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (user?.id && updatedUser.id !== user.id) {
        throw new Error(
          "The password service returned a different account. Please sign out and contact support.",
        );
      }

      const verifiedUser = await refreshCurrentUser();
      if (!verifiedUser) {
        return;
      }

      if (verifiedUser.mustChangePassword) {
        const message =
          "The server has not yet confirmed completion of the required password change. Please retry.";
        setError("root.server", { type: "server", message });
        showErrorToast("Password change not confirmed", message);
        return;
      }

      const destination = getPortalPath(verifiedUser.role);
      if (!destination) {
        logout();
        return;
      }

      showSuccessToast(
        "Password updated",
        "Your new password is confirmed. Your LTSU portal is now available.",
      );
      navigate(destination, { replace: true });
    } catch (error) {
      if (error?.status === 401) {
        showErrorToast(
          "Session expired",
          "Please sign in again before changing your password.",
        );
        logout();
        return;
      }

      const details = Array.isArray(error?.details) ? error.details : [];
      let mappedFieldError = false;

      details.forEach((detail) => {
        if (
          ["currentPassword", "newPassword"].includes(detail?.field) &&
          detail?.message
        ) {
          setError(detail.field, {
            type: "server",
            message: detail.message,
          });
          mappedFieldError = true;
        }
      });

      const message =
        error?.message || "Unable to change your password. Please try again.";

      if (!mappedFieldError) {
        setError("root.server", { type: "server", message });
      }
      showErrorToast("Password not changed", message);
    }
  };

  const currentPassword = watch("currentPassword", "");
  const newPassword = watch("newPassword", "");

  return (
    <main className={`login-root ${theme} password-change-root`}>
      <FeaturePanel />

      <section className="panel-right">
        <div className="right-bg-circle rbc1" aria-hidden="true" />
        <div className="right-bg-circle rbc2" aria-hidden="true" />

        <div
          className="auth-card password-change-card animate-fadeup delay-1"
          role="region"
          aria-label="Required password change"
        >
          <div className="logo-area">
            <div className="logo-mark" aria-hidden="true">
              <img src={ltsuLogo} alt="" className="logo-image" />
            </div>
            <div className="logo-text">
              <strong>LTSU Portal</strong>
              <span>Lamrin Tech Skills University</span>
            </div>
          </div>

          <div className="password-change-badge">
            <ShieldCheck size={17} aria-hidden="true" />
            <span>Account security required</span>
          </div>

          <h1 className="auth-heading">Create a new password</h1>
          <p className="auth-sub password-change-subtitle">
            {user?.fullName
              ? `Welcome, ${user.fullName}. Your account needs a new password before you can continue.`
              : "Your account needs a new password before you can continue."}
          </p>

          <div className="password-change-policy">
            Use at least 12 characters and no more than 72 UTF-8 bytes. Your
            new password must be different from your current password.
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <PasswordField
              id="currentPassword"
              label="Current temporary password"
              autoComplete="current-password"
              visible={showCurrentPassword}
              onToggle={() => setShowCurrentPassword((value) => !value)}
              error={errors.currentPassword}
              registerProps={register("currentPassword", {
                required: "Enter your current password.",
                validate: (value) =>
                  passwordByteLength(value) <= 72 ||
                  "Password must not exceed 72 UTF-8 bytes.",
              })}
            />

            <PasswordField
              id="newPassword"
              label="New password"
              autoComplete="new-password"
              visible={showNewPassword}
              onToggle={() => setShowNewPassword((value) => !value)}
              error={errors.newPassword}
              registerProps={register("newPassword", {
                required: "Enter a new password.",
                minLength: {
                  value: 12,
                  message: "New password must be at least 12 characters long.",
                },
                validate: {
                  byteLimit: (value) =>
                    passwordByteLength(value) <= 72 ||
                    "Password must not exceed 72 UTF-8 bytes.",
                  different: (value) =>
                    value !== currentPassword ||
                    "Choose a password different from your current password.",
                },
              })}
            />

            <PasswordField
              id="confirmPassword"
              label="Confirm new password"
              autoComplete="new-password"
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((value) => !value)}
              error={errors.confirmPassword}
              registerProps={register("confirmPassword", {
                required: "Confirm your new password.",
                validate: (value) =>
                  value === getValues("newPassword") ||
                  "The passwords do not match.",
              })}
            />

            {errors.root?.server && (
              <p className="login-error password-change-server-error" role="alert">
                {errors.root.server.message}
              </p>
            )}

            <button
              type="submit"
              className="login-btn-primary"
              disabled={isSubmitting || !accessToken}
              aria-busy={isSubmitting}
            >
              <span>
                {isSubmitting ? "Updating password…" : "Update password"}
              </span>
              {!isSubmitting && (
                <span className="btn-arrow" aria-hidden="true">
                  <ShieldCheck size={18} />
                </span>
              )}
            </button>
          </form>

          <button
            type="button"
            className="login-btn-secondary password-change-signout"
            onClick={logout}
            disabled={isSubmitting}
          >
            <LogOut size={17} />
            <span>Sign out</span>
          </button>

          <p className="password-change-footnote">
            Your Student, Teacher or Admin dashboard remains locked until the
            university server confirms this update.
          </p>
        </div>
      </section>
    </main>
  );
}
