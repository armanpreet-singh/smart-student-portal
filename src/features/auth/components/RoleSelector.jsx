import React, { memo, useCallback } from 'react';

const ROLES = [
  { id: 'student',   label: 'Student',       icon: '🎓' },
  { id: 'faculty',   label: 'Faculty',       icon: '👨‍🏫' },
  { id: 'admin',     label: 'Administrator', icon: '🛡️' },
];

const RoleSelector = ({ activeRole, onChange }) => {
  const handleKeyDown = useCallback(
    (e, index) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onChange(ROLES[(index + 1) % ROLES.length].id);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onChange(ROLES[(index - 1 + ROLES.length) % ROLES.length].id);
      }
    },
    [onChange]
  );

  return (
    <div
      className="role-selector"
      role="group"
      aria-label="Select your role"
    >
      {ROLES.map((role, i) => (
        <button
          key={role.id}
          type="button"
          className={`role-btn${activeRole === role.id ? ' active' : ''}`}
          aria-pressed={activeRole === role.id}
          onClick={() => onChange(role.id)}
          onKeyDown={(e) => handleKeyDown(e, i)}
        >
          <span className="r-icon" aria-hidden="true">{role.icon}</span>
          <span className="r-label">{role.label}</span>
        </button>
      ))}
    </div>
  );
};

export default memo(RoleSelector);
