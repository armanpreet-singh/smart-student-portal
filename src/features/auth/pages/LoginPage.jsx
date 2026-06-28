
import React, { useState, useCallback, useMemo } from 'react';
import './LoginPage.css';

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round"
       strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round"
       strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
       strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round"
       strokeLinejoin="round" aria-hidden="true">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round"
       strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round"
       strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M14.12 14.12a3 3 0 01-4.24-4.24" />
  </svg>
);

const LTSULogo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none"
       aria-hidden="true" role="img">
    <rect x="2" y="2" width="44" height="44" rx="12"
          fill="url(#logo-grad)" />
    <path d="M14 32V20l10-6 10 6v12l-10 6-10-6z"
          stroke="#fff" strokeWidth="2" fill="none"
          strokeLinejoin="round" />
    <path d="M14 20l10 6 10-6" stroke="#fff" strokeWidth="2"
          fill="none" strokeLinejoin="round" />
    <line x1="24" y1="26" x2="24" y2="38" stroke="#fff"
          strokeWidth="2" />
    <circle cx="24" cy="17" r="2.5" fill="#C9A84C" />
    <defs>
      <linearGradient id="logo-grad" x1="0" y1="0" x2="48" y2="48">
        <stop stopColor="#1E4DB7" />
        <stop offset="1" stopColor="#2F6FED" />
      </linearGradient>
    </defs>
  </svg>
);

const FeatureCard = ({ text }) => (
  <div className="lp-feature-card" role="listitem">
    <span className="lp-feature-check" aria-hidden="true">
      <CheckIcon />
    </span>
    <span className="lp-feature-text">{text}</span>
  </div>
);

const ROLES = ['Student', 'Faculty', 'Administrator'];

const LoginPage = () => {
  const [isDark, setIsDark] = useState(false);
  const [activeRole, setActiveRole] = useState('Student');
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const themeClass = useMemo(
    () => `lp-root${isDark ? ' lp-dark' : ' lp-light'}`,
    [isDark]
  );

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleRoleChange = useCallback((role) => {
    setActiveRole(role);
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleBack = useCallback(() => {
    // Production: window.location.href = '/' or use router
  }, []);

  return (
    <div className={themeClass} data-theme={isDark ? 'dark' : 'light'}>
      <div className="lp-container">
        <aside className="lp-left-panel" aria-label="Portal introduction">
          <div className="lp-left-overlay" />
          <div className="lp-orb lp-orb--1" aria-hidden="true" />
          <div className="lp-orb lp-orb--2" aria-hidden="true" />
          <div className="lp-orb lp-orb--3" aria-hidden="true" />

          <div className="lp-left-content">
            <h1 className="lp-left-heading">Welcome Back</h1>
            <p className="lp-left-subtitle">Access your Smart Student Portal</p>
            <ul className="lp-feature-list" role="list">
              <FeatureCard text="Attendance Tracking" />
              <FeatureCard text="Academic Dashboard" />
              <FeatureCard text="Assignments & Results" />
            </ul>
            <p className="lp-left-footer">Lamrin Tech Skills University</p>
          </div>
        </aside>

        <main className="lp-right-panel" role="main">
          <button
            className="lp-theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            type="button"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          <div className="lp-card">
            <div className="lp-card-header">
              <LTSULogo />
              <h2 className="lp-card-title">Login</h2>
              <p className="lp-card-welcome">Welcome to LTSU Smart Portal</p>
            </div>

            <div className="lp-role-selector" role="radiogroup" aria-label="Select your role">
              {ROLES.map(role => (
                <button
                  key={role}
                  type="button"
                  role="radio"
                  aria-checked={activeRole === role}
                  className={`lp-role-btn${activeRole === role ? ' lp-role-btn--active' : ''}`}
                  onClick={() => handleRoleChange(role)}
                >
                  {role}
                </button>
              ))}
            </div>

            <form className="lp-form" onSubmit={handleSubmit} noValidate>
              <div className="lp-field">
                <label htmlFor="lp-identifier" className="lp-label">Email / University ID</label>
                <div className="lp-input-wrap">
                  <input
                    id="lp-identifier"
                    type="text"
                    className="lp-input"
                    placeholder="Enter your email or ID"
                    value={formData.identifier}
                    onChange={e => updateField('identifier', e.target.value)}
                    autoComplete="username"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="lp-field">
                <label htmlFor="lp-password" className="lp-label">Password</label>
                <div className="lp-input-wrap lp-input-wrap--has-action">
                  <input
                    id="lp-password"
                    type={showPassword ? 'text' : 'password'}
                    className="lp-input lp-input--with-toggle"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={e => updateField('password', e.target.value)}
                    autoComplete="current-password"
                    required
                    aria-required="true"
                  />
                  <button
                    type="button"
                    className="lp-pw-toggle"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={0}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="lp-options-row">
                <label className="lp-checkbox-label">
                  <input
                    type="checkbox"
                    className="lp-checkbox"
                    checked={formData.rememberMe}
                    onChange={e => updateField('rememberMe', e.target.checked)}
                  />
                  <span className="lp-checkbox-custom" aria-hidden="true" />
                  <span className="lp-checkbox-text">Remember Me</span>
                </label>
                <a href="#forgot" className="lp-forgot-link" onClick={e => e.preventDefault()}>Forgot Password?</a>
              </div>

              <button type="submit" className="lp-btn-primary">Login to Portal</button>
              <button type="button" className="lp-btn-secondary" onClick={handleBack}>
                <ArrowLeftIcon />
                <span>Back to Home</span>
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;