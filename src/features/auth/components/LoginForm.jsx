import React, { useState, useCallback, memo } from 'react';
import RoleSelector from './RoleSelector';
import { Link, useNavigate } from "react-router-dom";   
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";


const PLACEHOLDERS = {
  student: 'Last Four Digits Of Your Roll No.',
  faculty: 'Faculty ID',
  admin:   'admin@ltsu.edu',
};

/* ── Logo SVG (memoised, renders once) ── */
const LogoMark = memo(() => (
  <div className="logo-mark" aria-hidden="true">
    <svg viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13 2L22 7V19L13 24L4 19V7L13 2Z"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M13 6L19 9.5V16.5L13 20L7 16.5V9.5L13 6Z"
        fill="rgba(201,168,76,0.7)"
      />
      <circle cx="13" cy="13" r="2.5" fill="white" />
    </svg>
  </div>
));
LogoMark.displayName = 'LogoMark';

/* ── Main form ── */
const LoginForm = () => {
  const [role, setRole]         = useState('student');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
const navigate = useNavigate();
const handleSubmit = useCallback(
  (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) return;

    if (loading) return;

    setLoading(true);

    // Temporary login
    setTimeout(() => {
      setLoading(false);

      navigate("/dashboard");
    }, 1000);
  },
  [email, password, loading, navigate]
);

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
      <p className="auth-sub">Sign in to access your academic dashboard and university services.</p>

      {/* ── Role selector ── */}
      <RoleSelector activeRole={role} onChange={setRole} />

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} noValidate>
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
              type="email"
              placeholder={PLACEHOLDERS[role]}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              aria-required="true"
            />
          </div>
        </div>

        {/* Password */}
        <div className="login-field-group">
          <label className="field-label" htmlFor="passwordInput">
            Password
          </label>
          <div className="login-field-wrap">
            <span className="login-field-icon" aria-hidden="true">
  <Lock size={18} strokeWidth={2} />
</span>
            <input
              id="passwordInput"
              className="login-field-input has-icon"
              type={showPw ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              aria-required="true"
            />
            <button
              type="button"
              className="pw-toggle"
              aria-label={showPw ? 'Hide password' : 'Show password'}
              onClick={togglePw}
            >
              {showPw ? (
  <EyeOff size={18} strokeWidth={2} />
) : (
  <Eye size={18} strokeWidth={2} />
)}
            </button>
          </div>
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
          <a href="#reset" className="login-forgot-link" aria-label="Reset your password">
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
          <span>{loading ? 'Signing in…' : 'Access Your Portal'}</span>
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
