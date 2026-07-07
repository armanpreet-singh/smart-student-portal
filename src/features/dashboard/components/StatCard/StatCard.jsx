import React, { memo } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

const StatCard = memo(({ title, value, icon, trend, color }) => {
  const IconComponent = Icons[icon];
  return (
    <motion.div className="d-stat-card" whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(30, 58, 138, 0.12)' }}>
      <div className="d-stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
        {IconComponent && <IconComponent size={24} />}
      </div>
      <div className="d-stat-content">
        <p className="d-stat-title">{title}</p>
        <h2 className="d-stat-value">{value}</h2>
      </div>
      <span className="d-stat-trend">{trend}</span>
    </motion.div>
  );
});

export default StatCard;