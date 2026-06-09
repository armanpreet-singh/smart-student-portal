const MockData = {
    students: [
        { id: 'CS301', name: 'Aanya Patel', class: 'CS-3A', attendance: 92, status: 'Active', color: '#6366f1', grade: 'A' },
        { id: 'CS302', name: 'Rohan Sharma', class: 'CS-3A', attendance: 67, status: 'Defaulter', color: '#ef4444', grade: 'B+' },
        { id: 'CS303', name: 'Priya Menon', class: 'CS-3B', attendance: 88, status: 'Active', color: '#10b981', grade: 'A+' },
        { id: 'CS304', name: 'Karan Singh', class: 'CS-3A', attendance: 74, status: 'Warning', color: '#f59e0b', grade: 'B' },
        { id: 'CS305', name: 'Nisha Gupta', class: 'CS-3B', attendance: 95, status: 'Active', color: '#8b5cf6', grade: 'A+' },
        { id: 'CS306', name: 'Arjun Verma', class: 'CS-3A', attendance: 71, status: 'Warning', color: '#06b6d4', grade: 'B' },
        { id: 'CS307', name: 'Divya Reddy', class: 'CS-3B', attendance: 89, status: 'Active', color: '#f43f5e', grade: 'A' },
        { id: 'CS308', name: 'Amit Joshi', class: 'CS-3A', attendance: 60, status: 'Defaulter', color: '#ef4444', grade: 'C+' },
    ],

    assignments: [
        { id: 1, title: 'Data Structures Lab 5 - Trees', subject: 'Data Structures', deadline: '2025-01-15', status: 'Active', submitted: 24, total: 32, desc: 'Implement Binary Search Tree with all operations including insert, delete, search and inorder traversal.' },
        { id: 2, title: 'Database Management - ER Diagram', subject: 'DBMS', deadline: '2025-01-18', status: 'Active', submitted: 18, total: 32, desc: 'Design an ER diagram for a Hospital Management System with all entities and relationships.' },
        { id: 3, title: 'Operating System - Process Scheduling', subject: 'OS', deadline: '2025-01-10', status: 'Closed', submitted: 30, total: 32, desc: 'Simulate FCFS, SJF, and Round Robin scheduling algorithms.' },
        { id: 4, title: 'Computer Networks - Socket Programming', subject: 'CN', deadline: '2025-01-20', status: 'Active', submitted: 10, total: 32, desc: 'Implement a simple client-server application using TCP sockets in C.' },
        { id: 5, title: 'Software Engineering - Use Case Diagram', subject: 'SE', deadline: '2025-01-25', status: 'Active', submitted: 5, total: 32, desc: 'Draw a comprehensive Use Case diagram for an Online Shopping System.' },
    ],

    studentAssignments: [
        { id: 1, title: 'Data Structures Lab 5 - Trees', subject: 'Data Structures', deadline: '2025-01-15', status: 'pending', desc: 'Implement BST with all operations.' },
        { id: 2, title: 'Database Management - ER Diagram', subject: 'DBMS', deadline: '2025-01-18', status: 'submitted', desc: 'Design ER diagram for Hospital Management System.' },
        { id: 3, title: 'OS - Process Scheduling', subject: 'Operating Systems', deadline: '2025-01-10', status: 'overdue', desc: 'Simulate process scheduling algorithms.' },
        { id: 4, title: 'CN - Socket Programming', subject: 'Computer Networks', deadline: '2025-01-20', status: 'pending', desc: 'Client-server application using TCP sockets.' },
    ],

    feedbacks: [
        { id: 1, from: 'Prof. Rajan Kumar', to: 'Aanya Patel', subject: 'Data Structures', message: 'Excellent performance in the recent DS lab. Your implementation of AVL trees was particularly impressive. Keep up the great work and maintain this consistency throughout the semester.', rating: 5, time: '2 hours ago', type: 'Positive', color: '#6366f1' },
        { id: 2, from: 'Prof. Sunita Rao', to: 'Aanya Patel', subject: 'DBMS', message: 'Good effort on the ER diagram assignment. However, please review the normalization concepts covered in Week 8. Your participation in class discussions has been excellent.', rating: 4, time: '1 day ago', type: 'Constructive', color: '#10b981' },
        { id: 3, from: 'Prof. Rajan Kumar', to: 'Aanya Patel', subject: 'Overall', message: 'Your overall academic performance is commendable. Your attendance and assignment submission rate are among the top in the class. Continue this trajectory for excellent semester results.', rating: 5, time: '3 days ago', type: 'Positive', color: '#8b5cf6' },
    ],

    announcements: [
        { id: 1, title: 'Mid-Term Examination Schedule Released', content: 'The mid-term examination schedule for Semester 5 has been officially released. Exams will be conducted from January 20-28, 2025. Students are advised to check their respective timetables and prepare accordingly. No postponements will be entertained.', type: 'urgent', author: 'Principal Office', time: '10 minutes ago', tags: ['Exam', 'Important'] },
        { id: 2, title: 'Guest Lecture on Machine Learning', content: 'We are pleased to announce a guest lecture on "Practical Applications of Machine Learning" by Dr. Ananya Singh from IIT Bombay. The lecture will be held on January 15, 2025 at 10:00 AM in Seminar Hall-1. Attendance is compulsory for CS 3rd year students.', type: 'info', author: 'CS Department', time: '2 hours ago', tags: ['Lecture', 'ML'] },
        { id: 3, title: 'Library Extended Hours During Exam Season', content: 'The college library will remain open 24/7 from January 15 to January 30, 2025 to support students during the examination period. Students can utilize the reading rooms and access digital resources. ID cards must be carried at all times.', type: 'success', author: 'Library Committee', time: '1 day ago', tags: ['Library', 'Exam'] },
        { id: 4, title: 'Sports Day Registration Open', content: 'Annual Sports Day registrations are now open! Students can register for events including Cricket, Football, Basketball, Badminton, and Athletics. Registration deadline is January 20, 2025. Contact the Sports Department for more details.', type: 'info', author: 'Sports Committee', time: '2 days ago', tags: ['Sports', 'Event'] },
    ],

    attendanceData: {
        months: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
        classAvg: [88, 82, 85, 79, 83, 87],
        myAttendance: [90, 85, 88, 82, 87, 92]
    },

    subjectAttendance: [
        { subject: 'Data Structures', percentage: 92, color: '#6366f1', classes: '22/24 classes' },
        { subject: 'DBMS', percentage: 88, color: '#10b981', classes: '21/24 classes' },
        { subject: 'Operating Systems', percentage: 85, color: '#f59e0b', classes: '20/24 classes' },
        { subject: 'Computer Networks', percentage: 79, color: '#ef4444', classes: '19/24 classes' },
        { subject: 'Software Engineering', percentage: 96, color: '#8b5cf6', classes: '23/24 classes' },
    ]
};
window.MockData=MockData;