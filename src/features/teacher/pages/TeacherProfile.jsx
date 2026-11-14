import React, { memo } from "react";
import { CalendarDays, Info, Mail, ShieldCheck, UserRound } from "lucide-react";

import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import { useAuth } from "../../auth/context/AuthContext";

import "./TeacherProfile.css";

function formatAccountDate(value) {
  if (typeof value !== "string" || !value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

const TeacherProfile = memo(() => {
  const { user } = useAuth();
  const accountCreatedAt = formatAccountDate(user?.createdAt);
  const accountName =
    typeof user?.fullName === "string" && user.fullName.trim()
      ? user.fullName.trim()
      : "Teacher account";
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
        <DashboardCard className="t-profile-unavailable">
          <section role="status" aria-labelledby="t-profile-unavailable-title">
            <div className="t-profile-unavailable-label">
              <Info size={14} aria-hidden="true" />
              Account information unavailable
            </div>
            <h3 id="t-profile-unavailable-title">
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
          <DashboardCard className="t-profile-header-card" padding={false}>
            <section className="t-profile-header-content">
              <div className="t-profile-avatar" aria-hidden="true">
                <UserRound size={27} />
              </div>
              <div className="t-profile-intro">
                <h2>{accountName}</h2>
                <p className="t-profile-role">
                  {user.role === "TEACHER" ? "Teacher account" : "Verified account"}
                </p>
                {username && <p className="t-profile-username">@{username}</p>}
              </div>
            </section>
          </DashboardCard>

          <div className="t-profile-details-grid">
            <DashboardCard className="t-profile-details-card">
              <h4>Verified Account Information</h4>
              <dl className="t-profile-details-list">
                <div className="t-profile-detail">
                  <dt>
                    <UserRound size={16} aria-hidden="true" />
                    Username
                  </dt>
                  <dd>{username || "Not provided by the account service"}</dd>
                </div>
                <div className="t-profile-detail">
                  <dt>
                    <Mail size={16} aria-hidden="true" />
                    Email
                  </dt>
                  <dd>{email || "No email address is associated with this account."}</dd>
                </div>
                <div className="t-profile-detail">
                  <dt>
                    <ShieldCheck size={16} aria-hidden="true" />
                    Account role
                  </dt>
                  <dd>{user.role === "TEACHER" ? "Teacher" : user.role}</dd>
                </div>
                {accountCreatedAt && (
                  <div className="t-profile-detail">
                    <dt>
                      <CalendarDays size={16} aria-hidden="true" />
                      Account created
                    </dt>
                    <dd>{accountCreatedAt}</dd>
                  </div>
                )}
              </dl>
            </DashboardCard>

            <DashboardCard className="t-profile-unavailable">
              <section
                className="t-profile-unavailable-content"
                role="status"
                aria-labelledby="t-profile-unavailable-title"
              >
                <div className="t-profile-unavailable-label">
                  <Info size={14} aria-hidden="true" />
                  Staff profile details unavailable
                </div>
                <h3 id="t-profile-unavailable-title">
                  Additional staff information is not available yet
                </h3>
                <p>
                  The current backend does not expose a Teacher staff-profile
                  endpoint or fields for employee ID, department, designation,
                  telephone, office location, experience or specialization.
                </p>
                <p>
                  These details are intentionally omitted until the university
                  provides an authoritative staff-profile contract.
                </p>
              </section>
            </DashboardCard>
          </div>
        </>
      )}
    </div>
  );
});

export default TeacherProfile;
