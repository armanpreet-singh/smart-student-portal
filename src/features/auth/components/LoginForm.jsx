import React, { useState, useCallback, memo } from "react";
import { useForm } from "react-hook-form";

import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
  showWarningToast,
} from "../../../components/ui/toastUtils";
import { loginWithUsername, getPortalPath } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import RoleSelector from "./RoleSelector";
import { ltsuLogo } from "../../../assets/images/logo";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react";

const PLACEHOLDERS = {
  student: "Student username",
  faculty: "Faculty username",
  admin: "Administrator username",
};

const EXPECTED_ROLES = {
  student: "STUDENT",
  faculty: "TEACHER",
  admin: "ADMIN",
};

const ROLE_LABELS = {
  STUDENT: "Student",
  TEACHER: "Faculty",
  ADMIN: "Administrator",
};

const REMEMBERED_USERNAME_KEY = "ltsu-remembered-username";
function getRememberedUsername() {
  try {
    return window.localStorage.getItem(REMEMBERED_USERNAME_KEY) || "";
  } catch {
    return "";
  }
}

const LogoMark = memo(() => (
  <div className="logo-mark" aria-hidden="true">
    <img src={ltsuLogo} alt="LTSU Logo" className="logo-image" />
  </div>
));

LogoMark.displayName = "LogoMark";

const LoginForm = () => {
  const [role, setRole] = useState("student");
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const { establishSession } = useAuth();
  const [rememberedUsername] = useState(getRememberedUsername);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      username: rememberedUsername,
      password: "",
      rememberUsername: Boolean(rememberedUsername),
    },
  });

  const onSubmit = async (data) => {
    clearErrors("root.server");

    try {
      const result = await loginWithUsername({
        username: data.username,
        password: data.password,
      });

      const destination = getPortalPath(result.user.role);
      if (!destination) {
        throw new Error(
          "This account does not have a supported LTSU portal role.",
        );
      }

      establishSession(result.accessToken, result.user);

      try {
        if (data.rememberUsername) {
          window.localStorage.setItem(
            REMEMBERED_USERNAME_KEY,
            data.username.trim(),
          );
        } else {
          window.localStorage.removeItem(REMEMBERED_USERNAME_KEY);
        }
      } catch {
        // Remembering the username is optional; a successful sign-in should continue.
      }

      if (result.user.mustChangePassword) {
        showWarningToast(
          "Password update required",
          "Your account needs a password change before protected portal services can be used.",
        );
      } else if (EXPECTED_ROLES[role] !== result.user.role) {
        showInfoToast(
          "Opening your assigned portal",
          `This account is registered as ${ROLE_LABELS[result.user.role]}. Opening that portal.`,
        );
      } else {
        showSuccessToast(
          "Sign in successful",
          `Welcome to the LTSU ${ROLE_LABELS[result.user.role]} Portal.`,
        );
      }

      navigate(destination, { replace: true });
    } catch (error) {
      const message =
        error?.message || "Unable to sign in. Please try again.";
      setError("root.server", { type: "server", message });
      showErrorToast("Sign in failed", message);
    }
  };

  const togglePw = useCallback(() => setShowPw((value) => !value), []);

  return (
    <div
      className="auth-card animate-fadeup delay-1"
      role="region"
      aria-label="Sign in form"
    >
      <div className="logo-area">
        <LogoMark />
        <div className="logo-text">
          <strong>LTSU Portal</strong>
          <span>Lamrin Tech Skills University</span>
        </div>
      </div>

      <h2 className="auth-heading">Welcome back</h2>
      <p className="auth-sub">
        Choose your portal and sign in with your university username.
      </p>

      <RoleSelector activeRole={role} onChange={setRole} />
      <p className="login-role-note">
        Your assigned portal is verified by the university server.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="login-field-group">
          <label className="field-label" htmlFor="usernameInput">
            University Username
          </label>
          <div className="login-field-wrap">
            <span className="login-field-icon" aria-hidden="true">
              <Mail size={18} strokeWidth={2} />
            </span>
            <input
              id="usernameInput"
              className="login-field-input has-icon"
              type="text"
              placeholder={PLACEHOLDERS[role]}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              aria-required="true"
              aria-invalid={Boolean(errors.username)}
              {...register("username", {
                required: "University username is required.",
                minLength: {
                  value: 3,
                  message: "Username must contain at least 3 characters.",
                },
                maxLength: {
                  value: 40,
                  message: "Username must be 40 characters or fewer.",
                },
                pattern: {
                  value: /^[a-zA-Z0-9._-]+$/,
                  message:
                    "Use only letters, numbers, dots, underscores and hyphens.",
                },
              })}
            />
          </div>
          {errors.username && (
            <p className="login-error" role="alert">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="login-field-group">
          <label className="field-label" htmlFor="passwordInput">
            Password
          </label>

          <div className="login-field-wrap">
            <span className="login-field-icon" aria-hidden="true">
              <Lock size={18} />
            </span>

            <input
              id="passwordInput"
              className="login-field-input has-icon"
              type={showPw ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-required="true"
              aria-invalid={Boolean(errors.password)}
              {...register("password", {
                required: "Password is required.",
                validate: (value) =>
                  new TextEncoder().encode(value).length <= 72 ||
                  "Password must not exceed 72 UTF-8 bytes.",
              })}
            />

            <button
              type="button"
              className="pw-toggle"
              onClick={togglePw}
              aria-label={showPw ? "Hide password" : "Show password"}
              aria-pressed={showPw}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.password && (
            <p className="login-error" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="login-form-row">
          <label className="login-checkbox-wrap">
            <input
              type="checkbox"
              id="rememberUsername"
              {...register("rememberUsername")}
            />
            <span>Remember username</span>
          </label>

          <button
            type="button"
            className="login-forgot-link login-forgot-link-button"
            onClick={() =>
              showInfoToast(
                "Password reset",
                "Password resets are managed by your university administrator.",
              )
            }
          >
            Forgot password?
          </button>
        </div>

        {errors.root?.server && (
          <p className="login-error login-server-error" role="alert">
            {errors.root.server.message}
          </p>
        )}

        <button
          type="submit"
          className="login-btn-primary"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          <span>{isSubmitting ? "Signing in…" : "Access Portal"}</span>
          {!isSubmitting && (
            <span className="btn-arrow" aria-hidden="true">
              <ArrowRight size={18} strokeWidth={2.5} />
            </span>
          )}
        </button>
      </form>

      <div className="login-divider">
        <div className="login-divider-line" />
        <span>or</span>
        <div className="login-divider-line" />
      </div>

      <button
        type="button"
        className="login-btn-secondary"
        onClick={() => navigate("/")}
        aria-label="Return to LTSU home page"
      >
        <ArrowLeft size={18} strokeWidth={2.5} />
        <span>Back to Home</span>
      </button>
    </div>
  );
};

export default memo(LoginForm);
