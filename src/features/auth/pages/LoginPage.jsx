import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import FeaturePanel from "../components/FeaturePanel";
import LoginForm from "../components/LoginForm";

import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleBackHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <main className="login-root">
      {/* Left Panel */}
      <FeaturePanel />

      {/* Right Panel */}
      <section className="panel-right">
        {/* Background Decorations */}
        <div className="right-bg-circle rbc1" aria-hidden="true" />
        <div className="right-bg-circle rbc2" aria-hidden="true" />

        {/* Login Form */}
    <LoginForm />
      </section>
    </main>
  );
}