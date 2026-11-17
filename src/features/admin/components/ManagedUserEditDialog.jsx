import React, { useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, Pencil, X } from "lucide-react";
import { fetchActiveStudentClassOptions, getRollNumberInputError } from "../api/adminStudentProvisioningApi";
import { updateAdminManagedUser } from "../api/adminManagedUsersApi";
import "./ManagedUserEditDialog.css";

const EMPTY_FORM = {
  fullName: "",
  username: "",
  email: "",
  rollNumber: "",
  classId: ""
};

export default function ManagedUserEditDialog({
  account,
  role,
  accessToken,
  onClose,
  onSaved,
  onUnauthorized
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const [status, setStatus] = useState("idle");
  const [classOptions, setClassOptions] = useState([]);
  const [classStatus, setClassStatus] = useState("idle");
  const firstInputRef = useRef(null);

  const isOpen = Boolean(account);
  const isStudent = role === "STUDENT";

  useEffect(() => {
    if (!account) return;
    setForm({
      fullName: account.fullName || "",
      username: account.username || "",
      email: account.email || "",
      rollNumber: account.rollNumber || "",
      classId: account.classId || ""
    });
    setFieldErrors({});
    setRequestError("");
    setStatus("idle");
    setClassOptions([]);
    setClassStatus(isStudent ? "loading" : "idle");
  }, [account, isStudent]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousFocus = document.activeElement;
    const focusId = window.requestAnimationFrame(() => firstInputRef.current?.focus());
    const onKeyDown = (event) => {
      if (event.key === "Escape" && status !== "saving") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusId);
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus?.();
    };
  }, [isOpen, onClose, status]);

  useEffect(() => {
    if (!isOpen || !isStudent || !accessToken) return undefined;
    let active = true;
    setClassStatus("loading");
    fetchActiveStudentClassOptions(accessToken)
      .then((options) => {
        if (!active) return;
        setClassOptions(options);
        setClassStatus("success");
      })
      .catch(async (error) => {
        if (!active) return;
        if (error?.status === 401) await onUnauthorized?.();
        if (!active) return;
        setClassStatus("error");
      });
    return () => { active = false; };
  }, [accessToken, isOpen, isStudent, onUnauthorized]);

  const availableClasses = useMemo(() => {
    if (!account?.class || classOptions.some((item) => item.id === account.class.id)) {
      return classOptions;
    }
    return [account.class, ...classOptions];
  }, [account, classOptions]);

  if (!account) return null;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setRequestError("");
  };

  const validate = () => {
    const errors = {};
    const fullName = form.fullName.trim();
    const username = form.username.trim();
    const email = form.email.trim();

    if (fullName.length < 2 || fullName.length > 120) {
      errors.fullName = "Full name must be between 2 and 120 characters.";
    }
    if (username.length < 3 || username.length > 40 || !/^[a-zA-Z0-9._-]+$/.test(username)) {
      errors.username = "Use 3–40 characters: letters, numbers, dots, underscores or hyphens.";
    }
    if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      errors.email = "Enter a valid email address.";
    }
    if (isStudent) {
      const rollNumberError = getRollNumberInputError(form.rollNumber);
      if (rollNumberError) errors.rollNumber = rollNumberError;
    }
    return errors;
  };

  const save = async (event) => {
    event.preventDefault();
    setRequestError("");
    const errors = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setStatus("saving");
    try {
      const updated = await updateAdminManagedUser(accessToken, role, account.id, form);
      onSaved?.(updated);
    } catch (error) {
      if (error?.status === 401) await onUnauthorized?.();
      setFieldErrors(error?.fieldErrors || {});
      setRequestError(error?.message || "Unable to update this account.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div
      className="a-managed-edit-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && status !== "saving") onClose();
      }}
    >
      <section
        className="a-managed-edit-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="a-managed-edit-title"
        aria-describedby="a-managed-edit-description"
      >
        <header className="a-managed-edit-heading">
          <div className="a-managed-edit-heading-icon"><Pencil size={18}/></div>
          <div className="a-managed-edit-title-copy">
            <h2 id="a-managed-edit-title">Edit {isStudent ? "Student" : "Teacher"} account</h2>
            <p id="a-managed-edit-description">
              Update profile details for {account.fullName}. Account role, password and activation status are managed separately.
            </p>
          </div>
          <button type="button" className="a-managed-edit-close" onClick={onClose} disabled={status === "saving"} aria-label="Close edit account form">
            <X size={18}/>
          </button>
        </header>

        <form onSubmit={save} noValidate>
          <div className="a-managed-edit-fields">
            <label>
              <span>Full name</span>
              <input ref={firstInputRef} value={form.fullName} maxLength={120} autoComplete="name"
                onChange={(event) => updateField("fullName", event.target.value)}
                aria-invalid={Boolean(fieldErrors.fullName)} required/>
              {fieldErrors.fullName && <small role="alert">{fieldErrors.fullName}</small>}
            </label>
            <label>
              <span>Username</span>
              <input value={form.username} minLength={3} maxLength={40} autoComplete="off"
                onChange={(event) => updateField("username", event.target.value)}
                aria-invalid={Boolean(fieldErrors.username)} required/>
              <small>Changing the username changes the account's sign-in name.</small>
              {fieldErrors.username && <small role="alert">{fieldErrors.username}</small>}
            </label>
            <label>
              <span>Email <em>Optional</em></span>
              <input type="email" value={form.email} maxLength={254} autoComplete="email"
                onChange={(event) => updateField("email", event.target.value)}
                aria-invalid={Boolean(fieldErrors.email)}/>
              {fieldErrors.email && <small role="alert">{fieldErrors.email}</small>}
            </label>

            {isStudent && (
              <>
                <label>
                  <span>Official roll number <em>Optional</em></span>
                  <input value={form.rollNumber} maxLength={40} autoComplete="off"
                    onChange={(event) => updateField("rollNumber", event.target.value)}
                    aria-invalid={Boolean(fieldErrors.rollNumber)}
                    placeholder="e.g. 00CSE/0123"/>
                  <small>Leading zeroes are preserved. The saved value is uppercase.</small>
                  {fieldErrors.rollNumber && <small role="alert">{fieldErrors.rollNumber}</small>}
                </label>
                <label className="a-managed-edit-class-field">
                  <span>Class <em>Optional</em></span>
                  <select value={form.classId} disabled={classStatus === "loading" || classStatus === "error"}
                    onChange={(event) => updateField("classId", event.target.value)}>
                    <option value="">No class assigned</option>
                    {availableClasses.map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.code} — {item.name}{!item.isActive && item.id === account.classId ? " (current class; inactive)" : ""}
                      </option>
                    ))}
                  </select>
                  {classStatus === "loading" && <small>Loading active classes…</small>}
                  {classStatus === "success" && <small>Only active classes can be newly assigned.</small>}
                  {classStatus === "error" && <small>Active classes could not be loaded. The current class assignment will be retained.</small>}
                  {fieldErrors.classId && <small role="alert">{fieldErrors.classId}</small>}
                </label>
              </>
            )}
          </div>

          {requestError && <p className="a-managed-edit-error" role="alert">{requestError}</p>}
          <footer className="a-managed-edit-actions">
            <button type="button" className="a-managed-edit-cancel" onClick={onClose} disabled={status === "saving"}>Cancel</button>
            <button type="submit" className="d-btn-primary" disabled={status === "saving"}>
              {status === "saving" ? <LoaderCircle size={16} className="a-managed-edit-spin"/> : <CheckIcon/>}
              {status === "saving" ? "Saving changes…" : "Save changes"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function CheckIcon() {
  return <span className="a-managed-edit-check" aria-hidden="true">✓</span>;
}
