import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import SectionHeader from '../components/SectionHeader/SectionHeader';
import DashboardCard from '../components/DashboardCard/DashboardCard';
import { studentData } from '../data/mockDashboardData';

const ProfilePage = () => (
  <div className="d-page-container">
    <SectionHeader title="My Profile" subtitle="Personal and academic information" />
    <DashboardCard className="d-profile-header-card">
      <img src={studentData.avatar} alt="Profile" className="d-profile-avatar" />
      <div className="d-profile-intro">
        <h2>{studentData.name}</h2>
        <p className="d-profile-dept">{studentData.department}</p>
        <p className="d-profile-roll">{studentData.semester} • {studentData.rollNumber}</p>
      </div>
    </DashboardCard>
    <div className="d-grid-2">
      <DashboardCard>
        <h4>Contact Information</h4>
        <div className="d-contact-list">
          <div className="d-contact-item"><Mail size={18} /><span>alex.johnson@ltsu.ac.in</span></div>
          <div className="d-contact-item"><Phone size={18} /><span>+91 98765 43210</span></div>
          <div className="d-contact-item"><MapPin size={18} /><span>Hostel Block A, Room 404</span></div>
        </div>
      </DashboardCard>
      <DashboardCard>
        <h4>Academic Details</h4>
        <div className="d-contact-list">
          <div className="d-contact-item"><span className="d-label">Program:</span><span>B.Tech CSE</span></div>
          <div className="d-contact-item"><span className="d-label">Batch:</span><span>2022-2026</span></div>
          <div className="d-contact-item"><span className="d-label">Advisor:</span><span>Dr. Smith</span></div>
        </div>
      </DashboardCard>
    </div>
  </div>
);
export default ProfilePage;