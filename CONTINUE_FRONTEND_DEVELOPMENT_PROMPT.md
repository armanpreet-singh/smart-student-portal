# Continue LTSU Smart Portal — Frontend Development

You are continuing work on the existing frontend in https://github.com/armanpreet-singh/smart-student-portal. Do not recreate or redesign the project.

## First actions

1. Read the latest `FRONTEND_DEVELOPMENT_HANDOFF.md` and this prompt from the frontend repository before changing files.
2. Verify live branch heads, pull requests and the current file contents. Do not assume the commit hashes below remain the latest.
3. Live verification: PRs #45 and #47–#55 are merged into `main`; PR #55 / Chunk 44 merged at `c7572a396eb7aa19bb5c55a0eafa2349e7b176b7`. PR #46 originally merged into a feature branch; its existing Student Timetable implementation is now carried into clean `main` by PR #51.
4. Current work is Phase II, Chunk 45 — Admin Student & Teacher Directory API Contract Tests. Branch `feat/admin-user-directory-api-contract-tests` is based directly on current `main` at `c7572a396eb7aa19bb5c55a0eafa2349e7b176b7`; PR #56 is open against `main`. Do not recreate the Admin Student or Teacher directory screens.

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

- Branch `feat/teacher-calendar-capability`, originally stacked on PR #22; PR #23 merged into `main` at `ef599232f5eef8e4c5f107778627180bd0767c33`.
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

## Completed Phase II, Chunk 20 — Teacher Announcements Capability Alignment

- Branch `feat/teacher-announcements-capability`, originally stacked on PR #25 / `feat/student-announcements-capability`; PR #26 merged into `main` at `94c377726153dc86c4b578e29e9dd4745a692771`.
- Backend-main has no Announcement/Notification Prisma model, no Teacher announcement read/publish endpoint, no announcement routes in Admin or Student routers, and no separate notification router mounted by `src/app.js`.
- Removed three fixed Teacher announcement samples (syllabus completion, lab rescheduling and an extra lecture) along with target groups, relative timestamps and sent/draft states. The page now shows an accessible capability-unavailable state.
- Removed the mock announcement count from Teacher dashboard stats, the inert Send Announcement shortcut, and the unsupported notification bell/unread dot from the Teacher topbar.
- Added responsive `TeacherAnnouncements.css`; preserved the Teacher announcements route and existing shared dashboard shell/components. The announcement-specific mock statistic was removed; other `mockTeacherData.js` content remains unchanged.
- Final pre-merge head `dea3d78679476ef51f4fdb42b1bbcafd85576a59` passed GitHub Actions push run `43572152311` (`npm ci`, `npm run build`) and Cloudflare Pages check `132378738174`. Post-merge `main` build run `43572551971` also passed after PR #26 merged.
- No backend, database, schema, migration, secret or deployment changes were made.

## Completed Phase II, Chunk 21 — Teacher Dashboard Capability Alignment

- Branch `feat/teacher-dashboard-capability`, based directly on `main` at `94c377726153dc86c4b578e29e9dd4745a692771`; PR #27 merged into `main` at `c1484c39871d6ca8e195ffd555a52bb68e4f1569`: https://github.com/armanpreet-singh/smart-student-portal/pull/27.
- Backend-main provides Teacher assigned-subject lookup, active subject rosters and attendance marking; authenticated `GET /api/auth/me` returns `fullName` but no designation, department, employee ID or semester. There are no Teacher timetable, dashboard aggregate, assignment, grading, results or insights endpoints/models.
- Replaced mock Teacher identity/profile fields, fabricated stats, hard-coded daily schedule, insight alerts and inert quick actions with an accessible capability-unavailable state. The page displays only verified `user.fullName` from `AuthContext` when available.
- Added a working link to the supported Teacher Attendance workflow. Added responsive `TeacherHome.css`; preserved route and shared layout. Unrelated Teacher fixtures/pages were not changed.
- Implementation-plus-handoff head `29abbfbcc4742ecef9fbec3a684550ab71369f74` passed GitHub Actions push run `43573775688` and PR run `43573848697` (`npm ci`, `npm run build`); Cloudflare Pages check `132383569842` passed. The follow-up commit only records these results in the handoff files; dashboard source is unchanged.
- No backend, database, schema, migration, secret or deployment changes were made.

## Completed Phase II, Chunk 22 — Teacher My Classes API Alignment

- Branch `feat/teacher-classes-api`, originally stacked on PR #27 / `feat/teacher-dashboard-capability`; PR #28 merged into `main` at `2ccfe31cdfedd1437ddda5b515b0825f2be72f02` after PR #27 merged: https://github.com/armanpreet-singh/smart-student-portal/pull/28.
- Backend-main Teacher `GET /api/teacher/subjects` is protected for TEACHER sessions and returns active assignments with `assignedAt`, subject `id`, `code`, `name`, `classId`, and class `id`, `code`, `name`, `academicYear`.
- Added `src/features/teacher/api/teacherSubjectsApi.js` with Bearer token, timeout, network/authorization/server error handling and contract validation.
- Replaced the mock Teacher My Classes page with API-backed subject/class cards. Shows only verified subject code/name, class code/name/academic year and assignment date; does not show student counts, timetable data, attendance percentages or fake quick actions.
- Added loading, API error/retry and empty states, plus a working link to the existing Attendance workflow. No mock fallback.
- Added responsive `TeacherClasses.css` and updated workflow filters for stacked push and PR checks. Preserved the Teacher route and shell.
- Final handoff-inclusive head `c6a8557548b6b43cd95f3172530263ce442c1b27` passed GitHub Actions push run `43575412273` and stacked PR run `43575415501` (`npm ci`, `npm run build`); Cloudflare Pages check `132388528302` passed. A follow-up documentation-only commit records these verification results; source implementation is unchanged.
- No backend, database, schema, migration, secret or deployment changes. No live account or academic records were modified.

## Completed Phase II, Chunk 23 — Teacher Students API Alignment

- Branch `feat/teacher-students-api`, based directly on `main` at `2ccfe31cdfedd1437ddda5b515b0825f2be72f02`; PR #29 is open against `main`: https://github.com/armanpreet-singh/smart-student-portal/pull/29.
- Backend-main Teacher routes expose authenticated `GET /api/teacher/subjects` and `GET /api/teacher/subjects/:subjectId/roster`. The roster service verifies the subject belongs to the signed-in Teacher and is active (as is its class), then returns student `id`, `fullName`, `username` only.
- Extended `src/features/teacher/api/teacherSubjectsApi.js` with `fetchTeacherSubjectRoster`, including Bearer authentication, 12-second timeout, network/authorization/not-found/server error handling and strict response/identity validation.
- Replaced the mock Students page with a subject selector fed by active Teacher assignments and a roster request scoped to the selected subject. Displays full name and username; local search filters those returned fields.
- Removed mock global student rows, roll numbers, sections, attendance percentages and CGPA. Student IDs are used only for validation and stable row keys; username is not called a roll number.
- Added subject and roster loading, error/retry, empty-subject, empty-roster and no-match states. Added responsive `TeacherStudents.css`; preserved Teacher route and shell. Added branch to frontend build workflow.
- Final handoff-inclusive head `e038948b67bbe5cc685e933c9b38292cceac191e` passed GitHub Actions push run `43577766143` and PR run `43577833858` (`npm ci`, `npm run build`); Cloudflare Pages check `132395773519` passed. A follow-up documentation-only commit records these verified results; source implementation is unchanged.
- No backend, database, schema, migration, secret or deployment changes. No live Teacher account or academic records were modified.

## Completed Phase II, Chunk 24 — Teacher Assignments Capability Alignment

- Branch `feat/teacher-assignments-capability`, stacked on PR #29 / `feat/teacher-students-api` at `00cd0f68574d90816b5349a33c4f7e2544867f2e`; PR #30 is open against that branch: https://github.com/armanpreet-singh/smart-student-portal/pull/30.
- Backend-main `prisma/schema.prisma` contains User, Class, Subject, TeacherSubject and Attendance; no Assignment/Submission model exists. Teacher routes expose assigned subjects, per-subject roster and attendance marking only; there are no assignment, submission, grading or results endpoints.
- Replaced fixture-backed Teacher Assignments page with an accessible capability-unavailable state. Removed mock titles, subject/section labels, due dates, submission totals, grading states, completion percentages, fake status filters and inert Create Assignment action.
- Added working navigation links to Teacher My Classes and Students. Preserved the existing Teacher assignments route and shared shell; added responsive `TeacherAssignments.css`.
- Updated GitHub Actions filters for the feature branch and stacked PR base. Implementation-plus-handoff head `5a779eb67e41bbe0071bf601bf5730953e1b061f` passed GitHub Actions push run `43579617820` (`npm ci`, `npm run build`) and Cloudflare Pages check `132401455069`. GitHub did not schedule a PR-triggered run for this stacked base branch; after PR #29 merges and PR #30 is retargeted to `main`, the PR-targeted build can run. The follow-up commit only updates these handoff records; source is unchanged. No backend, database, schema, migration, secret or deployment changes. No live Teacher account or academic records were modified.

## Exact next task — Phase II, Chunk 25 (proposed): Teacher Timetable Capability Alignment

1. Audit the mock Teacher Weekly Timetable page against backend-main Prisma models and routes.
2. Backend main has no timetable/schedule model or Teacher timetable endpoint; replace sample weekday sessions, times, rooms and lecture/lab labels with an accessible capability-unavailable state.
3. Remove static timetable fixtures from the page and inert schedule actions; preserve the Teacher timetable route and shared shell.
4. Do not infer lecture times, rooms, days or attendance from subject assignments.
5. Update both handoff documents, verify CI and stop.

## Completed Phase II, Chunk 9 — Admin Managed Account Password Reset

- Verified backend-main `POST /api/admin/users/:userId/password-reset`; its strict body is exactly `{ temporaryPassword }`, password is at least 12 characters and at most 72 UTF-8 bytes, and success sets `mustChangePassword=true`.
- Added `src/features/admin/api/adminAccountPasswordResetApi.js` with shared Bearer-token authentication, timeout, request/response validation, and handling for validation, authorization, not-found and server failures.
- Added reusable `AccountPasswordResetControl.jsx` and CSS. It requires explicit confirmation of the selected account and matching client-side password confirmation.
- Integrated the reset action into Student and Teacher directories. The signed-in Admin's own row is non-actionable; successful reset refreshes the directory and the existing password setup badge.
- The request body contains only `{ temporaryPassword }`. Temporary passwords are not persisted or logged, and form values are cleared on success or dialog close.
- Status controls and subject assignment remain outside this chunk. No backend, database, migration, secret or deployment changes were made. No real managed-account mutation was used for testing.
- Feature branch: `feat/admin-managed-password-reset`, based on live `main` head `d4484cfc4384b024f86ee0f4d9590d59e5bae242`. PR #15 merged into `main` at `3a8f7fc6fcae978922b628ee9e23349c166998ed`. GitHub Actions run `43558501510` passed on final PR head `7ec7110ce7dd7dedef578d377adfb4eb8f4ba78d` (`npm ci`, `npm run build`).

## Completed Phase II, Chunk 8 — Admin Managed Account Status Controls

- Branch `feat/admin-account-status-controls`, based on main after PR #13 merge commit `78a6936ff89bc477f5e0228c56d7d8151c74478d`.
- Added `src/features/admin/api/adminAccountStatusApi.js` for PATCH `/api/admin/users/:userId/status`, sending exactly `{ isActive }`, with Bearer authentication, timeout, response validation and error handling.
- Added reusable `AccountStatusControl.jsx` and CSS with Active/Inactive state, Activate/Deactivate actions and explicit confirmation.
- Integrated controls in both Student and Teacher directories. Successful changes refresh the server-backed directory.
- The current Admin's own row shows a non-actionable `Your account` state; backend self-change guard remains authoritative and returns 404.
- The backend status schema only permits the boolean `isActive`; the service limits changes to managed STUDENT/TEACHER roles. Password reset and subject assignment are outside this chunk.
- PR #14: https://github.com/armanpreet-singh/smart-student-portal/pull/14 merged into `main` at `b028a915973206e9cecea8a08a2ab827445149c1`. No Admin credentials used for live status-change testing.
- GitHub Actions builds `43556779435` and `43556782854` passed on final PR head `1205fb134e7122966081df331c7f774c564d335c`; Cloudflare Pages preview also deployed successfully: https://feat-admin-account-status-co.smart-student-portal.pages.dev.
## Completed Phase II, Chunk 7 — Admin Teacher Account Provisioning (create-only)

- Branch `feat/admin-teacher-provisioning`, based on main after PR #12 merge commit `2ad3c38118c5b5f250d94f824508c895bd938c9a`.
- Added `src/features/admin/api/adminTeacherProvisioningApi.js` with POST `/api/admin/users`, shared Bearer-token auth, timeout, backend-aligned name/username/email/password validation, response validation and duplicate-account handling.
- Added Add Teacher action and create-only dialog to Teacher Directory: full name, username, optional email, temporary password and client-only confirmation.
- Request sends `role=TEACHER`, normalized username and optional email. It deliberately omits `classId` because backend strict schema rejects teacher class assignment.
- Handles validation and duplicate-account 409 errors. Success confirms account is active and must change its temporary password, clears password fields and refreshes the directory.
- Temporary password is sent only in the POST body, never browser storage or logs. Teacher status/reset and subject assignment are outside scope.
- PR #13: https://github.com/armanpreet-singh/smart-student-portal/pull/13 merged into `main` at `78a6936ff89bc477f5e0228c56d7d8151c74478d`; no Admin credentials used for live account test.
- GitHub Actions builds `43469120271` and `43469130003` passed on final PR head `7888f80ce29f7412abe632fea08813a146e2bacc` (`npm ci` and `npm run build`).
## Completed Phase II, Chunk 6 — Admin Student Account Provisioning (create-only)

- Branch `feat/admin-student-provisioning`, based on main after PR #10 merge commit `a32bfa04d132f2866938b7364eccb426bfb1e519`.
- Added `src/features/admin/api/adminStudentProvisioningApi.js` with POST `/api/admin/users`, shared Bearer-token authentication, 12-second timeout, request/response validation, active class option loading and duplicate-account handling.
- Added a create-only Add Student dialog to the Student Directory with full name, username, optional email/class, temporary password and client-only confirmation.
- Active class choices are read from GET `/api/admin/classes?isActive=true`; selected class is verified again by the backend. Class assignment remains optional.
- Client validation mirrors backend name/username/email/password requirements, including the 72 UTF-8 password byte limit. The server remains authoritative.
- Successful create response is validated; the UI confirms account creation, reports active/forced password-change state, clears password fields and refreshes the directory.
- Temporary password is sent only in the POST body, is not persisted in browser storage and is not logged. Status/reset mutations, Teacher creation and backend changes are outside scope.
- PR #12: https://github.com/armanpreet-singh/smart-student-portal/pull/12 merged into `main` at `2ad3c38118c5b5f250d94f824508c895bd938c9a`.
- GitHub Actions build run `43464024426` passed on final PR #12 head `6523d6972c7a64ce0ebeee1a68d698e9f4a1fa0a` (`npm ci` and `npm run build`).
## Completed Phase II, Chunk 5 — Admin Teacher Directory API integration

- Branch `feat/admin-teacher-directory`, based on main after PR #10 merge commit `a32bfa04d132f2866938b7364eccb426bfb1e519`.
- Replaced the mock Faculty Directory and inert Add Faculty button with a read-only live Teacher Directory.
- Added `src/features/admin/api/adminTeachersApi.js` for backend-main GET `/api/admin/users` with `role=TEACHER`, shared Bearer-token authentication, timeout handling, query validation and response validation.
- Added backend-side search by fullName/username/email, active/inactive filtering, page-size selection and pagination.
- Teacher rows display full name, username, nullable email, nullable linked class, active/inactive account status, mustChangePassword state and account creation date.
- Removed unsupported faculty ID, department and subject fields; the directory endpoint has no employee ID, specialization, experience or teacher-subject assignment data.
- Added loading/error/retry/empty/no-match states with the existing Admin dashboard design and responsive styling. No mock fallback or create/status/reset/assignment mutations are included.
- PR #11: https://github.com/armanpreet-singh/smart-student-portal/pull/11 merged into `main` at `e2bbf343fffd11b714a7ad692e400174c20ee65b`; no Admin credentials were used for live account testing.
- GitHub Actions builds `43460760974` and `43460774481` passed on the final PR #11 head `ab75554fd13474748696b50357b5583c6902d6ed`. Cloudflare Pages was still reporting a build in progress at the last check.
## Completed Phase II, Chunk 4 — Admin Student Directory API integration

- Branch `feat/admin-student-directory`, stacked on `feat/admin-class-subject-catalogue` / PR #9 at `768c41c113f93cde8c3bfd8bb4dea6d2b5974f59`.
- Replaced the mock Student Directory and inert Add Student button with a read-only authenticated directory.
- Added `src/features/admin/api/adminStudentsApi.js` for backend-main GET `/api/admin/users` with `role=STUDENT`, shared Bearer token, timeout handling, query validation and response validation.
- Added backend-side search by fullName/username/email, active/inactive filter, page-size selection and pagination.
- Student rows display full name, username, nullable email, nullable class identity, active/inactive account state, mustChangePassword state and created date.
- No roll number, department or semester is fabricated; backend User has no rollNumber field. No mock fallback, account creation, password reset or account status mutation is included.
- Added loading/error/retry/empty states with the existing Admin dashboard design and responsive styling.
- PR #10: https://github.com/armanpreet-singh/smart-student-portal/pull/10 is open against `feat/admin-class-subject-catalogue` (PR #9); merge PR #9 first, then retarget PR #10 to `main` before merging.
- GitHub Actions build run `43455879552` passed on implementation head `c6f22ed013b7523f33bc739042c66cf82576cd81` (`npm ci` and `npm run build`). Documentation-updated head verification will be recorded after CI completes.
- The post-documentation-update head `bb33d5cd71ab5412f93eeb67d2cb582c81035ea9` passed GitHub Actions build run `43456291503` (`npm ci` and `npm run build`). No live Admin credentials were used; live account checks remain outstanding.
## Completed Phase II, Chunk 3 — Admin Class and Subject Catalogue API integration

- Branch `feat/admin-class-subject-catalogue`, based on main at PR #8 merge commit `db07903ce1003073f2e9b3902c295321c3427f3c`.
- Replaced the mock Course Catalog and inert Create Course button with a read-only Class & Subject Catalogue.
- Added `src/features/admin/api/adminCatalogueApi.js` for backend-main GET `/api/admin/classes` and GET `/api/admin/subjects` using the shared Bearer token, timeout handling, pagination and response validation.
- Classes view includes class code/name, academic year, backend student/subject counts and active status. Subjects view includes subject code/name, related class, academic year, nullable description and active status.
- Added server-side search, active/inactive filters, page-size selection, previous/next pagination and class filtering for subjects. Class options are loaded through the paginated class directory endpoint.
- Added loading/error/retry/empty states; no mock fallback remains. Unsupported credits, faculty, department and semester fields have been removed from this screen.
- Read-only scope: no create/update actions and no backend/database/Render/deployment changes. No live Admin credentials were used.
- PR #9: https://github.com/armanpreet-singh/smart-student-portal/pull/9 (open; targets main; not merged).
- Follow-up cleanup removed the duplicate `justifyContent` key from the mobile Login CTA in `src/components/layout/Navigation.jsx`, preserving desktop/mobile centering.
- On latest code head `2a457bd1125a5d03aa939b3024b8f59f54e72bc0`, GitHub Actions builds `43453090461` and `43453102554` both passed. Cloudflare Pages remains the deployment blocker: user-supplied logs show Vite build and all 89 static asset uploads succeeded, then Cloudflare failed publishing its Function with `Unknown internal error occurred`. The repository has no Functions directory, `_worker.js`, Wrangler config or Worker bindings; cause is unconfirmed and needs Cloudflare-side inspection or a successful retry.

## Completed Phase I, Chunk 4 — forced password-change workflow

- PR #6: https://github.com/armanpreet-singh/smart-student-portal/pull/6 merged into main at `4c8f5b5a9ed75f739f79cb7a14ec931570834a57`. Branch `feat/auth-forced-password-change`.
- Backend main `POST /api/auth/change-password` accepts exactly `{ currentPassword, newPassword }`; no role, ID or confirmation field is sent.
- Password rules mirror backend Zod: current password non-empty and <=72 UTF-8 bytes; new password >=12 characters, <=72 UTF-8 bytes and different from current. Confirmation remains client-side.
- Accounts with `mustChangePassword=true` go to `/change-password`; ProtectedRoute blocks the three role dashboards until the backend clears the flag. Normal users cannot open the password-change route.
- After the endpoint returns success, the shared auth provider calls GET `/api/auth/me` again. Navigation to the verified user's role dashboard happens only after the refreshed user confirms `mustChangePassword=false`.
- Build run `43439637720` and Cloudflare Pages passed on implementation commit `4ebd35f2fc0e1bb58cd59d219f2f03e634a443a3`.
- No real university credentials were used; no backend/database/Render/deployment changes were made.

## Completed Phase I, Chunk 3 — role-based route protection

- PR #5 merged into main at `9dc22f762c8b82cd5e59d34110e269f5af9d3b07`; parent PR #4 (session provider) merged first at `132b49e3269c99577f515121a60b0c99a7185f0f`.
- ProtectedRoute wraps Student `/dashboard/*`, Teacher `/teacher/*` and Admin `/admin/*` based on backend-verified role. Landing and login remain public.
- Anonymous/expired sessions redirect to login; wrong-role routes redirect to the correct verified dashboard; protected pages fail closed while restoring or when verification is unavailable.
- Build run `43437899529` and Cloudflare Pages passed on route-guard implementation head.

## Completed Phase I, Chunk 2 — shared authentication session management

- PR #4 merged into main at `132b49e3269c99577f515121a60b0c99a7185f0f`.
- AuthProvider verifies restored tokens through GET `/api/auth/me`; stale cached roles are not trusted. Invalid sessions clear token/user; temporary network errors preserve the token for retry.
- Student, Teacher and Admin logout controls clear the shared session. Teacher Attendance consumes the provider token.
- Build run `43436994527` passed on the implementation snapshot; Cloudflare Pages passed.

## Completed Phase I, Chunk 1 — backend-connected login

- PR #3 merged into main at `84607ce7c81512b5529788964672b9b0ca4c92c9`; Teacher Attendance PR #2 merged first at `76b7f1a4806c400811b8d6ba5bd955fb133be7a8`.
- Login calls backend-main POST `/api/auth/login` with exactly `{ username, password }`. Backend role routes to the correct portal; access token is stored at `ltsu-access-token`.
- Includes backend-aligned validation, timeout, error feedback and Remember username. API URL is configurable through VITE_API_BASE_URL.
- No live account credentials were used. Original login build run `43433208070` passed.

## Audit and future work

Read the full screen-by-screen audit and integration gaps from `FRONTEND_DEVELOPMENT_HANDOFF.md`. Student Dashboard Home now uses the authenticated identity and self-only attendance summaries, and the Courses page explicitly states that a Student catalogue endpoint is not available. Backend-main blockers still include assignments, results, timetable, resources, announcements, academic calendar and departments. Advanced institutional analytics (enrollment trends, department aggregates, staffing/workload and approvals) remain unsupported; the Admin home displays only verified directory totals. The Admin Teaching Assignments UI exists and creates links through the backend POST endpoint, but backend main has no assignment-list/read endpoint. Student duty-proof UI remains dependent on backend draft PR #1 being approved, merged and deployed. Live-account validation is still required for integrated workflows.

## Completed Phase II, Chunk 25 — Teacher Timetable Capability Alignment

- Branch `feat/teacher-timetable-capability`, stacked on the Teacher Students feature branch containing PR #29 and the Chunk 24 PR #30 merge.
- Backend main has no timetable/schedule/session model or Teacher timetable endpoint.
- Replaced the mock weekly Teacher timetable with an accessible capability-unavailable notice; removed sample weekdays, times, rooms and lecture/lab schedule labels.
- Removed unused `teacherScheduleData` from `mockTeacherData.js` after repository search confirmed there were no consumers.
- Added responsive `TeacherTimetable.css`; preserved the `/teacher/timetable` route and shared shell. Updated frontend build workflow for the stacked branch/base.
- PR #31 is the catch-up PR for Chunk 24 to `main`; PR #32 is the Chunk 25 child PR against `feat/teacher-students-api`. Merge #31 first, then retarget #32 to `main`.
- GitHub Actions push build run `43582171318` passed on PR #32 head `aaaef97d24f63bbdf53914589e456fa314e4a0f2`, including `npm ci` and `npm run build`. GitHub did not schedule a separate pull-request event for the stacked feature-branch target; retargeting to `main` after #31 merges will enable the PR-targeted check.
- Frontend-only; no backend/database/deployment or live academic data changes.

## Completed Phase II, Chunk 25 — Teacher Timetable Capability Alignment

- PR #32 merged into `main` at `06c7846d09585d3d11ef17529116a8e799308665` after PR #31 merged the Teacher Assignments capability changes.
- Backend main has no timetable/schedule/session model or Teacher timetable endpoint.
- Replaced the mock weekly Teacher timetable with an accessible capability-unavailable notice; removed sample weekdays, times, rooms and lecture/lab schedule labels.
- Removed unused `teacherScheduleData` from `mockTeacherData.js` after repository search confirmed there were no consumers.
- Added responsive `TeacherTimetable.css`; preserved the `/teacher/timetable` route and shared shell.
- GitHub Actions push run `43582354115` passed on the final PR #32 head; merged main head passed run `43582733557`.

## Completed Phase II, Chunk 26 — Teacher Learning Resources Capability Alignment

- Branch: `feat/teacher-resources-capability`, based on `main` at `06c7846d09585d3d11ef17529116a8e799308665`.
- Backend main has no Resource/learning-material model or Teacher resource listing/upload endpoint.
- Replaced the mock Teacher resource list with an accessible capability-unavailable notice; removed sample titles, file types, courses and file sizes.
- Removed the decorative upload/dropzone UI because no file upload contract or storage endpoint exists.
- Added responsive `TeacherResources.css`; preserved the `/teacher/resources` route and shared Teacher shell.
- PR #33 is open against `main`: https://github.com/armanpreet-singh/smart-student-portal/pull/33.
- GitHub Actions push build run `43583068296` passed on head `b2d92112d0b82cf50ecc28ac1b4ea888334ef7c5`, including `npm ci` and `npm run build`. An earlier overlapping build failed because the stylesheet commit had not yet landed; the final complete-tree build passed. PR #33 head `8fc33de2be63e2abbea4056e1e438fd8e59c5c47` passed push build run `43583245784` and main-target PR build run `43583249857`; both ran `npm ci` and `npm run build` successfully. The final documentation-only update does not alter source.
- Frontend-only; no backend/database/storage/deployment changes.

## Completed Phase II, Chunk 27 — Teacher Profile Capability Alignment

- Uses verified `AuthContext` account name, username, nullable email, role and account-created date; unsupported employee ID, department, designation, phone, office and professional details are not shown.
- Teacher topbar dropdown now uses authenticated account details instead of mock Teacher data.
- PR #33 merged into `main` at `8d7850c8f89b6a6270b94067c1c4f55810e6d21f`. Original stacked PR #34 was closed without merge during clean rebase; clean replacement PR #35 carries only Profile changes against `main`: https://github.com/armanpreet-singh/smart-student-portal/pull/35.
- GitHub Actions push build run `43585487245` passed on the Profile implementation snapshot (`npm ci`, `npm run build`).

## Completed Phase II, Chunk 28 — Teacher Settings Capability Alignment

- Backend `POST /api/auth/change-password` is authenticated and accepts exactly `{ currentPassword, newPassword }`; current password is non-empty and <=72 UTF-8 bytes, new password is >=12 characters and <=72 UTF-8 bytes, and the values must differ.
- Reused the existing frontend `changeCurrentPassword` helper; removed mock name/email/phone controls and the console-only submit handler.
- Added current/new/confirm password fields, visibility toggles, backend-aligned validation, submitting/error/success states and a verified session refresh through `refreshCurrentUser()`. Confirmation remains client-only; only currentPassword and newPassword are sent.
- Non-password account preferences are marked unavailable because there is no profile-update endpoint.
- Preserved `/teacher/settings` and the existing Teacher shell/theme; added responsive `TeacherSettings.css`.
- PR #36 merged into `main` at `96ad2fe3a635797f388c65ee8189563da2851262`; original stacked PR #37 was closed without merge because its branch included the squash-merged Teacher Settings history. Clean replacement PR #38 contains only Admin Profile changes and targets `main`.
- GitHub Actions push build run `43586082692` passed on the implementation and initial handoff snapshot `e59cefbeb90e53382d541138dcd59f4ec5bb3fef` (`npm ci`, `npm run build`).

## Completed Phase II, Chunk 29 — Admin Profile Capability Alignment

- Replaced mock Admin Profile contact and professional data with authenticated `AuthContext` fields: full name, username, nullable email, role and account-created date.
- Removed mock avatar, employee ID, department, phone, office, fabricated “Super Admin” label and unverified last-login timestamp.
- Updated Admin topbar account dropdown to use authenticated identity instead of mock Admin fixture data.
- Backend main `GET /api/auth/me` returns public User identity fields; no Admin-specific profile/last-login endpoint exists.
- Added accessible messaging for unavailable extended profile details and responsive `ProfilePage.css`; preserved `/admin/profile` and Admin shell/theme.
- Original stacked PR #37 was closed without merge; clean replacement PR #38 merged into `main` at `cc018e17c36a0a0dbd7ec830f61746d96738d44d`: https://github.com/armanpreet-singh/smart-student-portal/pull/38.
- Final handoff-inclusive head `4390162f1eca1686ad0838b3c6aa94b05f99102c` passed main-target GitHub Actions build run `43589981428`, including `npm ci` and `npm run build`.

## Current Phase II, Chunk 30 — Student Profile Capability Alignment

- Branch `feat/student-profile-capability`, based directly on `main` at `cc018e17c36a0a0dbd7ec830f61746d96738d44d`.
- Reverified backend-main `GET /api/auth/me`, `src/services/auth-service.js` and `prisma/schema.prisma`. Public User fields include `id`, `fullName`, `username`, nullable `email`, `role`, `classId`, `mustChangePassword`, `createdAt` and `updatedAt`; no Student profile endpoint or rollNumber, program, semester, batch, telephone, address or advisor fields exist. `classId` is not a human-readable academic profile.
- Replaced mock Student Profile data with verified session name, username, nullable email, role and account-created date. Unsupported academic/contact details are explicitly unavailable.
- Updated Student topbar dropdown to use authenticated name/username/email and a neutral account icon; removed the mock portrait, roll number, department and semester from the dropdown.
- Added responsive `StudentProfile.css`; preserved `/dashboard/profile`, Student shell, theme and existing topbar interactions.
- PR #39 merged into `main` at `6325413178f297eea9fc730fb26b2cbe540715d7`. Final handoff-inclusive head `47cd2aa361635e04258fd2c61c51cf3d256d0786` passed main-target build run `43590664299` (`npm ci`, `npm run build`).
- Frontend only. No backend, database, schema, migration, secret, deployment, credential or live account changes.

## Completed Phase II, Chunk 31 — Student Settings Capability Alignment

- Clean branch `feat/student-settings-capability-main-sync` is based directly on updated `main` at `6325413178f297eea9fc730fb26b2cbe540715d7`, after Student Profile PR #39 merged.
- Reverified backend-main `src/routes/auth-routes.js`, `src/validators/auth-schemas.js`, `src/services/auth-service.js` and frontend `src/features/auth/api/authApi.js`. Authenticated `POST /api/auth/change-password` accepts exactly `{ currentPassword, newPassword }`; current password is non-empty and <=72 UTF-8 bytes, new password is >=12 characters and <=72 UTF-8 bytes, and values must differ.
- Reused existing `changeCurrentPassword` helper; request sends only current/new password fields, requires the authenticated Bearer token, validates returned user and handles timeout/network/server errors.
- Removed mock Display Name, Official Email and Phone inputs and browser-local `ltsu-profile-settings` save. No Student profile-update endpoint exists.
- Added current/new/confirm inputs, visibility toggles, byte/length/difference validation, submitting/error/success states, mapped server field errors, post-change `refreshCurrentUser()` verification and 401 logout. Confirmation remains client-only; no password is persisted or logged.
- Added retry for unavailable session verification, accessible unsupported-preferences notice and responsive `StudentSettings.css`; preserved `/dashboard/settings`, Student shell and theme.
- PR #40 (initial stacked version) and PR #41 (pre-#39 clean-main version) were closed without merge. PR #42 was based directly on post-#39 `main` and merged at `682fc53abd8ee282bd38c9947b558f85f64be518`: https://github.com/armanpreet-singh/smart-student-portal/pull/42.
- Final handoff-inclusive head `1d9a712c7d4474c160ec0fcbb2602c188d16b0e8` passed GitHub Actions main-target build run `43593117161` (`npm ci`, `npm run build`). PR #42 merged into `main` at `682fc53abd8ee282bd38c9947b558f85f64be518`.
- Frontend only; no backend, database, schema, migration, secret, deployment, credential or live account changes.

After Chunk 34, re-audit remaining Student/Teacher/Admin screens against backend-main and select Chunk 35.

## Completed Phase II, Chunk 32 — Admin Dashboard Live Directory Overview

- Branch `feat/admin-dashboard-live-overview` was created from frontend `main` at `dd4071c8f6c4108edf9e8bbe41c56f6e7835287e`; PR #43 merged into `main` at `a73a5a8ec044a403a8ee10d8cba8b22d0bdc6fb5`.
- Reverified backend-main commit `19d34e577000411520ebb66cbea9eb6833fa4824`. The Admin user, class and subject directory endpoints return authoritative `pagination.total` values. Admin home requests page 1 with page size 1 for Student accounts, Teacher accounts, Classes and Subjects, then displays those totals; active and inactive records are included.
- Replaced fabricated Admin profile name, fake totals/department/approval/insight claims and nonfunctional quick actions. The heading now uses verified `AuthContext.user.fullName`; cards display only the four supported directory counts.
- Added loading skeletons, error/retry handling, refreshed-at timestamp, explanatory data-scope note, responsive/dark-theme-compatible CSS, and direct navigation to supported Admin workflows.
- Corrected the audit: `/admin/teacher-subject-assignments` is already implemented and routed. Backend main has assignment creation but no assignment-list read endpoint; do not invent a listing.
- Added `feat/admin-dashboard-live-overview` to `.github/workflows/frontend-build.yml`.
- Final handoff-inclusive PR head `2b4a8322f399ca4cfbf8cc18ff8809166397b09c` passed GitHub Actions PR workflow run `43706117724` (run #368), including successful `npm ci` and `npm run build` steps.
- Final handoff-inclusive branch head `004780a84d1eebf78e7d453e1e947cd5a6fc55f4` also passed GitHub Actions run `43706330530` (run #372): `npm ci` and `npm run build` succeeded.
- Live Admin-account/API validation remains outstanding. No live credentials, account mutations, backend/database/schema/migration/secrets or production data were changed. Existing PR automation posted a Cloudflare Pages preview (not a production deployment): [PR preview](https://05bb7103.smart-student-portal.pages.dev).

## Chunk 33 integration correction

- PR #44 was merged into the feature-branch base `feat/admin-dashboard-live-overview` at `4412d7d5199dab1d625f2f81f02b0d52a3c51a3b`, not into frontend `main`. The Student Dashboard Home implementation and CSS were therefore copied forward from that branch into clean-main PR #45.
- PR #45 includes the carried-forward Chunk 33 Student dashboard implementation together with Chunk 34 Courses capability alignment so both reach `main` through one clean PR.

## Completed Phase II, Chunk 34 — Student Courses Capability Alignment

- Clean branch `feat/student-courses-capability-main-sync` was created from frontend `main` at `a73a5a8ec044a403a8ee10d8cba8b22d0bdc6fb5`; PR #45 targets `main` and is not merged.
- Backend-main commit `19d34e577000411520ebb66cbea9eb6833fa4824` has only the Student attendance route in `src/routes/student-routes.js`; it has no authorized Student course/subject listing endpoint. Admin Class/Subject catalogue routes are ADMIN-only.
- Replaced the static mock CourseCard list, fake Semester 5 label, instructor names, progress and enrollment claims with an accessible unavailable-state explanation and a working link to `/dashboard/attendance`, where subject context currently appears as part of attendance.
- Added responsive `CoursesPage.css`; kept `/dashboard/courses` and existing Student navigation intact. Shared mock fixtures remain because other pages still use other exports from the same file.
- Carried the Chunk 33 dashboard home implementation and styles forward from PR #44 into PR #45 because PR #44's merge target was a feature branch, not `main`.
- Added `feat/student-courses-capability-main-sync` to frontend build CI. PR #45 implementation head `9cee52e74b83a749ddcea8762896958d544c943b` passed run `43709333776` (run #387); later handoff-inclusive head `e630fea84a6b08154229aaf695373193a2ee6778` passed PR run `43709518916` (run #391) and push run `43709514376` (run #390), both including successful `npm ci` and `npm run build`.
- Live Student-account validation remains outstanding; no backend, database, migration, secrets, deployment or production data changed.

## Completed Phase II, Chunk 35 — Student Timetable Capability Alignment

- PR #45 merged into frontend `main` at `415848c8817437b4e8abebb1148971c4c107eb7a`; PR #46 merged into `feat/student-courses-capability-main-sync` at `ba6862c361bb1e2eafec56bfbe7029201ca2b203`, not into `main`.
- Student Timetable is already aligned: sample weekly sessions/times/rooms removed, accessible capability-unavailable state added, attendance history distinguished from a future timetable. Preserve this implementation; do not redo it.

## Completed Phase II, Chunk 36 — Student Assignments Capability Alignment

- Audit existing Student Assignments page against backend-main before changing it. Backend main at `19d34e577000411520ebb66cbea9eb6833fa4824` exposes only Student `GET /api/student/attendance`; Prisma has no Assignment/Submission model.
- Replace fabricated Student assignment cards and local pending/overdue labels with an accessible capability-unavailable state. Preserve `/dashboard/assignments`, shell, navigation and theme.
- Do not modify shared mock fixtures unless a repository-wide consumer search proves a fixture is unused. Update both handoff documents, read back changed files, verify CI and stop.
- Implementation is in PR #47: https://github.com/armanpreet-singh/smart-student-portal/pull/47. Final handoff-inclusive head `0f5ab46db1f774b7abde18eebbb0e50c94c404b4` passed GitHub Actions PR run `43712823621` (run #408), including `npm ci` and `npm run build`.

## Completed Phase II, Chunk 37 — Student Results Capability Alignment

- Verify backend main has no grade/result model or Student results endpoint. Preserve `/dashboard/results`, Student shell, navigation and theme.
- Remove mock semester SGPA/credit rows and replace them with an accessible capability-unavailable state. Keep shared mock fixtures unchanged.
- PR #48 merged into `main` at `6484e6bcd889092aee78cd1dc9547b8ea312eaea` after PR #47 merged.
- Final handoff-inclusive head `23270dd0cfbf206dd1544a2ffdd27086610ae2f8` passed GitHub Actions PR run `43714521436` (run #413) and push run `43714513171` (run #412), including `npm ci` and `npm run build`.
- Chunk 38 continues with Student Learning Resources capability alignment.


## Completed Phase II, Chunk 37 — Student Results Capability Alignment

- Results page now uses an accessible capability-unavailable state instead of mock semester SGPA and credit rows. Existing `/dashboard/results` lazy route, Student shell, navigation and theme are preserved.
- Backend main has no exam/result/grade/transcript model or Student results endpoint. Shared `mockDashboardData.js` was not changed.
- PR #48: https://github.com/armanpreet-singh/smart-student-portal/pull/48. It targets `feat/student-assignments-capability-main-sync`; merge PR #47 into `main` before merging this child PR.
- Implementation commit `5374c21282d1a49f6773fc74da432fe544725d62` passed GitHub Actions push run `43713846373` (run #409), including `npm ci` and `npm run build`.
- Student Resources is proposed next as Chunk 38 after verifying the backend Resource model and Student resource route remain absent.


## Merge state — 2026-11-15

- PR #47 / Chunk 36 merged into `main` at `9dffca04e1c1fd7098688e65304e2d15943ea422`.
- PR #48 / Chunk 37 merged into `main` at `6484e6bcd889092aee78cd1dc9547b8ea312eaea`.
- PR #49 / Chunk 38 merged into `main` at `0044c46e288314290eef06c75a7fd16923e1a217`.
- PR #50 / Chunk 39 merged into `main` at `e117084677fdb711ad88dc1096fd553f1daed1e3`.
- PR #51 / Chunk 40 merged into `main` at `44b24aa0285fd5be501ddbeed1697e2f6d8429ab`.
- PR #52 / Chunk 41 merged into `main` at `5d63c279958d1e32e65e72340a301727d60c49ba`.
- PR #53 / Chunk 42 merged into `main` at `eb5e21a779d8557225d5b2d5e9d478b1d846c267`.
- PR #54 / Chunk 43 merged into `main` at `60b76d2b568673708e5c5f8ff63250af284f6bd7`.
- PR #55 / Chunk 44 merged into `main` at `c7572a396eb7aa19bb5c55a0eafa2349e7b176b7`.
- PR #56 / Chunk 45 is open against `main` on `feat/admin-user-directory-api-contract-tests`.
- After Chunk 45 is merged, continue the audit and select Chunk 46.


## Completed Phase II, Chunk 37 — Student Results Capability Alignment

- Removed fixture-backed semester SGPA and credit rows. Added accessible unavailable state; preserved `/dashboard/results`, Student shell, navigation and theme. Shared mock fixtures were not changed.
- PR #48 merged into frontend `main` at `6484e6bcd889092aee78cd1dc9547b8ea312eaea`. Final handoff-inclusive head `23270dd0cfbf206dd1544a2ffdd27086610ae2f8` passed GitHub Actions PR run `43714521436` (run #413) and push run `43714513171` (run #412); `npm ci` and `npm run build` succeeded.

## Completed Phase II, Chunk 38 — Student Learning Resources Capability Alignment

- Backend main `19d34e577000411520ebb66cbea9eb6833fa4824` has no Resource/learning-material model, Student resource listing route, file metadata API or protected download endpoint. Student router only exposes `GET /api/student/attendance`.
- Replaced fabricated Student resource cards, category tabs and inert Download controls with an accessible capability-unavailable state. Preserved `/dashboard/resources`, lazy loading, Student shell, navigation and LTSU theme. Shared `mockDashboardData.js` and reusable `ResourceCard` remain unchanged.
- PR #49 merged into frontend `main` at `0044c46e288314290eef06c75a7fd16923e1a217`. Final head `6cb8f7364cfc9c2dee51091054e5bfd64540eeed` passed push run #419 (`43715463771`) and PR run #420 (`43715468469`); `npm ci` and `npm run build` succeeded in both.

## Completed Phase II, Chunk 39 — Admin System Settings Capability Alignment

- Frontend `main` base: `0044c46e288314290eef06c75a7fd16923e1a217`. Branch: `feat/admin-system-settings-capability-main-sync`.
- Backend main `19d34e577000411520ebb66cbea9eb6833fa4824` has no portal/system configuration model and no Admin settings read/update endpoint. The old page's Save handler only logged form values to the browser console.
- Removed the sample University Name/Admin Email form and console-only Save action. Added an accessible unavailable state and responsive `SettingsPage.css`; preserved the existing `/admin/settings` route, Admin shell, navigation and theme.
- PR #50 merged into `main` at `e117084677fdb711ad88dc1096fd553f1daed1e3`: https://github.com/armanpreet-singh/smart-student-portal/pull/50. Final head `874aa9b9a80289fe909070b2d67c43deb5c9ced5` passed push run #426 and PR run #427.
- Frontend only; no backend, database, schema, migration, secrets, deployment or production data changes.

## Completed Phase II, Chunk 40 — Student Timetable Clean-Main Carry-Forward

- New branch `feat/student-timetable-main-sync` is based directly on post-PR #50 frontend `main` at `e117084677fdb711ad88dc1096fd553f1daed1e3`.
- PR #46 / Chunk 35 already implemented the Student Timetable capability-unavailable state, but its original base was `feat/student-courses-capability-main-sync`. That PR was merged only into the feature branch, not `main`.
- Carry forward only the two exact reviewed screen files from the PR #46 head branch: `src/features/dashboard/pages/TimetablePage.jsx` and `src/features/dashboard/pages/TimetablePage.css`. Do not reimplement or alter their behavior.
- `DashboardRoutes.jsx` on main already preserves the lazy `/dashboard/timetable` route. Add only the clean-main feature branch to frontend build CI and update this handoff.
- PR #51 merged into `main` at `44b24aa0285fd5be501ddbeed1697e2f6d8429ab`: https://github.com/armanpreet-singh/smart-student-portal/pull/51. Final head `b69fd46453d3e5fad09e3d282aca7d002bfe3456` passed push run #431 and PR run #432.
- No backend, database, schema, migration, secret, deployment or production data changes.

## Completed Phase II, Chunk 41 — Admin Academic Catalogue API Contract Tests

- Branch `feat/admin-academic-catalogue-contract-tests` is based directly on frontend `main` at `44b24aa0285fd5be501ddbeed1697e2f6d8429ab`.
- The Admin Class & Subject page already includes the backend-supported CRUD/status operations implemented in Chunks 11 and 12. Keep that UI; this chunk adds regression coverage for its API layer.
- Added 11 Node built-in tests covering Admin class/subject pagination and filters, all-page class choices, class/subject POST/PATCH payloads, normalization, strict field allowlists, 409 conflicts, malformed success responses and missing tokens.
- Added the `npm test` script and frontend CI test step. No test dependency added.
- PR #52 merged into `main` at `5d63c279958d1e32e65e72340a301727d60c49ba`: https://github.com/armanpreet-singh/smart-student-portal/pull/52. Final head `2cdaea7100edc19a8c734741e97b7cac0a004aac` passed push run #437 and PR run #438 (`npm ci`, `npm test`, `npm run build`).
- All test API responses are locally mocked; no live university account or production data was used or changed.

## Completed Phase II, Chunk 42 — Student Attendance API Contract Tests

- Branch `feat/student-attendance-api-contract-tests` is based directly on frontend `main` at `5d63c279958d1e32e65e72340a301727d60c49ba`.
- Student Attendance already calls self-scoped backend-main `GET /api/student/attendance` with optional `fromDate` and `toDate` query parameters. Keep the existing screen and API integration.
- Added 12 Node built-in tests for Bearer auth, date-filter serialization, empty subject results, all four current attendance statuses, EXCUSED-excluded summary semantics, nullable percentages, missing tokens, HTTP errors, malformed responses, network errors and timeouts.
- Reuse the `npm test` script and CI step added in Chunk 41. No new dependency was added. The API module now has an explicit `.js` ESM import path for direct Node test execution.
- PR #53 merged into `main` at `eb5e21a779d8557225d5b2d5e9d478b1d846c267`: https://github.com/armanpreet-singh/smart-student-portal/pull/53. Final head `0d70d712de6dfc534950431be86c62dd4ae1af80` passed push run #442 and PR run #443 (`npm ci`, `npm test`, `npm run build`).
- Tests stub `fetch`; no live Student account, production attendance API, or real attendance record was accessed or changed.

## Completed Phase II, Chunk 43 — Teacher Assigned Subjects & Roster API Contract Tests

- Branch `feat/teacher-subjects-api-contract-tests` is based directly on frontend `main` at `eb5e21a779d8557225d5b2d5e9d478b1d846c267`.
- Backend main provides authenticated Teacher `GET /api/teacher/subjects` and `GET /api/teacher/subjects/:subjectId/roster`. The Teacher UI from Chunks 22 and 23 already uses these APIs; keep the existing screens.
- Added 12 Node built-in tests covering assigned-subject response shape, empty assignment lists, Bearer authorization, roster lookup and encoded IDs, subject/class relationship validation, duplicate and malformed students, 401/403/404/5xx responses, missing token, network errors and timeouts.
- Reuse `npm test` and the CI step from Chunk 41. No test dependency added. The Teacher API helper now has an explicit `.js` ESM import.
- PR #54 merged into `main` at `60b76d2b568673708e5c5f8ff63250af284f6bd7`: https://github.com/armanpreet-singh/smart-student-portal/pull/54. Final head `b88dffa8b6da9968e52ba70376bab63582704b37` passed push run #447 (`npm ci`, `npm test`, `npm run build`); Cloudflare Pages branch preview also succeeded.
- Tests use mocked `fetch` responses; no live Teacher account, roster, production API or database changes.

## Completed Phase II, Chunk 44 — Admin Attendance Reporting API Contract Tests

- Branch `feat/admin-attendance-report-api-contract-tests` is based directly on frontend `main` at `60b76d2b568673708e5c5f8ff63250af284f6bd7`.
- The Admin Attendance Overview and Reports pages already use `GET /api/admin/attendance`; keep the existing page integrations and report semantics.
- Added 12 Node built-in tests for report filter serialization, blank filter omission, empty results, current attendance aggregates, zero-eligible/null percentages, summary and subject validation, all-page class/subject filter choices, invalid directory rows, missing token, HTTP errors, network failures and timeouts.
- Reuse `npm test` and the CI test step introduced in Chunk 41. No test dependency added. The Admin attendance API helper now has an explicit `.js` ESM import.
- PR #55 merged into `main` at `c7572a396eb7aa19bb5c55a0eafa2349e7b176b7`: https://github.com/armanpreet-singh/smart-student-portal/pull/55. Final head `c7a67c8e70a37effff7adb2c1401dffb002a95ed` passed push run #452 and PR run #453 (`npm ci`, `npm test`, `npm run build`).
- Tests stub `fetch`; no live Admin account, attendance reports, production API or real university data was accessed or changed.

## Current Phase II, Chunk 45 — Admin Student & Teacher Directory API Contract Tests

- Branch `feat/admin-user-directory-api-contract-tests` is based directly on frontend `main` at `c7572a396eb7aa19bb5c55a0eafa2349e7b176b7`.
- Admin Student and Teacher directories already use backend-main `GET /api/admin/users` with role-scoped pagination, search and active-status filters. Keep the existing directory UIs.
- Added 12 Node built-in tests covering role-specific query construction, Bearer auth, pagination, empty results, nullable class/email projections, invalid role and paging data, missing token, 401/403/5xx, network and timeout paths.
- Fixed Student directory filter validation so `isActive` must be `all`, `true` or `false`, matching the existing Teacher directory validation. Added explicit `.js` imports to the Student and Teacher API modules for Node ESM.
- Reuse `npm test` and CI from Chunk 41; no test dependency added.
- PR #56: https://github.com/armanpreet-singh/smart-student-portal/pull/56. Final handoff-inclusive head and CI results are verified after the documentation commit.
- All tests use mocked `fetch`; no live Admin account, student or teacher account, user record or production endpoint was accessed or changed.


## Latest authoritative continuation state — 2026-11-15 (post backend PR #2 merge)

Read `FRONTEND_DEVELOPMENT_HANDOFF.md` first; this update supersedes older backend contract snapshots above.

- Frontend main is `9924fb07820d89119fafb4b8e45c430568ff8621`. PR #56 has merged; there were no open frontend PRs at last verification (52 merged, 4 closed without merge).
- Backend main is now `c62760b9d7fb0384448d4dedaa3c8c939460532e`; backend PR #2 added official nullable `rollNumber` to Student provisioning, authenticated profiles, Admin directory/search and Teacher roster, and added server-generated `markedAt` to bulk attendance-mark responses. Its rollNumber migration is already applied to primary Neon and its Render deployment is live.
- `markedAt` is the register-submission time, not a scheduled class-start time. No timetable/session API exists.
- Completed in Chunk 46 on `feat/frontend-roll-number-integration`, PR #57: Admin Student provisioning accepts an optional official roll number; Student Profile displays the verified non-null value; Teacher rosters and attendance display it; status-based clipboard actions copy official roll numbers only. The feature is tested and awaiting review, not merged.
- Backend PR #1 (duty-review/proof) remains open/draft/unmerged/un-deployed. Its ON_DUTY_REVIEW schema and proof endpoints are not part of backend main. Its separate Neon migration is unapproved/unapplied; Cloudinary secrets are not configured. Do not wire those draft contracts into the frontend.
- Frontend `package.json` has `npm test`; CI runs `npm ci`, `npm test`, `npm run build`. The 59 contract tests added across Chunks 41–45 use mocked fetch and do not prove live account integration.
- Exact next task: Chunk 47, reconcile backend branch `attendance-duty-proof` with backend `main`, preserve the merged `rollNumber` and `markedAt` APIs, resolve schema/service overlap and rerun CI. Keep duty-review frontend work deferred until the separate primary Neon migration is approved/applied, Cloudinary is configured, and backend is deployed.


## Cross-repository status revalidated — 2026-11-15

- Frontend `main` at the start of this recheck was `dc17ef80b4e4f408a458e28fde0bf0fdf5108ef6`. There are **zero open pull requests** in `armanpreet-singh/smart-student-portal`; PR #56 is already merged.
- Backend PR #2 (official Student roll-number contract) is merged and live on Render. The only open backend PR is PR #1, duty-review/proof, which remains draft and unmergeable. Its branch is 31 commits ahead and 3 behind backend main and needs reconciliation preserving the merged `rollNumber` and `markedAt` APIs.
- Keep frontend `ON_DUTY_REVIEW` and duty-proof upload/download workflows deferred. The corresponding backend migration `cf299d60-31f1-422d-a00d-207236461ff8` has not been approved/applied to primary Neon, and Cloudinary runtime credentials are not configured.
- This pre-Chunk-46 next-step note is superseded by Chunk 46 below, which delivered the rollNumber frontend integration in PR #57. Keep the duty-review UI decoupled from the unreleased backend contract.
- No frontend PR was merged or changed during this status recheck.


## Completed Phase II, Chunk 46 — Official Student roll-number integration

- Frontend feature branch: `feat/frontend-roll-number-integration`, from `main` base `e289d5a1a9e302890025c5bb378b2f11a4df0407`.
- PR #57 is open and ready for review: https://github.com/armanpreet-singh/smart-student-portal/pull/57. Not merged or deployed.
- CI run `43736235914` passed on implementation commit `92f0d87d0b2884f8c58a78c3af9417ffbd35e92a`; the handoff-inclusive follow-up run `43736348435` also passed on `d0ce34386e2d499761ca79f8cd75bd2300be54b4`: locked dependency install, all Node API contract tests and `vite build`.
- Admin Student provisioning sends optional trimmed `rollNumber`; blank omitted, leading zeroes retained, backend uppercases. Client validation mirrors 1–40 characters and permitted-character/initial-character rules.
- Admin Student directory validates nullable rollNumber and shows it; Student Profile displays the verified authenticated `user.rollNumber` only when present.
- Teacher roster validation accepts nullable rollNumber and rejects malformed/duplicate values. Teacher Students and Teacher Attendance display official values.
- Teacher Attendance includes Copy Absentees / Copy Presentees. Output is official roll numbers only, newline-separated; only exact ABSENT or PRESENT statuses qualify. Missing roll numbers are skipped; no username/DB ID fallback; LATE/EXCUSED excluded.
- Added contract tests for create request/response, optional/null/malformed roll-number fields, leading-zero preservation, profile pass-through, Teacher roster validation and clipboard filtering.
- This is frontend-only. No Neon, backend, Render environment, secret, or production deployment was touched. Browser clipboard permission and real account E2E remain unverified.
- Keep duty-review frontend integration deferred until backend PR #1's schema migration, Cloudinary setup and deployment gates are complete.

### Next chunk — Phase II, Chunk 47

Reconcile backend branch `attendance-duty-proof` with current backend `main`, preserving the merged `rollNumber` and `markedAt` contracts. Resolve schema/service overlap and rerun backend CI. Do not apply the separate duty-review Neon migration without approval for its exact migration ID; do not merge while Render auto-deploy would target an unmigrated primary database or unconfigured Cloudinary storage.


## Authoritative continuation update — 2026-11-15 (duty-review UI release readiness)

This section supersedes earlier status notes in this document where they conflict.

### Cross-repository backend release state
- Backend repository: `armanpreet-singh/ltsu-backend`.
- Duty-review backend PR #1 is merged into backend `main` at squash commit `ef4c0ca273c806c0e746ff682840dfa7d7cf22d0`. A later documentation-only backend-main commit is `4748a5eba4b90fb6e0f2b9591cef1eabe153781f`.
- The user approved migration `cf299d60-31f1-422d-a00d-207236461ff8`. Primary Neon project `holy-darkness-25378856`, database `ltsu`, branch `br-twilight-lake-aovy1aeb`: migration `20261113111000_on_duty_review_and_duty_proof` is applied. The `AttendanceStatus` enum and six duty-proof columns were verified, and the `_prisma_migrations` ledger row has a finished timestamp and five applied steps.
- Render service `ltsu-smart-portal-api-0i8h` reports its latest deployment `dep-dbsuigp5efls73f6v5ug` as `live`, on backend-main commit `4748a5eba4b90fb6e0f2b9591cef1eabe153781f`. This is deployment status only; do not claim an independently verified readiness endpoint or end-to-end account flow.
- Cloudinary runtime credentials remain unconfigured in Render. Duty-proof upload/download endpoints return HTTP 503 until the three Cloudinary settings are configured privately. Do not ask for or commit secret values. Do not claim proof storage works end-to-end until configuration and a real upload/download test succeed.
- Backend main also includes official nullable Student `rollNumber` and server-generated `markedAt`; preserve these contracts. `markedAt` is submission time, not a scheduled class start.

### Current frontend duty-review work
- Frontend main at the start of this chunk: `fcd79cf08ba442d03f32054c1134e2e764183a95`. PR #57 (official roll-number integration) is merged into main at that commit.
- Duty-review branch: `feat/duty-review-attendance-ui`, head `c12c368ac1e3aa7c6651a3e6cc0ab0fb8af09cb0`; compare to main is 3 commits ahead, 0 behind, 13 files changed.
- This branch implements Student duty-proof API helpers and Student/Teacher/Admin attendance UI updates for `PRESENT`, `ABSENT`, and `ON_DUTY_REVIEW`; includes mocked API contract tests and preserves official roll-number-only clipboard behavior. Student-facing UI must explain the HTTP 503 storage-not-configured state without implying attendance was changed.
- At this point, no PR exists for this branch and no CI run is associated with its head. `npm ci`, `npm test`, and `npm run build` have not yet been verified on this branch. Open a PR to `main` to trigger the configured PR workflow, then fix any failures before merge.
- The workflow's push branch allow-list does not include `feat/duty-review-attendance-ui`; its `pull_request` trigger targets `main`, so PR creation is the expected CI trigger.
- Do not merge unless the PR is mergeable and all required CI checks pass. Do not deploy frontend manually as part of this chunk.
- No live Student, Teacher or Admin browser session has been tested. API tests stub `fetch`; they are contract tests, not production end-to-end verification.

### Next actions
1. Run or trigger the frontend CI checks on the exact branch head and resolve any issues.
2. Open a PR from `feat/duty-review-attendance-ui` to `main`; verify PR head SHA and CI results.
3. Update both handoff documents again with the final PR/CI/merge state.
4. Only merge when CI is green and GitHub reports the PR mergeable. Preserve Cloudinary as a clearly disclosed operational prerequisite.


## Completed Phase II — Duty-review attendance and Student proof UI (PR #58)

- PR #58: https://github.com/armanpreet-singh/smart-student-portal/pull/58 merged into `main` by squash at `fea685cf122581840a98f7f45929a19502dfb493`.
- Feature branch head before merge: `cfc849e551eb4eb1a8c0858bba8c07d144a35494`; PR compared cleanly with `main` (5 commits ahead, 0 behind; 15 files changed including the two handoff updates).
- GitHub Actions PR workflow run `43742778600` (run #472) completed successfully on the exact PR head. Locked dependency installation (`npm ci`), all frontend API contract tests (`npm test`) and production Vite build (`npm run build`) passed.
- Student attendance UI and API helpers support `PRESENT`, `ABSENT`, `ON_DUTY_REVIEW`, duty-proof submission/download requests, file type/size checks and explicit HTTP 503 messaging while Cloudinary storage is unconfigured. Teacher and Admin attendance surfaces use the three released statuses. Official roll-number clipboard behavior remains roll-number-only.
- Backend duty-review migration is applied and Render reports the backend deployment live. Cloudinary runtime credentials remain unconfigured; proof upload/download will remain unavailable (HTTP 503) until private Render configuration is completed and verified with an end-to-end upload/download test.
- CI uses mocked API responses. No live Student/Teacher/Admin account workflow, browser clipboard permission, or production proof upload/download was tested. No frontend deployment was performed by this PR.


## Authoritative continuation update — Phase III, Chunk 1 (2026-11-16)

Read `FRONTEND_DEVELOPMENT_HANDOFF.md` first. This section supersedes older continuation snapshots where they conflict.

- Current frontend work: PR #61, https://github.com/armanpreet-singh/smart-student-portal/pull/61, branch `feat/student-course-catalogue`.
- Implementation commit before handoff append: `72a923abb653b810c40f228aa9891d2499a4dede`; handoff append creates a new head commit.
- Student Courses page now calls `GET /api/student/courses`, displays the class summary and active class subjects, supports local search and handles loading, errors, retry, unassigned class and no-subject cases. No fictitious enrollment, credit or semester information is shown.
- New frontend helper `src/features/dashboard/api/studentCoursesApi.js` validates the response contract. Nine mocked API tests were added.
- Frontend GitHub Actions run #480 / ID `43828943677` passed all 88 tests and Vite production build on implementation head.
- Backend PR #4 in `armanpreet-singh/ltsu-backend` is a required dependency. Merge/deploy backend PR #4 before merging/deploying frontend PR #61.
- No live production request was made with a Student token by CI. After ordered release, test the portal with an active Student account assigned to a class containing active subjects.
- Next candidate: Teacher attendance correction UI using the existing 30-minute backend correction endpoint, without changing the server-side edit window or authorization rules.


## Authoritative continuation update — Phase III, Chunk 2 (2026-11-16)

Read `FRONTEND_DEVELOPMENT_HANDOFF.md` first.

- Frontend PR #62: https://github.com/armanpreet-singh/smart-student-portal/pull/62, branch `feat/teacher-attendance-corrections`, implementation head `17a18a88787f28fd987e1dbe70ea3ff655a8d015` before this handoff append.
- Teacher Attendance now loads the saved per-subject/date register and presents individual correction controls only where the API reports the original Teacher is within the 30-minute edit window and no proof has been submitted.
- Row corrections are explicitly saved through the existing PATCH endpoint. The server remains authoritative for ownership, optimistic concurrency, edit window and proof-submission lock.
- Existing/partial registers cannot be bulk re-submitted. Partial records are shown clearly and missing rows are excluded from totals and clipboard output. Date/subject changes clear previous record IDs immediately.
- Eight new mocked API tests. GitHub Actions run #487 / ID `43833181082` passed all 96 frontend tests and Vite build.
- Backend PR #5 in `armanpreet-singh/ltsu-backend` is a required release dependency. Merge/deploy backend first, then merge/deploy this frontend PR.
- No live attendance data or production records were changed. Browser acceptance tests after deployment remain required.


## Final verification — Phase III, Chunk 2 frontend (2026-11-16)

- Latest source head before this handoff append: `aaa88bc35ffcffdf6ca6630e158e1ec3463f282d` on `feat/teacher-attendance-corrections`.
- PR #62 remains open. Backend PR #5 is a prerequisite and must be deployed before frontend PR #62 is merged/deployed.
- Final hardening clears stale IDs on subject/date switches, disables register selectors during loads/saves, serializes row updates, and prevents clipboard actions from copying staged/unsaved corrections.
- GitHub Actions run #489 / ID `43833795105` passed all 96 tests and the Vite production build against that source head.
- No merge or production deployment has occurred for this chunk.


## Authoritative continuation — Phase III, Chunk 2 released (2026-11-16)

This section supersedes earlier status entries that describe frontend PR #62 as open/unmerged or waiting for backend PR #5.

### Released changes
- Frontend PR #62 (Teacher attendance correction workflow) is merged into `main` at `e2ea847701e410243acd11d6cacf950787782cdf`.
- Backend prerequisite PR #5 is merged at `efd749df9c7a535dfec26e4082574647beb5d30f`; runtime hotfix PR #6 is merged at `54486fdb16e014ed8cdb05eeac24cba297c228b0` and Render reports the hotfix deployment live.
- Frontend Actions run #491 (ID `43834851692`) passed the frontend API contract suite and production build.
- Cloudflare Pages production deployment `414694b7-acbe-4616-b436-60af71d1c4af` completed successfully for the merged frontend commit. Canonical app URL remains `https://smart-student-portal.pages.dev`.
- UI fetches the saved subject/date register, tracks actual attendance record IDs, enables targeted correction only when server metadata allows it, and submits changes one row at a time through the existing PATCH API. It preserves partial-register, staged-change and clipboard safeguards.

### Validation boundary
- CI uses mocked API responses. A real Teacher browser acceptance test remains outstanding: mark a register, reload, perform a correction inside 30 minutes, and verify expired and proof-submitted records stay read-only. Do not represent mocked tests as production account E2E.
- This release made no attendance-data, timetable or database-schema changes.

### Next candidate — Phase III, Chunk 3: timetable contract
- Student and Teacher timetable pages remain explicit unavailable placeholders. Backend `prisma/schema.prisma` has no timetable/session model, and Student/Teacher routes have no timetable read API.
- Do not use attendance `markedAt` as a scheduled start time; it records register submission.
- Agree on the authoritative schedule model before implementation: recurring weekly slots with validity dates, or individually dated sessions. The decision must cover holidays/one-off changes, timezone, room/location, teacher assignment, effective dates and overlap rules. Do not invent sample timetable rows or display unverified data.
- No Chunk 3 schema migration or UI implementation has begun.


## Phase III, Chunk 3 — Student dashboard attendance status alignment (2026-11-16)

- Feature branch: `fix/student-dashboard-duty-review-summary`.
- Aligns the Student dashboard homepage with the currently deployed attendance contract: `PRESENT`, `ABSENT`, and `ON_DUTY_REVIEW`. Removes the stale `LATE`/`EXCUSED` assumptions from its summary/status display.
- Extracts the dashboard roll-up to `src/features/dashboard/utils/dashboardAttendanceSummary.js` so the aggregate calculation can be tested independently. It sums per-subject backend counts and recomputes the overall percentage from aggregate attended/eligible totals rather than averaging subject percentages.
- A duty-review record is not treated as present. The homepage now labels the combined ABSENT + ON_DUTY_REVIEW count as **Not yet confirmed present**, shows all three current status counts, and states that duty-review only counts as present after proof submission succeeds.
- Recent attendance uses the released status labels, including the ON_DUTY_REVIEW badge. No API, database, schema, backend attendance policy or user data changes.
- Added four unit tests for multi-subject roll-up, duty-review semantics, empty eligibility and recent-record ordering. CI must verify the complete frontend test suite and production build before merge.
- No timetable work is included; Student/Teacher timetable placeholders remain unchanged.

### Validation boundary

- These tests cover the pure summary logic; they do not verify a real Student browser session or populated production attendance. Such live-account validation remains a separate acceptance test.
- PR/CI/merge/deployment state is recorded below after validation.


### Chunk 3 PR and CI verification — 2026-11-16

- PR #63: https://github.com/armanpreet-singh/smart-student-portal/pull/63 — open and not merged; branch `fix/student-dashboard-duty-review-summary`.
- Source head checked by PR CI: `cfb1098b37c97b329698d18bb901049dc105bd82`.
- GitHub Actions run #493 (ID `43836808520`) completed successfully: all **101 tests passed**, 0 failed, and `npm run build` completed successfully.
- The PR is frontend-only and has no backend release dependency. It has not been merged or deployed; this update records validation only.


## Authoritative continuation — Student Dashboard attendance alignment released (2026-11-16)

This section supersedes the earlier prompt entries that describe frontend PR #63 as open or awaiting deployment.

- PR #63: https://github.com/armanpreet-singh/smart-student-portal/pull/63 — merged into `main`.
- Source head: `e8d3720dc2a8f4c03a8ff933dbc06af6ed6d5ff5`; squash merge commit: `acc1e9c6c9e187fc1043a7f7ccc847d3a14f1f74`.
- GitHub Actions PR run #494 / ID `43837025823` passed 101 tests and the production Vite build; main run #495 / ID `43838368448` completed successfully.
- Cloudflare Pages production deployment `87fbd4f5-0957-4241-bcb9-7d0d5cc1dc16` succeeded for the merge commit. Canonical app: https://smart-student-portal.pages.dev.
- No backend, API, schema, migration, database, attendance-data, or timetable changes. Live Student-account browser acceptance remains outstanding.
- Timetable work is explicitly deferred by the user. Do not resume it. Select the next bounded chunk from current backend-integrated frontend gaps; do not invent backend capabilities or production records.


## Authoritative continuation — Phase III, Chunk 4: Teacher Dashboard overview (2026-11-16)

- Branch: `feat/teacher-dashboard-overview`, based on latest main after Student Dashboard PR #63 and release handoff updates.
- Replaces Teacher homepage unavailable placeholder with a read-only overview using existing `GET /api/teacher/subjects` and frontend `fetchTeacherAssignedSubjects` API client.
- Shows active assigned-subject count, distinct active-class count, verified subject/class identifiers, academic year and assignment date. Includes loading, error/retry, no-assignment states and links to existing Teacher pages.
- Uses helper `src/features/teacher/utils/teacherDashboardSummary.js`; tests in `tests/teacher-dashboard-summary.test.js`.
- No new backend endpoint, database/schema change, student headcount inference, timetable, assignment, grading or attendance aggregate is included.
- PR/CI validation and production release state must be checked directly in GitHub/Cloudflare before continuation. Real Teacher-account browser validation remains outstanding.
- Timetable work remains deferred by the user.


### Chunk 4 PR and CI verification — 2026-11-16

- PR #64: https://github.com/armanpreet-singh/smart-student-portal/pull/64 remains open and unmerged.
- Actions run #498 / ID `43846567768` passed all **104 tests** and the Vite production build on validated source head `dfd5e349f1b8c41c9731400b66bd2146f66ff5f4`.
- No production deployment has occurred for this chunk. Do not claim live Teacher-account browser validation.


## Authoritative continuation — PR #64 merged; Phase III, Chunk 5 selected (2026-11-16)

- PR #64 (Teacher Dashboard assigned-subject overview) merged into frontend main at `75ce9e0db750db1f3451c61e1f49de18a1aebaa4`.
- Main Actions run #501 / ID `43847143703` passed. Cloudflare Pages production deployment `d389fd20-4363-4395-a758-6a04382ba360` completed successfully.
- Teacher Dashboard uses the existing authenticated assigned-subject API and does not claim student headcounts, timetable, attendance percentage, grading or results.
- Next chunk: Admin existing Teacher-to-Subject assignment directory. Backend currently supports create-only `POST /api/admin/teacher-subject-assignments`; add a role-protected paginated GET read endpoint over existing `TeacherSubject` records, then render it in the Admin page. Include current related teacher/subject/class active states, exact IDs filters and bounded search. Preserve historical/inactive links in results.
- No database schema or migration is expected. Timetable work is explicitly deferred. Live Teacher/Admin account acceptance remains outstanding.


## Phase III, Chunk 5 — Admin existing Teacher-to-Subject assignment directory UI (2026-11-16)

- Backend PR #7 merged/deployed at `e1a89236ca38f9b8eacea2e71de16d787d834562`; Render deployment `dep-dbtdjgu7bikc7382dt6g` is live.
- Backend GET endpoint is Admin-only, paginated and supports bounded search plus exact teacherId, subjectId and classId filters. It returns Teacher, Subject and Class details including related active-state flags.
- Frontend branch `feat/admin-teacher-subject-assignment-directory` adds an authenticated API client, strict response validation, six API tests and a responsive Admin list with search, pagination and per-related-record active status.
- Existing assignment creation UI is preserved and refreshes the directory after a successful create. No inactive assignment rows are hidden or modified.
- Frontend CI and PR state must be checked on the current branch head. Live Admin-account/browser acceptance remains outstanding. No schema migration, DB write or timetable work.


## Authoritative continuation — Phase III, Chunk 5 released; Chunk 6 selected (2026-11-16)

- Backend PR #7 merged at `e1a89236ca38f9b8eacea2e71de16d787d834562`; Render deployment `dep-dbtdjgu7bikc7382dt6g` is live. Admin-only GET assignment directory supports bounded search, exact Teacher/Subject/Class filters and pagination, preserving inactive relations with flags.
- Frontend PR #65 merged at `16ab0f5076048b7bc7e8da2aa9baefa50c59a3ba`; Actions PR run #506 passed **110 tests** and Vite build; main run #507 passed. Pages deployment `203ecbcb-eba9-4503-9006-2d62a382d89c` succeeded.
- Chunk 5 Admin assignment list is live alongside the existing create workflow. Real Admin account browser acceptance remains outstanding. No schema or migration. Timetable remains deferred.
- Next Chunk 6: fix Admin Student provisioning form reset regression. Initial form state includes optional `rollNumber`, but Escape close, Cancel close and post-success reset omit it. Replace all duplicated reset objects with one canonical empty-form factory/constant and test its full shape/reset invariant. Preserve leading zeroes and optional roll number behavior. Frontend-only; no backend/API/DB changes.


## Phase III, Chunk 6 — Admin Student provisioning form reset fix (2026-11-16)

- Feature branch: `fix/admin-student-provisioning-form-reset`.
- Initial Admin Student form state includes optional `rollNumber`; Escape close, Cancel close and successful-create reset objects omitted it, so the next open could call `.trim()` on `undefined`.
- New helper: `src/features/admin/utils/adminStudentForm.js`, canonical `createEmptyAdminStudentForm()` used for initial state and all resets.
- New tests: `tests/admin-student-form-state.test.js`, covering full empty shape including `rollNumber: ""` and fresh independent objects.
- Preserves optional value, input text and leading-zero behavior. Frontend-only; no backend/API/DB/schema changes. Timetable remains deferred.
- PR/CI/deployment state must be checked directly. No live Admin browser acceptance is claimed.


## Authoritative continuation — Phase III, Chunk 6 released (2026-11-16)

- Frontend PR #66 merged at `55608f6b9d94994dd5a5d23ec0f8c10989a2aa08`.
- PR CI run #510 / ID `43850380370`: **112/112 tests passed**, no failures; Vite production build succeeded.
- Main CI run #511 / ID `43850494633` passed. Cloudflare Pages production deployment `f24ac945-f93e-4683-854f-02bd745a1e89` succeeded.
- Student provisioning form uses the complete `createEmptyAdminStudentForm()` helper for initial state and Escape/Cancel/successful-create reset. Optional `rollNumber` is always restored as an empty string; leading-zero semantics remain unchanged. No backend or database change.
- Parallel Teacher provisioning initial/reset fields were checked and found consistent.
- Next review: Admin Class/Subject catalogue create/edit form state and validation after cancel/success/retry. Select a reproducible bug before implementing. Timetable remains deferred. Real Admin browser acceptance remains outstanding.



## Authoritative release — Phase III, Chunk 7: Admin Attendance CSV export (2026-11-16)

- Frontend PR #67: https://github.com/armanpreet-singh/smart-student-portal/pull/67 — merged into `main` at `162734bfef457ef342065d8534e11e6a3a528357`.
- PR workflow run #514 / ID `43852877990` passed **117/117 tests**, zero failures, and the Vite production build (built in 4.02s). Main push workflow #515 / ID `43853337616` completed successfully.
- Cloudflare Pages production deployment `4ddb473b-e6bb-442f-a7d6-9706851a5e29` completed all stages successfully for the merge commit. Canonical app: https://smart-student-portal.pages.dev.
- Admin Attendance / Reports & Analytics now provides an Export CSV action when the currently loaded report contains subjects. It exports exactly the active report response: period, class and subject descriptors, PRESENT / ABSENT / ON_DUTY_REVIEW counts, total/eligible/attended sessions and backend-calculated percentage. One row per subject; null percentages remain blank.
- CSV quoting covers commas, quotes and line breaks; formula-leading class/subject text is neutralized; UTF-8 BOM is included for spreadsheet compatibility. Export is aggregate-only: no student identities or individual attendance records are included.
- Added `src/features/admin/utils/adminAttendanceCsv.js` and `tests/admin-attendance-csv.test.js`; updated `AttendancePage.jsx` and `AttendancePage.css`.
- Frontend-only. No backend/API, database, Prisma schema, migration or production data changes. No backend release was required.
- Real Admin browser acceptance and an actual downloaded-file check remain outstanding; CI tests are not a substitute for either. Timetable remains explicitly deferred.

### Next-work audit
- Revisited the Admin Class/Subject editor state review. Both editor dialogs are conditionally mounted and unmounted on close; reopening initializes fresh state. No reproducible reset defect was found, so no speculative change was made.
- No additional feature is selected by this release. Next bounded work should be based on the next verified workflow gap or real-role acceptance findings; do not invent timetable/configuration/announcement capabilities without an authoritative backend contract.


## Authoritative continuation — Phase III, Chunk 8 released (2026-11-16)

- Teacher Student roster CSV export PR #68 is merged at `c0931fa83f6fa3931717fe0356cffe376f2e0477`; PR CI #518 passed **122/122 tests** and the Vite build; main CI #519 passed.
- Pages production deployment `e8855b70-1809-4b82-a4df-dabe94d7dbfa` succeeded on the merge commit.
- Export is scoped to the selected active assigned subject and the currently visible (search-filtered) Teacher roster; it includes class/subject labels and student name/username/official roll number. CSV escaping, formula neutralization, UTF-8 BOM, safe filename, and leading-zero roll number handling are covered by tests.
- No backend/API/database/schema/migration changes. Real Teacher browser download and spreadsheet acceptance remain outstanding; user plans to test shortly.
- The next implementation should be driven by a concrete issue surfaced by acceptance testing or another verified workflow gap. Timetable remains deferred, and do not invent announcements/calendar contracts.


## Authoritative continuation — Phase III, Chunk 9 released (2026-11-16)

- Teacher saved Attendance CSV export PR #69 merged at `16a20f6c2cc63f3dc312e501e5652372cf1a7199`; PR CI #525 passed **129/129 tests** and Vite production build; main CI #526 passed.
- Cloudflare Pages production deployment `5a81eb3d-178f-4b7d-b5a2-6a284296d0a8` succeeded on the merge commit.
- Export is limited to persisted server-returned rows in the selected Teacher subject/date and the current search filter. It uses last-saved status/remarks, official roll number, register submission timestamp and proof-submitted flag. Missing rows are never filled in. Unsaved corrections disable export; demo-local attendance is excluded.
- No backend/API/database/schema/migration changes. Live Teacher browser and downloaded spreadsheet acceptance remain pending.
- Next change should be selected from actual user test feedback or another independently verified workflow gap. Do not infer timetable dates or new academic records; timetable remains deferred.


## Authoritative continuation — Phase III, Chunk 10 released (2026-11-16)

- Student duty-proof concurrent action race fix PR #70 merged at `74307b0fe99838b703862f9147957140f7844ff7`.
- PR CI #529 and main CI #530 each passed **133/133 tests** and the Vite production build. Cloudflare Pages deployment `e86863f7-8c63-4e90-8a7d-7358af963254` succeeded.
- Duty-proof upload/download progress is now keyed per attendance record; synchronous same-record locks prevent duplicate requests and completion of one record cannot clear another record's busy state.
- Added `src/features/dashboard/utils/studentDutyProofState.js` and `tests/student-duty-proof-state.test.js`; changed `AttendancePage.jsx`.
- No backend/API/database/schema/migration changes. Existing proof-upload/download runtime configuration and end-to-end file availability still require real Student-account testing.
- Continue with actual user acceptance findings or another verified workflow defect; do not infer academic schedules. Timetable remains deferred.


## Authoritative release — Phase III, Chunk 11: selected portal role enforcement at login (2026-11-16)

- Backend PR #8: https://github.com/armanpreet-singh/ltsu-backend/pull/8 — merged at `0a65452cc8c92c454464a46e7159e69b9b77fa1f`. Backend PR CI #129 passed **66/66 tests**, zero failures; main CI #130 passed. Render production deployment `dep-dbtf4ie417fc738ik0k0` is **live** on this backend commit.
- Frontend PR #71: https://github.com/armanpreet-singh/smart-student-portal/pull/71 — merged at `59d1a22b11768d214711f43981863b2fe5735c2c`. Frontend PR CI #533 passed **136/136 tests** and Vite production build; main CI #534 passed. Cloudflare Pages production deployment `5ed2183f-1932-4229-8de6-089baa5fd5f1` completed successfully on the matching frontend commit. Canonical app: https://smart-student-portal.pages.dev.
- Root cause: the login form previously treated the selected portal as a preference and intentionally redirected authenticated users to the portal for the role returned by the account. Thus, selecting Administrator and entering Student credentials opened Student.
- Login now sends an explicit `requestedRole` value (`STUDENT`, `TEACHER`, or `ADMIN`). The backend schema requires this field. After confirming the account is active and the password is correct, the auth service compares the account's actual role with the requested role. A mismatch returns HTTP 403 before any access token is created.
- The frontend now displays the role-mismatch response and does not establish a session or redirect to a different portal. It also validates the returned role before saving the session. Correctly matched credentials continue to their corresponding portal.
- Added backend selected-role schema/service regression tests and frontend auth API tests for role submission, matched sign-in, mismatched responses and invalid selections.
- This is an authentication/API contract change only. No Prisma schema, database migration, account record or production data was changed. Any other API client calling `POST /api/auth/login` must now include `requestedRole`.
- Real Student/Faculty/Administrator account acceptance testing is still required: verify each correct role can sign in, and verify a valid account is rejected when a different portal is selected. CI and deployment success do not replace those live-account checks.
- Timetable remains explicitly deferred. Next work should follow the role acceptance findings or another independently verified defect; do not add speculative features.


## Authoritative release — Phase III, Chunk 12: generic login failure message (2026-11-16)

- Backend PR #9: https://github.com/armanpreet-singh/ltsu-backend/pull/9 — merged at `a0d4e9b347e077bbed8e05612bc99491bbae29de`. Backend PR CI #133 passed **66/66 tests**; main CI #134 passed. Render production deployment `dep-dbtfb62jnfac73db9ftg` is **live** on the generic-response backend commit.
- Frontend PR #72: https://github.com/armanpreet-singh/smart-student-portal/pull/72 — merged at `ea666a86a04f4bad41f57aa01bd052b0e47212e1`. Frontend PR CI #537 passed **137/137 tests** and the Vite production build; main CI #538 passed. Cloudflare Pages production deployment `9d05e190-1228-473f-b0ab-7847831b74ba` completed successfully. Canonical app: https://smart-student-portal.pages.dev.
- The login failure message is now exactly **`Invalid credentials.`** for incorrect passwords, unknown/inactive accounts, and selected-portal role mismatches. The UI ignores role-specific response text for HTTP 401/403. The backend also returns the same generic message and HTTP 401 for role mismatches, before creating an access token.
- The role enforcement from Chunk 11 is unchanged: credentials authenticate only when the selected portal matches the account role. Only the wording/status classification of failed authentication changed.
- Added frontend regression coverage proving 401 and 403 responses both display the generic message even when the API body contains role-specific detail. Backend selected-role tests now assert generic HTTP 401 behavior.
- No account, password, Prisma schema, database migration or production data was changed.
- Real Student/Faculty/Administrator acceptance testing remains outstanding; verify correct-role login works and mismatched-role login shows only **Invalid credentials.** Timetable remains deferred.


## Phase III, Chunk 13 — Functional Teacher and Student Assignments (2026-11-16)

### Delivered and deployed
- Frontend PR #73: https://github.com/armanpreet-singh/smart-student-portal/pull/73 — merged at `f91ae6f375a5a8b71cafc61dd9d830bf80548471`.
- Frontend PR CI #549 passed **148/148 tests** and Vite production build; main CI #550 passed.
- Cloudflare Pages production deployment `f638583f-15c6-4ae7-a15d-047c534db355` succeeded on the frontend merge commit. Canonical URL: https://smart-student-portal.pages.dev.
- Backend assignment PR #10 merged at `9a071b4dd1f53073232f57b4ae29d54b1a742bee`; backend startup hotfix PR #11 merged at `f69e76cff9356164c9c6e5af670e9afdc64d1f57`. Backend PR CI #137 passed **76/76**, hotfix PR CI #139 passed **77/77**, and main CI #140 passed.
- Initial Render deployment failed after applying the migration because Student routes used `validateBody` without importing it. The hotfix imports it and adds a Student/Teacher route-module import regression test. Render deployment `dep-dbtfpvtbedkc73d8tgc0` is now **live**; Render logs show the server listening on port 10000 and no pending migrations.

### Teacher portal — Assignments
- Replaced the unavailable placeholder with a real API-backed workspace.
- Create assignment drafts for an active subject assigned to the signed-in Teacher; enter title, instructions, optional deadline, and maximum marks.
- Edit drafts before publishing. Publish coursework to the class associated with the selected Subject.
- See assignment state, class, deadline, maximum marks, submission counts, and active class size.
- Open submission management to review each active Student, identify missing submissions, read submitted text, save marks/feedback, and publish each result.
- Results remain private until the Teacher publishes them.

### Student portal — Assignments
- Replaced the unavailable placeholder with a real API-backed list of assignments published for the authenticated Student's active Class.
- Submit and resubmit text answers before the deadline. The server rejects late submissions.
- Resubmitting replaces the prior answer and resets the previous grade. The UI warns that a previously published grade is withdrawn until the new answer is graded and published.
- View marks and Teacher feedback only after the result is published.
- Includes loading, empty, error, retry, deadline, submitted, and result states. No mock assignment titles or browser-local assignment state is used.

### API/data contract
- Added authenticated API clients in `src/features/teacher/api/teacherAssignmentsApi.js` and `src/features/dashboard/api/studentAssignmentsApi.js`.
- Backend access rules rely on server-side TeacherSubject and Student class relationships; the client cannot widen access by changing a Subject or Student identifier.
- The new persisted lifecycle is documented in backend handoff: `Assignment` and `AssignmentSubmission` models, migration `20261116130000_add_assignments`.
- Current release is text-only. It does not claim to support file attachments.

### Remaining acceptance
- Verify with real Teacher and Student accounts: draft creation, publish to a real assigned class, Student visibility/submission, cross-class isolation, grading, grade publication, deadline rejection, and resubmission.
- No real account/browser acceptance was performed during CI/deployment. Timetable remains deferred.


## Phase III, Chunk 14 — Cloudinary assignment briefs and issue/deadline dates (2026-11-16)

### Released and deployed
- Frontend PR #74: https://github.com/armanpreet-singh/smart-student-portal/pull/74 — merged at `418247726e78a586732a7ce5e647f151219aabb6`.
- Backend PR #12: https://github.com/armanpreet-singh/ltsu-backend/pull/12 — merged at `78ec1582bc978fb58bb1a2b7b598af628fa435ce`.
- Frontend PR CI #554 passed **151/151 tests** and Vite build; main CI #555 passed. Backend PR CI #143 passed **82/82 tests**; backend main CI #144 passed.
- Cloudflare Pages deployment `382ae77b-f34c-47e4-8a91-272dd545398b` is successful on the frontend merge commit. Render deployment `dep-dbtgdth5efls73frvdv0` is live; Render logs confirm the new date/attachment migration applied and the API is listening on port 10000.
- Canonical frontend: https://smart-student-portal.pages.dev.

### Teacher form — Assignments
- The draft form now accepts written questions, one PDF/JPEG/PNG file (maximum 10 MB), or both together.
- Written questions are optional when a file is attached. A draft with neither written questions nor a file cannot be saved.
- The form shows the selected file, the existing file when editing, and actions to replace or remove it while the assignment is still a draft.
- New required fields: **Assignment date** and **Last submission date and time**. The default assignment date is today; the default last submission date is seven days later. Both can be edited before saving.
- Teacher assignment cards show the issue date, last submission date, and attached file. Teacher can open the file through a backend-authorized signed link.

### Student view — Assignments
- Student assignment cards show **Assignment date** and **Last submission date** explicitly.
- When a brief is attached, the Student sees its filename and file type and can open it through a short-lived signed link. The backend checks the Student's current Class and assignment publication/availability before signing.
- Existing text-answer submission and resubmission behavior remains. Server-side dueAt deadline checks remain authoritative.

### Storage and security
- Browser uploads are sent to the authenticated backend, which validates file signature and content type before uploading to the existing Cloudinary account using the existing backend Cloudinary environment configuration.
- Files use Cloudinary authenticated delivery rather than public upload delivery. The browser never receives Cloudinary API credentials. Backend signed download links expire after five minutes.
- Postgres stores Cloudinary asset identifiers and metadata only. Migration adds `assignmentDate` and attachment metadata; existing assignmentDate values are backfilled from `createdAt`.
- The release supports PDF, JPEG and PNG only, one file per assignment, up to 10 MB. It does not add Student file submissions; Student answers remain text.

### Remaining live acceptance
- Real Faculty/Student browser testing is outstanding. Upload an actual PDF and image with a Faculty account, publish each, open as a Student in the assigned Class, and confirm a Student from another Class cannot retrieve the file. Verify the displayed assignment and last-submission dates and confirm submissions after the deadline are rejected.
- CI and deployment success do not verify the live Cloudinary credentials or a real browser upload/download. Timetable remains deferred.


## Current implementation — Announcements workflow (November 16, 2026)
- Shared authenticated announcement API + manager/feed components live under `src/features/shared/announcements/`.
- Admin: create announcement drafts targeted to Everyone, Students or Teachers; edit/publish/delete drafts; inspect all notices and status/timestamps.
- Teacher: create class-targeted drafts only against active assigned subjects; edit/publish/delete own drafts; see published Admin notices directed to Teachers or everyone.
- Student: read-only published feed for Everyone, Students and the Student's active current Class. Backend performs audience/class filtering.
- Draft editing and deletion controls are hidden for published notices and for Teacher drafts not authored by the current Teacher. No push/email/SMS delivery, only feed refresh. No file attachments in announcements.
- Verify live across Admin, Teacher, Student same class and Student different class before treating this feature as accepted. Keep timetable deferred.


## Current implementation — Teacher Learning Resources (November 16, 2026)
- Shared authenticated resource API lives at `src/features/shared/resources/learningResourcesApi.js`.
- Teacher Learning Resources now offers assigned Subject/Class selection, title/description, file upload, list/search/download of resources in assigned active Subjects, and delete for own uploads.
- Student Learning Resources is a read-only class-scoped list with search and protected download actions.
- Supports PDF, DOC, DOCX, PPT, PPTX, TXT, JPEG and PNG up to 20 MB. Uploaded notes are immediately visible to the selected Class. No push/email notifications or in-app preview.
- Backend performs subject assignment, Student class, upload ownership and download authorization. Use actual account testing to verify Cloudinary operations and cross-Class denial before release acceptance. Timetable remains deferred.


## Current implementation — Role-based notifications (November 16, 2026)
- Shared NotificationBell is mounted in Admin, Teacher and Student topbars. Teacher bell was added; Student/Admin decorative bells now use persisted server data.
- API uses `/api/{role}/notifications`, `PATCH /:id/read` and `POST /read-all`; links stay within the matching portal.
- Dropdown displays unread count, notification list, loading/error/empty states, read/unread status, mark one and mark all.
- Feed polls every 45 seconds while visible and refreshes on focus/visibility return. No browser push, email, SMS or mobile push.
- Verify live event timing for low attendance (<75%), assignments, deadline reminders, announcements, class notes, student submissions, released results and duty-proof submissions across all roles. Timetable remains deferred.
