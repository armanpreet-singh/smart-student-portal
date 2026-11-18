import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteAdminManagedUser } from "../api/adminManagedUsersApi";

import "./ManagedUserDeleteControl.css";

const ManagedUserDeleteControl = ({
  accessToken,
  account,
  onDeleted,
  onUnauthorized
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [typedUsername, setTypedUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const confirmationMatches = typedUsername.trim() === account.username;

  useEffect(() => {
    if (!confirmOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !submitting) closeConfirmation();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [confirmOpen, submitting]);

  const openConfirmation = () => {
    setTypedUsername("");
    setError("");
    setConfirmOpen(true);
  };

  const closeConfirmation = () => {
    if (submitting) return;
    setConfirmOpen(false);
    setTypedUsername("");
    setError("");
  };

  const confirmDeletion = async () => {
    if (!confirmationMatches || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const deletedUser = await deleteAdminManagedUser(
        accessToken,
        account.role,
        account.id
      );
      setConfirmOpen(false);
      await onDeleted?.(deletedUser);
    } catch (requestError) {
      if (requestError?.status === 401) await onUnauthorized?.();
      setError(requestError?.message || "Unable to delete this account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="a-managed-delete-trigger"
        onClick={openConfirmation}
        aria-label={`Delete ${account.fullName}`}
        title="Delete account"
      >
        <Trash2 size={14} aria-hidden="true" />
        Delete
      </button>

      {confirmOpen && (
        <div
          className="a-managed-delete-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) closeConfirmation();
          }}
        >
          <section
            className="a-managed-delete-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="a-managed-delete-title"
            aria-describedby="a-managed-delete-description"
          >
            <div className="a-managed-delete-icon" aria-hidden="true">
              <Trash2 size={20} />
            </div>
            <h2 id="a-managed-delete-title">Delete {account.role === "STUDENT" ? "student" : "teacher"} account?</h2>
            <p id="a-managed-delete-description">
              This permanently retires <strong>{account.fullName}</strong> ({account.username}) from the live portal.
              They will immediately lose access and cannot be reactivated from the directory.
            </p>
            <p className="a-managed-delete-preservation">
              Attendance, assignments, submissions, syllabus progress and other historical records will be preserved.
            </p>
            <label className="a-managed-delete-confirm-field">
              <span>Type <strong>{account.username}</strong> to confirm</span>
              <input
                type="text"
                autoComplete="off"
                autoFocus
                value={typedUsername}
                onChange={(event) => setTypedUsername(event.target.value)}
                disabled={submitting}
                aria-label="Type the account username to confirm deletion"
              />
            </label>

            {error && <p className="a-managed-delete-error" role="alert">{error}</p>}

            <div className="a-managed-delete-actions">
              <button
                type="button"
                className="a-managed-delete-cancel"
                onClick={closeConfirmation}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="a-managed-delete-confirm"
                onClick={confirmDeletion}
                disabled={!confirmationMatches || submitting}
              >
                <Trash2 size={14} aria-hidden="true" />
                {submitting ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default ManagedUserDeleteControl;
