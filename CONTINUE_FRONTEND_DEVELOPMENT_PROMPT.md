# Continue LTSU Smart Portal — Frontend Development

You are continuing work on the existing frontend in https://github.com/armanpreet-singh/smart-student-portal. Do not recreate or redesign the project.

## First actions

1. Read the latest `FRONTEND_DEVELOPMENT_HANDOFF.md` and this prompt from the frontend repository before changing files.
2. Verify live branch heads, pull requests and the current file contents. Do not assume the commit hashes below remain the latest.
3. Latest verified `main` after merging Chunk 18 PR #24 is `fb64e04b0f3f4e58e327767189f5d9430306d020`. Chunk 16 PR #22 (Admin Academic Calendar) merged at `8aa276de681933f102c58062f8616db9869a080b`; Chunk 17 PR #23 (Teacher Academic Calendar) merged at `ef599232f5eef8e4c5f107778627180bd0767c33`; Chunk 18 PR #24 (Student Academic Calendar) merged at `fb64e04b0f3f4e58e327767189f5d9430306d020`. Current Chunk 19 branch: `feat/student-announcements-capability`; PR #25 is open directly against `main`. PRs #20 and #21 and PRs #15–#19 and earlier completed Phase II PRs are merged.
4. Continue the exact next task in the latest handoff. Do not repeat the completed Teacher Attendance chunk.

## Scope and rules

- Frontend UI only. The backend repository `armanpreet-singh/ltsu-backend` is reference-only.
- Use the connected GitHub integration for direct repository work. Do not ask the user to clone/paste files.
- One cohesive screen/workflow per chunk. Preserve existing LTSU theme, routes, role layouts, CSS tokens, responsive behavior and reusable components.
- Do not make backend, database, migration, secret, or deployment changes.
- Do not claim tests/builds/commits/PRs/deployment without verifying them.
- After every chunk: read back changed files, run available checks, update both frontend handoff documents, read them back, verify branch head/CI, then stop and report.

## Source of truth and architecture

Frontend uses React 18, Vite 7, JavaScript ES modules and React Router 7. The role page trees are:
- Student: `src/features/dashboard`
- Teacher: `src/features/teacher`
- Admin: `src/features/admin`
- Authentication: `src/features/auth`

Existing theme tokens and dashboard CSS are in `src/styles/tokens.js`, `src/styles/GlobalStyles.js`, and `src/features/dashboard/styles/`. Keep the current navy/gold LTSU identity, Inter typography, dashboard CSS variables, shared cards/headers/sidebar/topbars, dark mode and breakpoints. Mock data must remain separate from page components.

Backend application roles are exactly STUDENT, TEACHER and ADMIN. Backend main currently exposes login/me/password-change; admin user/class/subject/assignment and attendance-report APIs; teacher assigned-subject/roster/bulk-attendance APIs; and student self-only attendance API. See the handoff for exact request/response and field constraints.

## Backend branch distinction — critical

- Backend `main` is the only current mainline contract. Its AttendanceStatus values are PRESENT, ABSENT, LATE, EXCUSED.
- Backend branch `attendance-duty-proof` has draft PR #1 (https://github.com/armanpreet-singh/ltsu-backend/pull/1), open/unmerged/undeployed. It introduces PRESENT, ABSENT, ON_DUTY_REVIEW, student proof submission/retrieval, teacher 30-minute corrections and Cloudinary proof storage. Its schema migration has only been tested on a temporary Neon branch; primary Neon remains unchanged. Cloudinary secrets are not configured per its handoff.
- Do not wire draft-only fields/statuses or claim they are live until backend PR #1 is merged, deployed and the database migration is applied with approval.
- Neither backend main nor the inspected draft adds User.rollNumber or class/session time. Do not substitute username, user ID, or a made-up value for official roll number.

## Completed frontend chunk

Teacher Attendance has been rebuilt on `ui/teacher-attendance-workflow` with:
- GET teacher assigned subjects, GET selected subject roster and POST bulk attendance using backend main request/response contracts;
- subject and date selection, student search, per-student current-main status selection, all-present/all-absent actions, summary, loading/error/empty/retry states;
- API-shaped mock fixtures separated into `src/features/teacher/data/mockTeacherAttendance.js`;
- demo-only browser storage and responsive styles in `src/features/teacher/styles/teacherAttendance.css`;
- explicit note that roll-number clipboard controls are unavailable until the backend exposes actual rollNumber and class-time data.
- frontend CI workflow `.github/workflows/frontend-build.yml`.

The Teacher Attendance component now consumes the shared `useAuth()` Bearer token. Login/session restoration is implemented; its live API workflow is available to verified Teacher accounts.

Teacher Attendance implementation PR #2 was merged into main at `76b7f1a4806c400811b8d6ba5bd955fb133be7a8`. The original implementation build runs `43429998901` and `43429991685` passed on head `386a37cc5c45e796bfc3ffc5d4b1832ff4576e98`.

## Completed Phase II, Chunk 10 — Admin Teacher-to-Subject Assignment UI

- Feature branch: `feat/admin-teacher-subject-assignments`, based on `main` at `d4484cfc4384b024f86ee0f4d9590d59e5bae242`.
- PR #16: https://github.com/armanpreet-singh/smart-student-portal/pull/16 merged into `main` at `fc24d228a63e61e7e628ab4cab58e959deb01e21` after rebased CI run `43560009483` passed on final PR head `14601289a1227965b66db160fdb40fe03fd941c0`.
- Reverified backend-main Admin-only `POST /api/admin/teacher-subject-assignments`; strict request body is exactly `{ teacherId, subjectId }`; success is HTTP 201 with `{ status: "ok", data: { assignment: { id, teacherId, subjectId, assignedAt } } }`.
- Backend requires an active TEACHER, active subject and active parent class; duplicate assignments return 409. The backend remains authoritative.
- Added `adminTeacherSubjectAssignmentsApi.js` with shared Bearer auth, 12-second timeout, request/response validation and handling for 400, 401, 403, 409, server, network and timeout outcomes.
- Added `TeacherSubjectAssignmentsPage.jsx` and CSS. It obtains all pages of choices from the existing Teacher Directory and Subject Catalogue endpoints, filters to active TEACHER accounts and active subjects in active classes, groups subjects by class, and provides loading/error/empty/retry states.
- The UI previews the selected teacher and subject, requires an explicit review/confirmation before POST, and displays the confirmed assignment result. It refreshes auth on 401.
- Added route `/admin/teacher-subject-assignments`, the “Teaching Assignments” Admin navigation item, and the feature branch in frontend CI.
- Backend main has no assignment-list endpoint, so no ungrounded assignments table was added.
- GitHub Actions run `43559468023` passed on final implementation head `3968938daec63a0438822c296f44969f9dbb7bd1`; `npm ci` and `npm run build` succeeded. No lint/unit-test scripts are configured.
- No live assignment mutation, backend/database/migration/secret/deployment work occurred. PR #15 (Chunk 9 Password Reset) was merged into `main` at `3a8f7fc6fcae978922b628ee9e23349c166998ed`.

## Completed Phase II, Chunk 11 — Admin Class Management UI

- Branch: `feat/admin-class-management`, based on `main` at `fc24d228a63e61e7e628ab4cab58e959deb01e21`.
- PR #17: https://github.com/armanpreet-singh/smart-student-portal/pull/17 (open, unmerged).
- Reverified backend-main class APIs: POST `/api/admin/classes` accepts exactly `{ code, name, academicYear }` and returns 201; PATCH `/api/admin/classes/:classId` accepts `code`, `name`, `academicYear`, and/or `isActive` and returns 200.
- Client validation mirrors the backend: code 1–30 characters using letters, numbers, dots, underscores or hyphens (normalized uppercase); class name 2–120 characters; academic year 4–20 characters.
- Added `adminClassManagementApi.js` for authenticated create/update requests, strict payload validation, returned class validation, timeout handling and 400/401/403/404/409/server/network error handling.
- Extended `CoursesPage.jsx` and CSS with Add Class, Edit, and confirmed Archive/Reactivate controls. Status actions update `isActive` only; no class or related records are deleted. Successful changes refresh the directory and the class filter choices.
- Subject Catalogue remains read-only; current subject search/filter/pagination are preserved.
- No live class mutation or backend/database/migration/secret/deployment change was made. Chunk 9 PR #15 and Chunk 10 PR #16 are merged into `main`.

## Completed Phase II, Chunk 12 — Admin Subject Management UI

- Branch: `feat/admin-subject-management`, based on `main` at `88503fbfb98c7229e6179ba04a45b0ec71c7745a`.
- PR #18 merged into `main` at `a188f41af7218ae3a181dd51b5d3a08f7e1a436d`. CI runs `43561272705` and `43561269307` both passed (`npm ci`, `npm run build`).
- Backend-main POST `/api/admin/subjects` accepts `{ classId, code, name, description? }`; PATCH `/api/admin/subjects/:subjectId` accepts `code`, `name`, `description`, and/or `isActive`.
- Subject create/edit/archive/reactivate UI added. New subjects require an active parent class; existing class association is fixed during edit because PATCH does not support `classId`; reactivation is blocked when the parent class is inactive.
- Validation/duplicate 409/auth/not-found/server/network/timeout handling included. No live mutation or backend/database/secret/deployment change was made.

## Completed Phase II, Chunk 13 — Admin Reports & Analytics API Alignment

- Branch `feat/admin-reports-analytics`; PR #19 merged into `main` at `641540bbd547eb6b295f746c4048be542651ce5e`.
- Reused authenticated backend-main `GET /api/admin/attendance` and its date/class/subject filters, overall aggregates and per-subject breakdown. EXCUSED is excluded from the attendance percentage denominator; null remains no eligible data.
- Replaced mock Reports & Analytics charts with the existing report component/API. Unsupported growth, department, enrollment and monthly trends are not shown as real metrics.
- Final CI PR run `43562736157` and push run `43562732174` passed on final head `67d2f26f8c6dd660b02035345a352fb11ff2f21f`.

## Completed Phase II, Chunk 14 — Admin Departments Capability Alignment

- Branch `feat/admin-departments-capability`, based on main at `641540bbd547eb6b295f746c4048be542651ce5e`; PR #20 merged at `010e99ef2474f5f63e1dfeda0b383e4b4ec159d4`.
- Backend-main has no Department model, department fields, Admin read route, service or validation schema.
- Replaced hard-coded department/HOD/student/faculty cards with an accessible capability-unavailable notice. No mock department fixture import remains in DepartmentsPage.
- GitHub Actions PR run `43563316264` and push run `43563311740` passed on PR #20 head `467c58aee195f7a32460589783e15bd62afc97d6`; post-merge main build `43566113320` passed.
- No backend, database, schema, migration, secret, deployment or live data change.

## Completed Phase II, Chunk 15 — Admin Announcements Capability Alignment

- Branch `feat/admin-announcements-capability`; PR #21 merged into main at `2a15c4a9179d99a558a43a4c6a9affb6a06b0d9e`.
- Backend-main has no Announcement/Notification Prisma model, and no Admin, Student or Teacher announcement/notification routes.
- Replaced two hard-coded sample messages and the inert New Announcement button with an accessible capability-unavailable notice. Fake audience, sent/scheduled status and sample announcement content are removed.
- Added responsive styling and GitHub Actions workflow trigger. Push run `43565264008` passed on final head `f92835bead0cd0d689df5c4f196fc46a6aa591cd`; final head `build` and Cloudflare Pages checks passed. Post-merge main build `43566205135` passed.

## Completed Phase II, Chunk 16 — Admin Academic Calendar Capability Alignment

- Branch `feat/admin-calendar-capability`, based on main at `2a15c4a9179d99a558a43a4c6a9affb6a06b0d9e`; PR #22 is open against `main`.
- Backend-main has no Calendar/AcademicCalendar/Event Prisma model and no calendar/event endpoints in Admin, Student or Teacher route files; Admin academic services and validators expose no event contract.
- Removed the two hard-coded 2023 events (“University Convocation” and “Diwali Holidays Begin”) from Admin Calendar. The page now displays an accessible capability-unavailable notice and does not imply that sample dates are official or manageable.
- Added responsive `CalendarPage.css`; preserved the existing Admin `/calendar` route, shared dashboard components and layout.
- Source read-back covered the Admin Calendar page, stylesheet, workflow and both handoff files. GitHub Actions push run `43566860529` and PR run `43566938543` both completed successfully on implementation head `c427cc3bb51e3fd1c607b7e3adae8a7c92e1981d`; both ran `npm ci` and `npm run build`. The matching Cloudflare Pages check also completed successfully.
- No backend, database, schema, migration, secret, deployment or live calendar changes were made.

## Completed Phase II, Chunk 17 — Teacher Academic Calendar Capability Alignment

- Branch `feat/teacher-calendar-capability`, stacked on PR #22 branch `feat/admin-calendar-capability`; PR #23 targets that feature branch.
- Backend-main has no Calendar/AcademicCalendar/Event Prisma model and no calendar/event routes for Teacher. Teacher routes expose assigned subjects, subject rosters and attendance marking only.
- Removed four hard-coded 2023 Teacher Calendar events (mid-semester results, faculty meeting, DBMS viva and Diwali holidays). The page now shows an accessible capability-unavailable notice with no unsupported calendar controls.
- Added responsive `TeacherCalendar.css`; preserved the Teacher calendar route, dashboard layout and shared components.
- Final head `ce23c20ee277bc3ccc21859ce0513a60d2cf164b` passed GitHub Actions push run `43567902853` (`npm ci`, `npm run build`) and Cloudflare Pages check `132365766906`.

## Completed Phase II, Chunk 18 — Student Academic Calendar Capability Alignment

- Branch `feat/student-calendar-capability`, originally stacked on PR #23; PR #24 merged into `main` at `fb64e04b0f3f4e58e327767189f5d9430306d020`.
- Backend-main has no Calendar/AcademicCalendar/Event Prisma model or Student calendar route. The Student router exposes only its authenticated attendance read endpoint.
- Removed the four hard-coded 2023 Student Calendar records (DBMS Mid-Sem, Tech Fest, CN Lab Viva and OS Mid-Sem) by replacing the page with an accessible capability-unavailable notice. The page no longer imports `calendarData`; shared `mockDashboardData.js` remains unchanged for other mock-backed dashboard screens.
- Added responsive `CalendarPage.css`; preserved the Student `/dashboard/calendar` route, page heading and shared dashboard layout.
- Source read-back covered the Student Calendar page, stylesheet, workflow and both handoff files. GitHub Actions push run `43568955517` completed successfully on implementation head `1bd74d37e695027408ae1b45e97151f596301c72`; `npm ci` and `npm run build` passed. The matching Cloudflare Pages check `132369006051` also completed successfully. The PR-specific build is not triggered while PR #24 targets a feature branch; it will run after the stack is retargeted to `main`.
- No backend, database, schema, migration, secret, deployment or live calendar changes were made.

## Completed Phase II, Chunk 19 — Student Announcements Capability Alignment

- Branch `feat/student-announcements-capability`, based directly on `main` at `fb64e04b0f3f4e58e327767189f5d9430306d020`; PR #25 is open against `main`: https://github.com/armanpreet-singh/smart-student-portal/pull/25.
- Backend-main has no Announcement/Notification Prisma model, no Student announcement read endpoint, no announcement routes in Admin or Teacher routers, and no separate notification router mounted by `src/app.js`.
- Removed the three hard-coded Student announcement samples (exam schedule, Tech Fest registrations and library timing changes), their relative timestamps and category labels. The page now shows an accessible capability-unavailable state and no longer imports `announcementsData`.
- Added responsive `AnnouncementsPage.css`; preserved the existing Student route and shared dashboard layout. Shared `mockDashboardData.js` remains unchanged for other screens.
- Implementation commit `75729955689c7f3e6f3f2921a54285704ba39713` passed GitHub Actions push run `43570280493` and PR run `43570326248` (`npm ci`, `npm run build`); Cloudflare Pages check `132373055575` passed.
- No backend, database, schema, migration, secret or deployment changes were made.

## Exact next task — Phase II, Chunk 20 (proposed): Teacher Announcements Capability Alignment

1. Inspect the Teacher navigation/routes and any Teacher announcement screen or dashboard surface.
2. Reverify backend-main for Teacher announcement/notification models, authorized routes and read endpoints.
3. Remove unsupported mock announcement content where no supported contract exists; show an accessible unavailable state.
4. Preserve existing Teacher layouts/routes and do not add backend functionality.
5. Update both handoff documents, verify CI and stop.
