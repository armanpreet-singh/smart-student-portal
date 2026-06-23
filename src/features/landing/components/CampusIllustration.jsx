export default function CampusIllustration({ type, color }) {
  const map = {
    students: (
      <svg viewBox="0 0 100 100" width="64" height="64">
        <circle cx="50" cy="30" r="15" fill={`${color}25`} stroke={color} strokeWidth="1.5"/>
        <path d="M25 80 Q50 58 75 80" fill={`${color}15`} stroke={color} strokeWidth="1.5"/>
        <circle cx="30" cy="45" r="8" fill={`${color}20`}/>
        <circle cx="70" cy="45" r="8" fill={`${color}20`}/>
        <rect x="42" y="55" width="16" height="4" rx="2" fill={color} opacity="0.45"/>
        <path d="M36 68 L50 58 L64 68" fill="none" stroke={color} strokeWidth="1.5"/>
      </svg>
    ),
    faculty: (
      <svg viewBox="0 0 100 100" width="64" height="64">
        <rect x="15" y="18" width="70" height="64" rx="7" fill={`${color}10`} stroke={color} strokeWidth="1.5"/>
        <rect x="25" y="35" width="50" height="4" rx="2" fill={color} opacity="0.4"/>
        <rect x="25" y="47" width="38" height="4" rx="2" fill={color} opacity="0.3"/>
        <rect x="25" y="59" width="43" height="4" rx="2" fill={color} opacity="0.35"/>
        <circle cx="50" cy="24" r="6" fill={`${color}35`}/>
        <path d="M44 24 L50 18 L56 24" fill="none" stroke={color} strokeWidth="1.2"/>
      </svg>
    ),
    labs: (
      <svg viewBox="0 0 100 100" width="64" height="64">
        <rect x="12" y="45" width="76" height="45" rx="6" fill={`${color}10`} stroke={color} strokeWidth="1.5"/>
        <rect x="20" y="55" width="18" height="14" rx="3" fill={`${color}30`}/>
        <rect x="41" y="55" width="18" height="14" rx="3" fill={`${color}30`}/>
        <rect x="62" y="55" width="18" height="14" rx="3" fill={`${color}30`}/>
        <path d="M15 45 L50 18 L85 45" fill={`${color}18`} stroke={color} strokeWidth="1.5"/>
        <rect x="42" y="72" width="16" height="18" rx="2" fill={`${color}35`}/>
      </svg>
    ),
    innovation: (
      <svg viewBox="0 0 100 100" width="64" height="64">
        <circle cx="50" cy="48" r="25" fill={`${color}10`} stroke={color} strokeWidth="1.5"/>
        <path d="M43 42 L50 30 L57 42 L63 48 L50 68 L37 48 Z" fill={`${color}28`} stroke={color} strokeWidth="1"/>
        <circle cx="50" cy="48" r="7" fill={`${color}45`}/>
        <line x1="50" y1="23" x2="50" y2="14" stroke={color} strokeWidth="2"/>
        <line x1="75" y1="48" x2="84" y2="48" stroke={color} strokeWidth="2"/>
        <line x1="25" y1="48" x2="16" y2="48" stroke={color} strokeWidth="2"/>
        <line x1="68" y1="30" x2="74" y2="24" stroke={color} strokeWidth="2"/>
        <line x1="32" y1="30" x2="26" y2="24" stroke={color} strokeWidth="2"/>
      </svg>
    ),
    digital: (
      <svg viewBox="0 0 100 100" width="64" height="64">
        <rect x="10" y="22" width="80" height="52" rx="6" fill={`${color}10`} stroke={color} strokeWidth="1.5"/>
        <rect x="20" y="32" width="60" height="32" rx="3" fill={`${color}18`}/>
        <polyline points="25,56 36,44 47,51 58,38 69,47 80,36" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="37" y="74" width="26" height="5" rx="2.5" fill={`${color}35`}/>
        <rect x="43" y="79" width="14" height="4" rx="2" fill={`${color}25`}/>
      </svg>
    ),
  };
  return map[type] || null;
}
