// Demo-only teacher attendance fixtures. Shape follows the current roster API.
export const demoTeacherAttendanceSubjects = [
  {
    id: "demo-subject-dbms",
    code: "DBMS",
    name: "Database Management Systems",
    classId: "demo-class-5a",
    class: {
      id: "demo-class-5a",
      code: "CSE-5A",
      name: "5th Semester · Section A",
      academicYear: "2026-27"
    },
    students: [
      { id: "demo-student-23", fullName: "Aarav Sharma", username: "aarav.sharma" },
      { id: "demo-student-45", fullName: "Meera Kaur", username: "meera.kaur" },
      { id: "demo-student-55", fullName: "Rohan Singh", username: "rohan.singh" },
      { id: "demo-student-67", fullName: "Simran Gill", username: "simran.gill" }
    ]
  },
  {
    id: "demo-subject-cn",
    code: "CN",
    name: "Computer Networks",
    classId: "demo-class-5b",
    class: {
      id: "demo-class-5b",
      code: "CSE-5B",
      name: "5th Semester · Section B",
      academicYear: "2026-27"
    },
    students: [
      { id: "demo-student-31", fullName: "Ishita Verma", username: "ishita.verma" },
      { id: "demo-student-32", fullName: "Kabir Saini", username: "kabir.saini" },
      { id: "demo-student-33", fullName: "Ananya Das", username: "ananya.das" }
    ]
  },
  {
    id: "demo-subject-os",
    code: "OS",
    name: "Operating Systems",
    classId: "demo-class-3a",
    class: {
      id: "demo-class-3a",
      code: "CSE-3A",
      name: "3rd Semester · Section A",
      academicYear: "2026-27"
    },
    students: [
      { id: "demo-student-12", fullName: "Dev Malhotra", username: "dev.malhotra" },
      { id: "demo-student-14", fullName: "Naina Joshi", username: "naina.joshi" }
    ]
  }
];

export const demoAttendanceStorageKey = "ltsu-teacher-attendance-demo";

export function readDemoAttendance() {
  try {
    const saved = JSON.parse(localStorage.getItem(demoAttendanceStorageKey) || "{}");
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  } catch {
    return {};
  }
}

export function saveDemoAttendance(subjectId, attendanceDate, records) {
  const saved = readDemoAttendance();
  saved[`${subjectId}:${attendanceDate}`] = { marked: true, records };
  localStorage.setItem(demoAttendanceStorageKey, JSON.stringify(saved));
  return saved;
}
