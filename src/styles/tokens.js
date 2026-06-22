// ─────────────────────────────────────────────────────────────
// LTSU BRAND TOKENS — Real data from ltsu.ac.in
// Brand Colors extracted from official LTSU seal logo:
//   Navy Blue  #1B3A6B
//   Gold       #C9A84C
// ─────────────────────────────────────────────────────────────

export const BRAND = {
  name:             "Lamrin Tech Skills University",
  shortName:        "LTSU",
  tagline:          "Enlightenment to Empowerment",
  subTagline:       "India's Premier Tech Skills University",
  website:          "https://www.ltsu.ac.in/",
  location:         "Rupnagar (Ropar) District, Punjab — 144533",
  phone:            "+91-172-5055500",
  email:            "info@ltsu.ac.in",
  admissionsEmail:  "admissions@ltsu.ac.in",
  ugcRecognition:   "UGC Recognized · State Private University · Punjab 2021",
  established:      "2021",
};

// Real colors from LTSU official circular seal logo
export const COLORS = {
  primary:      "#1B3A6B",   // Navy Blue  (from LTSU seal)
  primaryLight: "#2A52A0",   // Lighter navy
  primaryDark:  "#0F2247",   // Darker navy
  accent:       "#C9A84C",   // Gold       (from LTSU seal)
  accentLight:  "#F0C96B",   // Light gold
  accentDark:   "#A07830",   // Dark gold
  white:        "#ffffff",
  success:      "#10b981",
  warning:      "#f59e0b",
  error:        "#ef4444",
  purple:       "#8b5cf6",
};

export const DEPARTMENTS = [
  "School of Engineering & Technology",
  "School of  Physical Education & Sports",
  "School of Management Studies",
  "School of Law",
  "School of Pharmacy",
  "School of Polytechnic",
  "School of Education",
  "School of Nursing",
  "School of Architecture & Design",
  "School of Hotel Management",
  "School of Media & Communication",
  "School of Science",
];

export const MODULE_CONFIGS = [
  {
    id:          "student",
    icon:        "graduation",
    title:       "Student Portal",
    color:       "#1B3A6B",
    gradient:    "linear-gradient(135deg, #0F2247, #1B3A6B)",
    description: "Complete academic management for LTSU students with real-time updates on attendance, results, and course materials.",
    features: [
      { icon: "clock",        label: "Attendance Tracking"  },
      { icon: "fileText",     label: "Academic Records"     },
      { icon: "calendar",     label: "Class Timetable"      },
      { icon: "award",        label: "Exam Results"         },
      { icon: "tag",          label: "Fee Information"      },
      { icon: "book",         label: "Course Registration"  },
    ],
  },
  {
    id:          "faculty",
    icon:        "users",
    title:       "Faculty Portal",
    color:       "#C9A84C",
    gradient:    "linear-gradient(135deg, #A07830, #C9A84C)",
    description: "Streamlined tools for LTSU faculty to manage classes, assessments, and monitor student academic progress.",
    features: [
      { icon: "clock",          label: "Attendance Management" },
      { icon: "trendingUp",     label: "Performance Tracking"  },
      { icon: "fileText",       label: "Assignment Upload"     },
      { icon: "calendar",       label: "Timetable View"        },
      { icon: "barChart",       label: "Internal Assessment"   },
      { icon: "messageSquare",  label: "Student Messaging"     },
    ],
  },
  {
    id:          "admin",
    icon:        "settings",
    title:       "Administration Portal",
    color:       "#0F2247",
    gradient:    "linear-gradient(135deg, #060e1f, #0F2247)",
    description: "Comprehensive administrative control with complete university oversight for LTSU admin staff.",
    features: [
      { icon: "database", label: "Student Database"    },
      { icon: "users",    label: "Faculty Management"  },
      { icon: "barChart", label: "Reports & Analytics" },
      { icon: "layers",   label: "Department Ops"      },
      { icon: "book",     label: "Academic Calendar"   },
      { icon: "shield",   label: "Access Control"      },
    ],
  },
  {
    id:          "communication",
    icon:        "bell",
    title:       "Communication Hub",
    color:       "#10b981",
    gradient:    "linear-gradient(135deg, #065f46, #10b981)",
    description: "Keep every member of the LTSU community connected with real-time announcements and notifications.",
    features: [
      { icon: "bell",           label: "University Notices"   },
      { icon: "send",           label: "Announcements"        },
      { icon: "calendar",       label: "Event Updates"        },
      { icon: "messageSquare",  label: "Student Alerts"       },
      { icon: "users",          label: "Faculty Broadcast"    },
      { icon: "link",           label: "Department Channel"   },
    ],
  },
  {
    id:          "examination",
    icon:        "fileText",
    title:       "Examination Module",
    color:       "#ef4444",
    gradient:    "linear-gradient(135deg, #991b1b, #ef4444)",
    description: "End-to-end examination lifecycle management from scheduling to result publishing for LTSU.",
    features: [
      { icon: "activity", label: "Internal Assessments" },
      { icon: "calendar", label: "Exam Scheduling"      },
      { icon: "send",     label: "Result Publishing"    },
      { icon: "barChart", label: "Grade Reports"        },
      { icon: "eye",      label: "Marksheet View"       },
      { icon: "fileText", label: "Hall Ticket"          },
    ],
  },
  {
    id:          "analytics",
    icon:        "pieChart",
    title:       "Analytics Dashboard",
    color:       "#8b5cf6",
    gradient:    "linear-gradient(135deg, #5b21b6, #8b5cf6)",
    description: "Data-driven institutional insights to optimize LTSU's academic performance and outcomes.",
    features: [
      { icon: "trendingUp", label: "Attendance Insights"   },
      { icon: "activity",   label: "Performance Trends"    },
      { icon: "barChart",   label: "Department Stats"      },
      { icon: "pieChart",   label: "Institutional Reports" },
      { icon: "monitor",    label: "Live Dashboards"       },
      { icon: "database",   label: "Data Export"           },
    ],
  },
];

export const DASHBOARD_CONFIGS = {
  student: {
    title:    "Student Dashboard",
    name:     "Arjun Singh",
    id:       "LTSU2024CSE001 · B.Tech CSE",
    gradient: "linear-gradient(135deg, #0F2247, #1B3A6B)",
    color:    "#1B3A6B",
    stats: [
      { label: "Attendance", value: "91%",  icon: "clock",    color: "#1B3A6B" },
      { label: "CGPA",       value: "8.6",  icon: "award",    color: "#C9A84C" },
      { label: "Pending",    value: "2",    icon: "fileText", color: "#ef4444" },
      { label: "Credits",    value: "142",  icon: "book",     color: "#10b981" },
    ],
    items: [
      { label: "Data Structures & Algorithms", progress: 90, color: "#1B3A6B" },
      { label: "Database Management",          progress: 85, color: "#10b981" },
      { label: "Computer Networks",            progress: 78, color: "#f59e0b" },
      { label: "Software Engineering",         progress: 93, color: "#8b5cf6" },
    ],
  },
  faculty: {
    title:    "Faculty Dashboard",
    name:     "Dr. Priya Sharma",
    id:       "FAC0042 · School of Engineering",
    gradient: "linear-gradient(135deg, #A07830, #C9A84C)",
    color:    "#C9A84C",
    stats: [
      { label: "Classes Today", value: "4",   icon: "calendar", color: "#C9A84C" },
      { label: "Students",      value: "210", icon: "users",    color: "#1B3A6B" },
      { label: "Pending",       value: "3",   icon: "clock",    color: "#ef4444" },
      { label: "Avg. Score",    value: "74%", icon: "barChart", color: "#10b981" },
    ],
    items: [
      { label: "Assignments Graded",  progress: 80, color: "#C9A84C" },
      { label: "Syllabus Coverage",   progress: 67, color: "#1B3A6B" },
      { label: "Student Attendance",  progress: 88, color: "#10b981" },
      { label: "Assessment Done",     progress: 95, color: "#8b5cf6" },
    ],
  },
  admin: {
    title:    "Admin Dashboard",
    name:     "University Administration",
    id:       "ADMIN · Academic Affairs Office",
    gradient: "linear-gradient(135deg, #060e1f, #1B3A6B)",
    color:    "#C9A84C",
    stats: [
      { label: "Total Students",      value: "5,200+", icon: "users",    color: "#C9A84C" },
      { label: "Active Faculty",      value: "280+",   icon: "award",    color: "#1B3A6B" },
      { label: "Departments",         value: "12",     icon: "layers",   color: "#10b981" },
      { label: "Today's Attendance",  value: "89%",    icon: "barChart", color: "#8b5cf6" },
    ],
    items: [
      { label: "Overall Attendance",   progress: 89, color: "#C9A84C" },
      { label: "Academic Performance", progress: 82, color: "#1B3A6B" },
      { label: "Fee Collection",       progress: 94, color: "#10b981" },
      { label: "Faculty Satisfaction", progress: 87, color: "#8b5cf6" },
    ],
  },
};

export const TESTIMONIALS = [
  {
    name:   "Arjun Singh",
    role:   "B.Tech CSE, 4th Semester · LTSU",
    type:   "Student",
    avatar: "AS",
    color:  "#1B3A6B",
    rating: 5,
    text:   "The LTSU portal has completely transformed how I manage my academics. I can check attendance, exam results, and course materials all in one place. It's exactly what a modern university needs.",
  },
  {
    name:   "Sneha Kapoor",
    role:   "MBA 2nd Year · School of Management",
    type:   "Student",
    avatar: "SK",
    color:  "#10b981",
    rating: 5,
    text:   "Accessing my timetable, fee receipts, and academic records has never been easier. The mobile-friendly interface means I'm always connected to LTSU even off-campus.",
  },
  {
    name:   "Dr. Priya Sharma",
    role:   "Associate Professor · School of Engineering",
    type:   "Faculty",
    avatar: "PS",
    color:  "#C9A84C",
    rating: 5,
    text:   "As an LTSU faculty member, the portal has significantly reduced my administrative workload. Managing attendance and tracking student performance is now seamless and instant.",
  },
  {
    name:   "Prof. Rajiv Mehta",
    role:   "HOD · School of  Physical Education & Sports",
    type:   "Faculty",
    avatar: "RM",
    color:  "#8b5cf6",
    rating: 5,
    text:   "The faculty dashboard gives me comprehensive insights into student performance. The internal assessment module integrates perfectly with our existing LTSU evaluation process.",
  },
  {
    name:   "Dr. Kavita Nair",
    role:   "Dean · School of Management Studies",
    type:   "Department Head",
    avatar: "KN",
    color:  "#ef4444",
    rating: 5,
    text:   "The administrative portal gives me complete visibility into school operations. From faculty management to academic analytics, everything I need is right here in one platform.",
  },
  {
    name:   "Prof. Harjinder Singh",
    role:   "Registrar · Lamrin Tech Skills University",
    type:   "Administration",
    avatar: "HS",
    color:  "#f59e0b",
    rating: 5,
    text:   "This portal represents LTSU's commitment to digital transformation. It has dramatically improved our administrative efficiency and brought all university stakeholders together.",
  },
];

export const CAMPUS_EXPERIENCES = [
  { type: "students",    title: "Student Community",  desc: "5,200+ students across 12 schools pursuing industry-aligned programs",        color: "#1B3A6B" },
  { type: "faculty",     title: "Expert Faculty",     desc: "280+ experienced educators with industry & research backgrounds",              color: "#C9A84C" },
  { type: "labs",        title: "Tech Labs",          desc: "State-of-the-art labs for AI, Robotics, IoT & advanced computing",            color: "#10b981" },
  { type: "innovation",  title: "Innovation Hub",     desc: "Incubation center fostering startups & research breakthroughs",               color: "#8b5cf6" },
  { type: "digital",     title: "Digital Learning",   desc: "Smart classrooms & e-learning platforms for Industry 4.0 readiness",         color: "#ef4444" },
];

export const NAV_ITEMS = [
  { label: "Home",      id: "home"       },
  { label: "About",     id: "about-ltsu" },
  { label: "Modules",   id: "modules"    },
  { label: "Dashboard", id: "dashboard"  },
  { label: "Contact",   id: "contact"    },
];

export const FOOTER_LINKS = {
  "Quick Links": ["Home", "Student Portal", "Faculty Portal", "Admin Portal", "Examination", "Results"],
  "Academics":   ["Academic Calendar", "Course Catalog", "Exam Schedule", "Fee Structure", "Scholarships", "E-Library"],
  "Schools":     ["Engineering & Technology", " Physical Education & Sports", "Management Studies", "Law", "Pharmacy", "Polytechnic"],
  "Support":     ["Help Center", "Contact Support", "User Guide", "FAQs", "Report Issue", "Privacy Policy"],
};

export const UNIVERSITY_STATS = [
  { value: "5200", suffix: "+",  label: "Enrolled Students",    icon: "users",    color: "#1B3A6B" },
  { value: "280",  suffix: "+",  label: "Expert Faculty",       icon: "award",    color: "#C9A84C" },
  { value: "12",   suffix: "",   label: "Schools & Depts",      icon: "layers",   color: "#10b981" },
  { value: "50",   suffix: "+",  label: "Industry Partners",    icon: "link",     color: "#8b5cf6" },
];