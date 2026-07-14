import React, { memo } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import SectionHeader from "../../../features/dashboard/components/SectionHeader/SectionHeader";
import DashboardCard from "../../../features/dashboard/components/DashboardCard/DashboardCard";
import { teacherData } from "../data/mockTeacherData";

const TeacherProfile = memo(() => (
  <div className="d-page-container">
    <SectionHeader
      title="My Profile"
      subtitle="Personal and academic information"
    />
    <DashboardCard className="d-profile-header-card">
      <img
        src={teacherData.avatar}
        alt="Profile"
        className="d-profile-avatar"
      />
      <div className="d-profile-intro">
        <h2>{teacherData.name}</h2>
        <p className="d-profile-dept">{teacherData.department}</p>
        <p className="d-profile-roll">
          {teacherData.designation} • {teacherData.employeeId}
        </p>
      </div>
    </DashboardCard>
    <div className="d-grid-2">
      <DashboardCard>
        <h4 style={{ marginBottom: "16px" }}>Contact Information</h4>
        <div className="d-contact-list">
          <div className="d-contact-item">
            <Mail size={18} />
            <span>prof.rajan@ltsu.ac.in</span>
          </div>
          <div className="d-contact-item">
            <Phone size={18} />
            <span>+91 98765 43210</span>
          </div>
          <div className="d-contact-item">
            <MapPin size={18} />
            <span>Faculty Block B, Room 210</span>
          </div>
        </div>
      </DashboardCard>
      <DashboardCard>
        <h4 style={{ marginBottom: "16px" }}>Professional Details</h4>
        <div className="d-contact-list">
          <div className="d-contact-item">
            <span className="d-label">Experience:</span>
            <span>8 Years</span>
          </div>
          <div className="d-contact-item">
            <span className="d-label">Specialization:</span>
            <span>Databases & AI</span>
          </div>
          <div className="d-contact-item">
            <span className="d-label">Advisor:</span>
            <span>HOD - CSE</span>
          </div>
        </div>
      </DashboardCard>
    </div>
  </div>
));
export default TeacherProfile;
