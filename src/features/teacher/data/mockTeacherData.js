export const teacherData = {
  name: "Prof. Rajan",
  designation: "Associate Professor",
  department: "Computer Science & Engineering",
  employeeId: "FAC/2018/012",
  semester: "5th Semester",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80"
};

export const teacherStatsData = [
  { id: 1, title: "Today's Classes", value: "4", icon: "Clock", trend: "Next at 11:00 AM", color: "#1E3A8A" },
  { id: 2, title: "Total Students", value: "128", icon: "Users", trend: "Across 3 sections", color: "#294D9B" },
  { id: 3, title: "Pending Attendance", value: "2", icon: "UserCheck", trend: "For today", color: "#F59E0B" },
  { id: 4, title: "To Grade", value: "28", icon: "FileCheck", trend: "DBMS Assignment", color: "#DC2626" },
  { id: 5, title: "Pending Results", value: "1", icon: "BarChart3", trend: "OS Mid-Sem due tomorrow", color: "#D4AF37" },
  { id: 6, title: "Announcements", value: "3", icon: "Megaphone", trend: "2 active", color: "#16A34A" }
];

export const teacherScheduleData = [
  { id: 1, time: "09:00 AM", subject: "Database Management Systems", semester: "5th Sem", section: "A", room: "Room 301", students: 42, isCurrent: true },
  { id: 2, time: "11:00 AM", subject: "Computer Networks", semester: "5th Sem", section: "B", room: "Lab 102", students: 45 },
  { id: 3, time: "02:00 PM", subject: "Operating Systems", semester: "3rd Sem", section: "A", room: "Room 205", students: 41 }
];

export const teacherClassesData = [
  { id: 1, name: "Database Management Systems", semester: "5th Sem", section: "A", students: 42, attendance: 88, nextLecture: "Today, 09:00 AM" },
  { id: 2, name: "Computer Networks", semester: "5th Sem", section: "B", students: 45, attendance: 75, nextLecture: "Today, 11:00 AM" },
  { id: 3, name: "Operating Systems", semester: "3rd Sem", section: "A", students: 41, attendance: 92, nextLecture: "Today, 02:00 PM" }
];

export const teacherAssignmentsData = [
  { id: 1, title: "ER Diagram for Library System", subject: "DBMS", section: "A", submitted: 38, total: 42, status: "grading" },
  { id: 2, title: "Socket Programming in C", subject: "CN", section: "B", submitted: 10, total: 45, status: "active" },
  { id: 3, title: "Process Scheduling Algorithms", subject: "OS", section: "A", submitted: 41, total: 41, status: "graded" }
];

export const teacherInsightsData = [
  { id: 1, title: "Attendance Pending", desc: "Attendance for Semester VI Section B has not been submitted.", type: "warning" },
  { id: 2, title: "Submissions Waiting", desc: "DBMS Assignment has 28 submissions waiting for grading.", type: "danger" },
  { id: 3, title: "Results Due Tomorrow", desc: "Results for Operating Systems Mid-Sem are due tomorrow.", type: "warning" },
  { id: 4, title: "Low Attendance Alert", desc: "Section B Computer Networks attendance has dropped below 75%.", type: "danger" }
];

export const studentsListData = [
  { id: 1, name: "Alex Johnson", roll: "CSE/2022/042", section: "A", attendance: "88%", cgpa: 8.9 },
  { id: 2, name: "Sarah Williams", roll: "CSE/2022/015", section: "A", attendance: "92%", cgpa: 9.2 },
  { id: 3, name: "David Brown", roll: "CSE/2022/031", section: "B", attendance: "74%", cgpa: 7.8 }
];