import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';
import DashboardCard from '../DashboardCard/DashboardCard';

const AnnouncementCard = memo(({ title, date, type }) => (
  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
    <DashboardCard className="d-announcement-card">
      <div className="d-ann-icon"><Megaphone size={18} /></div>
      <div className="d-ann-content">
        <h5>{title}</h5>
        <p>{date}</p>
      </div>
      <span className={`d-ann-badge ${type}`}>{type}</span>
    </DashboardCard>
  </motion.div>
));

export default AnnouncementCard;