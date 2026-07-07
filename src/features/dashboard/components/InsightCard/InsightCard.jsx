import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const icons = { warning: AlertTriangle, danger: AlertTriangle, info: Info, success: CheckCircle };

const InsightCard = memo(({ title, desc, type }) => {
  const Icon = icons[type] || Info;
  return (
    <motion.div className={`d-insight-card ${type}`} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className="d-insight-icon">
        <Icon size={18} />
      </div>
      <div className="d-insight-content">
        <h5>{title}</h5>
        <p>{desc}</p>
      </div>
      <div className="d-insight-sparkle"><Sparkles size={14} /></div>
    </motion.div>
  );
});

export default InsightCard;