import React, { memo } from 'react';
import { motion } from 'framer-motion';

const DashboardCard = memo(({ children, className = '', padding = true, onClick }) => (
  <motion.div 
    className={`d-card ${padding ? 'p-4' : ''} ${className}`}
    whileHover={onClick ? { y: -4, boxShadow: '0 12px 24px rgba(30, 58, 138, 0.12)' } : {}}
    onClick={onClick}
    style={onClick ? { cursor: 'pointer' } : {}}
  >
    {children}
  </motion.div>
));

export default DashboardCard;