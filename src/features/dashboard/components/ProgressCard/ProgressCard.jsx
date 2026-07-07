import React, { memo } from 'react';
import { motion } from "framer-motion";
const ProgressCard = memo(({ value, color = '#1E3A8A', showLabel = true }) => (
  <div className="d-progress-wrapper">
    <div className="d-progress-bar">
      <motion.div 
        className="d-progress-fill" 
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
    {showLabel && <span className="d-progress-label" style={{ color }}>{value}%</span>}
  </div>
));

export default ProgressCard;