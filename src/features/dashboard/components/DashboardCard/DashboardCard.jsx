import React, { memo } from 'react';

const DashboardCard = memo(({ children, className = '', padding = true, onClick }) => (
  <div
    className={`d-card ${onClick ? 'd-card-interactive' : ''} ${padding ? 'p-4' : ''} ${className}`}
    onClick={onClick}
    style={onClick ? { cursor: 'pointer' } : undefined}
  >
    {children}
  </div>
));

export default DashboardCard;
