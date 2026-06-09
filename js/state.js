const AppState = {
    currentRole: 'teacher',
    currentPage: 'dashboard',
    darkMode: false,
    sidebarCollapsed: false,
    charts: {},

    users: {
        teacher: {
            name: 'Prof. Rajan Kumar',
            email: 'rajan.kumar@edusmart.edu',
            role: 'Faculty - CS Dept.',
            initials: 'RK',
            department: 'Computer Science'
        },
        student: {
            name: 'Aanya Patel',
            email: 'aanya.patel@student.edu',
            role: 'Student - CS-3A',
            initials: 'AP',
            department: 'Computer Science'
        }
    }
};
window.AppState=AppState;