import React, { memo } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import { adminData } from "../data/mockAdminData";
const ProfilePage = memo(() => (
  <div className="d-page-container">
    <SectionHeader title="My Profile" subtitle="Administrator information" />
    <DashboardCard className="d-profile-header-card">
      <img src={adminData.avatar} alt="Profile" className="d-profile-avatar" />
      <div className="d-profile-intro">
        <h2>{adminData.name}</h2>
        <p className="d-profile-dept">{adminData.department}</p>
        <p className="d-profile-roll">
          {adminData.role} • {adminData.employeeId}
        </p>
      </div>
    </DashboardCard>
    <div className="d-grid-2">
      <DashboardCard>
        <h4 style={{ marginBottom: "16px" }}>Contact</h4>
        <div className="d-contact-list">
          <div className="d-contact-item">
            <Mail size={18} />
            <span>admin@ltsu.ac.in</span>
          </div>
          <div className="d-contact-item">
            <Phone size={18} />
            <span>+91 1700 123456</span>
          </div>
          <div className="d-contact-item">
            <MapPin size={18} />
            <span>Admin Block, LTTSU</span>
          </div>
        </div>
      </DashboardCard>
      <DashboardCard>
        <h4 style={{ marginBottom: "16px" }}>System Role</h4>
        <div className="d-contact-list">
          <div className="d-contact-item">
            <span className="d-label">Access Level:</span>
            <span>Super Admin</span>
          </div>
          <div className="d-contact-item">
            <span className="d-label">Last Login:</span>
            <span>Today, 08:45 AM</span>
          </div>
        </div>
      </DashboardCard>
    </div>
  </div>
));
export default ProfilePage;
