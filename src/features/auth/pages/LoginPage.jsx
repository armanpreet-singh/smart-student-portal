import React, { useCallback } from 'react';
import FeaturePanel from './FeaturePanel';
import LoginForm from './LoginForm';
import './LoginPage.css';

/**
 * LoginPage
 *
 * Root layout component for the LTSU Smart Portal authentication screen.
 * Composes a 55 / 45 split between the campus feature panel (left)
 * and the authentication card (right).
 *
 * Props:
 *   onBackHome  – callback fired when the user clicks "Back to Home"
 *                 (connect to your router, e.g. navigate('/') )
 */
const LoginPage = ({ onBackHome }) => {
  const handleBackHome = useCallback(() => {
    if (onBackHome) {
      onBackHome();
    } else {
      // Default fallback – replace with your routing logic
      window.location.href = '/';
    }
  }, [onBackHome]);

  return (
    <main className="login-root">
      {/* Left – campus visual + feature highlights */}
      <FeaturePanel />

      {/* Right – auth card */}
      <section className="panel-right">
        {/* Subtle ambient circles */}
        <div className="right-bg-circle rbc1" aria-hidden="true" />
        <div className="right-bg-circle rbc2" aria-hidden="true" />

        <LoginForm onBackHome={handleBackHome} />
      </section>
    </main>
  );
};

export default LoginPage;
