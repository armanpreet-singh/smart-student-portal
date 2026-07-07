// src/features/dashboard/data/mockDashboardData.js

export const studentData = {
  name: "Alex Johnson",
  department: "Computer Science & Engineering",
  semester: "5th Semester",
  rollNumber: "CSE/2022/042",
  avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80"
};

export const statsData = [
  { id: 1, title: "Overall Attendance", value: "87.5%", icon: "UserCheck", trend: "+2.1%", color: "#16A34A" },
  { id: 2, title: "Current CGPA", value: "8.9", icon: "GraduationCap", trend: "+0.4", color: "#1E3A8A" },
  { id: 3, title: "Pending Assignments", value: "4", icon: "FileText", trend: "2 Due Tomorrow", color: "#F59E0B" },
  { id: 4, title: "Active Courses", value: "6", icon: "BookOpen", trend: "This Semester", color: "#294D9B" }
];

export const scheduleData = [
  { id: 1, time: "09:00 AM", subject: "Database Management Systems", faculty: "Dr. Smith", room: "Room 301", type: "Lecture", isCurrent: true },
  { id: 2, time: "11:00 AM", subject: "Computer Networks", faculty: "Prof. Jones", room: "Lab 102", type: "Lab" },
  { id: 3, time: "02:00 PM", subject: "Operating Systems", faculty: "Dr. Lee", room: "Room 205", type: "Lecture" }
];

export const coursesData = [
  { id: 1, name: "Database Management Systems", code: "CSE501", faculty: "Dr. Smith", progress: 65, color: "#1E3A8A" },
  { id: 2, name: "Computer Networks", code: "CSE502", faculty: "Prof. Jones", progress: 45, color: "#294D9B" },
  { id: 3, name: "Operating Systems", code: "CSE503", faculty: "Dr. Lee", progress: 80, color: "#D4AF37" },
  { id: 4, name: "Software Engineering", code: "CSE504", faculty: "Dr. Davis", progress: 55, color: "#16A34A" },
  { id: 5, name: "Theory of Computation", code: "CSE505", faculty: "Prof. Clark", progress: 30, color: "#DC2626" },
  { id: 6, name: "AI Lab", code: "CSE506", faculty: "Dr. Wilson", progress: 70, color: "#F59E0B" }
];

export const assignmentsData = [
  { id: 1, title: "ER Diagram for Library System", course: "DBMS", dueDate: "Tomorrow", status: "pending", priority: "high" },
  { id: 2, title: "Socket Programming in C", course: "Computer Networks", dueDate: "In 3 Days", status: "pending", priority: "medium" },
  { id: 3, title: "Process Scheduling Algorithms", course: "OS", dueDate: "Next Week", status: "pending", priority: "low" },
  { id: 4, title: "UML Diagrams for ATM", course: "Software Engineering", dueDate: "Yesterday", status: "overdue", priority: "high" }
];

export const announcementsData = [
  { id: 1, title: "Mid-Semester Exam Schedule Released", date: "2 hours ago", type: "urgent" },
  { id: 2, title: "Annual Tech Fest Registrations Open", date: "1 day ago", type: "event" },
  { id: 3, title: "Library timing changes for next week", date: "2 days ago", type: "info" }
];

export const resourcesData = [
  { id: 1, title: "DBMS Lecture Notes - Module 3", type: "Lecture Notes", course: "DBMS", size: "2.4 MB" },
  { id: 2, title: "Computer Networks PPT - TCP/IP", type: "PPT", course: "CN", size: "5.1 MB" },
  { id: 3, title: "OS Lab Manual", type: "Lab Manual", course: "OS", size: "1.2 MB" },
  { id: 4, title: "SE Recorded Lecture - 12/10/23", type: "Recorded Lecture", course: "SE", size: "340 MB" },
  { id: 5, title: "TOC Previous Year Papers 2022", type: "Previous Year Papers", course: "TOC", size: "800 KB" }
];

export const calendarData = [
  { id: 1, date: "2023-10-25", title: "DBMS Mid-Sem", type: "exam" },
  { id: 2, date: "2023-10-27", title: "Tech Fest 'Synapse'", type: "event" },
  { id: 3, date: "2023-10-30", title: "CN Lab Viva", type: "viva" },
  { id: 4, date: "2023-11-05", title: "OS Mid-Sem", type: "exam" }
];

export const activityData = [
  { id: 1, action: "Submitted Assignment", detail: "UML Diagrams for ATM (SE)", time: "1 hour ago" },
  { id: 2, action: "Attendance Marked", detail: "Database Management Systems", time: "3 hours ago" },
  { id: 3, action: "Downloaded Resource", detail: "CN PPT - TCP/IP", time: "Yesterday" }
];

export const insightsData = [
  { id: 1, title: "Assignment Due Tomorrow", desc: "Your DBMS ER Diagram assignment is due tomorrow at 11:59 PM.", type: "warning" },
  { id: 2, title: "Low Attendance Alert", desc: "Your attendance in Computer Networks is at 72%. Aim for 80% to avoid detention.", type: "danger" },
  { id: 3, title: "Class Starting Soon", desc: "AI Lab starts in 45 minutes. Don't forget your laptop.", type: "info" },
  { id: 4, title: "Exam Prep Suggestion", desc: "Mid-Semester exams begin next week. Focus on OS and DBMS.", type: "success" }
];

// ==========================================
// ATTENDANCE PAGE DATA
// ==========================================

// Math adjusted precisely: 140 attended out of 160 total = 87.5%
export const attendanceData = {
  overall: 87.5,
  totalAttended: 140,
  totalMissed: 20,
  details: [
    { code: "CSE501", name: "DBMS", faculty: "Dr. Smith", attended: 28, total: 32 },
    { code: "CSE502", name: "Computer Networks", faculty: "Prof. Jones", attended: 24, total: 28 },
    { code: "CSE503", name: "Operating Systems", faculty: "Dr. Lee", attended: 32, total: 36 },
    { code: "CSE504", name: "Software Engineering", faculty: "Dr. Davis", attended: 24, total: 28 },
    { code: "CSE505", name: "TOC", faculty: "Prof. Clark", attended: 21, total: 24 },
    { code: "CSE506", name: "AI Lab", faculty: "Dr. Wilson", attended: 11, total: 12 }
  ]
};

export const weeklyChartData = [
  { day: 'Mon', present: 4, absent: 0 },
  { day: 'Tue', present: 3, absent: 1 },
  { day: 'Wed', present: 4, absent: 0 },
  { day: 'Thu', present: 2, absent: 2 },
  { day: 'Fri', present: 4, absent: 0 },
  { day: 'Sat', present: 1, absent: 0 },
];

export const monthlyTrendData = [
  { month: 'May', attendance: 85 },
  { month: 'Jun', attendance: 82 },
  { month: 'Jul', attendance: 88 },
  { month: 'Aug', attendance: 79 },
  { month: 'Sep', attendance: 84 },
  { month: 'Oct', attendance: 87.5 },
];

export const todayAttendanceStatus = {
  totalClasses: 4,
  present: 2,
  absent: 0,
  upcoming: {
    subject: "Operating Systems",
    time: "02:00 PM",
    room: "Room 205"
  }
};

export const attendanceInsightsData = [
  { id: 1, icon: "check", text: "Excellent attendance this month.", type: "success" },
  { id: 2, icon: "alert", text: "Computer Networks attendance is below 75%.", type: "danger" },
  { id: 3, icon: "trend", text: "Attendance improved by 3% compared to last month.", type: "success" },
  { id: 4, icon: "target", text: "Attend the next 3 DBMS lectures to reach 90%.", type: "info" },
];

