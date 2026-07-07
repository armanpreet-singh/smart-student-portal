import React, { memo } from 'react';
import { motion } from 'framer-motion';
import DashboardCard from '../DashboardCard/DashboardCard';
import ProgressCard from '../ProgressCard/ProgressCard';

const CourseCard = memo(({ name, code, faculty, progress, color }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
    <DashboardCard className="d-course-card">
      <div className="d-course-header">
        <span className="d-course-code" style={{ color }}>{code}</span>
      </div>
      <h4 className="d-course-name">{name}</h4>
      <p className="d-course-faculty">{faculty}</p>
      <ProgressCard value={progress} color={color} />
    </DashboardCard>
  </motion.div>
));

export default CourseCard;