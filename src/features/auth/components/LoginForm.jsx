import React, { useState, useCallback, memo } from "react";
import { useForm } from "react-hook-form";
import RoleSelector from "./RoleSelector";
import { ltsuLogo } from "../../../assets/images/logo";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react";

const PLACEHOLDERS = {
  student: "Last Four Digits Of Your Roll No.",
  faculty: "Faculty ID",
  admin: "admin@ltsu.edu",
};

/* ── Logo SVG (memoised, renders once) ── */
const LogoMark = memo(() => (
  <div className="logo-mark" aria-hidden="true">
    <img src={ltsuLogo} alt="LTSU Logo" className="logo-image" />
  </div>
));

LogoMark.displayName = "LogoMark";

/* ── Main form ── */
const LoginForm = () => {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });
  const navigate = useNavigate();
  const onSubmit = (data) => {
    if (loading) return;

    setLoading(true);

    console.log(data); // replace this with API call later

    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1000);
  };

  const togglePw = useCallback(() => setShowPw((v) => !v), []);

  return (
    <div
      className="auth-card animate-fadeup delay-1"
      role="region"
      aria-label="Sign in form"
    >
      {/* ── Logo ── */}
      <div className="logo-area">
        <LogoMark />
        <div className="logo-text">
          <strong>LTSU Portal</strong>
          <span>Lamrin Tech Skills University</span>
        </div>
      </div>

      <h2 className="auth-heading">Welcome back</h2>
      <p className="auth-sub">
        Sign in to access your academic dashboard and university services.
      </p>

      {/* ── Role selector ── */}
      <RoleSelector activeRole={role} onChange={setRole} />

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Email / ID */}
        <div className="login-field-group">
          <label className="field-label" htmlFor="emailInput">
            University ID
          </label>
          <div className="login-field-wrap">
            <span className="login-field-icon" aria-hidden="true">
              <Mail size={18} strokeWidth={2} />
            </span>
            <input
              id="emailInput"
              className="login-field-input has-icon"
              type="text"
              placeholder={PLACEHOLDERS[role]}
              autoComplete="username"
              aria-required="true"
              {...register("email", {
                required: "University ID is required",
              })}
            />
          </div>
          {errors.email && (
  <p className="login-error">
    {errors.email.message}
  </p>
)}
        </div>

        {/* Password */}
       <div className="login-field-group">
  <label className="field-label" htmlFor="passwordInput">
    Password
  </label>

  <div className="login-field-wrap">
    <span className="login-field-icon">
      <Lock size={18} />
    </span>

    <input
      id="passwordInput"
      className="login-field-input has-icon"
      type={showPw ? "text" : "password"}
      placeholder="Enter your password"
      autoComplete="current-password"
      {...register("password", {
        required: "Password is required",
        minLength: {
          value: 6,
          message: "Password must be at least 6 characters",
        },
      })}
    />

    <button
      type="button"
      className="pw-toggle"
      onClick={togglePw}
    >
      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>

  {errors.password && (
    <p className="login-error">
      {errors.password.message}
    </p>
  )}
</div>

        {/* Remember + Forgot */}
        <div className="login-form-row">
          <label className="login-checkbox-wrap">
            <input
              type="checkbox"
              id="rememberMe"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <a
            href="#reset"
            className="login-forgot-link"
            aria-label="Reset your password"
          >
            Forgot password?
          </a>
        </div>

        {/* Primary CTA */}
        <button
          type="submit"
          className="login-btn-primary"
          disabled={loading}
          aria-busy={loading}
        >
          <span>{loading ? "Signing in…" : "Access Portal"}</span>
          {!loading && (
            <span className="btn-arrow" aria-hidden="true">
              <ArrowRight size={18} strokeWidth={2.5} />
            </span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="login-divider">
        <div className="login-divider-line" />
        <span>or</span>
        <div className="login-divider-line" />
      </div>

      {/* Secondary CTA */}
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
