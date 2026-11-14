import React, { memo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Eye,
  EyeOff,
  Info,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import SectionHeader from "../components/SectionHeader/SectionHeader";
import DashboardCard from "../components/DashboardCard/DashboardCard";
import { changeCurrentPassword } from "../../auth/api/authApi";
import { useAuth } from "../../auth/context/AuthContext";
import {
  showErrorToast,
  showSuccessToast,
} from "../../../components/ui/toastUtils";

import "./StudentSettings.css";

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
    <div className="s-settings-field">
      <label className="s-settings-field-label" htmlFor={id}>
        {label}
      </label>
      <div className="s-settings-input-wrap">
        <input
          id={id}
          className="s-settings-input"
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...registerProps}
        />
        <button
          type="button"
          className="s-settings-password-toggle"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error && (
        <p className="s-settings-field-error" id={`${id}-error`} role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

const SettingsPage = memo(() => {
  const {
    accessToken,
    user,
    sessionStatus,
    sessionError,
    refreshCurrentUser,
    retrySession,
    logout,
  } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
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

  const currentPassword = watch("currentPassword", "");
  const newPassword = watch("newPassword", "");

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

      reset();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      const verifiedUser = await refreshCurrentUser();
      if (!verifiedUser) {
        const message =
          "Your password update was accepted, but the account session could not be refreshed. Sign in again or retry session verification.";
        setError("root.server", { type: "refresh", message });
        showErrorToast("Password updated; session refresh unavailable", message);
        return;
      }

      if (verifiedUser.id !== updatedUser.id || verifiedUser.mustChangePassword) {
        const message =
          "The password service has not yet confirmed the updated account state. Please retry session verification.";
        setError("root.server", { type: "refresh", message });
        showErrorToast("Account refresh not confirmed", message);
        return;
      }

      showSuccessToast(
        "Password updated",
        "Your password was changed and your account session was refreshed.",
      );
    } catch (error) {
      if (error?.status === 401) {
        reset();
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

  const canSubmit = Boolean(accessToken) && sessionStatus === "authenticated";

  return (
    <div className="d-page-container">
      <SectionHeader
        title="Settings"
        subtitle="Manage your account security and available preferences"
      />

      <div className="s-settings-grid">
        <DashboardCard className="s-settings-card">
          <div className="s-settings-card-heading">
            <div className="s-settings-card-icon" aria-hidden="true">
              <LockKeyhole size={20} />
            </div>
            <div>
              <h3>Change Password</h3>
              <p>Update the password for your authenticated LTSU account.</p>
            </div>
          </div>

          <div className="s-settings-password-policy">
            <ShieldCheck size={16} aria-hidden="true" />
            <p>
              Use at least 12 characters and no more than 72 UTF-8 bytes. Your
              new password must be different from your current password.
            </p>
          </div>

          {sessionStatus === "unavailable" && sessionError && (
            <div className="s-settings-session-error" role="alert">
              <p>{sessionError}</p>
              <button
                type="button"
                className="s-settings-retry"
                onClick={retrySession}
              >
                Retry account verification
              </button>
            </div>
          )}

          {sessionStatus === "restoring" && (
            <p className="s-settings-session-status" role="status">
              Verifying your account session…
            </p>
          )}

          <form
            className="s-settings-password-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <PasswordField
              id="student-current-password"
              label="Current password"
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
              id="student-new-password"
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
              id="student-confirm-password"
              label="Confirm new password"
              autoComplete="new-password"
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((value) => !value)}
              error={errors.confirmPassword}
              registerProps={register("confirmPassword", {
                required: "Confirm your new password.",
                validate: (value) =>
                  value === newPassword || "The passwords do not match.",
              })}
            />

            {errors.root?.server && (
              <p className="s-settings-form-error" role="alert">
                {errors.root.server.message}
              </p>
            )}

            <button
              type="submit"
              className="d-btn-primary s-settings-submit"
              disabled={isSubmitting || !canSubmit}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Updating password…" : "Update password"}
            </button>
          </form>
        </DashboardCard>

        <DashboardCard className="s-settings-card s-settings-info-card">
          <div className="s-settings-card-heading">
            <div className="s-settings-card-icon" aria-hidden="true">
              <Info size={20} />
            </div>
            <div>
              <h3>Account Preferences</h3>
              <p>Profile and contact settings</p>
            </div>
          </div>
          <section
            className="s-settings-unavailable"
            role="status"
            aria-labelledby="s-settings-unavailable-title"
          >
            <h4 id="s-settings-unavailable-title">
              Additional preferences are not editable yet
            </h4>
            <p>
              The current backend supports password changes, but it does not
              provide an account-profile update endpoint for display name,
              email address, phone number or other Student preferences.
            </p>
            <p>
              These fields are not saved as authoritative profile data and are
              intentionally not shown as editable until the university
              provides an authenticated update contract.
            </p>
          </section>
        </DashboardCard>
      </div>
    </div>
  );
});

export default SettingsPage;
