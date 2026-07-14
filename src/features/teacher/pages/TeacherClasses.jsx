import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, UserCheck, FileText } from 'lucide-react';
import SectionHeader from '../../../features/dashboard/components/SectionHeader/SectionHeader';
import DashboardCard from '../../../features/dashboard/components/DashboardCard/DashboardCard';
import ProgressCard from '../../../features/dashboard/components/ProgressCard/ProgressCard';
import QuickActionCard from '../../../features/dashboard/components/QuickActionCard/QuickActionCard';
import { teacherClassesData } from '../data/mockTeacherData';

// Helper to determine progress bar color based on attendance percentage
const getAttendanceColor = (percentage) => {
  if (percentage >= 80) return "#16A34A"; // Green
  if (percentage >= 75) return "#F59E0B"; // Yellow
  return "#DC2626"; // Red
};

const TeacherClasses = memo(() => {
  return (
    <div className="d-page-container">
      <SectionHeader 
        title="My Classes" 
        subtitle="Manage your assigned courses and sections" 
      />

      <div className="d-grid-2">
        {teacherClassesData.map((cls, index) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <DashboardCard className="d-course-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
              
              {/* Header */}
              <div className="d-course-header">
                <h4 className="d-course-name" style={{ margin: 0, fontSize: '18px' }}>{cls.name}</h4>
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: 600, 
                  color: 'var(--d-primary)', 
                  backgroundColor: 'rgba(30, 58, 138, 0.1)', 
                  padding: '4px 10px', 
                  borderRadius: '6px',
                  whiteSpace: 'nowrap'
                }}>
                  {cls.semester} • {cls.section}
                </span>
              </div>

              {/* Class Meta Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--d-text-secondary)', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={15} />
                  <span>{cls.students} Students</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={15} />
                  <span>Next: {cls.nextLecture}</span>
                </div>
              </div>

              {/* Attendance Progress */}
              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--d-text-secondary)' }}>Overall Attendance</span>
                  <span style={{ fontWeight: 700, color: getAttendanceColor(cls.attendance) }}>{cls.attendance}%</span>
                </div>
                <ProgressCard 
                  value={cls.attendance} 
                  color={getAttendanceColor(cls.attendance)} 
                  showLabel={false} 
                />
              </div>

              {/* Quick Actions */}
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                paddingTop: '16px', 
                borderTop: '1px solid var(--d-border)' 
              }}>
                <QuickActionCard icon={UserCheck} label="Attendance" color="#16A34A" />
                <QuickActionCard icon={FileText} label="Assignments" color="#1E3A8A" />
              </div>

            </DashboardCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

export default TeacherClasses;