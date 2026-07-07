import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock } from 'lucide-react';
import DashboardCard from '../DashboardCard/DashboardCard';

const AssignmentCard = memo(({ title, course, dueDate, status, priority }) => (
  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
    <DashboardCard className={`d-assignment-card ${status}`}>
      <div className="d-assignment-header">
        <span className={`d-priority-dot ${priority}`}></span>
        <span className="d-course-tag">{course}</span>
      </div>
      <h4 className="d-assignment-title">{title}</h4>
      <div className="d-assignment-footer">
        {status === 'overdue' ? <AlertCircle size={14} color="#DC2626" /> : <Clock size={14} />}
        <span className={status === 'overdue' ? 'text-danger' : ''}>{dueDate}</span>
      </div>
    </DashboardCard>
  </motion.div>
));

export default AssignmentCard;