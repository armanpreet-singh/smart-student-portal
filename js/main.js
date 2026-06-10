
function showPage(pageId) {
    document.querySelectorAll('[id$="-page"], #app').forEach(el => {
        el.classList.add('hidden');
    });
    document.getElementById(pageId).classList.remove('hidden');
}

function selectRole(role) {
    AppState.currentRole = role;
    document.getElementById('role-teacher').classList.toggle('active', role === 'teacher');
    document.getElementById('role-student').classList.toggle('active', role === 'student');

    const emailInput = document.getElementById('login-email');
    if (role === 'teacher') {
        emailInput.value = 'teacher@edusmart.edu';
        emailInput.placeholder = 'Enter your faculty email';
    } else {
        emailInput.value = 'aanya.patel@student.edu';
        emailInput.placeholder = 'Enter your student email';
    }
}

function handleLogin(e) {
    e.preventDefault();
    const user = AppState.users[AppState.currentRole];

    // Update UI for logged-in user
    document.getElementById('sidebar-avatar-text').textContent = user.initials;
    document.getElementById('sidebar-user-name').textContent = user.name;
    document.getElementById('sidebar-user-role').textContent = user.role;
    document.getElementById('header-avatar').textContent = user.initials;
    document.getElementById('header-name').textContent = user.name.split(' ')[0];
    document.getElementById('dropdown-user-name').textContent = user.name;
    document.getElementById('dropdown-user-email').textContent = user.email;

    // Show correct navigation
    document.getElementById('teacher-nav').classList.toggle('hidden', AppState.currentRole !== 'teacher');
    document.getElementById('student-nav').classList.toggle('hidden', AppState.currentRole !== 'student');

    showPage('app');
    navigateTo('dashboard');
    showToast('success', 'Login Successful', `Welcome back, ${user.name.split(' ')[0]}!`);
}

function logout() {
    closeAllDropdowns();
    showPage('login-page');
    showToast('info', 'Logged Out', 'You have been successfully logged out.');
}

// ========================================
// NAVIGATION
// ========================================
function navigateTo(page) {
    AppState.currentPage = page;

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const onclick = link.getAttribute('onclick');
        if (onclick && onclick.includes(`'${page}'`)) {
            link.classList.add('active');
        }
    });

 
    const titles = {
        dashboard: 'Dashboard',
        students: 'Student Management',
        attendance: 'Attendance Management',
        assignments: 'Assignments',
        feedback: 'Feedback',
        announcements: 'Announcements',
        reports: 'Reports & Analytics',
        performance: 'Performance Summary'
    };
    document.getElementById('breadcrumb-current').textContent = titles[page] || page;

    // Destroy existing charts
    Object.values(AppState.charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') chart.destroy();
    });
    AppState.charts = {};

    // Render page
    const content = document.getElementById('pageContent');
    content.innerHTML = '';

    const renderMap = {
        dashboard: AppState.currentRole === 'teacher' ? renderTeacherDashboard : renderStudentDashboard,
        students: renderStudentsPage,
        attendance: AppState.currentRole === 'teacher' ? renderTeacherAttendance : renderStudentAttendance,
        assignments: AppState.currentRole === 'teacher' ? renderTeacherAssignments : renderStudentAssignments,
        feedback: AppState.currentRole === 'teacher' ? renderTeacherFeedback : renderStudentFeedback,
        announcements: AppState.currentRole === 'teacher' ? renderTeacherAnnouncements : renderStudentAnnouncements,
        reports: renderReports,
        performance: renderPerformance
    };

    if (renderMap[page]) {
        content.innerHTML = renderMap[page]();
        initPageScripts(page);
    }

    // Close mobile sidebar
    closeMobileSidebar();
}

function initPageScripts(page) {
    setTimeout(() => {
        if (page === 'dashboard') {
            initDashboardCharts();
        } else if (page === 'attendance') {
            if (AppState.currentRole === 'student') initAttendanceCharts();
        } else if (page === 'reports') {
            initReportsCharts();
        } else if (page === 'performance') {
            initPerformanceCharts();
        }
    }, 100);
}

// ========================================
// TEACHER DASHBOARD
// ========================================
function renderTeacherDashboard() {
    return `
        <div class="page-header">
            <h1 class="page-title">Good Morning, Prof. Rajan! 👋</h1>
            <p class="page-subtitle">Here's what's happening in your classes today — Wednesday, January 8, 2025</p>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
            <div class="stat-card blue">
                <div class="stat-card-header">
                    <div class="stat-icon blue"><i class="fas fa-users"></i></div>
                    <span class="stat-trend up"><i class="fas fa-arrow-up"></i> +5</span>
                </div>
                <div class="stat-value">128</div>
                <div class="stat-label">Total Students</div>
            </div>
            <div class="stat-card green">
                <div class="stat-card-header">
                    <div class="stat-icon green"><i class="fas fa-user-check"></i></div>
                    <span class="stat-trend up"><i class="fas fa-arrow-up"></i> 87%</span>
                </div>
                <div class="stat-value">112</div>
                <div class="stat-label">Present Today</div>
            </div>
            <div class="stat-card orange">
                <div class="stat-card-header">
                    <div class="stat-icon orange"><i class="fas fa-tasks"></i></div>
                    <span class="stat-trend down"><i class="fas fa-arrow-down"></i> 3</span>
                </div>
                <div class="stat-value">5</div>
                <div class="stat-label">Pending Assignments</div>
            </div>
            <div class="stat-card red">
                <div class="stat-card-header">
                    <div class="stat-icon red"><i class="fas fa-exclamation-triangle"></i></div>
                    <span class="stat-trend up"><i class="fas fa-arrow-up"></i> 2</span>
                </div>
                <div class="stat-value">8</div>
                <div class="stat-label">Defaulters</div>
            </div>
        </div>

        <!-- Charts Row -->
        <div class="charts-grid">
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Attendance Trend</div>
                        <div class="card-subtitle">Monthly class attendance overview</div>
                    </div>
                    <div class="card-actions">
                        <select class="filter-select" style="font-size:0.8rem; padding:0.4rem 0.75rem;">
                            <option>Last 6 Months</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                </div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="attendanceTrendChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Quick Actions</div>
                        <div class="card-subtitle">Frequently used tools</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="quick-actions-grid">
                        <div class="quick-action-btn" onclick="navigateTo('attendance')">
                            <div class="quick-action-icon" style="background:rgba(16,185,129,0.12);color:var(--success);">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                            <span class="quick-action-text">Mark Attendance</span>
                        </div>
                        <div class="quick-action-btn" onclick="navigateTo('assignments')">
                            <div class="quick-action-icon" style="background:rgba(99,102,241,0.12);color:var(--primary);">
                                <i class="fas fa-plus-circle"></i>
                            </div>
                            <span class="quick-action-text">New Assignment</span>
                        </div>
                        <div class="quick-action-btn" onclick="navigateTo('announcements')">
                            <div class="quick-action-icon" style="background:rgba(245,158,11,0.12);color:var(--warning);">
                                <i class="fas fa-bullhorn"></i>
                            </div>
                            <span class="quick-action-text">Announcement</span>
                        </div>
                        <div class="quick-action-btn" onclick="navigateTo('students')">
                            <div class="quick-action-icon" style="background:rgba(139,92,246,0.12);color:var(--accent);">
                                <i class="fas fa-user-plus"></i>
                            </div>
                            <span class="quick-action-text">Add Student</span>
                        </div>
                        <div class="quick-action-btn" onclick="navigateTo('feedback')">
                            <div class="quick-action-icon" style="background:rgba(6,182,212,0.12);color:var(--secondary);">
                                <i class="fas fa-comment-dots"></i>
                            </div>
                            <span class="quick-action-text">Send Feedback</span>
                        </div>
                        <div class="quick-action-btn" onclick="navigateTo('reports')">
                            <div class="quick-action-icon" style="background:rgba(239,68,68,0.12);color:var(--danger);">
                                <i class="fas fa-chart-bar"></i>
                            </div>
                            <span class="quick-action-text">View Reports</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Subject Attendance & Recent Activity -->
        <div class="two-col-grid">
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Subject Attendance Stats</div>
                        <div class="card-subtitle">Average attendance per subject</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="chart-container" style="height:220px;">
                        <canvas id="subjectAttendanceChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Recent Activity</div>
                        <div class="card-subtitle">Latest updates</div>
                    </div>
                </div>
                <div class="card-body" style="padding-top:0.5rem;">
                    <div class="activity-item">
                        <div class="activity-dot" style="background:rgba(16,185,129,0.12);color:var(--success);">
                            <i class="fas fa-check"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-text">Attendance marked for CS-3A</div>
                            <div class="activity-time">5 minutes ago</div>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-dot" style="background:rgba(99,102,241,0.12);color:var(--primary);">
                            <i class="fas fa-tasks"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-text">Assignment "DS Lab 5" created</div>
                            <div class="activity-time">2 hours ago</div>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-dot" style="background:rgba(245,158,11,0.12);color:var(--warning);">
                            <i class="fas fa-exclamation"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-text">Rohan Sharma attendance warning sent</div>
                            <div class="activity-time">3 hours ago</div>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-dot" style="background:rgba(139,92,246,0.12);color:var(--accent);">
                            <i class="fas fa-bullhorn"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-text">New announcement posted</div>
                            <div class="activity-time">Yesterday</div>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-dot" style="background:rgba(6,182,212,0.12);color:var(--secondary);">
                            <i class="fas fa-comment"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-text">Feedback sent to Priya Menon</div>
                            <div class="activity-time">Yesterday</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Defaulters Table -->
        <div class="card" style="margin-top:1.25rem;">
            <div class="card-header">
                <div>
                    <div class="card-title">⚠️ Defaulter Alert List</div>
                    <div class="card-subtitle">Students with attendance below 75%</div>
                </div>
                <button class="btn-sm btn-outline" onclick="navigateTo('students')">View All</button>
            </div>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Class</th>
                            <th>Attendance</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${MockData.students.filter(s => s.attendance < 75).map(s => `
                        <tr>
                            <td>
                                <div class="student-info">
                                    <div class="student-avatar" style="background:${s.color};">
                                        ${s.name.split(' ').map(n=>n[0]).join('')}
                                    </div>
                                    <div>
                                        <div class="student-name">${s.name}</div>
                                        <div class="student-id">${s.id}</div>
                                    </div>
                                </div>
                            </td>
                            <td><span class="badge badge-gray">${s.class}</span></td>
                            <td>
                                <div style="display:flex;align-items:center;gap:0.75rem;">
                                    <div class="progress-bar" style="width:100px;">
                                        <div class="progress-fill ${s.attendance < 65 ? 'bad' : 'warning'}" style="width:${s.attendance}%;"></div>
                                    </div>
                                    <span style="font-size:0.875rem;font-weight:700;color:${s.attendance < 65 ? 'var(--danger)' : 'var(--warning)'};">${s.attendance}%</span>
                                </div>
                            </td>
                            <td><span class="badge ${s.status === 'Defaulter' ? 'badge-danger' : 'badge-warning'}">${s.status}</span></td>
                            <td>
                                <button class="btn-sm btn-primary-sm" onclick="showToast('info','Alert Sent',\`Warning sent to ${s.name}\`)">
                                    <i class="fas fa-paper-plane" style="margin-right:0.3rem;"></i>Send Alert
                                </button>
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ========================================
// STUDENT DASHBOARD
// ========================================
function renderStudentDashboard() {
    return `
        <div class="page-header">
            <h1 class="page-title">Hello, Aanya! 🎓</h1>
            <p class="page-subtitle">Your academic summary for today — Wednesday, January 8, 2025</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card blue">
                <div class="stat-card-header">
                    <div class="stat-icon blue"><i class="fas fa-percentage"></i></div>
                    <span class="stat-trend up"><i class="fas fa-arrow-up"></i> +2%</span>
                </div>
                <div class="stat-value">88%</div>
                <div class="stat-label">Overall Attendance</div>
            </div>
            <div class="stat-card orange">
                <div class="stat-card-header">
                    <div class="stat-icon orange"><i class="fas fa-clock"></i></div>
                    <span class="stat-trend down"><i class="fas fa-arrow-down"></i> 1</span>
                </div>
                <div class="stat-value">3</div>
                <div class="stat-label">Pending Assignments</div>
            </div>
            <div class="stat-card green">
                <div class="stat-card-header">
                    <div class="stat-icon green"><i class="fas fa-check-square"></i></div>
                    <span class="stat-trend up"><i class="fas fa-arrow-up"></i> 2</span>
                </div>
                <div class="stat-value">12</div>
                <div class="stat-label">Submitted Assignments</div>
            </div>
            <div class="stat-card purple">
                <div class="stat-card-header">
                    <div class="stat-icon purple"><i class="fas fa-comments"></i></div>
                    <span class="stat-trend up"><i class="fas fa-arrow-up"></i> 1</span>
                </div>
                <div class="stat-value">3</div>
                <div class="stat-label">Feedback Received</div>
            </div>
        </div>

        <div class="charts-grid">
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">My Attendance Trend</div>
                        <div class="card-subtitle">Monthly attendance comparison</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="attendanceTrendChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Subject Attendance</div>
                        <div class="card-subtitle">Per-subject breakdown</div>
                    </div>
                </div>
                <div class="card-body">
                    ${MockData.subjectAttendance.map(s => `
                    <div class="subject-attendance-card">
                        <div class="subject-color-dot" style="background:${s.color};"></div>
                        <div class="subject-info">
                            <div class="subject-name">${s.subject}</div>
                            <div class="subject-classes">${s.classes}</div>
                        </div>
                        <div>
                            <div class="subject-percentage" style="color:${s.percentage >= 75 ? 'var(--success)' : 'var(--danger)'};">${s.percentage}%</div>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- Pending Assignments & Notifications -->
        <div class="two-col-grid" style="margin-top:0;">
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Upcoming Deadlines</div>
                        <div class="card-subtitle">Assignments due soon</div>
                    </div>
                    <button class="btn-sm btn-outline" onclick="navigateTo('assignments')">View All</button>
                </div>
                <div class="card-body" style="padding-top:0.5rem;">
                    ${MockData.studentAssignments.filter(a => a.status !== 'submitted').slice(0,3).map(a => `
                    <div class="list-item">
                        <div style="flex:1;">
                            <div style="font-size:0.875rem;font-weight:600;color:var(--text-primary);">${a.title}</div>
                            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.15rem;">
                                <i class="fas fa-book" style="margin-right:0.3rem;"></i>${a.subject} &nbsp;
                                <i class="fas fa-calendar" style="margin-right:0.3rem;"></i>${a.deadline}
                            </div>
                        </div>
                        <span class="badge ${a.status === 'overdue' ? 'badge-danger' : 'badge-warning'}">${a.status}</span>
                    </div>
                    `).join('')}
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Recent Notifications</div>
                        <div class="card-subtitle">Latest updates for you</div>
                    </div>
                </div>
                <div class="card-body" style="padding-top:0.5rem;">
                    <div class="activity-item">
                        <div class="activity-dot" style="background:rgba(16,185,129,0.12);color:var(--success);">
                            <i class="fas fa-comment"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-text">New feedback from Prof. Rajan</div>
                            <div class="activity-time">2 hours ago</div>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-dot" style="background:rgba(245,158,11,0.12);color:var(--warning);">
                            <i class="fas fa-tasks"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-text">Assignment "DS Lab 5" due in 2 days</div>
                            <div class="activity-time">1 day ago</div>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-dot" style="background:rgba(239,68,68,0.12);color:var(--danger);">
                            <i class="fas fa-bullhorn"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-text">Exam schedule announced</div>
                            <div class="activity-time">Today</div>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-dot" style="background:rgba(99,102,241,0.12);color:var(--primary);">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-text">Attendance updated for Jan 7</div>
                            <div class="activity-time">Yesterday</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// STUDENTS PAGE (TEACHER)
// ========================================
function renderStudentsPage() {
    return `
        <div class="page-header">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
                <div>
                    <h1 class="page-title">Student Management</h1>
                    <p class="page-subtitle">Manage all enrolled students across your classes</p>
                </div>
                <button class="btn-sm btn-primary-sm" style="padding:0.65rem 1.25rem;" onclick="openAddStudentModal()">
                    <i class="fas fa-user-plus" style="margin-right:0.5rem;"></i>Add Student
                </button>
            </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);">
            <div class="stat-card blue">
                <div class="stat-card-header"><div class="stat-icon blue"><i class="fas fa-users"></i></div></div>
                <div class="stat-value">128</div>
                <div class="stat-label">Total Students</div>
            </div>
            <div class="stat-card green">
                <div class="stat-card-header"><div class="stat-icon green"><i class="fas fa-user-check"></i></div></div>
                <div class="stat-value">118</div>
                <div class="stat-label">Active</div>
            </div>
            <div class="stat-card orange">
                <div class="stat-card-header"><div class="stat-icon orange"><i class="fas fa-exclamation-triangle"></i></div></div>
                <div class="stat-value">5</div>
                <div class="stat-label">Warnings</div>
            </div>
            <div class="stat-card red">
                <div class="stat-card-header"><div class="stat-icon red"><i class="fas fa-times-circle"></i></div></div>
                <div class="stat-value">5</div>
                <div class="stat-label">Defaulters</div>
            </div>
        </div>

        <!-- Filter Bar -->
        <div class="filter-bar">
            <div class="search-input-group">
                <i class="fas fa-search"></i>
                <input type="text" placeholder="Search student..." id="studentSearch" oninput="filterStudents()">
            </div>
            <select class="filter-select" id="classFilter" onchange="filterStudents()">
                <option value="">All Classes</option>
                <option value="CS-3A">CS-3A</option>
                <option value="CS-3B">CS-3B</option>
            </select>
            <select class="filter-select" id="statusFilter" onchange="filterStudents()">
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Warning">Warning</option>
                <option value="Defaulter">Defaulter</option>
            </select>
        </div>

        <!-- Students Table -->
        <div class="card">
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Roll No.</th>
                            <th>Class</th>
                            <th>Attendance</th>
                            <th>Grade</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="studentsTableBody">
                        ${renderStudentRows(MockData.students)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderStudentRows(students) {
    return students.map(s => `
    <tr>
        <td>
            <div class="student-info">
                <div class="student-avatar" style="background:${s.color};">
                    ${s.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                    <div class="student-name">${s.name}</div>
                    <div class="student-id">${s.id}</div>
                </div>
            </div>
        </td>
        <td style="color:var(--text-secondary);">${s.id}</td>
        <td><span class="badge badge-info">${s.class}</span></td>
        <td>
            <div style="display:flex;align-items:center;gap:0.75rem;">
                <div class="progress-bar" style="width:80px;">
                    <div class="progress-fill ${s.attendance >= 75 ? 'good' : s.attendance >= 65 ? 'warning' : 'bad'}" style="width:${s.attendance}%;"></div>
                </div>
                <span style="font-size:0.875rem;font-weight:700;color:${s.attendance >= 75 ? 'var(--success)' : s.attendance >= 65 ? 'var(--warning)' : 'var(--danger)'};">${s.attendance}%</span>
            </div>
        </td>
        <td><span class="badge badge-purple">${s.grade}</span></td>
        <td><span class="badge ${s.status==='Active'?'badge-success':s.status==='Warning'?'badge-warning':'badge-danger'}">${s.status}</span></td>
        <td>
            <div style="display:flex;gap:0.5rem;">
                <button class="btn-sm btn-outline" title="View Profile" onclick="showToast('info','Profile','Viewing ${s.name} profile')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-sm btn-outline" title="Send Feedback" onclick="navigateTo('feedback')">
                    <i class="fas fa-comment"></i>
                </button>
            </div>
        </td>
    </tr>
    `).join('');
}

function filterStudents() {
    const search = document.getElementById('studentSearch').value.toLowerCase();
    const classF = document.getElementById('classFilter').value;
    const statusF = document.getElementById('statusFilter').value;

    const filtered = MockData.students.filter(s => {
        return (!search || s.name.toLowerCase().includes(search) || s.id.toLowerCase().includes(search)) &&
               (!classF || s.class === classF) &&
               (!statusF || s.status === statusF);
    });

    document.getElementById('studentsTableBody').innerHTML = renderStudentRows(filtered);
    if (filtered.length === 0) {
        document.getElementById('studentsTableBody').innerHTML = `
            <tr><td colspan="7">
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <div class="empty-state-title">No students found</div>
                    <div class="empty-state-desc">Try adjusting your search filters</div>
                </div>
            </td></tr>`;
    }
}

// ========================================
// ATTENDANCE PAGES
// ========================================
function renderTeacherAttendance() {
    const today = new Date().toLocaleDateString('en-IN', {weekday:'long', year:'numeric', month:'long', day:'numeric'});

    return `
        <div class="page-header">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
                <div>
                    <h1 class="page-title">Attendance Management</h1>
                    <p class="page-subtitle">Mark and manage student attendance • ${today}</p>
                </div>
                <button class="btn-sm btn-primary-sm" style="padding:0.65rem 1.25rem;" onclick="saveAttendance()">
                    <i class="fas fa-save" style="margin-right:0.5rem;"></i>Save Attendance
                </button>
            </div>
        </div>

        <!-- Quick Stats -->
        <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);">
            <div class="stat-card green">
                <div class="stat-card-header"><div class="stat-icon green"><i class="fas fa-user-check"></i></div></div>
                <div class="stat-value" id="presentCount">0</div>
                <div class="stat-label">Present</div>
            </div>
            <div class="stat-card red">
                <div class="stat-card-header"><div class="stat-icon red"><i class="fas fa-user-times"></i></div></div>
                <div class="stat-value" id="absentCount">0</div>
                <div class="stat-label">Absent</div>
            </div>
            <div class="stat-card blue">
                <div class="stat-card-header"><div class="stat-icon blue"><i class="fas fa-users"></i></div></div>
                <div class="stat-value">${MockData.students.length}</div>
                <div class="stat-label">Total</div>
            </div>
        </div>

        <!-- Filter Bar -->
        <div class="filter-bar">
            <div class="search-input-group">
                <i class="fas fa-search"></i>
                <input type="text" placeholder="Search student..." oninput="filterAttendanceTable(this.value)">
            </div>
            <select class="filter-select">
                <option>CS-3A</option>
                <option>CS-3B</option>
            </select>
            <select class="filter-select">
                <option>Data Structures</option>
                <option>DBMS</option>
                <option>OS</option>
            </select>
            <button class="btn-sm btn-outline" onclick="markAllPresent()">
                <i class="fas fa-check-double" style="margin-right:0.4rem;"></i>Mark All Present
            </button>
        </div>

        <!-- Attendance Table -->
        <div class="card">
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Student</th>
                            <th>Roll No.</th>
                            <th>Class</th>
                            <th>Overall Att.</th>
                            <th>Today's Status</th>
                        </tr>
                    </thead>
                    <tbody id="attendanceTableBody">
                        ${MockData.students.map((s, i) => `
                        <tr id="att-row-${s.id}">
                            <td style="color:var(--text-muted);">${i+1}</td>
                            <td>
                                <div class="student-info">
                                    <div class="student-avatar" style="background:${s.color};">
                                        ${s.name.split(' ').map(n=>n[0]).join('')}
                                    </div>
                                    <div>
                                        <div class="student-name">${s.name}</div>
                                    </div>
                                </div>
                            </td>
                            <td style="color:var(--text-secondary);">${s.id}</td>
                            <td><span class="badge badge-info">${s.class}</span></td>
                            <td>
                                <span style="font-weight:700;color:${s.attendance>=75?'var(--success)':s.attendance>=65?'var(--warning)':'var(--danger)'};">${s.attendance}%</span>
                            </td>
                            <td>
                                <div class="attendance-toggle">
                                    <button class="toggle-btn present" id="present-${s.id}" onclick="toggleAttendance('${s.id}','present')">
                                        <i class="fas fa-check"></i> Present
                                    </button>
                                    <button class="toggle-btn" id="absent-${s.id}" onclick="toggleAttendance('${s.id}','absent')">
                                        <i class="fas fa-times"></i> Absent
                                    </button>
                                </div>
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

const attendanceStatus = {};

function toggleAttendance(studentId, status) {
    attendanceStatus[studentId] = status;

    const presentBtn = document.getElementById(`present-${studentId}`);
    const absentBtn = document.getElementById(`absent-${studentId}`);

    if (status === 'present') {
        presentBtn.className = 'toggle-btn present';
        absentBtn.className = 'toggle-btn';
    } else {
        presentBtn.className = 'toggle-btn';
        absentBtn.className = 'toggle-btn absent';
    }
    updateAttendanceCounts();
}

function updateAttendanceCounts() {
    const presentEl = document.getElementById('presentCount');
    const absentEl = document.getElementById('absentCount');
    if (!presentEl) return;

    const present = Object.values(attendanceStatus).filter(s => s === 'present').length;
    const absent = Object.values(attendanceStatus).filter(s => s === 'absent').length;
    presentEl.textContent = present;
    absentEl.textContent = absent;
}

function markAllPresent() {
    MockData.students.forEach(s => toggleAttendance(s.id, 'present'));
    showToast('success', 'All Present', 'All students marked as present');
}

function saveAttendance() {
    showToast('success', 'Attendance Saved', 'Attendance for today has been recorded successfully');
}

function filterAttendanceTable(query) {
    document.querySelectorAll('#attendanceTableBody tr').forEach(row => {
        const name = row.querySelector('.student-name')?.textContent.toLowerCase() || '';
        row.style.display = name.includes(query.toLowerCase()) ? '' : 'none';
    });
}

function renderStudentAttendance() {
    const days = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Fill calendar
    const calDays = [];
    for (let i = 0; i < firstDay; i++) calDays.push({ day: '', type: 'empty' });
    for (let d = 1; d <= daysInMonth; d++) {
        let type = 'normal';
        if (d === today.getDate()) type = 'today';
        else if (d < today.getDate()) {
            const r = Math.random();
            type = r > 0.15 ? 'present' : 'absent';
        }
        calDays.push({ day: d, type });
    }

    const monthName = today.toLocaleString('default', {month:'long', year:'numeric'});

    return `
        <div class="page-header">
            <h1 class="page-title">Attendance Overview</h1>
            <p class="page-subtitle">Track your attendance across all subjects</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card blue">
                <div class="stat-card-header"><div class="stat-icon blue"><i class="fas fa-percentage"></i></div></div>
                <div class="stat-value">88%</div>
                <div class="stat-label">Overall Attendance</div>
            </div>
            <div class="stat-card green">
                <div class="stat-card-header"><div class="stat-icon green"><i class="fas fa-calendar-check"></i></div></div>
                <div class="stat-value">105</div>
                <div class="stat-label">Days Present</div>
            </div>
            <div class="stat-card red">
                <div class="stat-card-header"><div class="stat-icon red"><i class="fas fa-calendar-times"></i></div></div>
                <div class="stat-value">15</div>
                <div class="stat-label">Days Absent</div>
            </div>
        </div>

        <div class="two-col-grid">
            <!-- Calendar -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">📅 Attendance Calendar</div>
                        <div class="card-subtitle">${monthName}</div>
                    </div>
                    <div style="display:flex;gap:0.5rem;font-size:0.75rem;">
                        <span class="badge badge-success">Present</span>
                        <span class="badge badge-danger">Absent</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="calendar-grid">
                        ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => `
                            <div class="calendar-day-header">${d}</div>
                        `).join('')}
                        ${calDays.map(d => `
                            <div class="calendar-day ${d.type}">${d.day}</div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Subject Attendance -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Subject-wise Attendance</div>
                        <div class="card-subtitle">Attendance per subject this semester</div>
                    </div>
                </div>
                <div class="card-body">
                    ${MockData.subjectAttendance.map(s => `
                    <div style="margin-bottom:1.25rem;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem;">
                            <span style="font-size:0.85rem;font-weight:600;color:var(--text-primary);">${s.subject}</span>
                            <span style="font-size:0.85rem;font-weight:700;color:${s.percentage>=75?'var(--success)':s.percentage>=65?'var(--warning)':'var(--danger)'};">${s.percentage}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${s.percentage>=75?'good':s.percentage>=65?'warning':'bad'}" style="width:${s.percentage}%;"></div>
                        </div>
                        <div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.3rem;">${s.classes}</div>
                    </div>
                    `).join('')}
                    <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:var(--radius-md);padding:0.85rem;margin-top:0.5rem;">
                        <div style="font-size:0.8rem;color:var(--warning);font-weight:600;">
                            <i class="fas fa-info-circle" style="margin-right:0.4rem;"></i>
                            Minimum 75% attendance required for eligibility
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Attendance Chart -->
        <div class="card" style="margin-top:0;">
            <div class="card-header">
                <div>
                    <div class="card-title">Attendance Trend</div>
                    <div class="card-subtitle">Your attendance vs class average</div>
                </div>
            </div>
            <div class="card-body">
                <div class="chart-container" style="height:220px;">
                    <canvas id="studentAttendanceChart"></canvas>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// ASSIGNMENTS PAGES
// ========================================
function renderTeacherAssignments() {
    return `
        <div class="page-header">
            <h1 class="page-title">Assignment Management</h1>
            <p class="page-subtitle">Create and monitor assignments across your subjects</p>
        </div>

        <!-- Create Assignment Form -->
        <div class="create-form">
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
                <div style="width:36px;height:36px;border-radius:var(--radius-sm);background:rgba(99,102,241,0.12);color:var(--primary);display:flex;align-items:center;justify-content:center;">
                    <i class="fas fa-plus"></i>
                </div>
                <div>
                    <div style="font-weight:700;color:var(--text-primary);">Create New Assignment</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">Fill in the details below</div>
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group-app">
                    <label>Assignment Title *</label>
                    <input type="text" class="form-control" placeholder="e.g., Data Structures Lab 6" id="assignTitle">
                </div>
                <div class="form-group-app">
                    <label>Subject *</label>
                    <select class="form-control" id="assignSubject">
                        <option value="">Select Subject</option>
                        <option>Data Structures</option>
                        <option>DBMS</option>
                        <option>Operating Systems</option>
                        <option>Computer Networks</option>
                        <option>Software Engineering</option>
                    </select>
                </div>
                <div class="form-group-app">
                    <label>Deadline *</label>
                    <input type="date" class="form-control" id="assignDeadline">
                </div>
                <div class="form-group-app">
                    <label>Class</label>
                    <select class="form-control">
                        <option>All Classes</option>
                        <option>CS-3A</option>
                        <option>CS-3B</option>
                    </select>
                </div>
            </div>
            <div class="form-group-app" style="margin-top:0.75rem;">
                <label>Description *</label>
                <textarea class="form-control" placeholder="Describe the assignment requirements..." id="assignDesc"></textarea>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:0.75rem;margin-top:1rem;">
                <button class="btn-sm btn-outline" onclick="clearAssignmentForm()">Clear</button>
                <button class="btn-sm btn-primary-sm" style="padding:0.65rem 1.5rem;" onclick="createAssignment()">
                    <i class="fas fa-paper-plane" style="margin-right:0.5rem;"></i>Create Assignment
                </button>
            </div>
        </div>

        <!-- Assignments List -->
        <div class="section-divider">
            <span class="section-divider-title">All Assignments</span>
            <div class="section-divider-line"></div>
        </div>

        ${MockData.assignments.map(a => {
            const pct = Math.round((a.submitted / a.total) * 100);
            return `
        <div class="assignment-card ${a.status === 'Closed' ? 'submitted' : 'pending'}">
            <div class="assignment-header">
                <div>
                    <div class="assignment-title">${a.title}</div>
                    <div class="assignment-subject">
                        <i class="fas fa-book" style="margin-right:0.3rem;"></i>${a.subject}
                    </div>
                </div>
                <span class="badge ${a.status === 'Active' ? 'badge-success' : 'badge-gray'}">${a.status}</span>
            </div>
            <div class="assignment-desc">${a.desc}</div>
            <div style="margin-bottom:0.75rem;">
                <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem;font-size:0.8rem;">
                    <span style="color:var(--text-muted);">Submissions</span>
                    <span style="font-weight:700;color:var(--text-primary);">${a.submitted}/${a.total}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill primary" style="width:${pct}%;"></div>
                </div>
            </div>
            <div class="assignment-meta">
                <span><i class="fas fa-calendar-alt"></i> Due: ${a.deadline}</span>
                <span><i class="fas fa-users"></i> ${a.submitted} submitted</span>
                <span><i class="fas fa-clock"></i> ${a.total - a.submitted} pending</span>
            </div>
        </div>
        `;}).join('')}
    `;
}

function renderStudentAssignments() {
    return `
        <div class="page-header">
            <h1 class="page-title">My Assignments</h1>
            <p class="page-subtitle">View and track all your assignment submissions</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card orange">
                <div class="stat-card-header"><div class="stat-icon orange"><i class="fas fa-clock"></i></div></div>
                <div class="stat-value">2</div>
                <div class="stat-label">Pending</div>
            </div>
            <div class="stat-card green">
                <div class="stat-card-header"><div class="stat-icon green"><i class="fas fa-check-circle"></i></div></div>
                <div class="stat-value">1</div>
                <div class="stat-label">Submitted</div>
            </div>
            <div class="stat-card red">
                <div class="stat-card-header"><div class="stat-icon red"><i class="fas fa-exclamation-circle"></i></div></div>
                <div class="stat-value">1</div>
                <div class="stat-label">Overdue</div>
            </div>
        </div>

        <!-- Filter -->
        <div class="filter-bar">
            <div class="search-input-group">
                <i class="fas fa-search"></i>
                <input type="text" placeholder="Search assignment...">
            </div>
            <select class="filter-select">
                <option>All Subjects</option>
                <option>Data Structures</option>
                <option>DBMS</option>
                <option>OS</option>
                <option>CN</option>
            </select>
            <select class="filter-select">
                <option>All Status</option>
                <option>pending</option>
                <option>submitted</option>
                <option>overdue</option>
            </select>
        </div>

        ${MockData.studentAssignments.map(a => `
        <div class="assignment-card ${a.status}">
            <div class="assignment-header">
                <div>
                    <div class="assignment-title">${a.title}</div>
                    <div class="assignment-subject">
                        <i class="fas fa-book" style="margin-right:0.3rem;"></i>${a.subject}
                    </div>
                </div>
                <span class="badge ${a.status==='submitted'?'badge-success':a.status==='overdue'?'badge-danger':'badge-warning'}">
                    ${a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                </span>
            </div>
            <div class="assignment-desc">${a.desc}</div>
            <div class="assignment-meta">
                <span><i class="fas fa-calendar-alt"></i> Due: ${a.deadline}</span>
            </div>
            ${a.status === 'pending' ? `
            <div style="margin-top:1rem;">
                <button class="btn-sm btn-primary-sm" onclick="showToast('success','Submitted!','Assignment submitted successfully')">
                    <i class="fas fa-upload" style="margin-right:0.4rem;"></i>Submit Assignment
                </button>
            </div>` : ''}
            ${a.status === 'submitted' ? `
            <div style="margin-top:0.75rem;padding:0.5rem 0.85rem;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:var(--radius-sm);display:inline-flex;align-items:center;gap:0.4rem;font-size:0.8rem;color:var(--success);font-weight:600;">
                <i class="fas fa-check-circle"></i> Submitted successfully
            </div>` : ''}
            ${a.status === 'overdue' ? `
            <div style="margin-top:0.75rem;padding:0.5rem 0.85rem;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:var(--radius-sm);display:inline-flex;align-items:center;gap:0.4rem;font-size:0.8rem;color:var(--danger);font-weight:600;">
                <i class="fas fa-exclamation-circle"></i> Deadline passed
            </div>` : ''}
        </div>
        `).join('')}
    `;
}

// ========================================
// FEEDBACK PAGES
// ========================================
function renderTeacherFeedback() {
    return `
        <div class="page-header">
            <h1 class="page-title">Feedback System</h1>
            <p class="page-subtitle">Send personalized feedback to your students</p>
        </div>

        <!-- Send Feedback Form -->
        <div class="create-form">
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
                <div style="width:36px;height:36px;border-radius:var(--radius-sm);background:rgba(99,102,241,0.12);color:var(--primary);display:flex;align-items:center;justify-content:center;">
                    <i class="fas fa-paper-plane"></i>
                </div>
                <div>
                    <div style="font-weight:700;color:var(--text-primary);">Send New Feedback</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">Provide constructive feedback to students</div>
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group-app">
                    <label>Student *</label>
                    <select class="form-control">
                        <option>Select Student</option>
                        ${MockData.students.map(s => `<option>${s.name} (${s.id})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group-app">
                    <label>Subject *</label>
                    <select class="form-control">
                        <option>Select Subject</option>
                        <option>Data Structures</option>
                        <option>DBMS</option>
                        <option>Operating Systems</option>
                        <option>Computer Networks</option>
                        <option>Overall Performance</option>
                    </select>
                </div>
            </div>
            <div class="form-group-app" style="margin-top:0.75rem;">
                <label>Feedback Type</label>
                <div style="display:flex;gap:0.75rem;margin-top:0.25rem;">
                    <label style="display:flex;align-items:center;gap:0.4rem;font-size:0.85rem;cursor:pointer;color:var(--text-secondary);">
                        <input type="radio" name="fbtype" value="positive" checked> Positive
                    </label>
                    <label style="display:flex;align-items:center;gap:0.4rem;font-size:0.85rem;cursor:pointer;color:var(--text-secondary);">
                        <input type="radio" name="fbtype" value="constructive"> Constructive
                    </label>
                    <label style="display:flex;align-items:center;gap:0.4rem;font-size:0.85rem;cursor:pointer;color:var(--text-secondary);">
                        <input type="radio" name="fbtype" value="improvement"> Needs Improvement
                    </label>
                </div>
            </div>
            <div class="form-group-app" style="margin-top:0.75rem;">
                <label>Rating</label>
                <div style="display:flex;gap:0.5rem;margin-top:0.25rem;">
                    ${[1,2,3,4,5].map(i => `<span class="star" style="font-size:1.3rem;cursor:pointer;" onclick="setRating(${i})" id="star-${i}">★</span>`).join('')}
                </div>
            </div>
            <div class="form-group-app" style="margin-top:0.75rem;">
                <label>Feedback Message *</label>
                <textarea class="form-control" placeholder="Write your detailed feedback here..." style="min-height:120px;"></textarea>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:0.75rem;margin-top:1rem;">
                <button class="btn-sm btn-outline">Clear</button>
                <button class="btn-sm btn-primary-sm" style="padding:0.65rem 1.5rem;" onclick="showToast('success','Feedback Sent','Feedback has been sent to the student successfully')">
                    <i class="fas fa-paper-plane" style="margin-right:0.5rem;"></i>Send Feedback
                </button>
            </div>
        </div>

        <!-- Recent Feedback Sent -->
        <div class="section-divider">
            <span class="section-divider-title">Recently Sent Feedback</span>
            <div class="section-divider-line"></div>
        </div>

        ${MockData.feedbacks.map(f => renderFeedbackCard(f, 'teacher')).join('')}
    `;
}

function renderStudentFeedback() {
    return `
        <div class="page-header">
            <h1 class="page-title">My Feedback</h1>
            <p class="page-subtitle">Feedback received from your faculty</p>
        </div>

        <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);">
            <div class="stat-card blue">
                <div class="stat-card-header"><div class="stat-icon blue"><i class="fas fa-comments"></i></div></div>
                <div class="stat-value">3</div>
                <div class="stat-label">Total Feedback</div>
            </div>
            <div class="stat-card green">
                <div class="stat-card-header"><div class="stat-icon green"><i class="fas fa-smile"></i></div></div>
                <div class="stat-value">2</div>
                <div class="stat-label">Positive</div>
            </div>
            <div class="stat-card orange">
                <div class="stat-card-header"><div class="stat-icon orange"><i class="fas fa-star"></i></div></div>
                <div class="stat-value">4.7</div>
                <div class="stat-label">Avg. Rating</div>
            </div>
        </div>

        ${MockData.feedbacks.map(f => renderFeedbackCard(f, 'student')).join('')}
    `;
}

function renderFeedbackCard(f, viewAs) {
    const stars = [1,2,3,4,5].map(i =>
        `<span class="star ${i <= f.rating ? '' : 'empty'}">★</span>`
    ).join('');

    return `
    <div class="feedback-card">
        <div class="feedback-header">
            <div class="feedback-from">
                <div class="feedback-avatar" style="background:${f.color};">
                    ${f.from.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div>
                    <div class="feedback-sender-name">${viewAs === 'student' ? f.from : `To: ${f.to}`}</div>
                    <div class="feedback-sender-role">${f.subject}</div>
                </div>
            </div>
            <div style="text-align:right;">
                <div class="feedback-time">${f.time}</div>
                <span class="badge ${f.type === 'Positive' ? 'badge-success' : 'badge-warning'}" style="margin-top:0.3rem;">${f.type}</span>
            </div>
        </div>
        <div class="feedback-body">${f.message}</div>
        <div class="feedback-rating">${stars}</div>
    </div>
    `;
}

function setRating(val) {
    [1,2,3,4,5].forEach(i => {
        document.getElementById(`star-${i}`).style.color = i <= val ? 'var(--warning)' : 'var(--border)';
    });
}

// ========================================
// ANNOUNCEMENTS PAGES
// ========================================
function renderTeacherAnnouncements() {
    return `
        <div class="page-header">
            <h1 class="page-title">Announcements</h1>
            <p class="page-subtitle">Create and manage announcements for your students</p>
        </div>

        <!-- Create Announcement -->
        <div class="create-form">
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
                <div style="width:36px;height:36px;border-radius:var(--radius-sm);background:rgba(245,158,11,0.12);color:var(--warning);display:flex;align-items:center;justify-content:center;">
                    <i class="fas fa-bullhorn"></i>
                </div>
                <div>
                    <div style="font-weight:700;color:var(--text-primary);">Post New Announcement</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">Reach all your students instantly</div>
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group-app">
                    <label>Announcement Title *</label>
                    <input type="text" class="form-control" placeholder="e.g., Exam Schedule Update">
                </div>
                <div class="form-group-app">
                    <label>Priority</label>
                    <select class="form-control">
                        <option value="info">Normal</option>
                        <option value="urgent">Urgent</option>
                        <option value="success">Informational</option>
                    </select>
                </div>
                <div class="form-group-app">
                    <label>Target Audience</label>
                    <select class="form-control">
                        <option>All Students</option>
                        <option>CS-3A Only</option>
                        <option>CS-3B Only</option>
                    </select>
                </div>
                <div class="form-group-app">
                    <label>Tags (optional)</label>
                    <input type="text" class="form-control" placeholder="e.g., Exam, Important">
                </div>
            </div>
            <div class="form-group-app" style="margin-top:0.75rem;">
                <label>Message *</label>
                <textarea class="form-control" placeholder="Write your announcement message..." style="min-height:120px;"></textarea>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:0.75rem;margin-top:1rem;">
                <button class="btn-sm btn-outline">Clear</button>
                <button class="btn-sm btn-primary-sm" style="padding:0.65rem 1.5rem;" onclick="showToast('success','Posted!','Announcement has been posted to all students')">
                    <i class="fas fa-bullhorn" style="margin-right:0.5rem;"></i>Post Announcement
                </button>
            </div>
        </div>

        <!-- Existing Announcements -->
        <div class="section-divider">
            <span class="section-divider-title">Posted Announcements</span>
            <div class="section-divider-line"></div>
        </div>

        ${MockData.announcements.map(a => renderAnnouncementCard(a, true)).join('')}
    `;
}

function renderStudentAnnouncements() {
    return `
        <div class="page-header">
            <h1 class="page-title">Announcements</h1>
            <p class="page-subtitle">Stay updated with the latest news and notices</p>
        </div>

        <div class="filter-bar">
            <div class="search-input-group">
                <i class="fas fa-search"></i>
                <input type="text" placeholder="Search announcements...">
            </div>
            <select class="filter-select">
                <option>All Types</option>
                <option>Urgent</option>
                <option>Info</option>
            </select>
        </div>

        ${MockData.announcements.map(a => renderAnnouncementCard(a, false)).join('')}
    `;
}

function renderAnnouncementCard(a, isTeacher) {
    const typeColors = {
        urgent: 'var(--danger)',
        info: 'var(--info)',
        success: 'var(--success)'
    };
    const typeBadge = {
        urgent: 'badge-danger',
        info: 'badge-info',
        success: 'badge-success'
    };

    return `
    <div class="announcement-card ${a.type}">
        <div class="announcement-header">
            <div>
                <div class="announcement-title">${a.title}</div>
                <div class="announcement-meta">
                    <i class="fas fa-user" style="margin-right:0.3rem;"></i>${a.author} &nbsp;•&nbsp;
                    <i class="fas fa-clock" style="margin-right:0.3rem;"></i>${a.time}
                </div>
            </div>
            <div style="display:flex;gap:0.5rem;align-items:flex-start;">
                <span class="badge ${typeBadge[a.type]}">${a.type.charAt(0).toUpperCase() + a.type.slice(1)}</span>
                ${isTeacher ? `<button class="btn-sm btn-outline" title="Edit" style="font-size:0.7rem;padding:0.25rem 0.6rem;">
                    <i class="fas fa-edit"></i>
                </button>` : ''}
            </div>
        </div>
        <div class="announcement-body">${a.content}</div>
        <div style="display:flex;gap:0.5rem;margin-top:0.75rem;">
            ${a.tags.map(t => `<span class="badge badge-gray">${t}</span>`).join('')}
        </div>
    </div>
    `;
}

// ========================================
// REPORTS PAGE
// ========================================
function renderReports() {
    return `
        <div class="page-header">
            <h1 class="page-title">Reports & Analytics</h1>
            <p class="page-subtitle">Comprehensive insights into attendance and academic performance</p>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
            <div class="stat-card blue">
                <div class="stat-card-header"><div class="stat-icon blue"><i class="fas fa-chart-line"></i></div></div>
                <div class="stat-value">85.4%</div>
                <div class="stat-label">Overall Attendance</div>
            </div>
            <div class="stat-card red">
                <div class="stat-card-header"><div class="stat-icon red"><i class="fas fa-exclamation-triangle"></i></div></div>
                <div class="stat-value">8</div>
                <div class="stat-label">Total Defaulters</div>
            </div>
            <div class="stat-card green">
                <div class="stat-card-header"><div class="stat-icon green"><i class="fas fa-check-circle"></i></div></div>
                <div class="stat-value">120</div>
                <div class="stat-label">Above 75%</div>
            </div>
            <div class="stat-card orange">
                <div class="stat-card-header"><div class="stat-icon orange"><i class="fas fa-calendar"></i></div></div>
                <div class="stat-value">Jan 2025</div>
                <div class="stat-label">Current Month</div>
            </div>
        </div>

        <!-- Charts Row -->
        <div class="two-col-grid">
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Monthly Attendance Trend</div>
                        <div class="card-subtitle">Class-wide attendance over time</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="monthlyTrendChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Attendance Distribution</div>
                        <div class="card-subtitle">Students by attendance range</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="distributionChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Subject Performance Chart -->
        <div class="card" style="margin-top:0;">
            <div class="card-header">
                <div>
                    <div class="card-title">Subject-wise Average Attendance</div>
                    <div class="card-subtitle">Performance comparison across subjects</div>
                </div>
                <div class="card-actions">
                    <button class="btn-sm btn-outline" onclick="showToast('info','Exporting','Generating PDF report...')">
                        <i class="fas fa-download" style="margin-right:0.4rem;"></i>Export PDF
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="chart-container" style="height:220px;">
                    <canvas id="subjectBarChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Defaulter List -->
        <div class="card" style="margin-top:0;">
            <div class="card-header">
                <div>
                    <div class="card-title">⚠️ Complete Defaulter List</div>
                    <div class="card-subtitle">Students requiring immediate attention</div>
                </div>
                <div class="card-actions">
                    <button class="btn-sm btn-outline" onclick="showToast('info','Export','Defaulter list exported')">
                        <i class="fas fa-file-export" style="margin-right:0.4rem;"></i>Export
                    </button>
                </div>
            </div>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Class</th>
                            <th>Attendance %</th>
                            <th>Classes Missed</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${MockData.students.filter(s => s.attendance < 80).map(s => `
                        <tr>
                            <td>
                                <div class="student-info">
                                    <div class="student-avatar" style="background:${s.color};">
                                        ${s.name.split(' ').map(n=>n[0]).join('')}
                                    </div>
                                    <div>
                                        <div class="student-name">${s.name}</div>
                                        <div class="student-id">${s.id}</div>
                                    </div>
                                </div>
                            </td>
                            <td><span class="badge badge-info">${s.class}</span></td>
                            <td>
                                <span style="font-weight:700;font-size:1rem;color:${s.attendance<65?'var(--danger)':'var(--warning)'};">${s.attendance}%</span>
                            </td>
                            <td style="color:var(--text-secondary);">${Math.round((100-s.attendance)*0.24)} classes</td>
                            <td>
                                <span class="badge ${s.attendance<65?'badge-danger':'badge-warning'}">${s.status}</span>
                            </td>
                            <td>
                                <button class="btn-sm btn-primary-sm" onclick="showToast('success','Notified',\`${s.name} has been notified\`)">
                                    Notify
                                </button>
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Coming Soon Features -->
        <div class="section-divider" style="margin-top:2rem;">
            <span class="section-divider-title">Upcoming Features</span>
            <div class="section-divider-line"></div>
        </div>

        <div class="coming-soon-grid">
            <div class="coming-soon-card">
                <div class="coming-soon-icon" style="color:#6366f1;"><i class="fas fa-qrcode"></i></div>
                <div class="coming-soon-title">QR Attendance</div>
                <div class="coming-soon-desc">Scan QR codes for instant contactless attendance marking</div>
                <div class="coming-soon-badge">Coming Soon</div>
            </div>
            <div class="coming-soon-card">
                <div class="coming-soon-icon" style="color:#10b981;"><i class="fas fa-robot"></i></div>
                <div class="coming-soon-title">AI Insights</div>
                <div class="coming-soon-desc">Machine learning powered predictions for attendance patterns</div>
                <div class="coming-soon-badge">Coming Soon</div>
            </div>
            <div class="coming-soon-card">
                <div class="coming-soon-icon" style="color:#f59e0b;"><i class="fas fa-users-cog"></i></div>
                <div class="coming-soon-title">Parent Portal</div>
                <div class="coming-soon-desc">Allow parents to view their child's academic progress</div>
                <div class="coming-soon-badge">Coming Soon</div>
            </div>
            <div class="coming-soon-card">
                <div class="coming-soon-icon" style="color:#ef4444;"><i class="fas fa-file-medical"></i></div>
                <div class="coming-soon-title">Leave Management</div>
                <div class="coming-soon-desc">Digital leave request and approval workflow system</div>
                <div class="coming-soon-badge">Coming Soon</div>
            </div>
            <div class="coming-soon-card">
                <div class="coming-soon-icon" style="color:#8b5cf6;"><i class="fas fa-trophy"></i></div>
                <div class="coming-soon-title">Exam Results</div>
                <div class="coming-soon-desc">Publish and manage semester examination results online</div>
                <div class="coming-soon-badge">Coming Soon</div>
            </div>
            <div class="coming-soon-card">
                <div class="coming-soon-icon" style="color:#06b6d4;"><i class="fas fa-edit"></i></div>
                <div class="coming-soon-title">Attendance Correction</div>
                <div class="coming-soon-desc">Student requests for attendance correction with proof upload</div>
                <div class="coming-soon-badge">Coming Soon</div>
            </div>
        </div>
    `;
}

// ========================================
// PERFORMANCE PAGE (STUDENT)
// ========================================
function renderPerformance() {
    return `
        <div class="page-header">
            <h1 class="page-title">Performance Summary</h1>
            <p class="page-subtitle">Your academic performance overview for Semester 5</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card blue">
                <div class="stat-card-header"><div class="stat-icon blue"><i class="fas fa-chart-line"></i></div></div>
                <div class="stat-value">8.6</div>
                <div class="stat-label">Current GPA</div>
            </div>
            <div class="stat-card green">
                <div class="stat-card-header"><div class="stat-icon green"><i class="fas fa-trophy"></i></div></div>
                <div class="stat-value">#3</div>
                <div class="stat-label">Class Rank</div>
            </div>
            <div class="stat-card purple">
                <div class="stat-card-header"><div class="stat-icon purple"><i class="fas fa-star"></i></div></div>
                <div class="stat-value">A+</div>
                <div class="stat-label">Overall Grade</div>
            </div>
            <div class="stat-card orange">
                <div class="stat-card-header"><div class="stat-icon orange"><i class="fas fa-tasks"></i></div></div>
                <div class="stat-value">92%</div>
                <div class="stat-label">Assignments Done</div>
            </div>
        </div>

        <div class="two-col-grid">
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Subject Performance</div>
                        <div class="card-subtitle">Marks overview by subject</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="performanceRadarChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">Class Rank Comparison</div>
                        <div class="card-subtitle">Performance vs top rankers</div>
                    </div>
                </div>
                <div class="card-body" style="padding-top:0.5rem;">
                    ${[
                        {rank:1, name:'Priya Menon', gpa:'9.2', color:'#f59e0b'},
                        {rank:2, name:'Nisha Gupta', gpa:'8.9', color:'#94a3b8'},
                        {rank:3, name:'Aanya Patel', gpa:'8.6', color:'#b45309', isMe:true},
                        {rank:4, name:'Arjun Verma', gpa:'8.2', color:'#6366f1'},
                        {rank:5, name:'Karan Singh', gpa:'7.8', color:'#10b981'},
                    ].map(s => `
                    <div class="list-item">
                        <div class="rank-badge rank-${Math.min(s.rank, 4)}">${s.rank}</div>
                        <div style="flex:1;padding-left:0.75rem;">
                            <div style="font-size:0.875rem;font-weight:${s.isMe?'700':'500'};color:${s.isMe?'var(--primary)':'var(--text-primary)'};">
                                ${s.name} ${s.isMe ? '(You)' : ''}
                            </div>
                        </div>
                        <span style="font-size:0.875rem;font-weight:700;color:var(--text-primary);">${s.gpa}</span>
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- Subject Marks Table -->
        <div class="card" style="margin-top:0;">
            <div class="card-header">
                <div>
                    <div class="card-title">Subject-wise Marks</div>
                    <div class="card-subtitle">Mid-term assessment marks</div>
                </div>
            </div>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Internal (30)</th>
                            <th>Mid-Term (20)</th>
                            <th>Attendance</th>
                            <th>Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${[
                            {sub:'Data Structures', internal:27, mid:18, att:92, grade:'A+'},
                            {sub:'DBMS', internal:25, mid:16, att:88, grade:'A'},
                            {sub:'Operating Systems', internal:22, mid:15, att:85, grade:'A'},
                            {sub:'Computer Networks', internal:20, mid:14, att:79, grade:'B+'},
                            {sub:'Software Engineering', internal:28, mid:19, att:96, grade:'A+'},
                        ].map(s => `
                        <tr>
                            <td style="font-weight:600;">${s.sub}</td>
                            <td>
                                <span style="font-weight:700;color:${s.internal>=25?'var(--success)':s.internal>=20?'var(--warning)':'var(--danger)'};">${s.internal}/30</span>
                            </td>
                            <td>
                                <span style="font-weight:700;color:${s.mid>=16?'var(--success)':s.mid>=12?'var(--warning)':'var(--danger)'};">${s.mid}/20</span>
                            </td>
                            <td>
                                <div style="display:flex;align-items:center;gap:0.5rem;">
                                    <div class="progress-bar" style="width:70px;">
                                        <div class="progress-fill ${s.att>=75?'good':'bad'}" style="width:${s.att}%;"></div>
                                    </div>
                                    <span style="font-size:0.8rem;font-weight:600;">${s.att}%</span>
                                </div>
                            </td>
                            <td><span class="badge badge-success">${s.grade}</span></td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Coming Soon -->
        <div class="section-divider" style="margin-top:2rem;">
            <span class="section-divider-title">Upcoming Features</span>
            <div class="section-divider-line"></div>
        </div>

        <div class="coming-soon-grid">
            <div class="coming-soon-card">
                <div class="coming-soon-icon" style="color:#6366f1;"><i class="fas fa-trophy"></i></div>
                <div class="coming-soon-title">Exam Results</div>
                <div class="coming-soon-desc">View your semester final exam results and grade cards</div>
                <div class="coming-soon-badge">Coming Soon</div>
            </div>
            <div class="coming-soon-card">
                <div class="coming-soon-icon" style="color:#10b981;"><i class="fas fa-chart-bar"></i></div>
                <div class="coming-soon-title">Academic Tracking</div>
                <div class="coming-soon-desc">Complete semester-wise academic performance history</div>
                <div class="coming-soon-badge">Coming Soon</div>
            </div>
            <div class="coming-soon-card">
                <div class="coming-soon-icon" style="color:#f59e0b;"><i class="fas fa-file-medical"></i></div>
                <div class="coming-soon-title">Leave Requests</div>
                <div class="coming-soon-desc">Submit and track leave requests digitally</div>
                <div class="coming-soon-badge">Coming Soon</div>
            </div>
        </div>
    `;
}

// ========================================
// CHART INITIALIZATION
// ========================================
function initDashboardCharts() {
    const isDark = AppState.darkMode;
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor, font: { size: 12 } } } },
        scales: {
            x: { grid: { color: gridColor }, ticks: { color: textColor } },
            y: { grid: { color: gridColor }, ticks: { color: textColor } }
        }
    };

    // Attendance Trend Chart
    const trendCanvas = document.getElementById('attendanceTrendChart');
    if (trendCanvas) {
        const ctx = trendCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 250);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

        AppState.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: MockData.attendanceData.months,
                datasets: [
                    {
                        label: AppState.currentRole === 'teacher' ? 'Class Average' : 'My Attendance',
                        data: MockData.attendanceData.classAvg,
                        borderColor: '#6366f1',
                        backgroundColor: gradient,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#6366f1',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5
                    }
                ]
            },
            options: {
                ...defaultOptions,
                scales: {
                    ...defaultOptions.scales,
                    y: { ...defaultOptions.scales.y, min: 60, max: 100, ticks: { color: textColor, callback: v => v + '%' } }
                }
            }
        });
    }

    // Subject Attendance Chart (Horizontal Bar - Teacher only)
    const subCanvas = document.getElementById('subjectAttendanceChart');
    if (subCanvas) {
        AppState.charts.subject = new Chart(subCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: MockData.subjectAttendance.map(s => s.subject.split(' ')[0]),
                datasets: [{
                    label: 'Avg. Attendance %',
                    data: [88, 82, 85, 90, 79],
                    backgroundColor: ['rgba(99,102,241,0.8)', 'rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(139,92,246,0.8)', 'rgba(6,182,212,0.8)'],
                    borderRadius: 6
                }]
            },
            options: {
                ...defaultOptions,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: {
                    x: { ...defaultOptions.scales.x, min: 60, max: 100, ticks: { color: textColor, callback: v => v + '%' } },
                    y: { ...defaultOptions.scales.y, grid: { display: false } }
                }
            }
        });
    }
}

function initAttendanceCharts() {
    const isDark = AppState.darkMode;
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    const canvas = document.getElementById('studentAttendanceChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const g1 = ctx.createLinearGradient(0, 0, 0, 200);
        g1.addColorStop(0, 'rgba(99,102,241,0.2)');
        g1.addColorStop(1, 'rgba(99,102,241,0)');

        AppState.charts.att = new Chart(ctx, {
            type: 'line',
            data: {
                labels: MockData.attendanceData.months,
                datasets: [
                    {
                        label: 'My Attendance',
                        data: MockData.attendanceData.myAttendance,
                        borderColor: '#6366f1',
                        backgroundColor: g1,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5
                    },
                    {
                        label: 'Class Average',
                        data: MockData.attendanceData.classAvg,
                        borderColor: '#10b981',
                        backgroundColor: 'transparent',
                        borderDash: [5,5],
                        tension: 0.4,
                        pointRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: textColor } } },
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: textColor } },
                    y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => v + '%' }, min: 60, max: 100 }
                }
            }
        });
    }
}

function initReportsCharts() {
    const isDark = AppState.darkMode;
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    // Monthly Trend
    const trendCanvas = document.getElementById('monthlyTrendChart');
    if (trendCanvas) {
        const ctx = trendCanvas.getContext('2d');
        const g = ctx.createLinearGradient(0, 0, 0, 250);
        g.addColorStop(0, 'rgba(99,102,241,0.2)');
        g.addColorStop(1, 'rgba(99,102,241,0)');

        AppState.charts.monthly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
                datasets: [{
                    label: 'Class Attendance %',
                    data: [88, 82, 85, 79, 83, 87],
                    borderColor: '#6366f1',
                    backgroundColor: g,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#6366f1'
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: textColor } } },
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: textColor } },
                    y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => v+'%' }, min: 60, max: 100 }
                }
            }
        });
    }

    // Distribution Pie
    const distCanvas = document.getElementById('distributionChart');
    if (distCanvas) {
        AppState.charts.dist = new Chart(distCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Above 90%', '75-90%', '65-75%', 'Below 65%'],
                datasets: [{
                    data: [40, 80, 8, 0],
                    backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#ef4444'],
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: textColor, padding: 15 } }
                },
                cutout: '65%'
            }
        });
    }

    // Subject Bar
    const subCanvas = document.getElementById('subjectBarChart');
    if (subCanvas) {
        AppState.charts.subBar = new Chart(subCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Data Structures', 'DBMS', 'OS', 'Networks', 'SE'],
                datasets: [{
                    label: 'Average Attendance %',
                    data: [88, 82, 85, 79, 92],
                    backgroundColor: ['rgba(99,102,241,0.8)', 'rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)', 'rgba(139,92,246,0.8)'],
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: textColor } },
                    y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => v+'%' }, min: 60, max: 100 }
                }
            }
        });
    }
}

function initPerformanceCharts() {
    const isDark = AppState.darkMode;
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    const radarCanvas = document.getElementById('performanceRadarChart');
    if (radarCanvas) {
        AppState.charts.radar = new Chart(radarCanvas.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['DS', 'DBMS', 'OS', 'CN', 'SE'],
                datasets: [
                    {
                        label: 'Aanya (You)',
                        data: [90, 85, 80, 75, 95],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99,102,241,0.15)',
                        pointBackgroundColor: '#6366f1',
                        pointRadius: 4
                    },
                    {
                        label: 'Class Average',
                        data: [78, 72, 75, 70, 80],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16,185,129,0.1)',
                        borderDash: [5,5],
                        pointBackgroundColor: '#10b981',
                        pointRadius: 4
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: { color: textColor } } },
                scales: {
                    r: {
                        grid: { color: gridColor },
                        pointLabels: { color: textColor },
                        ticks: { color: textColor, backdropColor: 'transparent' },
                        min: 0, max: 100
                    }
                }
            }
        });
    }
}

// ========================================
// UI HELPERS
// ========================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    AppState.sidebarCollapsed = !AppState.sidebarCollapsed;
    sidebar.classList.toggle('collapsed', AppState.sidebarCollapsed);
    mainContent.classList.toggle('sidebar-collapsed', AppState.sidebarCollapsed);
}

function openMobileSidebar() {
    document.getElementById('sidebar').classList.add('mobile-open');
    document.getElementById('mobileOverlay').classList.add('open');
}

function closeMobileSidebar() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('mobileOverlay').classList.remove('open');
}

function toggleTheme() {
    AppState.darkMode = !AppState.darkMode;
    document.body.classList.toggle('dark-mode', AppState.darkMode);
    document.getElementById('theme-icon').className = AppState.darkMode ? 'fas fa-sun' : 'fas fa-moon';
    showToast('info', 'Theme Changed', AppState.darkMode ? 'Dark mode enabled' : 'Light mode enabled');

    // Reinit charts after theme change
    setTimeout(() => initPageScripts(AppState.currentPage), 200);
}

function toggleDropdown(id) {
    const dropdown = document.getElementById(id);
    if (!dropdown) return;
    const isOpen = dropdown.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) dropdown.classList.add('open');
}

function toggleNotifPanel() {
    const panel = document.getElementById('notifPanel');
    const isOpen = panel.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) panel.classList.add('open');
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu, .notif-panel').forEach(el => el.classList.remove('open'));
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.profile-dropdown') && !e.target.closest('.sidebar-user') &&
        !e.target.closest('.notif-panel') && !e.target.closest('.icon-btn')) {
        closeAllDropdowns();
    }
});

function markAllRead() {
    document.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
    document.querySelector('.notif-badge').style.display = 'none';
    showToast('success', 'All Read', 'All notifications marked as read');
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================
function showToast(type, title, message, duration = 4000) {
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type]} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <i class="fas fa-times toast-close" onclick="this.closest('.toast').remove()"></i>
    `;

    document.getElementById('toastContainer').appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

// ========================================
// FORM HELPERS
// ========================================
function clearAssignmentForm() {
    const fields = ['assignTitle', 'assignSubject', 'assignDeadline', 'assignDesc'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

function createAssignment() {
    const title = document.getElementById('assignTitle')?.value;
    const subject = document.getElementById('assignSubject')?.value;

    if (!title || !subject) {
        showToast('warning', 'Missing Fields', 'Please fill in all required fields');
        return;
    }
    showToast('success', 'Assignment Created', `"${title}" has been assigned to students`);
    clearAssignmentForm();
}

function openAddStudentModal() {
    showToast('info', 'Coming Soon', 'Add student modal will be available soon');
}

// ========================================
// INITIALIZE
// ========================================
window.onload = function() {
    showPage('landing-page');

    // Set minimum date for assignment deadline
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => { input.min = today; input.value = today; });
};

// Handle resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        closeMobileSidebar();
    }
});
window.showPage = showPage;
window.selectRole = selectRole;