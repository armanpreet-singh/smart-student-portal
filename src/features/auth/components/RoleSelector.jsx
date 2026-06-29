import React, { memo, useCallback } from 'react';
import {
  GraduationCap,
  UserRoundCog,
  ShieldCheck,
} from "lucide-react";


const ROLES = [
  {
    id: "student",
    label: "Student",
    icon: GraduationCap,
  },
  {
    id: "faculty",
    label: "Faculty",
    icon: UserRoundCog,
  },
  {
    id: "admin",
    label: "Administrator",
    icon: ShieldCheck,
  },
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
        <span className="r-icon" aria-hidden="true">
  <role.icon
    size={20}
    strokeWidth={2.2}
    color={activeRole === role.id ? "#C9A84C" : "#64748B"}
  />
</span>
          <span className="r-label">{role.label}</span>
        </button>
      ))}
    </div>
  );
};

export default memo(RoleSelector);
