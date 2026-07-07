import React, { memo } from 'react';

const SectionHeader = memo(({ title, subtitle, action }) => (
  <div className="d-section-header">
    <div>
      <h3 className="d-section-title">{title}</h3>
      {subtitle && <p className="d-section-subtitle">{subtitle}</p>}
    </div>
    {action && <div className="d-section-action">{action}</div>}
  </div>
));

export default SectionHeader;