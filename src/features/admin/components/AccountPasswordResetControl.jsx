import React, { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { resetManagedAccountPassword } from "../api/adminAccountPasswordResetApi";

import "./AccountPasswordResetControl.css";

const EMPTY_FORM = { temporaryPassword: "", confirmPassword: "" };

const AccountPasswordResetControl = ({
  accessToken,
  account,
  actorId,
  onUpdated,
  onUnauthorized,
}) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  const isSelf = Boolean(actorId && actorId === account.id);

  const clearForm = () => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setError("");
  };

  const closeDialog = () => {
    if (submitting) return;
    setOpen(false);
    clearForm();
  };

  useEffect(() => {
    if (!open) return undefined;
    const handleEscape = (event) => {
      if (event.key === "Escape" && !submitting) closeDialog();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, submitting]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const byteLength = new TextEncoder().encode(form.temporaryPassword).length;
    const nextErrors = {};
    if (form.temporaryPassword.length < 12) {
      nextErrors.temporaryPassword = "Use at least 12 characters.";
    } else if (byteLength > 72) {
      nextErrors.temporaryPassword = "Use no more than 72 UTF-8 bytes.";
    }
    if (form.temporaryPassword !== form.confirmPassword) {
      nextErrors.confirmPassword = "The passwords do not match.";
    }
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const updated = await resetManagedAccountPassword(
        accessToken,
        account.id,
        account.role,
        form.temporaryPassword,
        form.confirmPassword,
      );
      setOpen(false);
      clearForm();
      setNotice("Password reset; change required at next sign-in");
      await onUpdated?.(updated);
    } catch (requestError) {
      if (requestError?.status === 401) await onUnauthorized?.();
      setFieldErrors(requestError?.fieldErrors || {});
      setError(requestError?.message || "Unable to reset this account password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="a-account-password-reset-control">
        {isSelf ? (
          <span
            className="a-account-password-reset-self"
            title="You cannot reset your own account through managed-account reset."
          >
            Your account
          </span>
        ) : (
          <button
            type="button"
            className="a-account-password-reset-trigger"
            onClick={() => {
              setNotice("");
              clearForm();
              setOpen(true);
            }}
          >
            <KeyRound size={14} aria-hidden="true" />
            Reset password
          </button>
        )}
        {notice && (
          <span className="a-account-password-reset-notice" role="status">
            {notice}
          </span>
        )}
      </div>

      {open && (
        <div
          className="a-account-password-reset-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) closeDialog();
          }}
        >
          <section
            className="a-account-password-reset-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="a-account-password-reset-title"
            aria-describedby="a-account-password-reset-description"
          >
            <div className="a-account-password-reset-heading">
              <h2 id="a-account-password-reset-title">Reset managed account password?</h2>
              <p id="a-account-password-reset-description">
                Set a temporary password for {account.fullName} ({account.username}).
                They must choose a new password at their next sign-in.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <label className="a-account-password-reset-field">
                <span>Temporary password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={form.temporaryPassword}
                  onChange={(event) => updateField("temporaryPassword", event.target.value)}
                  minLength={12}
                  aria-invalid={Boolean(fieldErrors.temporaryPassword)}
                  aria-describedby="a-account-password-reset-password-help"
                  required
                />
                <small id="a-account-password-reset-password-help">
                  At least 12 characters and no more than 72 UTF-8 bytes.
                </small>
                {fieldErrors.temporaryPassword && (
                  <small role="alert">{fieldErrors.temporaryPassword}</small>
                )}
              </label>

              <label className="a-account-password-reset-field">
                <span>Confirm temporary password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(event) => updateField("confirmPassword", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  required
                />
                {fieldErrors.confirmPassword && (
                  <small role="alert">{fieldErrors.confirmPassword}</small>
                )}
              </label>

              <p className="a-account-password-reset-warning">
                Verify the account identity before continuing. The temporary password is sent only in the reset request and is not stored in the portal.
              </p>
              {error && (
                <p className="a-account-password-reset-error" role="alert">{error}</p>
              )}

              <div className="a-account-password-reset-actions">
                <button
                  type="button"
                  className="a-account-password-reset-cancel"
                  onClick={closeDialog}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="d-btn-primary" disabled={submitting}>
                  {submitting ? "Resetting password…" : "Confirm password reset"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
};

export default AccountPasswordResetControl;
