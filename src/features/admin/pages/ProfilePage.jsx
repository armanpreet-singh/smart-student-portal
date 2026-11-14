import React, { memo } from "react";
import {
  CalendarDays,
  Info,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import { useAuth } from "../../auth/context/AuthContext";

import "./ProfilePage.css";

function formatAccountDate(value) {
  if (typeof value !== "string" || !value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

const ProfilePage = memo(() => {
  const { user } = useAuth();
  const accountCreatedAt = formatAccountDate(user?.createdAt);
  const accountName =
    typeof user?.fullName === "string" && user.fullName.trim()
      ? user.fullName.trim()
      : "Administrator account";
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
        <DashboardCard className="a-profile-unavailable">
          <section role="status" aria-labelledby="a-profile-unavailable-title">
            <div className="a-profile-unavailable-label">
              <Info size={14} aria-hidden="true" />
              Account information unavailable
            </div>
            <h3 id="a-profile-unavailable-title">
              Your verified account details are not available
            </h3>
            <p>
              Sign in again or restore your session to view the account
              information returned by the authentication service.
            </p>
          </section>
        </DashboardCard>
      ) : (
        <>
          <DashboardCard className="a-profile-header-card" padding={false}>
            <section className="a-profile-header-content">
              <div className="a-profile-avatar" aria-hidden="true">
                <UserRound size={27} />
              </div>
              <div className="a-profile-intro">
                <h2>{accountName}</h2>
                <p className="a-profile-role">
                  {user.role === "ADMIN" ? "Administrator account" : "Verified account"}
                </p>
                {username && <p className="a-profile-username">@{username}</p>}
              </div>
            </section>
          </DashboardCard>

          <div className="a-profile-details-grid">
            <DashboardCard className="a-profile-details-card">
              <h4>Verified Account Information</h4>
              <dl className="a-profile-details-list">
                <div className="a-profile-detail">
                  <dt>
                    <UserRound size={16} aria-hidden="true" />
                    Username
                  </dt>
                  <dd>{username || "Not provided by the account service"}</dd>
                </div>
                <div className="a-profile-detail">
                  <dt>
                    <Mail size={16} aria-hidden="true" />
                    Email
                  </dt>
                  <dd>{email || "No email address is associated with this account."}</dd>
                </div>
                <div className="a-profile-detail">
                  <dt>
                    <ShieldCheck size={16} aria-hidden="true" />
                    Account role
                  </dt>
                  <dd>{user.role === "ADMIN" ? "Administrator" : user.role}</dd>
                </div>
                {accountCreatedAt && (
                  <div className="a-profile-detail">
                    <dt>
                      <CalendarDays size={16} aria-hidden="true" />
                      Account created
                    </dt>
                    <dd>{accountCreatedAt}</dd>
                  </div>
                )}
              </dl>
            </DashboardCard>

            <DashboardCard className="a-profile-unavailable">
              <section
                className="a-profile-unavailable-content"
                role="status"
                aria-labelledby="a-profile-unavailable-details-title"
              >
                <div className="a-profile-unavailable-label">
                  <Info size={14} aria-hidden="true" />
                  Additional administrator details unavailable
                </div>
                <h3 id="a-profile-unavailable-details-title">
                  Extended administrator profile is not available yet
                </h3>
                <p>
                  The current backend does not expose administrator-specific
                  profile fields or an Admin profile endpoint for employee ID,
                  department, telephone, office location, access-level labels
                  beyond the account role, or last-login activity.
                </p>
                <p>
                  These details are intentionally omitted until the university
                  provides an authoritative profile and audit contract.
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
