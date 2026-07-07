import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download } from 'lucide-react';
import DashboardCard from '../DashboardCard/DashboardCard';

const ResourceCard = memo(({ title, type, course, size }) => (
  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} whileHover={{ y: -2 }} viewport={{ once: true }}>
    <DashboardCard className="d-resource-card">
      <div className="d-res-icon"><FileText size={24} /></div>
      <div className="d-res-content">
        <h5>{title}</h5>
        <div className="d-res-meta">
          <span>{type}</span>
          <span>•</span>
          <span>{course}</span>
          <span>•</span>
          <span>{size}</span>
        </div>
      </div>
      <button className="d-res-download" aria-label="Download"><Download size={18} /></button>
    </DashboardCard>
  </motion.div>
));

export default ResourceCard;