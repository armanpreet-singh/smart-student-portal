export const adminData = {
  name: "Dr. A.P. Singh",
  role: "Chief Administrator",
  employeeId: "ADM/2015/001",
  department: "University Administration",
  avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80"
};

export const adminStatsData = [
  { id: 1, title: "Total Students", value: "3,450", icon: "Users", trend: "+120 this semester", color: "#1E3A8A" },
  { id: 2, title: "Total Faculty", value: "185", icon: "GraduationCap", trend: "Across 12 depts", color: "#294D9B" },
  { id: 3, title: "Active Courses", value: "420", icon: "BookOpen", trend: "Current semester", color: "#16A34A" },
  { id: 4, title: "Departments", value: "12", icon: "Building", trend: "All active", color: "#D4AF37" },
  { id: 5, title: "Pending Approvals", value: "8", icon: "Clock", trend: "Requires action", color: "#F59E0B" },
  { id: 6, title: "Today's Attendance", value: "92%", icon: "UserCheck", trend: "University wide", color: "#16A34A" }
];

export const adminInsightsData = [
  { id: 1, title: "Pending Approvals", desc: "8 new faculty leave requests need approval.", type: "warning" },
  { id: 2, title: "Low Attendance Alert", desc: "CSE Department attendance dropped below 80%.", type: "danger" },
  { id: 3, title: "Semester Start", desc: "Mid-semester examinations begin next week.", type: "info" },
  { id: 4, title: "System Update", desc: "Portal maintenance scheduled for Sunday 2 AM.", type: "success" }
];

export const studentsListData = [
  { id: 1, name: "Alex Johnson", roll: "CSE/2022/042", dept: "CSE", sem: "5th", status: "Active" },
  { id: 2, name: "Sarah Williams", roll: "ECE/2023/015", dept: "ECE", sem: "3rd", status: "Active" },
  { id: 3, name: "David Brown", roll: "ME/2021/031", dept: "ME", sem: "7th", status: "Inactive" }
];

export const facultyListData = [
  { id: 1, name: "Prof. Rajan", id: "FAC/2018/012", dept: "CSE", subjects: "DBMS, OS", status: "Active" },
  { id: 2, name: "Dr. Smith", id: "FAC/2019/045", dept: "ECE", subjects: "Signals, VLSI", status: "On Leave" },
  { id: 3, name: "Prof. Clark", id: "FAC/2020/008", dept: "ME", subjects: "Thermodynamics", status: "Active" }
];

export const coursesListData = [
  { id: 1, name: "Database Management Systems", code: "CSE501", credits: 4, faculty: "Prof. Rajan", dept: "CSE", sem: "5th" },
  { id: 2, name: "Signal Processing", code: "ECE301", credits: 3, faculty: "Dr. Smith", dept: "ECE", sem: "3rd" }
];

export const departmentsData = [
  { id: 1, name: "Computer Science & Eng.", hod: "Dr. A.P. Singh", students: 450, faculty: 28 },
  { id: 2, name: "Electronics & Comm.", hod: "Dr. Verma", students: 380, faculty: 24 },
  { id: 3, name: "Mechanical Eng.", hod: "Prof. Kumar", students: 320, faculty: 20 }
];

export const deptAttendanceData = [
  { dept: "CSE", attendance: 88 }, { dept: "ECE", attendance: 91 },
  { dept: "ME", attendance: 85 }, { dept: "CE", attendance: 89 },
  { dept: "EE", attendance: 92 }
];

// Recharts Data
export const studentGrowthData = [
  { year: "2020", students: 2400 }, { year: "2021", students: 2650 },
  { year: "2022", students: 2900 }, { year: "2023", students: 3150 }, { year: "2024", students: 3450 }
];

export const deptDistributionData = [
  { name: "CSE", value: 450, color: "#1E3A8A" }, { name: "ECE", value: 380, color: "#294D9B" },
  { name: "ME", value: 320, color: "#D4AF37" }, { name: "CE", value: 280, color: "#16A34A" }, { name: "EE", value: 250, color: "#F59E0B" }
];

export const monthlyAttendanceData = [
  { month: "May", attendance: 89 }, { month: "Jun", attendance: 91 }, { month: "Jul", attendance: 85 },
  { month: "Aug", attendance: 88 }, { month: "Sep", attendance: 90 }, { month: "Oct", attendance: 92 }
];

export const courseEnrollmentData = [
  { name: "DBMS", enrolled: 120 }, { name: "Data Structures", enrolled: 110 },
  { name: "Signals", enrolled: 95 }, { name: "Thermo", enrolled: 80 }, { name: "Maths III", enrolled: 150 }
];