import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { studentData } from '../data/mockDashboardData';
import { getGreeting, getDateStr } from '../utils/formatHelpers';

const Hero = memo(() => (
  <motion.div 
    className="d-hero"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="d-hero-text">
      <p className="d-hero-greeting">{getGreeting()},</p>
      <h1 className="d-hero-name">{studentData.name}</h1>
      <div className="d-hero-meta">
        <span>{studentData.department}</span>
        <span className="d-separator">•</span>
        <span>{studentData.semester}</span>
        <span className="d-separator">•</span>
        <span>{studentData.rollNumber}</span>
      </div>
      <p className="d-hero-quote">"The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice."</p>
    </div>
    <div className="d-hero-date">
      <p className="d-date-day">{new Date().getDate()}</p>
      <p className="d-date-month">{new Date().toLocaleString('default', { month: 'short' })}</p>
      <p className="d-date-year">{new Date().getFullYear()}</p>
    </div>
  </motion.div>
));

export default Hero;