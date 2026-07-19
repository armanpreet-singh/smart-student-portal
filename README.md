# LTSU Smart Portal

A modern, role-based university management portal designed to streamline the academic experience for students, faculty, and administrators through a unified digital platform.

The project focuses on scalability, modular architecture, reusable components, accessibility, and a production-oriented frontend built with React.

---

## Preview

### Landing Page

<p align="center">
  <img src="./preview/landing-page.png" alt="Landing Page" width="90%">
</p>

### Student Dashboard

<p align="center">
  <img src="./preview/student-dashboard.png" alt="Student Dashboard" width="90%">
</p>

### Teacher Dashboard

<p align="center">
  <img src="./preview/teacher-dashboard.png" alt="Teacher Dashboard" width="90%">
</p>

### Admin Dashboard

<p align="center">
  <img src="./preview/admin-dashboard.png" alt="Admin Dashboard" width="90%">
</p>

---

# Overview

LTSU Smart Portal is a feature-based React application that simulates a modern university management system with dedicated interfaces for different user roles.

The application emphasizes clean architecture, maintainability, responsive design, reusable UI components, and an enterprise-style dashboard experience.

Current implementation includes fully functional frontend modules with mock data and is designed for seamless backend integration.

---

# Core Features

### Landing Experience

- Responsive marketing website
- Dynamic theme support
- Smooth animations
- Feature showcase
- University branding

### Authentication

- React Hook Form
- Client-side validation
- Mock authentication
- Role selection
- Toast notifications

### Student Portal

- Academic dashboard
- Attendance analytics
- Timetable
- Course overview
- Assignment tracking
- Learning resources
- Announcements
- Academic calendar
- AI Insights (Coming Soon)
- QR Attendance (Coming Soon)

### Teacher Portal

- Faculty dashboard
- Class overview
- Attendance management
- Student management
- Assignment workflow
- Resource sharing
- Announcements
- Academic calendar

### Administrator Portal

- University overview
- Student management
- Faculty management
- Course administration
- Department management
- Attendance monitoring
- Reports & analytics
- Announcement management
- Academic calendar
- AI Analytics (Coming Soon)
- QR Campus Access (Coming Soon)

---

# Technical Highlights

- Feature-based architecture
- Reusable component system
- Role-based routing
- Responsive layouts
- Theme management
- Accessibility support
- Modern dashboard design
- Animated user experience
- Mock API-ready structure

---

# Technology Stack

| Category | Technology |
|-----------|------------|
| Framework | React 19 |
| Build Tool | Vite |
| Routing | React Router DOM |
| Forms | React Hook Form |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Styling | CSS3 (Custom Design System) |

---

# Project Architecture

```text
src
│
├── assets
├── components
├── features
│   ├── landing
│   ├── auth
│   ├── dashboard
│   ├── teacher
│   └── admin
│
├── hooks
├── styles
├── utils
│
├── App.jsx
└── main.jsx
```

The project follows a modular, feature-driven architecture that promotes scalability and separation of concerns.

Each feature maintains its own:

- Components
- Pages
- Layouts
- Styles
- Routes
- Mock Data
- Hooks
- Utilities

This structure allows independent development and easier migration to backend APIs.

---

# Design Principles

- Mobile-first responsive design
- Component reusability
- Consistent spacing system
- Accessible user interface
- Performance-oriented rendering
- Scalable folder structure
- Minimal dependencies
- Production-ready code organization

---

# Accessibility

The application includes accessibility-focused improvements including:

- Keyboard navigation
- Focus management
- Accessible forms
- Semantic HTML
- Theme support
- Accessibility preferences
- Responsive typography

---

# Backend Status

The current repository contains the frontend implementation.

Backend development is planned as a separate service using:

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- REST APIs
- Role-based Authorization

The frontend has been structured to support API integration with minimal changes.

---

# Roadmap

- Backend Integration
- JWT Authentication
- MongoDB Database
- Real-time Notifications
- QR Attendance
- AI Academic Assistant
- File Uploads
- Email Notifications
- Analytics Dashboard

---

# Development

```bash
npm install

npm run dev
```

Production build

```bash
npm run build
```

---

# Repository

```text
Frontend
│
└── LTSU Smart Portal (React + Vite)

Backend (In Progress)
│
└── Node.js + Express + MongoDB
```

---

# Author

**Armanpreet Singh**

Full Stack Developer

GitHub: https://github.com/armanpreet-singh

---

## License

This project is intended for educational, research, and portfolio purposes.
