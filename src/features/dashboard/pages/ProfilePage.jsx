import React, { memo } from "react";
import {
  CalendarDays,
  Info,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import SectionHeader from "../components/SectionHeader/SectionHeader";
import DashboardCard from "../components/DashboardCard/DashboardCard";
import { useAuth } from "../../auth/context/AuthContext";

import "./StudentProfile.css";

function formatAccountDate(value) {
  if (typeof value !== "string" || !value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

const ProfilePage = memo(() => {
  const { user, sessionStatus, sessionError, retrySession } = useAuth();
  const accountCreatedAt = formatAccountDate(user?.createdAt);
  const accountName =
    typeof user?.fullName === "string" && user.fullName.trim()
      ? user.fullName.trim()
      : "Student account";
  const username =
    typeof user?.username === "string" ? user.username : "";
  const email =
    typeof user?.email === "string" && user.email.trim()
      ? user.email.trim()
      : null;

  return (
    <div className="d-page-container">
      <SectionHeader
        title="My Profile"
        subtitle="Account information from your verified LTSU session"
      />

      {!user ? (
        <DashboardCard className="s-profile-unavailable">
          <section role="status" aria-labelledby="s-profile-unavailable-title">
            <div className="s-profile-unavailable-label">
              <Info size={14} aria-hidden="true" />
              {sessionStatus === "restoring"
                ? "Verifying account information"
                : "Account information unavailable"}
            </div>
            <h3 id="s-profile-unavailable-title">
              {sessionStatus === "restoring"
                ? "Your LTSU account is being verified"
                : "Your verified account details are not available"}
            </h3>
            <p>
              {sessionError ||
                "Sign in or restore your session to view the account information returned by the authentication service."}
            </p>
            {sessionStatus === "unavailable" && (
              <button
                type="button"
                className="d-btn-primary s-profile-retry"
                onClick={retrySession}
              >
                Retry account verification
              </button>
            )}
          </section>
        </DashboardCard>
      ) : (
        <>
          <DashboardCard className="s-profile-header-card" padding={false}>
            <section className="s-profile-header-content">
              <div className="s-profile-avatar" aria-hidden="true">
                <UserRound size={27} />
              </div>
              <div className="s-profile-intro">
                <h2>{accountName}</h2>
                <p className="s-profile-role">
                  {user.role === "STUDENT" ? "Student account" : "Verified account"}
                </p>
                {username && <p className="s-profile-username">@{username}</p>}
              </div>
            </section>
          </DashboardCard>

          <div className="s-profile-details-grid">
            <DashboardCard className="s-profile-details-card">
              <h4>Verified Account Information</h4>
              <dl className="s-profile-details-list">
                <div className="s-profile-detail">
                  <dt>
                    <UserRound size={16} aria-hidden="true" />
                    Username
                  </dt>
                  <dd>{username || "Not provided by the account service"}</dd>
                </div>
                <div className="s-profile-detail">
                  <dt>
                    <Mail size={16} aria-hidden="true" />
                    Email
                  </dt>
                  <dd>
                    {email || "No email address is associated with this account."}
                  </dd>
                </div>
                <div className="s-profile-detail">
                  <dt>
                    <ShieldCheck size={16} aria-hidden="true" />
                    Account role
                  </dt>
                  <dd>{user.role === "STUDENT" ? "Student" : user.role}</dd>
                </div>
                {accountCreatedAt && (
                  <div className="s-profile-detail">
                    <dt>
                      <CalendarDays size={16} aria-hidden="true" />
                      Account created
                    </dt>
                    <dd>{accountCreatedAt}</dd>
                  </div>
                )}
              </dl>
            </DashboardCard>

            <DashboardCard className="s-profile-unavailable">
              <section
                className="s-profile-unavailable-content"
                role="status"
                aria-labelledby="s-profile-unavailable-details-title"
              >
                <div className="s-profile-unavailable-label">
                  <Info size={14} aria-hidden="true" />
                  Student profile details unavailable
                </div>
                <h3 id="s-profile-unavailable-details-title">
                  Additional academic and contact details are not available yet
                </h3>
                <p>
                  The current backend does not expose a Student profile endpoint
                  or verified fields for roll number, program, semester, batch,
                  telephone, residential address or academic advisor. The
                  available class ID is not a human-readable academic profile.
                </p>
                <p>
                  These details are intentionally omitted until the university
                  provides an authoritative Student profile contract.
                </p>
              </section>
            </DashboardCard>
          </div>
        </>
      )}
    </div>
  );
});

export default ProfilePage;
