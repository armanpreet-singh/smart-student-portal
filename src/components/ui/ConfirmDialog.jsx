import React, { useEffect, useId, useRef } from "react";
import { AlertTriangle, CheckCircle2, LoaderCircle, X } from "lucide-react";
import "./ConfirmDialog.css";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel
}) {
  const titleId = useId();
  const descriptionId = useId();
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    confirmRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !busy) {
        event.preventDefault();
        onCancel?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  const Icon = tone === "danger" ? AlertTriangle : CheckCircle2;

  return (
    <div
      className="ui-confirm-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel?.();
      }}
    >
      <section
        className={`ui-confirm-dialog is-${tone}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className="ui-confirm-heading">
          <span className="ui-confirm-icon" aria-hidden="true"><Icon size={20}/></span>
          <button
            type="button"
            className="ui-confirm-close"
            onClick={onCancel}
            disabled={busy}
            aria-label="Close confirmation"
          >
            <X size={17}/>
          </button>
        </div>
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{description}</p>
        <div className="ui-confirm-actions">
          <button type="button" className="ui-confirm-cancel" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className="ui-confirm-submit"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy && <LoaderCircle size={15} className="ui-confirm-spin"/>}
            {busy ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
