import React, { memo } from 'react';
import { motion } from 'framer-motion';

const QuickActionCard = memo(({ icon: Icon, label, color }) => (
  <motion.button className="d-quick-action" whileHover={{ scale: 1.05, backgroundColor: `${color}15` }} whileTap={{ scale: 0.95 }}>
    <Icon size={20} color={color} />
    <span>{label}</span>
  </motion.button>
));

export default QuickActionCard;