# Continue LTSU Smart Portal — Frontend Development

You are continuing work on the existing frontend in https://github.com/armanpreet-singh/smart-student-portal. Do not recreate or redesign the project.

## First actions

1. Read the latest `FRONTEND_DEVELOPMENT_HANDOFF.md` and this prompt from the frontend repository before changing files.
2. Verify live branch heads, pull requests and the current file contents. Do not assume the commit hashes below remain the latest.
3. Live verification on 2026-11-14: PR #33 (Teacher Learning Resources) merged into `main` at `8d7850c8f89b6a6270b94067c1c4f55810e6d21f`; PR #35 (Teacher Profile replacement) merged into `main` at `c7923704bd392bd2888fb5cc1d75bdd1bf5e9d37`; PR #36 (Teacher Settings) merged into `main` at `96ad2fe3a635797f388c65ee8189563da2851262`. The original stacked Admin Profile PR #37 was closed without merge to avoid repeating the squash-merged Teacher Settings changes; clean replacement PR #38 targets `main` from `feat/admin-profile-capability-clean`: https://github.com/armanpreet-singh/smart-student-portal/pull/38.
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

Read the full screen-by-screen audit and integration gaps from `FRONTEND_DEVELOPMENT_HANDOFF.md`. Broad categories still mock-backed include timetable, assignments, results, resources, announcements, academic calendar, departments and dashboard analytics. Admin also needs a dedicated teacher-subject assignment UI; Student duty-proof UI is dependent on backend draft PR #1 being approved/merged/deployed. Most existing pages need API loading/error/empty states and correct data/permission mapping before they can be marked Ready.

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
- Original stacked PR #37 was closed without merge; clean replacement PR #38 contains only Admin Profile work and targets `main`: https://github.com/armanpreet-singh/smart-student-portal/pull/38.
- GitHub Actions push build run `43587179882` passed on source head `45c7ce23732bb5fc1dea520b259c315a5b294734` (`npm ci`, `npm run build`).

After PR #38 (Admin Profile) merges, re-audit the remaining Teacher/Admin screen inventory against backend-main and select Chunk 30.
