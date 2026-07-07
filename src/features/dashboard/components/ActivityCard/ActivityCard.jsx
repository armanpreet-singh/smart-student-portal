import React, { memo } from 'react';
import { motion } from 'framer-motion';

const ActivityCard = memo(({ action, detail, time }) => (
  <motion.div className="d-activity-card" initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
    <div className="d-activity-dot"></div>
    <div className="d-activity-content">
      <p className="d-activity-action">{action}</p>
      <p className="d-activity-detail">{detail}</p>
      <span className="d-activity-time">{time}</span>
    </div>
  </motion.div>
));

export default ActivityCard;