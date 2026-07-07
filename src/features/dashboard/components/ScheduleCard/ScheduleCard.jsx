import React, { memo } from 'react';
import { motion } from 'framer-motion';

const ScheduleCard = memo(({ time, subject, faculty, room, type, isCurrent }) => (
  <motion.div className={`d-schedule-card ${isCurrent ? 'current' : ''}`} initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>
    <div className="d-schedule-time">
      <p className="d-time-text">{time}</p>
      {isCurrent && <div className="d-current-indicator"></div>}
    </div>
    <div className="d-schedule-content">
      <h4>{subject}</h4>
      <p>{faculty} • {room}</p>
      <span className={`d-type-badge ${type.toLowerCase()}`}>{type}</span>
    </div>
  </motion.div>
));

export default ScheduleCard;