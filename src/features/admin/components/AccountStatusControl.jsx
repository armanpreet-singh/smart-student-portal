import React, { useEffect, useState } from "react";
import { updateManagedAccountStatus } from "../api/adminAccountStatusApi";

import "./AccountStatusControl.css";

const AccountStatusControl = ({
  accessToken,
  account,
  actorId,
  onUpdated,
  onUnauthorized,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const nextStatus = !account.isActive;
  const actionLabel = nextStatus ? "Activate" : "Deactivate";
  const isSelf = Boolean(actorId && actorId === account.id);

  useEffect(() => {
    if (!confirmOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !submitting) {
        setConfirmOpen(false);
        setError("");
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [confirmOpen, submitting]);

  const openConfirmation = () => {
    setNotice("");
    setError("");
    setConfirmOpen(true);
  };

  const closeConfirmation = () => {
    if (submitting) return;
    setConfirmOpen(false);
    setError("");
  };

  const confirmStatusChange = async () => {
    setSubmitting(true);
    setError("");

    try {
      const updatedUser = await updateManagedAccountStatus(
        accessToken,
        account.id,
        account.role,
        nextStatus,
      );

      setConfirmOpen(false);
      setNotice(updatedUser.isActive ? "Activated" : "Deactivated");
      await onUpdated?.(updatedUser);
    } catch (requestError) {
      if (requestError?.status === 401) {
        await onUnauthorized?.();
      }
      setError(
        requestError?.message || "Unable to update this account status.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="a-account-status-control">
        <span
          className={`a-account-status-badge ${account.isActive ? "active" : "inactive"}`}
        >
          {account.isActive ? "Active" : "Inactive"}
        </span>

        {isSelf ? (
          <span className="a-account-status-self" title="You cannot change your own account status.">
            Your account
          </span>
        ) : (
          <button
            type="button"
            className="a-account-status-trigger"
            onClick={openConfirmation}
          >
            {actionLabel}
          </button>
        )}

        {notice && (
          <span className="a-account-status-notice" role="status">
            {notice}
          </span>
        )}
      </div>

      {confirmOpen && (
        <div
          className="a-account-status-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !submitting
            ) {
              closeConfirmation();
            }
          }}
        >
          <section
            className="a-account-status-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="a-account-status-title"
            aria-describedby="a-account-status-description"
          >
            <h2 id="a-account-status-title">
              {nextStatus ? "Activate account?" : "Deactivate account?"}
            </h2>
            <p id="a-account-status-description">
              {nextStatus
                ? `This will activate ${account.fullName} (${account.username}) so the account can be used again.`
                : `This will deactivate ${account.fullName} (${account.username}) and prevent the account from being used until it is reactivated.`}
            </p>

            {error && (
              <p className="a-account-status-error" role="alert">
                {error}
              </p>
            )}

            <div className="a-account-status-actions">
              <button
                type="button"
                className="a-account-status-cancel"
                onClick={closeConfirmation}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`a-account-status-confirm ${nextStatus ? "activate" : "deactivate"}`}
                onClick={confirmStatusChange}
                disabled={submitting}
              >
                {submitting ? "Saving…" : actionLabel}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default AccountStatusControl;
