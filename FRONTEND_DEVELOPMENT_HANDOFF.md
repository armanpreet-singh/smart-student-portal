# LTSU Smart Portal — Frontend Development Handoff

Last updated: 2026-11-14
Repository: https://github.com/armanpreet-singh/smart-student-portal
Base branch: `main`
Development branch: `feat/teacher-resources-capability`
Current pull request: Phase II, Chunk 26 Teacher Learning Resources Capability Alignment PR #33 is open against `main` from `feat/teacher-resources-capability`: https://github.com/armanpreet-singh/smart-student-portal/pull/33. PR #31 (Teacher Assignments catch-up) merged into `main` at `2dc2cca9f1c16ecc4ff526149af0a0a03ca3421a`; PR #32 (Teacher Timetable) merged into `main` at `06c7846d09585d3d11ef17529116a8e799308665`. PR #29 (Teacher Students) merged into `main` at `04573f41327e09cfbb19225502002003de8105a3`; PR #30's initial merge was into the feature branch at `99573c1d41bb2d4f070bbc6124f8ff3b1ee2cb34`, with its changes subsequently brought to `main` through PR #31.
Phase II, Chunk 3 Admin Class and Subject Catalogue PR #9 merged into `main`: `d00fc61b54456b0fb313294c72aecedd62c9bd65`.
Phase II, Chunk 4 Admin Student Directory PR #10 merged into `main`: `a32bfa04d132f2866938b7364eccb426bfb1e519`.
Phase II, Chunk 5 Admin Teacher Directory PR #11 merged into `main`: `e2bbf343fffd11b714a7ad692e400174c20ee65b`.
Phase II, Chunk 6 Admin Student Account Provisioning PR #12 merged into `main`: `2ad3c38118c5b5f250d94f824508c895bd938c9a`.
Phase II, Chunk 7 Admin Teacher Account Provisioning PR #13 merged into `main`: `78a6936ff89bc477f5e0228c56d7d8151c74478d`.
Phase II, Chunk 8 Admin Managed Account Status Controls PR #14 merged into `main`: `b028a915973206e9cecea8a08a2ab827445149c1`.
Phase II, Chunk 1 Student Attendance PR #7 merged into `main`: `49d42d4b750f213debfb7e354c98c31f1b7ae5d4`
Phase II, Chunk 2 Admin Attendance PR #8 merged into `main`: `db07903ce1003073f2e9b3902c295321c3427f3c`
Phase I PRs #2–#6 (Teacher Attendance and Authentication) are also merged into `main`.
Latest verified `main` commit after Chunk 25 / PR #32 merge: `06c7846d09585d3d11ef17529116a8e799308665`. It includes PR #29 Teacher Students, PR #31's catch-up of Chunk 24 Teacher Assignments and PR #32 Teacher Timetable. PR #31 merged at `2dc2cca9f1c16ecc4ff526149af0a0a03ca3421a`; PR #32 merged at `06c7846d09585d3d11ef17529116a8e799308665`.

## Working scope and rules

- This repository is the frontend source of truth. Backend repository `armanpreet-singh/ltsu-backend` is reference-only in this frontend workflow.
- Work in one cohesive UI chunk at a time. Preserve the existing theme, layouts, navigation, responsive behavior, and user changes.
- Do not modify backend code, database, migrations, secrets, or deployment from frontend tasks.
- Make changes directly through GitHub, verify each commit and read changed files back from GitHub, and update both frontend handoff documents after each completed chunk.
- Do not claim a build, test, commit, PR, or deployment that has not been verified.
- Do not substitute usernames or database IDs for official student roll numbers.

## Project structure and design baseline

- React 18, Vite 7, JavaScript ES Modules, React Router 7.
- Package scripts: `dev`, `build`, `preview`. There are no configured `lint` or `test` scripts in `package.json`.
- Main entry: `src/App.jsx`. Top-level paths: `/`, `/login`, `/dashboard/*`, `/teacher/*`, `/admin/*`.
- Student area: `src/features/dashboard`; Teacher area: `src/features/teacher`; Admin area: `src/features/admin`; Auth: `src/features/auth`.
- Teacher and Admin layouts reuse the shared dashboard design system. Reuse shared SectionHeader, DashboardCard, StatCard, toast utilities, dashboard CSS, and existing page conventions.
- Theme baseline: dashboard CSS variables `--d-primary` (#1e3a8a), `--d-secondary` (#294d9b), `--d-gold` (#d4af37), `--d-success`, `--d-warning`, `--d-danger`, `--d-bg`, `--d-surface`, `--d-border`, `--d-text`, `--d-text-secondary`; dark-mode overrides are in `src/features/dashboard/styles/dashboard.css`. Typography uses Inter with system fallbacks. Existing responsive rules are in `src/features/dashboard/styles/responsive.css` and page-specific styles.
- Brand tokens are in `src/styles/tokens.js` (LTSU navy #1B3A6B and gold #C9A84C). Do not add a new palette, new dashboard framework, or unrelated visual language.
- Mock data is currently split across `src/features/dashboard/data/mockDashboardData.js`, `src/features/teacher/data/mockTeacherData.js`, and `src/features/admin/data/mockAdminData.js`. The attendance chunk adds a dedicated teacher-attendance fixture file instead of embedding fixtures in the page.

## Branch and repository verification

- Frontend default branch `main) was at `51f4b51e8a3a8e89e06bbef38bdfb574bb849020` when this chunk began.
- The previously named `teacher-attendance-copy-clipboard` branch was checked live and pointed to the same commit as `main`; it did not contain a clipboard implementation. It was not overwritten or used.
- New development branch `ui/teacher-attendance-workflow` was created from `main`. The `main` branch was not changed.
- The frontend GitHub connection has repository push/admin permissions.
- No deployment was performed.

## Verification snapshot before final handoff metadata refresh

- Verified source branch snapshot: `ui/teacher-attendance-workflow` at `386a37cc5c45e796bfc3ffc5d4b1832ff4576e98`. The implementation files were unchanged after their verified build; subsequent work in this snapshot was limited to handoff/PR metadata.
- At this snapshot, branch comparison with `main` was 11 commits ahead, 0 behind, and six intended files changed. `main` was not modified.
- At this historical snapshot, frontend PR #2 was open; it was subsequently merged into main at `76b7f1a4806c400811b8d6ba5bd955fb133be7a8`.
- GitHub Actions run `43429998901` completed with conclusion `success` on the exact snapshot commit. Checkout, Node.js 22 setup, `npm ci`, and `npm run build` all passed. Run `43429991685` also passed on the same commit.
- No deployment was performed.
- Always re-check the live ref, PR and latest CI after this snapshot; documentation-only commits can advance the branch head without changing implementation code.

## UI audit — role and screen inventory

Classification definitions:
- **Ready:** UI and interaction use a currently available backend contract with appropriate permission/data handling and integration states.
- **Needs improvement:** A page exists, but remains mock-backed, has inert actions, mismatched data semantics, or incomplete API/error/permission integration.
- **Missing:** A necessary workflow/page is not present in the frontend.

No existing role page met the full Ready standard at audit time. The page shells and navigation exist, but many screens remain demonstration UI. Teacher Attendance and Student Attendance have live backend integrations, but still require validation with real university accounts and data.

| Role | Screen | Existing condition | Backend integration readiness | Missing work |
|---|---|---|---|---|
| Auth | Login / role selection | Login posts the backend's `{username,password}` contract, stores the Bearer token and follows the returned account role. Session restoration and the required-password-change path are implemented. | **Needs improvement** — implementation is complete for the current backend contract; live university-account verification remains outstanding. | Complete live account validation and verify deployed frontend origin is allowed by backend CORS. |
| Auth | Route access / session | `AuthProvider` verifies `/api/auth/me`; `ProtectedRoute` restricts Student, Teacher and Admin trees by verified role and redirects temporary-password accounts to `/change-password`. | **Needs improvement** — frontend flow is implemented; verify with real provisioned accounts before marking Ready. | Live Student/Teacher/Admin account checks, including a first-login temporary password and expired session. |
| Student | Dashboard Home | Uses mock stats, classes, courses, assignments, announcements, resources and activity. | **Needs improvement** — no composed dashboard endpoint is exposed by backend main. | Replace mock data only as each supported endpoint exists; show empty/loading/error states; avoid fabricating metrics. |
| Student | Courses | Static mock course cards with faculty/progress fields. | **Needs improvement** — backend main has Class and Subject models, but no student course-list endpoint. | Define the student-facing Subject/Class read contract and map IDs/relationships rather than mock faculty/progress values. |
| Student | Attendance | Uses the shared Bearer-token session to call `GET /api/student/attendance`; subject summaries, status breakdown, recent records and charts are derived from the response, with optional date filters. | **Needs improvement** — integration is implemented; verify with a provisioned Student account and seeded attendance data. | Validate empty/no-class, date-range and mixed-status cases against live data; preserve backend's null percentage and EXCUSED denominator rules. |
| Student | Timetable | Repeats mock schedule data across weekdays. | **Needs improvement** — no timetable model/API exists on backend main or inspected draft. | Backend contract/model required before live integration. |
| Student | Assignments | Static assignment cards and local status labels. | **Needs improvement** — no assignment endpoint/model exists on backend main or inspected draft. | Backend assignment contract, upload/submission workflow and status lifecycle required. |
| Student | Results | Static semester SGPA/credit rows. | **Needs improvement** — no results/grade endpoint or model exists on backend main or inspected draft. | Backend marks/results contract and authorized read API required. |
| Student | Resources | Static resource cards with client-side type tabs. | **Needs improvement** — no student resource API/model or download authorization exists on backend main. | Backend resource metadata, file access and authorization contract required. |
| Student | Announcements | Accessible capability-unavailable state; the page no longer imports or displays sample announcement records. | **Not supported by backend main** — no Announcement/Notification model or Student announcements read route. | Backend announcement audience, publishing, authorization and read-state contract required. |
| Student | Academic Calendar | Accessible capability-unavailable state; the page no longer imports shared sample calendar records. | **Not supported by backend main** — no calendar/event model or Student calendar route. | Backend event/calendar model, authorized Student read API and date/time-zone semantics required. |
| Student | Profile | Profile fields, roll number, contact and academic details are hardcoded. | **Needs improvement** — `GET /api/auth/me` returns safe identity fields but no rollNumber, phone, program or batch. | Bind only returned fields; separately define missing profile data fields before displaying them as real account data. |
| Student | Settings | Display name/email/phone save to browser localStorage only. | **Needs improvement** — backend supports password change, not profile/settings mutation. | Connect password-change flow; keep local preferences separate from authoritative account data. |
| Teacher | Dashboard Home | Displays only the verified account name from `AuthContext`; timetable, statistics, generated insights and inert quick actions have been replaced with an accessible capability-unavailable state and a working Attendance link. | **Not supported for dashboard summaries by backend main** — assigned-subject, roster and attendance APIs exist, but no timetable, dashboard aggregate, assignment, grading, results or insights endpoints. | Add dashboard metrics only when supported APIs exist; keep attendance reachable through its existing workflow. |
| Teacher | My Classes | Reads authenticated active subject assignments from `GET /api/teacher/subjects`; displays returned subject code/name, class code/name/academic year and assignment date. Includes loading, API error/retry and empty states with no mock fallback. | **API-integrated in Chunk 22 PR #28; live Teacher-account/data validation remains outstanding.** No roster size, timetable or attendance percentage is shown. | Validate with a provisioned Teacher account; roster and attendance actions remain on their dedicated supported screens. |
| Teacher | Attendance | Uses the shared session token with current backend-main subject discovery, roster and bulk-attendance APIs; supports demo fixtures separately. | **Needs improvement** — live integration exists; no rollNumber or class time is exposed by backend main. | Validate with a real Teacher account; do not add roll-number clipboard or draft-only duty-review/correction behavior until the backend contract is live. |
| Teacher | Assignments | Accessible capability-unavailable state; mock assignment cards, sample submission/grading figures, fake status filters and inert Create Assignment action removed. | **Not supported by backend main** — no Assignment or Submission Prisma model and no Teacher assignment, submission, grading or results endpoint. | Backend Assignment/Submission models, authenticated Teacher read/create/update/submission and grading contracts, permissions and validation required. |
| Teacher | Students | Authenticated Teacher selects one active assigned subject; the page loads that subject's active roster and displays returned student full name and username with local search. Includes subject/roster loading, error/retry and empty states. | **API-integrated in Chunk 23 PR #29; live Teacher-account/data validation remains outstanding.** | The roster endpoint returns only student id, fullName and username. Roll number, attendance percentage, CGPA and global Teacher student directory are not supported. |
| Teacher | Announcements | Accessible capability-unavailable state; mock feed, dashboard count/shortcut and unsupported unread-notification indicator removed. | **Not supported by backend main** — no Announcement/Notification model or Teacher read/publish route. | Backend announcement audience, publishing, authorization and read-state contract required. |
| Teacher | Timetable | Accessible capability-unavailable state; no mock weekday sessions, lecture times, rooms or lecture/lab labels are displayed. | **Not supported by backend main** — no timetable/schedule/session model or Teacher timetable endpoint exists. | Backend timetable/session model and authorized Teacher read endpoint required. |
| Teacher | Learning Resources | Accessible capability-unavailable state; no sample resource cards or upload/dropzone controls are displayed. | **Not supported by backend main** — no Resource/learning-material model or Teacher resource listing/upload endpoint exists. | Backend resource metadata, file storage/access, sharing scope and authorized Teacher list/upload contracts required. |
| Teacher | Academic Calendar | Accessible capability-unavailable state; no sample events are displayed. | **Not supported by backend main** — no calendar/event model or Teacher calendar route. | Backend event/calendar model, authorized Teacher read API and date/time-zone semantics required. |
| Teacher | Profile | Hardcoded employee ID, contact details, experience and specialization. | **Needs improvement** — `/api/auth/me` supplies only basic account identity/role/class fields. | Bind known account fields and specify any additional staff profile model/contract before displaying values as authoritative. |
| Teacher | Settings | Form submits to console.log. | **Needs improvement** — backend password-change route exists; profile/system settings mutations do not. | Implement password change using API; separate unsupported preferences from account data. |
| Admin | Dashboard Home | Static institutional totals/insights and quick-action cards. | **Needs improvement** — no aggregate dashboard endpoint exists. | Use current admin endpoints for actual counts and avoid unverified institutional metrics. |
| Admin | Student Directory | Uses backend-main paginated `GET /api/admin/users?role=STUDENT`; supports search/status filters/pagination, create-only provisioning and confirmed active/inactive status changes through the managed-user API. | **Needs improvement** — read/create/status UI integration is implemented; validate with a provisioned Admin account and real Student accounts. | Verify real account creation and status changes including own-account protection. Password reset remains separate; backend exposes no rollNumber. |
| Admin | Teacher Directory | Uses backend-main paginated `GET /api/admin/users?role=TEACHER`; supports search/status filters/pagination, create-only provisioning and confirmed active/inactive status changes through the managed-user API. | **Needs improvement** — read/create/status UI integration is implemented; validate with a provisioned Admin account and real Teacher accounts. | Verify real account creation and status changes including own-account protection. Password reset and subject assignments remain separate; employee IDs, departments, specializations, experience and teacher-subject assignments are not provided by the directory. |
| Admin | Class & Subject Catalogue | Separate Classes and Subjects views call backend-main GET `/api/admin/classes` and `/api/admin/subjects`; pagination, search, active filters and class-scoped subject filter use API data. | **Needs improvement** — read integration is implemented; verify with a provisioned Admin account and actual catalogue data. | Validate real data, pagination and class/subject relationships; create/update actions are outside this read-only chunk. |
| Admin | Departments | Accessible capability-unavailable state; mock department/HOD/student/faculty counts are no longer displayed. | **Not supported by backend main** — no Department model or authorized read API exists. | Backend department structure and authorized management/read API required. |
| Admin | Attendance Overview | Calls backend-main `GET /api/admin/attendance`; overall metrics, status counts, subject chart and class/subject table are derived from report aggregates. Date, class and subject filters use backend-supported query fields and directory data. | **Needs improvement** — integration is implemented; verify with a provisioned Admin account and real class/subject/attendance records. | Validate report filters and empty/zero-denominator cases with live university data; no department-level aggregation exists. |
| Admin | Announcements | Explicit capability-unavailable state; sample notices, sent/scheduled labels and inert publish action removed. | **Not supported by backend main** — no Announcement/Notification model or announcement routes. | Requires backend announcement model, audience/targeting semantics, publication and schedule endpoints, and authorized read/publish contracts. |
| Admin | Academic Calendar | Accessible capability-unavailable state; no sample events are shown. | **Not supported by backend main** — no calendar/event model or Admin calendar routes. | Backend event/calendar model, authorized API, date/time-zone semantics and event lifecycle required. |
| Admin | Reports & Analytics | Uses backend-main `GET /api/admin/attendance` via shared authenticated report UI, with date/class/subject filters, overall status aggregates and per-subject results. | **Implemented and merged in Chunk 13 PR #19** — mock metrics are no longer presented as university data. | Validate filters and empty/zero-denominator cases with a provisioned Admin and real attendance records; add growth/department/enrollment/trends only when backend sources exist. |
| Admin | Profile | Hardcoded admin details and contact information. | **Needs improvement** — `/api/auth/me` returns limited identity data. | Bind known user identity; remove fabricated contact/last-login details until API supports them. |
| Admin | System Settings | Form logs values to console; no persistence. | **Needs improvement** — no system configuration API/model exists. | Backend settings contract and administrative audit rules required. |

### Missing frontend workflows

- Shared login/session restoration, role guards and forced-password-change workflow are implemented in Phase I. Live account validation and deployed CORS verification remain outstanding.
- Dedicated Admin teacher-to-subject assignment screen is not present, although the assignment API exists on backend main.
- Student duty-proof submission/retrieval UI is not present; matching backend support exists only on the unmerged backend draft branch.
- No authoritative rollNumber UI/data path exists. This blocks the requested roll-number-only attendance clipboard.
- No class/session time field is exposed by the current teacher subject/roster API, so clipboard first-line class-time data is also unsupported today.

## Backend integration contract status

### Available on backend main (live source branch only)

- Authentication: `POST /api/auth/login` accepts `{ username, password }`; `GET /api/auth/me`; `POST /api/auth/change-password`. Login returns a short-lived Bearer access token (15-minute default), user role and `mustChangePassword`.
- Exact application roles: `STUDENT`, `TEACHER`, `ADMIN`. New student/teacher accounts are provisioned by Admin; no public signup.
- Admin: user directory/provisioning/status/password reset, Class and Subject management, teacher-subject assignment, and read-only `GET /api/admin/attendance` aggregate report.
- Teacher: `GET /api/teacher/subjects`; `GET /api/teacher/subjects/:subjectId/roster`; `POST /api/teacher/subjects/:subjectId/attendance`.
- Student: self-only `GET /api/student/attendance?fromDate=&toDate=`.
- Current main Prisma User has `id, fullName, username, email, role, classId, mustChangePassword, isActive, timestamps`; no dedicated `rollNumber`.
- Current main AttendanceStatus is `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`. One row per student/subject/calendar date; class time/session is not represented.

### Backend draft branch only — do not assume available to frontend production

- Backend branch: `attendance-duty-proof`, head `48816f5595b52fb19c7f63b58ba2b17b85820463`, 31 commits ahead of backend `main`.
- Its PR #1 is open, draft, unmerged and undeployed: https://github.com/armanpreet-singh/ltsu-backend/pull/1.
- Draft schema replaces statuses with `PRESENT`, `ABSENT`, `ON_DUTY_REVIEW`; it implements the confirmed percentage formula and student proof submission/retrieval.
- Draft student route: `POST /api/student/attendance/:attendanceId/duty-proof` (multipart field `proof`), plus GET duty-proof download route. Authenticated student is limited to their own pending ON_DUTY_REVIEW record; successful proof submission changes it to PRESENT.
- Draft teacher routes add `PATCH /api/teacher/attendance/:attendanceId` for the original marking teacher within 30 minutes, and duty-proof read access for assigned teachers. Bulk mark response also returns attendance IDs/edit-window metadata.
- Draft proof upload accepts PDF/JPEG/PNG up to 5 MB, uses authenticated Cloudinary storage and five-minute signed download URLs. Cloudinary secrets are not configured; proof submission will not work until runtime configuration is complete.
- Draft migration `20261113111000_on_duty_review_and_duty_proof` was executed/tested only on temporary Neon branch `br-old-mouse-aovx103t`; primary Neon and its migration history remain unchanged. The backend PR must be reviewed/merged and the primary migration explicitly approved/applied before treating these APIs as live.
- The draft still does **not** add a dedicated `rollNumber` field or class/session time to roster/attendance records.

### Planned/unsupported contracts

- Dedicated User.rollNumber and class/session time remain product requirements with no field in backend main or the inspected backend draft.
- Assignments, timetable, results, resources, announcements, calendar/events, Department and general system settings have no supporting endpoint/model in backend main or the inspected attendance draft. Do not fabricate API paths or payloads.

## Completed frontend chunk — Teacher Attendance UI

### Implementation

- Replaced the non-functional static “Mark Now” list with one cohesive teacher attendance workflow.
- In live API mode, it calls the existing backend-main teacher subject list, roster, and bulk attendance endpoints using a Bearer token.
- Adds subject/class selection, date selection, student search, current-backend status selection (PRESENT/ABSENT/LATE/EXCUSED), bulk all-present/all-absent actions, review summary, submit confirmation, and loading/error/empty/retry states.
- In demo mode, uses separate API-shaped fixtures in `src/features/teacher/data/mockTeacherAttendance.js` and stores demo results in browser localStorage. It does not silently replace an API error with mock data.
- Adds responsive layout rules using the existing `--d-*` theme variables in `src/features/teacher/styles/teacherAttendance.css`.
- Explicitly explains why roll-number clipboard actions remain unavailable; it does not copy usernames or database IDs as roll numbers.
- Teacher Attendance and Student Attendance use the token from the shared auth provider. Login, `/api/auth/me` restoration, logout, role route protection and forced password change are integrated through the same session context.
- Current main API does not return attendance records for a selected date before marking. The UI can track submission state in its active session, but a revisit/refresh cannot reconstruct existing marks from main's current teacher API. Duplicate attendance returns a backend conflict (HTTP 409).
- Component uses main's current four statuses. Do not change it to ON_DUTY_REVIEW until the backend draft is approved/merged/deployed.

### Files changed

1. `.github/workflows/frontend-build.yml` — adds CI build for pushes to `main` and `ui/teacher-attendance-workflow`, and pull requests targeting main.
2. `src/features/teacher/data/mockTeacherAttendance.js` — API-shaped demo fixtures and browser-local attendance persistence.
3. `src/features/teacher/pages/TeacherAttendance.jsx` — attendance workflow implementation.
4. `src/features/teacher/styles/teacherAttendance.css` — theme-aware responsive styles.

### Commits

- `c22971c3d164e172ebc7f8dde3b671e4a39bc077` — initial page replacement.
- `def7479cdcd47bc616ad820dc33710c659859782` — add separated demo data.
- `fdb9fa42bd7a4b2de3faa3c147ef33ac0e625741` — add responsive page styles.
- `c6bb002f204ca8c07e28c3541dee057a318d323a` — finalize API-shaped data flow and error handling.
- `6caeb59f7bec8b509c87f659faf344b1d94ef204` — add frontend build workflow (build trigger commit).

### Verification

- GitHub Actions workflow run `43428639030` completed with conclusion `success` on branch `ui/teacher-attendance-workflow`, commit `6caeb59f7bec8b509c87f659faf344b1d94ef204`.
- Verified steps: checkout, Node.js 22 setup, `npm ci`, `npm run build` — all successful.
- No lint or unit-test run: package.json does not define lint/test scripts.
- Desktop/mobile were checked through responsive CSS review and breakpoints; no browser-driven viewport test was available in the GitHub connector.
- This verifies a successful frontend production build, not a live authenticated API session or browser clipboard behavior.
- No deployment was performed.
- This implementation PR (#2) was subsequently merged into main at `76b7f1a4806c400811b8d6ba5bd955fb133be7a8`. The following backend-login PR (#3) was then merged at `84607ce7c81512b5529788964672b9b0ca4c92c9`.

## Completed frontend chunk — Phase I, Chunk 1: Backend-connected login

### Historical PR and CI snapshot

- PR #2 was merged first using a regular merge commit: `76b7f1a4806c400811b8d6ba5bd955fb133be7a8`.
- PR #3 was then retargeted to `main` and merged using a regular merge commit: `84607ce7c81512b5529788964672b9b0ca4c92c9`.
- The login implementation's GitHub Actions run `43433208070` passed on its original feature-branch head `c07aa2a2cfd27715b738ab920bf6a0d2b6f9ad04`.
- No live account sign-in was attempted during Phase I, Chunk 1. No backend/Neon changes were made.

### Backend contract verified

Backend `main` exposes `POST /api/auth/login` with Zod validation for exactly `{ username, password }`. Username is trimmed, 3–40 characters, restricted to letters/numbers/dot/underscore/hyphen and normalized to lowercase by the backend. Password must be non-empty and no more than 72 UTF-8 bytes.

Successful response shape is `{ status: "ok", data: { accessToken, tokenType: "Bearer", expiresIn, user } }`. The safe user includes `id`, `fullName`, `username`, `email`, `role`, `classId`, `mustChangePassword`, and timestamps. Supported roles are exactly `STUDENT`, `TEACHER`, and `ADMIN`.

### Implementation

- Login now calls `POST /api/auth/login` using only `username` and `password`; the UI role selector is a portal preference and is never sent as an authorization claim.
- The server-returned role controls navigation: STUDENT → `/dashboard`, TEACHER → `/teacher`, ADMIN → `/admin`. A role preference mismatch produces an informational notice but does not override the backend role.
- Stores the short-lived Bearer token under `ltsu-access-token` (the key expected by Teacher Attendance) and the safe user object under `ltsu-auth-user` for the upcoming session-provider chunk.
- Implements username format/length validation and the backend's 72 UTF-8-byte password maximum, pending/submitting state, a 12-second request timeout, useful 401/429/5xx/network/CORS messages, inline errors and toast feedback.
- “Remember username” stores only the username, not a password. The password-reset hint now explains that reset is managed by a university administrator; no unsupported public reset API is fabricated.
- When `mustChangePassword=true`, the login flow warns the user. The dedicated password-change page and route gate remain a later Phase I chunk.
- API URL is configurable with `VITE_API_BASE_URL`; the code defaults to the documented Render service URL. `.env.example` documents the backend's local port (5000) and production override.
- Backend `CORS_ORIGIN` must include the real frontend origin (currently documented site: `https://smart-student-portal.pages.dev`) and local development origin as appropriate. Render's current runtime value was not inspected or changed in this UI-only chunk.

### Files changed for this chunk

1. `src/features/auth/api/authApi.js` — typed-by-contract login request/response handling and role routing map.
2. `src/features/auth/components/LoginForm.jsx` — backend login, validation, storage, role-based navigation and user feedback.
3. `src/features/auth/components/RoleSelector.jsx` — accessibility label clarifies this is a portal preference.
4. `src/features/auth/pages/LoginPage.css` — small styling additions for API errors and role hint; existing design retained.
5. `.env.example` — public Vite API URL configuration examples; no secrets.
6. `.github/workflows/frontend-build.yml` — includes `feat/auth-login-api` push builds.
7. This handoff and `CONTINUE_FRONTEND_DEVELOPMENT_PROMPT.md`.

### Verification and limitations

- This chunk has not yet been tested with a real account; no credentials were requested or used. Build verification is the available automated check.
- No authentication/session integration tests are configured in the frontend package; no `test` or `lint` script exists.
- The token is stored in localStorage to remain compatible with the existing Teacher Attendance page. The next auth chunk must implement `GET /api/auth/me`, account/session restoration, expiration and logout. Route guards and forced password change are separate upcoming chunks.
- No backend changes, database changes, Render environment changes or deployment were performed.

## Completed frontend chunk — Phase I, Chunk 2: Shared authentication session management

### Implementation

- Added `AuthProvider` inside `BrowserRouter` in `src/main.jsx`; `App.jsx` displays the session-recovery notice.
- The provider exposes the current access token, server-verified user, session status, `establishSession`, `restoreSession`, `retrySession` and `logout` through `useAuth()`.
- On startup, if a stored token exists, it calls backend-main `GET /api/auth/me` with Bearer authorization. The returned user replaces the cached user snapshot. Cached user data is not read or trusted when restoring a session.
- Session states: `restoring`, `authenticated`, `anonymous`, `expired` and `unavailable`.
- HTTP 401 clears the saved token/user, marks the session expired, and redirects to `/login`. If a valid session is restored while already on `/login`, the provider routes to that verified user's dashboard.
- Network/temporary service failures clear the in-memory user but preserve the token for retry. A recovery notice offers Retry and Sign out. The app does not treat stale cached roles as authenticated.
- Login now calls `establishSession` instead of writing session keys itself. Storage access is centralized in `src/features/auth/utils/sessionStorage.js`.
- Existing logout menu actions in Student, Teacher and Admin topbars now clear the shared token/user and navigate to `/login`.
- Teacher Attendance now consumes `accessToken` and `sessionStatus` from the auth provider; it waits until the backend session is verified before loading live subjects. Its API base URL now uses the same shared `getApiBaseUrl()` helper as authentication.
- No route guards or forced password-change page were added; these remain later Phase I chunks.

### Files changed for this chunk

1. `src/features/auth/context/AuthContext.jsx`
2. `src/features/auth/utils/sessionStorage.js`
3. `src/features/auth/api/authApi.js` — shared API base URL and `GET /api/auth/me` client.
4. `src/features/auth/components/SessionRecoveryNotice.jsx` and `.css`
5. `src/features/auth/components/LoginForm.jsx`
6. `src/main.jsx` and `src/App.jsx`
7. Student, Teacher and Admin topbar components.
8. `src/features/teacher/pages/TeacherAttendance.jsx`
9. `.github/workflows/frontend-build.yml`.

### Branch, PR and verification

- Branch: `feat/auth-session-provider`; base: `main`.
- PR #4: https://github.com/armanpreet-singh/smart-student-portal/pull/4 — open, mergeable, not merged.
- Code head at verification: `92be2959eb63161718d8b2669e889460a9677ffd`.
- GitHub Actions build run `43436197757` passed on that exact head; PR check run `43436411634` also passed, and Cloudflare Pages check completed successfully.
- Both `npm ci` and `npm run build` passed. There are no frontend lint or unit-test scripts.
- No real account credentials were used. No backend, database, Render environment or deployment configuration was changed.
## Completed frontend chunk — Phase I, Chunk 3: Role-based route protection

### Implementation

- Added reusable `ProtectedRoute` component using the shared `useAuth()` context and backend role-to-dashboard mapping.
- Wrapped `/dashboard/*` in `allowedRole="STUDENT"`, `/teacher/*` in `allowedRole="TEACHER"`, and `/admin/*` in `allowedRole="ADMIN"` within `src/App.jsx`.
- Public `/` landing and `/login` routes remain unguarded.
- While the session status is `restoring`, protected content is not mounted; the user sees a centered session-verification state.
- Anonymous and expired sessions are redirected to `/login`, retaining the attempted path in navigation state.
- A verified user who opens another role's route is redirected to the dashboard derived from the server-verified role.
- When session verification is temporarily unavailable, the guard fails closed and displays a session-unavailable state. The global recovery banner remains available for retry; the fallback also offers sign-out.
- Added responsive, theme-token-based styling for loading and unavailable states, with focus-visible and reduced-motion handling.
- No changes were made to the landing/login pages or any role dashboard UI. Forced password-change UI remains Phase I, Chunk 4.

### Files changed for this chunk

1. `src/features/auth/components/ProtectedRoute.jsx`
2. `src/features/auth/components/ProtectedRoute.css`
3. `src/App.jsx` — guard the three existing role route trees.
4. `.github/workflows/frontend-build.yml` — run the build on the route-guard feature branch.
5. Both frontend handoff documents.

### Branch, PR and verification

- Branch: `feat/auth-role-route-guards`, originally stacked on `feat/auth-session-provider`.
- PR #4 was subsequently merged into `main` at `132b49e3269c99577f515121a60b0c99a7185f0f`; PR #5 was retargeted to `main` and merged at `9dc22f762c8b82cd5e59d34110e269f5af9d3b07`.
- GitHub Actions run `43437899529` completed successfully on the exact branch head; checkout, Node.js 22 setup, `npm ci` and `npm run build` passed.
- The frontend has no configured lint or unit-test scripts. No live account credentials were used.
- No backend, database, Render environment or deployment changes were made.
## Completed frontend chunk — Phase I, Chunk 4: Forced password-change workflow

### Backend contract verified

- Backend `main` exposes `POST /api/auth/change-password`, protected by `authenticate` and strict Zod validation.
- Request body is exactly `{ currentPassword, newPassword }`. No user ID, role or confirmation field is accepted.
- Current password must be non-empty and at most 72 UTF-8 bytes. New password must be at least 12 characters, at most 72 UTF-8 bytes, and different from the current password.
- Success returns `{ status: "ok", message, data: { user } }`. The updated public user has `mustChangePassword: false`.
- The backend also exposes `GET /api/auth/me`; the UI calls it again after the password-change response to confirm that the requirement is cleared before navigating.

### Implementation

- Login sends accounts with `mustChangePassword === true` directly to `/change-password`.
- `ProtectedRoute` now supports `requirePasswordChange`. All Student, Teacher and Admin dashboard route trees redirect a verified temporary-password account to `/change-password`; a normal account opening that route is redirected to its own role dashboard.
- The password-change screen reuses the existing LTSU authentication layout and includes current, new and confirm fields, visibility toggles, validation feedback, submit state, sign-out and success/error toasts.
- Only `{ currentPassword, newPassword }` is sent to the backend. Password confirmation is checked locally and never sent.
- Frontend validation matches the backend's 12-character / 72 UTF-8-byte / different-from-current rules. Backend field validation details and incorrect-current-password errors are displayed.
- After the password-change API confirms `mustChangePassword: false`, the shared auth provider refreshes the current user using `/api/auth/me`. Dashboard navigation occurs only after the refreshed server user confirms the requirement is cleared.
- No account provisioning, password reset, backend, database, Render environment or deployment changes were made.

### Files changed for this chunk

1. `src/features/auth/api/authApi.js` — `POST /api/auth/change-password` client and strict response validation.
2. `src/features/auth/context/AuthContext.jsx` — authenticated current-user refresh action.
3. `src/features/auth/components/ProtectedRoute.jsx` — required-password-change route gate.
4. `src/features/auth/pages/PasswordChangePage.jsx` and `.css` — responsive LTSU password-change screen.
5. `src/features/auth/components/LoginForm.jsx` — send temporary-password accounts to the change page.
6. `src/App.jsx` — verified `/change-password` route.
7. `.github/workflows/frontend-build.yml` — build on this feature branch.
8. Both frontend handoff documents.

### Branch, PR and verification

- Branch: `feat/auth-forced-password-change`, based on `main` at `9dc22f762c8b82cd5e59d34110e269f5af9d3b07`.
- PR #6: https://github.com/armanpreet-singh/smart-student-portal/pull/6 was merged into main at `4c8f5b5a9ed75f739f79cb7a14ec931570834a57`.
- Implementation commit `4ebd35f2fc0e1bb58cd59d219f2f03e634a443a3` passed GitHub Actions build run `43439637720` and Cloudflare Pages.
- Both `npm ci` and `npm run build` passed on that exact implementation commit. A documentation-only update will trigger another final build.
- No real university credentials were used. The frontend package has no lint or unit-test script.

## Completed frontend chunk — Phase II, Chunk 1: Student Attendance API integration

### Backend contract verified

- Backend `main` mounts Student routes at `/api/student`; `GET /api/student/attendance` is protected by authentication, `STUDENT` role authorization and the completed-password-change guard.
- Optional query parameters are `fromDate` and `toDate`, both valid calendar dates in `YYYY-MM-DD` format. When both are present, `fromDate` must be on or before `toDate`.
- Response is `{ status: "ok", data: { period, subjects } }`. Each subject includes `subject` (`id`, `code`, `name`, `isActive`, `class`), `summary`, and `records` (`id`, `date`, `status`, `remarks`, `recordedAt`).
- Summary includes counts for `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`, `totalRecords`, `eligibleSessions`, `attendedSessions`, and nullable `attendancePercentage`.
- Backend calculation: eligible sessions are PRESENT + ABSENT + LATE; attended sessions are PRESENT + LATE. EXCUSED is excluded from the percentage denominator. A subject with no eligible sessions has a null percentage.

### Implementation

- Replaced the Student Attendance page's mock totals, mock weekly/monthly values, mock faculty names, current-day/upcoming-class data and mock insights with live API data.
- Added `src/features/dashboard/api/studentAttendanceApi.js`, which sends the shared Bearer token, optional date filters, request timeout and response validation; it surfaces backend errors rather than falling back to demo data.
- The existing summary cards now derive overall attendance, attended sessions, missed sessions and excused records from backend summaries.
- The weekly chart is derived from last-seven-day PRESENT/LATE/ABSENT records; the monthly chart is calculated from returned records and excludes EXCUSED from the denominator.
- Subject detail rows use the backend subject/class data and the backend-provided per-subject attendance summary. Recent records and status breakdown use the returned record list.
- Added start/end date filters, date-order validation, loading, API error/retry, no-subject and no-record states. No mock attendance fixtures are imported by the live screen.
- The page retains the existing dashboard layout, shared cards, theme variables, dark-mode compatibility and responsive styles.
- No backend, database, Render configuration, or deployment changes were made. No real Student credentials were used.

### Files changed

1. `src/features/dashboard/api/studentAttendanceApi.js` — authenticated read API client and response contract checks.
2. `src/features/dashboard/pages/AttendancePage.jsx` — live response mapping, charts, date filters and request states.
3. `src/features/dashboard/pages/AttendancePage.css` — responsive filter, state, status and record styling.
4. `.github/workflows/frontend-build.yml` — CI build trigger for this feature branch.
5. Both frontend handoff documents.

### Branch, PR and verification

- Branch: `feat/student-attendance-api`, based on `main` at `4c8f5b5a9ed75f739f79cb7a14ec931570834a57` (PR #6 merge).
- PR #7: https://github.com/armanpreet-singh/smart-student-portal/pull/7 merged into `main` at `49d42d4b750f213debfb7e354c98c31f1b7ae5d4`.
- Final Student Attendance PR #7 head `f5da8688302a87fbf3eb2e9da54a753991a2a763` passed GitHub Actions builds `43442444854` and `43442432240`, plus Cloudflare Pages.
- No lint or unit-test scripts are configured. Live Student-account end-to-end testing remains outstanding.

## Completed frontend chunk — Phase II, Chunk 2: Admin Attendance Overview API integration

### Backend contract verified

- Backend `main` mounts Admin routes at `/api/admin`; `GET /api/admin/attendance` is protected by authentication, `ADMIN` role authorization and the completed-password-change guard.
- Supported optional query parameters are `fromDate`, `toDate`, `classId` and `subjectId`. Date values must be valid calendar dates in `YYYY-MM-DD` format; fromDate must be on or before toDate.
- Report response is `{ status: "ok", data: { period, filters, summary, subjects } }`. Overall and per-subject summaries contain PRESENT, ABSENT, LATE, EXCUSED, totalRecords, eligibleSessions, attendedSessions and nullable attendancePercentage.
- Per-subject entries contain subject identity (`id`, `code`, `name`, `class`) and a backend-calculated summary. There is no department model/report grouping in backend main.
- `GET /api/admin/classes` and `GET /api/admin/subjects` provide paginated class/subject directory data. Query schemas support `page` and `pageSize`; subjects return `classId` and related class identity fields.
- Backend percentage rules: eligible sessions are PRESENT + ABSENT + LATE; attended sessions are PRESENT + LATE; EXCUSED is excluded from the denominator. Percentage is null if there are no eligible sessions.

### Implementation

- Replaced the Admin Attendance page's fabricated university percentage, highest/lowest department figures and department-wise chart with the real overall and per-subject aggregate report.
- Added `src/features/admin/api/adminAttendanceApi.js` to call `GET /api/admin/attendance` with the shared Bearer token, supported query filters, request timeout, backend error handling and response validation.
- The same API client loads paginated class and subject directories through existing Admin endpoints to populate real filter choices. It does not create new backend contracts.
- Added date, class and subject filters. Changing class narrows the available subject options; selecting filters submits the exact supported query parameters.
- Overall metric cards, status counts, subject chart and class/subject detail table all derive from the returned aggregate summaries. No fake departments, top/lowest ranks or mock metrics remain on this screen.
- Added loading, API error/retry, filter-directory retry, date-order validation, empty-subject and no-record states. Live API failures are not hidden by mock fallbacks.
- Preserved the existing Admin dashboard layout and shared card/header components, plus dashboard CSS variables and responsive/dark-mode behavior.
- No backend, database, Render configuration, secret or deployment changes were made. No real Admin credentials were used.

### Files changed

1. `src/features/admin/api/adminAttendanceApi.js` — authenticated report and paginated class/subject filter clients.
2. `src/features/admin/pages/AttendancePage.jsx` — report metrics, filters, chart, breakdown and request states.
3. `src/features/admin/pages/AttendancePage.css` — responsive Admin report styling.
4. `.github/workflows/frontend-build.yml` — CI build trigger for this feature branch.
5. Both frontend handoff documents.

### Branch, PR and verification

- Branch: `feat/admin-attendance-api`, based on `main` at `4c8f5b5a9ed75f739f79cb7a14ec931570834a57` (PR #6 merge).
- PR #8: https://github.com/armanpreet-singh/smart-student-portal/pull/8 — open against `main`; do not merge it without an explicit request.
- Student Attendance PR #7 was merged into `main` before Admin Attendance PR #8; the final merge will retain both implementations.
- GitHub Actions build run `43448089188` and Cloudflare Pages both passed on implementation head `69aae5c9284d12a2c58b88015f8fbb3a5e3e9dd5`. Final checks on the documentation-updated head will be verified after the handoff refresh.
- No lint or unit-test scripts are configured. Live Admin-account end-to-end testing remains outstanding.

## Completed frontend chunk — Phase II, Chunk 3: Admin Class and Subject Catalogue API integration

### Backend contract verified

- Backend `main` mounts Admin routes at `/api/admin`; both `GET /api/admin/classes` and `GET /api/admin/subjects` require an authenticated `ADMIN` account with `mustChangePassword=false`.
- Both directory endpoints support 1-based `page` and `pageSize` (1–100), optional `search` (maximum 80 characters) and optional `isActive=true|false`.
- Class listing also supports optional `academicYear`; the page displays class `id`, `code`, `name`, `academicYear`, `isActive` and `_count.students` / `_count.subjects`.
- Subject listing also supports optional `classId`; subjects include `id`, `classId`, `code`, `name`, nullable `description`, `isActive` and related class identity (`id`, `code`, `name`, `academicYear`, `isActive`).
- Responses use `{ status: "ok", data: { classes|subjects, pagination: { page, pageSize, total, totalPages } } }`.
- Search behavior in backend main is case-insensitive: classes search code/name/academicYear; subjects search code/name/description.

### Implementation

- Replaced the mock Course Catalog and inert Create Course button with a read-only Class & Subject Catalogue. The screen no longer presents unsupported credits, faculty, department or semester fields.
- Added `src/features/admin/api/adminCatalogueApi.js` for authenticated, timeout-protected GET requests, pagination validation, class/subject response validation and API error handling.
- Added separate Classes and Subjects views. Class rows show class code/name, academic year, student count, subject count and active state. Subject rows show subject code/name, related class, academic year, description and active state.
- Added server-side search, active/inactive filtering, page-size selection, previous/next pagination and a class filter for subjects.
- The subject class filter is populated from paginated class-directory data (up to 10,000 class records) rather than from mock options. If those choices cannot be loaded, the subject list remains viewable without the class filter and exposes a retry.
- Added loading, API error/retry and empty/no-match states. Live failures do not fall back to mock catalogue rows.
- Preserved the Admin dashboard layout, shared SectionHeader/DashboardCard, existing CSS tokens, dark-mode compatibility and responsive behavior.
- This is a read-only integration using only existing GET endpoints. No create/update actions, backend, database, Render, secret or deployment changes were made. No real Admin credentials were used.

### Files changed

1. `src/features/admin/api/adminCatalogueApi.js` — authenticated Class/Subject list clients, pagination and response validation.
2. `src/features/admin/pages/CoursesPage.jsx` — live Classes/Subjects views, filters, pagination and request states.
3. `src/features/admin/pages/CoursesPage.css` — responsive catalogue styling.
4. `.github/workflows/frontend-build.yml` — CI trigger for this feature branch.
5. Both frontend handoff documents.

### Branch, PR and verification

- Branch: `feat/admin-class-subject-catalogue`, based on `main` at `db07903ce1003073f2e9b3902c295321c3427f3c` (PR #8 merge).
- PR #9: https://github.com/armanpreet-singh/smart-student-portal/pull/9 — open against `main`; do not merge it without an explicit request.
- PR #7 (Student Attendance) and PR #8 (Admin Attendance) were merged into `main` in dependency order before this chunk.
- Follow-up cleanup: removed the duplicate `justifyContent` key in the existing mobile Login CTA in `src/components/layout/Navigation.jsx`, while preserving horizontal centering for both desktop and mobile Login CTAs.
- On latest code head `2a457bd1125a5d03aa939b3024b8f59f54e72bc0`, GitHub Actions builds `43453090461` and `43453102554` both passed (`npm ci` and `npm run build`).
- Cloudflare Pages preview is still the deployment blocker. The supplied full log shows the Vite build completed, all 89 static assets were uploaded/published, then Cloudflare failed at `Failed to publish your Function` with `Unknown internal error occurred`. The repo has no `functions/` directory, `_worker.js`, Wrangler config or Worker bindings. This points to Cloudflare's Function/Worker publication layer rather than the app build; exact cause is unconfirmed and requires Cloudflare-side log/settings inspection or a successful retry.
- No lint or unit-test scripts are configured. Live Admin-account end-to-end testing remains outstanding.

## Completed frontend chunk — Phase II, Chunk 4: Admin Student Directory API integration

### Backend contract verified

- Backend `main` mounts Admin routes at `/api/admin`; `GET /api/admin/users` requires an authenticated `ADMIN` account with `mustChangePassword=false`.
- Directory query accepts optional `role` (`STUDENT` or `TEACHER`), optional `search` (maximum 80 characters), optional `isActive=true|false`, 1-based `page` and `pageSize` (1–100).
- This screen always sends `role=STUDENT`; search is performed by backend against `fullName`, `username` and `email`.
- Response is `{ status: "ok", data: { users, pagination } }`. User rows provide `id`, `fullName`, `username`, nullable `email`, `role`, nullable `classId`, `mustChangePassword`, `isActive`, `createdAt`, `updatedAt` and nullable class `{ id, code, name }`.
- Backend User data has no `rollNumber`, department or semester fields. The UI must not infer these values from username or class code.

### Implementation

- Replaced the mock Student Directory and inert Add Student button with a read-only authenticated directory view.
- Added `src/features/admin/api/adminStudentsApi.js` for `GET /api/admin/users`, shared Bearer-token authentication, a 12-second timeout, query validation, response-shape validation and backend error handling.
- Added server-side search by full name/username/email, Active/Inactive filtering, selectable page size, previous/next pagination and result counts.
- Student rows display name and username, nullable email, linked class code/name or Not assigned, active account status, whether a password change is required, and account creation date.
- Added loading, error/retry, empty and no-match states. Live API failures do not fall back to mock students.
- Preserved shared `SectionHeader`/`DashboardCard`, Admin layout, LTSU color tokens, dark-mode support and responsive table behavior.
- Removed unsupported roll number, department and semester presentation and the inert Add Student action. This slice does not create accounts, reset passwords or mutate account status.
- No backend, database, Render, secret or deployment changes were made. No real Admin credentials were used for live testing.

### Files changed

1. `src/features/admin/api/adminStudentsApi.js` — authenticated Student directory request and validation.
2. `src/features/admin/pages/StudentsPage.jsx` — live Student Directory, server filters, pagination and request states.
3. `src/features/admin/pages/StudentsPage.css` — responsive styling and states.
4. `.github/workflows/frontend-build.yml` — CI trigger for this feature branch.
5. Both frontend handoff documents.

### Branch, PR and verification

- Branch: `feat/admin-student-directory`, stacked on PR #9 branch `feat/admin-class-subject-catalogue` at `768c41c113f93cde8c3bfd8bb4dea6d2b5974f59`.
- PR #10 will target `feat/admin-class-subject-catalogue`, not `main`, to keep the Student Directory diff separate while preserving PR #9 as its dependency. After PR #9 merges, the base can be moved to `main`.
- PR #9 remains open; its Cloudflare Pages Function-publication failure is documented in the preceding chunk. No successful Pages deployment is claimed here.
- Documentation-updated branch head `bb33d5cd71ab5412f93eeb67d2cb582c81035ea9` passed GitHub Actions build run `43456291503` (`npm ci` and `npm run build`).
- No lint or unit-test scripts are configured. Live Admin/Student-account end-to-end testing remains outstanding.
## Completed frontend chunk — Phase II, Chunk 5: Admin Teacher Directory API integration

### Backend contract verified

- Backend `main` mounts Admin routes at `/api/admin`; `GET /api/admin/users` requires an authenticated `ADMIN` account with `mustChangePassword=false`.
- Directory query accepts optional `role` (`STUDENT` or `TEACHER`), optional `search` (maximum 80 characters), optional `isActive=true|false`, 1-based `page` and `pageSize` (1–100).
- This screen always sends `role=TEACHER`; backend search covers `fullName`, `username` and `email`.
- Response is `{ status: "ok", data: { users, pagination } }`. User rows provide `id`, `fullName`, `username`, nullable `email`, `role`, nullable `classId`, `mustChangePassword`, `isActive`, `createdAt`, `updatedAt` and nullable class `{ id, code, name }`.
- The directory endpoint does not provide employee ID, department, specialization, experience, teacher-subject assignment, or assigned-subject summaries. Do not invent these fields or infer subjects from a class link.

### Implementation

- Replaced the mock Faculty Directory and inert Add Faculty button with a read-only live Teacher Directory.
- Added `src/features/admin/api/adminTeachersApi.js` for `GET /api/admin/users` with `role=TEACHER`, shared Bearer-token authentication, a 12-second timeout, filter validation, response validation and backend error handling.
- Added backend-side search by full name/username/email, Active/Inactive filtering, page-size selection, previous/next pagination and result counts.
- Teacher rows display full name and username, nullable email, nullable linked class, account active state, password-change-required state and account creation date.
- Added loading, error/retry, empty and no-match states. Live API failures do not fall back to mock faculty records.
- Removed fabricated faculty ID, department and subjects columns. No teacher creation, account status mutation, password reset or subject-assignment controls were added.
- Preserved the Admin dashboard's shared `SectionHeader`/`DashboardCard`, LTSU design tokens, dark mode and responsive table behavior.
- No backend, database, Render, secrets or deployment code was changed. No real Admin credentials were used for live end-to-end testing.

### Files changed

1. `src/features/admin/api/adminTeachersApi.js` — authenticated Teacher directory client and response validation.
2. `src/features/admin/pages/TeachersPage.jsx` — live Teacher Directory, filters, pagination and request states.
3. `src/features/admin/pages/TeachersPage.css` — responsive directory styling.
4. `.github/workflows/frontend-build.yml` — CI trigger for this feature branch.
5. Both frontend handoff documents.

### Branch, PR and verification

- Branch: `feat/admin-teacher-directory`, based on `main` after PR #10 merge commit `a32bfa04d132f2866938b7364eccb426bfb1e519`.
- PR #11: https://github.com/armanpreet-singh/smart-student-portal/pull/11 merged into `main` at `e2bbf343fffd11b714a7ad692e400174c20ee65b`.
- GitHub Actions build run `43459874479` passed on final handoff-updated head `25de2967f8d25628b1c12c4186a8eda8f34a6cfa` (`npm ci` and `npm run build`).
- Cloudflare Pages preview check was still building when PR #11 was opened; no successful Pages deployment is claimed until the result is confirmed.
- No lint or unit-test scripts are configured. Live Admin/Teacher-account testing remains outstanding.
## Completed frontend chunk — Phase II, Chunk 6: Admin Student Account Provisioning (create-only)

### Backend contract verified

- Backend `main` mounts Admin routes at `/api/admin`; `POST /api/admin/users` requires an authenticated `ADMIN` account with `mustChangePassword=false`.
- The strict request schema accepts `fullName` (2–120 characters), `username` (3–40 characters; letters/numbers/dot/underscore/hyphen; normalized lowercase), optional email, `role=STUDENT`, `temporaryPassword` (minimum 12 characters and maximum 72 UTF-8 bytes), and optional `classId`.
- If `classId` is supplied, the service verifies that class exists and is active. Class assignment is optional; no class is fabricated or required by the UI.
- Successful creation responds with HTTP 201 and `{ status: "ok", data: { user } }`. Backend creates the account active with `mustChangePassword=true`.
- Backend duplicate/unique conflicts are returned as HTTP 409. Teacher creation, status updates and password reset are separate operations and remain outside this chunk.

### Implementation

- Added `src/features/admin/api/adminStudentProvisioningApi.js` with shared Bearer-token POST authentication, 12-second timeout, request validation, response validation and duplicate/conflict-aware errors.
- Added active class option loading by reusing the live `GET /api/admin/classes` endpoint with `isActive=true`; all pages are loaded with page size 100 and a 10,000-class safety ceiling.
- Restored an explicit **Add Student** action in the Admin Student Directory and connected it to an accessible responsive create-account dialog.
- Form fields: full name, username, optional email, optional active class, temporary password and client-side password confirmation.
- Client validation mirrors backend constraints, including UTF-8 password byte length. Server remains authoritative and validates a selected class again.
- Sends only the backend-supported create payload: fullName, normalized username, role=STUDENT, temporaryPassword, and optional email/classId. Confirmation is client-side only.
- Displays API validation and duplicate-account conflicts. On success, displays confirmation, clears sensitive password state and refreshes the directory. No password is logged or persisted in browser storage.
- Account status is not editable in this slice; success communicates that the new account is active and must change its temporary password at first sign-in.
- If active class options cannot load, the form explains that class is optional and allows creation without a class or a retry.
- No backend, database, Render, secret or deployment changes were made. No real Admin credentials were used for live end-to-end testing.

### Files changed

1. `src/features/admin/api/adminStudentProvisioningApi.js` — create request, validation and active class options.
2. `src/features/admin/pages/StudentsPage.jsx` — Add Student action and create dialog.
3. `src/features/admin/pages/StudentsPage.css` — modal, form and success styles.
4. `.github/workflows/frontend-build.yml` — CI trigger for this branch.
5. Both frontend handoff documents.

### Branch, PR and verification

- Branch: `feat/admin-student-provisioning`, based on `main` after PR #10 merge commit `a32bfa04d132f2866938b7364eccb426bfb1e519`.
- PR #12: https://github.com/armanpreet-singh/smart-student-portal/pull/12 remains open against `main`; PR #11 has already merged.
- GitHub Actions build run `43464024426` passed on final PR head `6523d6972c7a64ce0ebeee1a68d698e9f4a1fa0a` (`npm ci` and `npm run build`).
- No lint or unit-test scripts are configured. Live Admin-account creation testing remains outstanding.
## Completed frontend chunk — Phase II, Chunk 7: Admin Teacher Account Provisioning (create-only)

### Backend contract verified

- Backend `main` mounts Admin routes at `/api/admin`; `POST /api/admin/users` requires an authenticated `ADMIN` account with `mustChangePassword=false`.
- The strict request schema accepts `fullName` (2–120 characters), `username` (3–40 characters; letters/numbers/dot/underscore/hyphen; normalized lowercase), optional email, `role=TEACHER` and `temporaryPassword` (minimum 12 characters and maximum 72 UTF-8 bytes).
- The schema explicitly rejects a `classId` for TEACHER accounts. Teacher-to-subject assignment is a separate endpoint/workflow and is not part of account creation.
- Successful creation responds with HTTP 201 and `{ status: "ok", data: { user } }`. Backend creates the account active with `mustChangePassword=true`.
- Duplicate/unique conflicts return HTTP 409. Status update and password reset are separate endpoints and remain outside this chunk.

### Implementation

- Added `src/features/admin/api/adminTeacherProvisioningApi.js` for POST `/api/admin/users`, shared Bearer-token authentication, 12-second timeout, backend-aligned client validation, response validation and duplicate-account handling.
- Added an **Add Teacher** action and responsive create-account dialog to the live Teacher Directory.
- Form fields: full name, username, optional email, temporary password and client-side confirmation. There is no class field and the request never sends `classId`.
- Client validation mirrors backend field limits and validates temporary-password UTF-8 byte length. The backend remains authoritative.
- Sends only backend-supported fields: `fullName`, normalized `username`, `role=TEACHER`, `temporaryPassword` and optional `email`. Confirmation is client-side only.
- Handles validation/duplicate errors. On success, displays confirmation, communicates active/forced-password-change state, clears password fields and refreshes the Teacher Directory.
- Temporary password is sent only in the POST body, is not persisted in browser storage and is not logged.
- No teacher status changes, password resets, subject assignments, backend/database/Render/secret changes or deployment changes were made. No real Admin credentials were used for live testing.

### Files changed

1. `src/features/admin/api/adminTeacherProvisioningApi.js` — authenticated Teacher create request and validation.
2. `src/features/admin/pages/TeachersPage.jsx` — Add Teacher action and create dialog.
3. `src/features/admin/pages/TeachersPage.css` — responsive modal/form/success styling.
4. `.github/workflows/frontend-build.yml` — CI trigger for this feature branch.
5. Both frontend handoff documents.

### Branch, PR and verification

- Branch: `feat/admin-teacher-provisioning`, based on `main` after PR #12 merge commit `2ad3c38118c5b5f250d94f824508c895bd938c9a`.
- PR #13: https://github.com/armanpreet-singh/smart-student-portal/pull/13 merged into `main` at `78a6936ff89bc477f5e0228c56d7d8151c74478d`.
- GitHub Actions builds `43469120271` and `43469130003` both passed on final documentation-updated head `7888f80ce29f7412abe632fea08813a146e2bacc` (`npm ci` and `npm run build`).
- Cloudflare Pages preview was still in progress at last check; deployment is not confirmed.
- No lint or unit-test scripts are configured. Live Admin/Teacher account creation testing remains outstanding.
## Completed frontend chunk — Phase II, Chunk 8: Admin Managed Account Status Controls

### Backend contract verified

- Backend `main` exposes `PATCH /api/admin/users/:userId/status` under the Admin router.
- The request schema is strict and accepts exactly `{ isActive: boolean }`; no additional body properties are allowed.
- The service only updates managed `STUDENT` and `TEACHER` roles. It rejects self-account changes by returning HTTP 404 and also returns 404 when the target is missing or outside the managed roles.
- Success returns HTTP 200 with `{ status: "ok", data: { user } }`; the public user record includes id, role, isActive, identity/class fields and timestamps.

### Implementation

- Added `src/features/admin/api/adminAccountStatusApi.js` for authenticated PATCH requests, a 12-second timeout, strict request validation, response validation and clear 401/403/404/5xx handling.
- Added reusable `src/features/admin/components/AccountStatusControl.jsx` and `.css` with visible Active/Inactive badges, Activate/Deactivate actions and an explicit confirmation dialog.
- Integrated the control into both Student and Teacher Directory rows; each successful update triggers a fresh server-backed directory request.
- The signed-in Admin's own account is identified from the shared auth context and displays a non-actionable `Your account` indicator. Backend self-account protection remains authoritative.
- Controls only alter `isActive`. Password resets and teacher-subject assignment are not included.
- No backend, database, Render, secrets or deployment changes were made. No real Admin credentials were used for live status-change testing.

### Files changed

1. `src/features/admin/api/adminAccountStatusApi.js` — authenticated status mutation and validation.
2. `src/features/admin/components/AccountStatusControl.jsx` — reusable confirm-and-update UI.
3. `src/features/admin/components/AccountStatusControl.css` — status control and confirmation styles.
4. `src/features/admin/pages/StudentsPage.jsx` — Student status control integration.
5. `src/features/admin/pages/TeachersPage.jsx` — Teacher status control integration.
6. `.github/workflows/frontend-build.yml` — feature branch CI trigger.
7. Both frontend handoff documents.

### Branch, PR and verification

- Branch: `feat/admin-account-status-controls`, based on `main` after PR #13 merge commit `78a6936ff89bc477f5e0228c56d7d8151c74478d`.
- PR #14: https://github.com/armanpreet-singh/smart-student-portal/pull/14 merged into `main` at `b028a915973206e9cecea8a08a2ab827445149c1`.
- GitHub Actions builds `43556779435` and `43556782854` passed on final PR head `1205fb134e7122966081df331c7f774c564d335c` (`npm ci` and `npm run build`). Cloudflare Pages preview deployed successfully: https://feat-admin-account-status-co.smart-student-portal.pages.dev.
- No lint/unit-test scripts or live Admin status-change tests are configured.
## Completed frontend chunk — Phase II, Chunk 9: Admin Managed Account Password Reset

### Backend contract verified

- Backend `main` exposes `POST /api/admin/users/:userId/password-reset` under the authenticated Admin router.
- The strict request schema accepts exactly `{ temporaryPassword: string }`; temporary passwords require at least 12 characters and no more than 72 UTF-8 bytes.
- The service hashes the password, stores no plaintext, and sets `mustChangePassword=true`. The response is `{ status: "ok", data: { user } }` and contains no password.
- The service returns HTTP 404 when the Admin targets their own account or a missing/non-managed account. The route is protected by authentication, ADMIN role, and completed-password-change middleware.

### Implementation

- Added `src/features/admin/api/adminAccountPasswordResetApi.js` for authenticated POST requests with a 12-second timeout, client validation, Bearer token, exact request body, response validation and explicit 400/401/403/404/5xx handling.
- Added reusable `src/features/admin/components/AccountPasswordResetControl.jsx` and `.css` with a clear account-specific confirmation dialog, temporary-password input, client-side confirmation and inline validation/error feedback.
- Integrated the control into both Student and Teacher Directory password-setup cells. Successful resets refresh the server-backed directory; the updated password state is reflected by the existing `mustChangePassword` badge.
- The signed-in Admin's own row is non-actionable and displays `Your account`; the backend self-target 404 remains authoritative.
- Passwords are sent only in the reset request body; confirmation is client-only. Passwords are not written to browser storage, state outside the form, console output or request logs. Form state is cleared on success or dialog close.
- No status-change or teacher-subject assignment behavior was added. No backend, database, migration, Render, secrets or deployment changes were made. No live Admin credentials or managed account were used for mutation testing.

### Files changed

1. `src/features/admin/api/adminAccountPasswordResetApi.js` — authenticated reset request and backend-aligned validation.
2. `src/features/admin/components/AccountPasswordResetControl.jsx` — reusable confirmation and password form.
3. `src/features/admin/components/AccountPasswordResetControl.css` — responsive reset dialog and action styling.
4. `src/features/admin/pages/StudentsPage.jsx` — Student Directory reset action.
5. `src/features/admin/pages/TeachersPage.jsx` — Teacher Directory reset action.
6. `.github/workflows/frontend-build.yml` — push CI trigger for `feat/admin-managed-password-reset`.
7. Both frontend handoff documents.

### Branch, PR and verification

- Branch: `feat/admin-managed-password-reset`, created from live `main` at `d4484cfc4384b024f86ee0f4d9590d59e5bae242`.
- PR #15 merged into `main` at `3a8f7fc6fcae978922b628ee9e23349c166998ed`. No deployment was performed.
- GitHub Actions run `43558387098` completed with `success` on PR head `b91accc4a61ebd2ad08626707178b985fde4d0c9`; both `npm ci` and `npm run build` passed. This was the final handoff-updated head when the run was checked.
- No lint or unit-test scripts are configured. Live Admin/Student/Teacher password reset validation remains outstanding.

## Known issues and integration gaps

- Login, shared session restoration/logout, role-based route guards and forced password-change UI are implemented in merged or reviewable frontend changes. Phase I is complete at the code level; live university-account validation remains outstanding.
- Login, session provider, Teacher Attendance, role route guards and forced password change use the shared auth context/session interface. The underlying short-lived token remains stored under `ltsu-access-token` for compatibility.
- Backend-main attendance status set differs from the confirmed product policy. Backend draft PR #1 is not merged/deployed and its database migration is not on primary.
- User model and roster response do not include rollNumber; the requested copy output must remain disabled until a dedicated backend field and matching API response are introduced.
- No attendance session/class-time data exists. Current uniqueness is one student/subject/date record, not multiple class sessions in one day.
- No list/existing-record endpoint exists on backend main for teacher attendance on a selected date, so UI cannot restore pre-existing marks on refresh.
- Cloudinary proof uploads on the backend draft require runtime credentials, currently not configured per draft handoff.
- CORS origin must be configured on backend runtime for the actual frontend origin.
- Most non-attendance pages remain mock-backed or have inert controls; see audit above.
- No lint/test scripts currently exist in the frontend package. No real account credentials have been used for live end-to-end testing.

## Completed frontend chunk — Phase II, Chunk 10: Admin Teacher-to-Subject Assignment UI

- Feature branch: `feat/admin-teacher-subject-assignments`, created from live `main` at `d4484cfc4384b024f86ee0f4d9590d59e5bae242`.
- PR #16: https://github.com/armanpreet-singh/smart-student-portal/pull/16 merged into `main` at `fc24d228a63e61e7e628ab4cab58e959deb01e21` after successful rebased CI run `43560009483` on head `14601289a1227965b66db160fdb40fe03fd941c0`.
- Reverified backend-main route, request schema and service before editing. The Admin-only endpoint is `POST /api/admin/teacher-subject-assignments`, with strict body exactly `{ teacherId, subjectId }`; it returns HTTP 201 with `{ status: "ok", data: { assignment: { id, teacherId, subjectId, assignedAt } } }`.
- Backend eligibility rules require an active account with role `TEACHER`, an active Subject, and an active parent Class. Duplicate teacher/subject links return HTTP 409. These rules remain authoritative on the backend.
- Added `src/features/admin/api/adminTeacherSubjectAssignmentsApi.js` for the Bearer-authenticated POST. It validates IDs and the created response, applies a 12-second timeout, and handles validation/ineligibility, expired session, forbidden access, duplicate, server, transport and timeout-uncertainty cases.
- Added `src/features/admin/pages/TeacherSubjectAssignmentsPage.jsx` and its CSS. Choices are loaded from the existing paginated Teacher Directory and Subject Catalogue APIs. Only active TEACHER accounts and active Subjects belonging to active Classes are selectable. Subject options are grouped by Class.
- The screen includes loading, retry, error and empty states, a selection preview, explicit review/confirmation before mutation, and success feedback after the API confirms creation. A 401 triggers the shared auth refresh.
- Added the Admin route `/admin/teacher-subject-assignments` and sidebar link “Teaching Assignments”; added the feature branch to frontend build CI.
- Backend main does not expose an assignment-list/read endpoint, so this slice deliberately does not invent a list of current assignments or claim to show existing links.
- Verification: GitHub Actions run `43559468023` completed successfully on final implementation head `3968938daec63a0438822c296f44969f9dbb7bd1`. Both locked dependency installation (`npm ci`) and `npm run build` passed. The frontend package has no configured lint or unit-test script.
- No live Admin account or teacher-subject assignment mutation was used for testing. No backend, database, migration, secrets or deployment were changed.
- Chunk 9 password reset was merged separately through PR #15 into `main` at `3a8f7fc6fcae978922b628ee9e23349c166998ed`: https://github.com/armanpreet-singh/smart-student-portal/pull/15.


## Completed frontend chunk — Phase II, Chunk 11: Admin Class Management UI

- Feature branch: `feat/admin-class-management`, based on `main` at `fc24d228a63e61e7e628ab4cab58e959deb01e21`.
- PR #17: https://github.com/armanpreet-singh/smart-student-portal/pull/17 merged into `main` at `88503fbfb98c7229e6179ba04a45b0ec71c7745a` after CI run `43560632318` passed on final PR head `88c37682758501c8ed611727c9351012f8509429`.
- Reverified backend-main Admin route and validators. `POST /api/admin/classes` accepts exactly `{ code, name, academicYear }` and returns HTTP 201 with `{ status: "ok", data: { class } }`. `PATCH /api/admin/classes/:classId` accepts only `code`, `name`, `academicYear`, and/or `isActive`; it returns HTTP 200 with the updated class projection.
- Backend validation: class code 1–30 characters, letters/numbers/dots/underscores/hyphens and uppercased; name 2–120 characters; academicYear 4–20 characters. Unique code conflict returns 409; a missing class on update returns 404.
- Added `src/features/admin/api/adminClassManagementApi.js` with authenticated POST/PATCH requests, client-side backend-aligned validation, class response validation, 12-second timeout and handling for 400, 401, 403, 404, 409, server, network and timeout-uncertainty cases.
- Extended `src/features/admin/pages/CoursesPage.jsx` and CSS with Add Class, Edit, and confirmed Archive/Reactivate controls in the Class view. Archive/reactivate changes only `isActive`; records are retained. Successful mutations refresh the class directory and class filter options.
- The existing Subject Catalogue remains read-only. Class/subject directory search, filtering and pagination are preserved.
- No live class create/edit/archive/reactivate operation was used for testing. No backend, database, migration, secret or deployment changes were made.
- Chunk 9 PR #15 merged into `main` at `3a8f7fc6fcae978922b628ee9e23349c166998ed`. Chunk 10 PR #16 merged into `main` at `fc24d228a63e61e7e628ab4cab58e959deb01e21`.

## Completed frontend chunk — Phase II, Chunk 12: Admin Subject Management UI

- Feature branch: `feat/admin-subject-management`, based on `main` at `88503fbfb98c7229e6179ba04a45b0ec71c7745a`.
- PR #18: https://github.com/armanpreet-singh/smart-student-portal/pull/18 merged into `main` at `a188f41af7218ae3a181dd51b5d3a08f7e1a436d`.
- Reverified backend-main Admin routes, strict schemas, service eligibility and response projection. POST `/api/admin/subjects` accepts exactly `{ classId, code, name, description? }` and returns HTTP 201. PATCH `/api/admin/subjects/:subjectId` accepts only `code`, `name`, `description`, and/or `isActive` and returns HTTP 200.
- Backend limits: code 1–30 allowed characters and normalized uppercase; name 2–120 characters; description nullable and at most 500 characters. Unique subject-code conflicts return 409; missing subject update returns 404.
- Subject creation requires an active parent class. Reactivation is rejected when the parent class is inactive. The update schema does not accept `classId`, so changing a subject's parent class is not offered.
- Added `adminSubjectManagementApi.js` and Add/Edit/Archive/Reactivate controls in the Subject view. New subjects require an active class; successful mutations refresh the directory. Existing Class Management, class-scoped filtering, search and pagination remain intact.
- PR #18 final head `0d14f89cd651a9025ee6dd33ad7049a782c8ee11`; GitHub Actions runs `43561272705` and `43561269307` both passed (`npm ci`, `npm run build`).
- No live subject mutations, backend, database, migration, secrets or deployment changes were made.

## Completed frontend chunk — Phase II, Chunk 13: Admin Reports & Analytics API Alignment

- Feature branch: `feat/admin-reports-analytics`, rebased onto `main` after PR #18 merged.
- PR #19: https://github.com/armanpreet-singh/smart-student-portal/pull/19 merged into `main` at `641540bbd547eb6b295f746c4048be542651ce5e`.
- Backend-main `GET /api/admin/attendance` returns period, filters, overall summary and per-subject summaries. Supported filters are `fromDate`, `toDate`, `classId`, `subjectId`.
- Summary semantics: eligible = PRESENT + ABSENT + LATE; attended = PRESENT + LATE; EXCUSED excluded; zero eligible denominator returns nullable `attendancePercentage`.
- Reports & Analytics uses the authenticated Attendance Overview report component/API, with filters, metrics, status breakdown, subject chart/table and loading/error/empty states. Unsupported growth, department, enrollment and monthly attendance metrics are not shown as real data.
- Final post-rebase CI runs `43562736157` (PR) and `43562732174` (push) passed on head `67d2f26f8c6dd660b02035345a352fb11ff2f21f` (`npm ci`, `npm run build`).
- No backend, database, migration, secret, deployment or live report data changes were made.

## Completed frontend chunk — Phase II, Chunk 14: Admin Departments Capability Alignment

- Branch: `feat/admin-departments-capability`, based on `main` at `641540bbd547eb6b295f746c4048be542651ce5e`.
- PR #20: https://github.com/armanpreet-singh/smart-student-portal/pull/20 merged into `main` at `010e99ef2474f5f63e1dfeda0b383e4b4ec159d4`.
- Backend-main Prisma schema has no Department model or department/faculty fields; Admin routes expose no department read endpoint; academic services and validators contain no department contract.
- Replaced the mock department cards with an accessible capability-unavailable notice. Department names, HODs and student/faculty totals are not displayed as university data.
- DepartmentsPage no longer imports `departmentsData`; shared `mockAdminData.js` remains unchanged for unrelated legacy screens.
- GitHub Actions PR run `43563316264` and push run `43563311740` passed on PR #20 head `467c58aee195f7a32460589783e15bd62afc97d6`; post-merge main build `43566113320` also passed.
- No backend, database, schema, migration, secret, deployment or live data changes were made.

## Completed frontend chunk — Phase II, Chunk 15: Admin Announcements Capability Alignment

- Branch: `feat/admin-announcements-capability`, originally stacked on PR #20; PR #21 was retargeted to `main` after PR #20 merged.
- PR #21: https://github.com/armanpreet-singh/smart-student-portal/pull/21 merged into `main` at `2a15c4a9179d99a558a43a4c6a9affb6a06b0d9e`.
- Reverified backend-main `prisma/schema.prisma`: no Announcement or Notification model. Admin, Student and Teacher route files contain no announcement/notification endpoints; the app mounts only the existing auth/admin/teacher/student route groups.
- The previous Admin page had two hard-coded sample messages with unverified audience/date/status values and an inert New Announcement button. Replaced the content with an accessible capability-unavailable notice; sample messages, fake sent/scheduled states and unsupported publishing controls are no longer displayed.
- Added responsive `AnnouncementsPage.css` and a workflow trigger for `feat/admin-announcements-capability`.
- GitHub Actions push run `43565264008` passed on final head `f92835bead0cd0d689df5c4f196fc46a6aa591cd`; the final head's `build` and Cloudflare Pages checks passed. Post-merge main build `43566205135` also passed.
- No backend, database, schema, migration, secret, deployment or live announcement changes were made.

## Completed frontend chunk — Phase II, Chunk 16: Admin Academic Calendar Capability Alignment

- Branch: `feat/admin-calendar-capability`, based on `main` at `2a15c4a9179d99a558a43a4c6a9affb6a06b0d9e`.
- PR #22: https://github.com/armanpreet-singh/smart-student-portal/pull/22 is open against `main`.
- Reverified backend-main `prisma/schema.prisma`: no Calendar, AcademicCalendar or Event model. Admin, Student and Teacher route files expose no calendar/event endpoints; Admin academic services and validators have no event contract.
- The Admin Calendar page previously rendered two hard-coded events (“University Convocation” and “Diwali Holidays Begin”) with fixed 2023 dates. Replaced them with an accessible capability-unavailable notice; no unsupported event creation, editing or publishing controls were added.
- Added responsive `CalendarPage.css` and the `feat/admin-calendar-capability` workflow branch trigger. The existing Admin `/calendar` route and dashboard layout are preserved.
- Source read-back covered the Admin Calendar page, stylesheet, workflow and both handoff files. GitHub Actions push run `43566860529` and PR run `43566938543` both completed successfully on implementation head `c427cc3bb51e3fd1c607b7e3adae8a7c92e1981d`; both ran `npm ci` and `npm run build`. The matching Cloudflare Pages check also completed successfully.
- No backend, database, schema, migration, secret, deployment or live calendar changes were made.

## Completed frontend chunk — Phase II, Chunk 17: Teacher Academic Calendar Capability Alignment

- Branch: `feat/teacher-calendar-capability`, stacked on PR #22 / `feat/admin-calendar-capability` at `bcb4ad1f9c649b43c202a8a20a6f44f5c0b639f5` (whose base is `main` at `2a15c4a9179d99a558a43a4c6a9affb6a06b0d9e`).
- PR #23: https://github.com/armanpreet-singh/smart-student-portal/pull/23 merged into `main` at `ef599232f5eef8e4c5f107778627180bd0767c33`.
- Reverified backend-main Prisma schema and Teacher route: no Calendar/AcademicCalendar/Event model or Teacher calendar/event endpoint. The Teacher router currently exposes assigned subjects, subject rosters and attendance marking only.
- The previous Teacher Calendar displayed four hard-coded 2023 entries (mid-semester results, faculty meeting, DBMS viva and Diwali holidays). Replaced them with an accessible capability-unavailable notice; no fixed dates, sample event labels or unsupported event management controls remain.
- Added responsive `TeacherCalendar.css`; preserved the existing Teacher calendar page, route and shared dashboard components.
- Source read-back covered the Teacher Calendar page, stylesheet, workflow and both handoff files. GitHub Actions push run `43567902853` passed on final PR head `ce23c20ee277bc3ccc21859ce0513a60d2cf164b`; `npm ci` and `npm run build` passed. Cloudflare Pages check `132365766906` also passed.
- No backend, database, schema, migration, secret, deployment or live calendar changes were made.

## Completed frontend chunk — Phase II, Chunk 18: Student Academic Calendar Capability Alignment

- Branch: `feat/student-calendar-capability`, stacked on PR #23 / `feat/teacher-calendar-capability` at `ce23c20ee277bc3ccc21859ce0513a60d2cf164b`; PR #23 itself is stacked on PR #22 / `feat/admin-calendar-capability`.
- PR #24: https://github.com/armanpreet-singh/smart-student-portal/pull/24 merged into `main` at `fb64e04b0f3f4e58e327767189f5d9430306d020`.
- Reverified backend-main Prisma schema and `src/routes/student-routes.js`: no Calendar/AcademicCalendar/Event model or Student calendar/event endpoint. The Student router exposes only its authenticated attendance read endpoint.
- The Student Calendar page previously imported four sample dates from `mockDashboardData.js` (DBMS Mid-Sem, Tech Fest, CN Lab Viva and OS Mid-Sem, all dated 2023). Replaced the sample list with an accessible capability-unavailable notice and removed the page's mock calendar import. The shared fixture file remains unchanged for unrelated dashboard data.
- Added responsive `CalendarPage.css`; preserved the Student `/dashboard/calendar` route, page heading, shared dashboard components and layout.
- Source read-back covered the Student Calendar page, stylesheet, workflow and both handoff files. GitHub Actions push run `43568955517` completed successfully on implementation head `1bd74d37e695027408ae1b45e97151f596301c72`; `npm ci` and `npm run build` passed. The matching Cloudflare Pages check `132369006051` also completed successfully. The PR-specific build is not triggered while PR #24 targets a feature branch; it will run after the stack is retargeted to `main`.
- No backend, database, schema, migration, secret, deployment or live calendar changes were made.

## Completed frontend chunk — Phase II, Chunk 19: Student Announcements Capability Alignment

- Branch: `feat/student-announcements-capability`, based directly on `main` at `fb64e04b0f3f4e58e327767189f5d9430306d020`.
- PR #25: https://github.com/armanpreet-singh/smart-student-portal/pull/25 merged into `main` at `81cf6ef370d98db8919e547135194d33bbac2112`.
- Reverified backend-main `prisma/schema.prisma`, `src/routes/student-routes.js`, `src/routes/admin-routes.js`, `src/routes/teacher-routes.js` and `src/app.js`: no Announcement/Notification model, no role-specific announcement read routes, and no separate announcement/notification router. Student routes expose only authenticated attendance reads.
- The Student Announcements page previously imported three fixed records from `mockDashboardData.js` (exam schedule, Tech Fest registrations and library timing changes), with relative timestamps and category labels. Replaced these mock cards with an accessible capability-unavailable state; the page no longer imports announcement fixtures.
- Added responsive `src/features/dashboard/pages/AnnouncementsPage.css`; preserved the existing Student Announcements route in `DashboardRoutes.jsx`, the shared SectionHeader/DashboardCard layout and the shared fixture module for unrelated screens.
- Added `feat/student-announcements-capability` to the frontend build workflow push filters.
- Implementation commit `75729955689c7f3e6f3f2921a54285704ba39713` passed GitHub Actions push run `43570280493` and PR run `43570326248`, including `npm ci` and `npm run build`. Cloudflare Pages check `132373055575` also passed. Handoff-only documentation refresh follows the implementation commit.
- No backend, database, schema, migration, secret, deployment or live announcement changes were made.

## Completed frontend chunk — Phase II, Chunk 20: Teacher Announcements Capability Alignment

- Branch: `feat/teacher-announcements-capability`, stacked on PR #25 / `feat/student-announcements-capability` at `de0845bc4c6c8a839d520cb911853b47278ff934`.
- PR #26: https://github.com/armanpreet-singh/smart-student-portal/pull/26 merged into `main` at `94c377726153dc86c4b578e29e9dd4745a692771`.
- Reverified backend-main `prisma/schema.prisma`, `src/routes/teacher-routes.js`, `src/routes/admin-routes.js`, `src/routes/student-routes.js` and `src/app.js`: no Announcement/Notification model, no role-specific announcement read/publish routes, and no separate notification router. Teacher routes expose assigned subjects, subject rosters and attendance marking only.
- Replaced three hard-coded Teacher announcement records (syllabus completion, lab rescheduling and an extra lecture) with an accessible capability-unavailable state. Removed unsupported target audiences, relative timestamps, sent/draft badges and the inert New Announcement button.
- Removed the mock Announcements count from `teacherStatsData`, the inert Send Announcement shortcut from `TeacherHome.jsx`, and the Teacher top-bar unread-notification dot/icon because no Notification contract exists.
- Added responsive `src/features/teacher/pages/TeacherAnnouncements.css`; preserved the Teacher announcements route, page shell and shared dashboard components. Only the announcement-specific entry in `mockTeacherData.js` was removed; unrelated fixture data remains unchanged.
- Added `feat/teacher-announcements-capability` to the frontend build workflow push filters.
- Final pre-merge head `dea3d78679476ef51f4fdb42b1bbcafd85576a59` passed GitHub Actions push run `43572152311` (`npm ci`, `npm run build`) and Cloudflare Pages check `132378738174`. Post-merge `main` build run `43572551971` also passed after PR #26 merged.
- No backend, database, schema, migration, secret, deployment or live announcement/notification changes were made.

## Completed frontend chunk — Phase II, Chunk 21: Teacher Dashboard Capability Alignment

- Branch: `feat/teacher-dashboard-capability`, based directly on `main` at `94c377726153dc86c4b578e29e9dd4745a692771`.
- PR #27: https://github.com/armanpreet-singh/smart-student-portal/pull/27 merged into `main` at `c1484c39871d6ca8e195ffd555a52bb68e4f1569`.
- Reverified backend-main `prisma/schema.prisma`, `src/routes/teacher-routes.js`, `src/services/attendance-service.js`, `src/routes/auth-routes.js`, `src/services/auth-service.js` and `src/app.js`: the Teacher API supports assigned-subject lookup, active subject rosters and attendance marking. Authenticated `GET /api/auth/me` returns verified basic identity fields including `fullName`; it does not provide designation, department, employee ID or semester. No timetable, dashboard aggregates, assignment, grading, results or insights endpoint/model exists.
- Replaced the mock Teacher hero/profile data, five remaining fabricated summary cards, hard-coded daily schedule, mock insight alerts and inert quick-action buttons with an accessible capability-unavailable state. The page displays only the verified `user.fullName` from `AuthContext` when available.
- Added a working link to the existing Teacher Attendance workflow, which is supported by assigned-subject, roster and attendance-marking endpoints.
- Added responsive `src/features/teacher/pages/TeacherHome.css`; preserved the Teacher dashboard route and shared page/card components. Other Teacher mock data and pages were left unchanged.
- Added `feat/teacher-dashboard-capability` to the frontend build workflow push filters.
- Final implementation-plus-handoff head `29abbfbcc4742ecef9fbec3a684550ab71369f74` passed GitHub Actions push run `43573775688` and PR run `43573848697`, each including `npm ci` and `npm run build`; Cloudflare Pages check `132383569842` also passed. The follow-up commit only records these verification results in the handoff documents; Teacher dashboard source is unchanged.

## Completed frontend chunk — Phase II, Chunk 22: Teacher My Classes API Alignment

- Branch: `feat/teacher-classes-api`, stacked on PR #27 / `feat/teacher-dashboard-capability` at `dbd53c39cb36caa1d17df14c23e72fca78123d7f`.
- PR #28: https://github.com/armanpreet-singh/smart-student-portal/pull/28 merged into `main` at `2ccfe31cdfedd1437ddda5b515b0825f2be72f02`, after prerequisite PR #27 merged first.
- Reverified backend-main `src/routes/teacher-routes.js`, `src/services/attendance-service.js`, `prisma/schema.prisma` and `src/app.js`: authenticated Teacher `GET /api/teacher/subjects` returns `{ status: "ok", data: { subjects } }`. Each row includes `assignedAt` and a subject with `id`, `code`, `name`, `classId`, and nested class `id`, `code`, `name`, `academicYear`. The service filters to active subject and class assignments.
- Added `src/features/teacher/api/teacherSubjectsApi.js` with Bearer-token authentication, 12-second timeout, network/authorization/server error handling and strict response validation.
- Replaced the fixture-backed `TeacherClasses.jsx` with backend-backed subject cards. Only verified subject/class fields and assignment timestamp are displayed. Removed unsupported student totals, timetable/next-lecture information, attendance percentages and inert Attendance/Assignments quick actions.
- Added loading, API error with retry, empty-assignment state and a working page-level link to the existing Teacher Attendance workflow. No mock fallback is used.
- Added responsive `src/features/teacher/pages/TeacherClasses.css`; preserved the existing `/teacher/classes` route and shared Teacher dashboard shell.
- Added `feat/teacher-classes-api` to push workflow filters and `feat/teacher-dashboard-capability` to pull-request workflow base filters to run PR checks for this stacked PR.
- No backend, database, schema, migration, secret or deployment changes were made. No live account or academic records were modified.
- Implementation commit: `0e4a32a0d3096eab24e3d62e83fb0131c567801d`; final handoff-inclusive head `c6a8557548b6b43cd95f3172530263ce442c1b27` passed GitHub Actions push run `43575412273` and stacked PR run `43575415501`, both including `npm ci` and `npm run build`. Cloudflare Pages check `132388528302` also passed. A follow-up documentation-only commit records these verified CI results; the source implementation is unchanged.

## Completed frontend chunk — Phase II, Chunk 23: Teacher Students API Alignment

- Branch: `feat/teacher-students-api`, based directly on `main` at `2ccfe31cdfedd1437ddda5b515b0825f2be72f02`.
- PR #29: https://github.com/armanpreet-singh/smart-student-portal/pull/29 merged into `main` at `04573f41327e09cfbb19225502002003de8105a3`.
- Reverified backend-main `src/routes/teacher-routes.js`, `src/services/attendance-service.js`, `src/validators/attendance-schemas.js`, `prisma/schema.prisma` and `src/app.js`: authenticated Teacher `GET /api/teacher/subjects` returns active subject assignments; `GET /api/teacher/subjects/:subjectId/roster` verifies that the subject is assigned and active for the current Teacher and returns the selected subject/class plus active students. Roster student fields are exactly `id`, `fullName`, `username`.
- Extended `src/features/teacher/api/teacherSubjectsApi.js` with `fetchTeacherSubjectRoster`, using the shared Bearer-token request helper, 12-second timeout, 401/403/404/server/network/timeout handling, strict response validation, selected subject/class identity matching and unique student ID validation.
- Replaced the mock `TeacherStudents.jsx` page with a subject-scoped flow: load the Teacher's active assignments, select an assigned subject, then request only that subject's roster. Displays returned student full name and username; searches locally by those fields.
- Removed unsupported global student listings, roll numbers, sections, attendance percentages and CGPA. Database IDs are used only for response validation and stable row keys; usernames are not presented as roll numbers.
- Added subject and roster loading states, API error/retry states, empty assigned-subject and empty-roster states, plus a no-search-match state.
- Added responsive `src/features/teacher/pages/TeacherStudents.css`; preserved the existing `/teacher/students` route and shared Teacher shell. Added `feat/teacher-students-api` to the frontend build workflow push filters.
- No backend, database, schema, migration, secret or deployment changes were made. No live Teacher account or academic records were modified.
- Implementation commit: `cd67d541e50294c6fe62b9ab0457d85f7d932c04`; final handoff-inclusive head `e038948b67bbe5cc685e933c9b38292cceac191e` passed GitHub Actions push run `43577766143` and PR run `43577833858`, each including `npm ci` and `npm run build`. Cloudflare Pages check `132395773519` also passed. The follow-up documentation-only commit records these verified results; source implementation is unchanged.

## Completed frontend chunk — Phase II, Chunk 24: Teacher Assignments Capability Alignment

- Branch: `feat/teacher-assignments-capability`, stacked on PR #29 / `feat/teacher-students-api` at `00cd0f68574d90816b5349a33c4f7e2544867f2e`.
- PR #30 initially merged into `feat/teacher-students-api` at `99573c1d41bb2d4f070bbc6124f8ff3b1ee2cb34`. Because its base was the feature branch, follow-up PR #31 carried those changes into `main`; PR #31 merged at `2dc2cca9f1c16ecc4ff526149af0a0a03ca3421a`.
- Reverified backend-main `prisma/schema.prisma`, `src/routes/teacher-routes.js`, `src/routes/admin-routes.js`, `src/routes/student-routes.js`, `src/services` and `src/app.js`. Schema models are User, Class, Subject, TeacherSubject and Attendance; no Assignment/Submission model exists. Teacher routes expose only assigned-subject lookup, subject roster and attendance marking; no assignment, submission, grading or results endpoint exists.
- Replaced fixture-backed Teacher Assignments UI with an accessible capability-unavailable state. Removed mock assignment titles, subject/section labels, due dates, submission totals, grading states and completion percentages.
- Removed fake status filters and the inert Create Assignment button. Added working links to existing My Classes and Students pages.
- Added responsive `src/features/teacher/pages/TeacherAssignments.css`; preserved existing `/teacher/assignments` route and shared Teacher shell. Added CI branch filters for the feature branch.
- No backend, database, schema, migration, secret or deployment changes were made. No live Teacher account or academic records were modified.
- Chunk 24 implementation build run `43579617820` passed; catch-up PR #31's push and PR builds also passed on its final head `5c704170e3fad2421cf7efdbbe5627507324fc9f` (runs `43581573236` and `43581578108`). PR #31 merge commit `2dc2cca9f1c16ecc4ff526149af0a0a03ca3421a` is part of main.

## Completed frontend chunk — Phase II, Chunk 25: Teacher Timetable Capability Alignment

- Branch: `feat/teacher-timetable-capability`, initially stacked on `feat/teacher-students-api` to retain the Chunk 24 Assignment changes.
- PR #32: https://github.com/armanpreet-singh/smart-student-portal/pull/32 merged into `main` at `06c7846d09585d3d11ef17529116a8e799308665`, after catch-up PR #31 merged first.
- Reverified backend-main `prisma/schema.prisma`, `src/routes/teacher-routes.js` and `src/app.js`: Prisma models are User, Class, Subject, TeacherSubject and Attendance only; Teacher routes expose assigned-subject lookup, subject roster and attendance marking. No timetable/schedule/session model or Teacher timetable endpoint exists.
- Replaced the sample Teacher weekly timetable with an accessible capability-unavailable state. Removed fabricated weekday sessions, subject/lecture/lab labels, times and room assignments.
- Removed the page-local `timetableData` and unused `teacherScheduleData` export from `src/features/teacher/data/mockTeacherData.js` after repository search confirmed there were no consumers.
- Added responsive `src/features/teacher/pages/TeacherTimetable.css`; preserved the existing `/teacher/timetable` route and Teacher shell.
- PR #32 head `a4994fc726e762f51cff721e24d9055ff3c87620` passed push build run `43582354115` (`npm ci`, `npm run build`). The main-target PR check was not separately scheduled before merge; the merged main head then passed build run `43582733557`.
- No backend, database, schema, migration, secret, deployment, Teacher account or academic record changes were made.

## Completed frontend chunk — Phase II, Chunk 26: Teacher Learning Resources Capability Alignment

- Branch: `feat/teacher-resources-capability`, based on `main` at `06c7846d09585d3d11ef17529116a8e799308665`, after PRs #31 and #32 merged.
- Reverified backend-main `prisma/schema.prisma`, the Teacher/Student/Admin route files, `src/app.js` and the backend repository tree. Only User, Class, Subject, TeacherSubject and Attendance models exist; no Resource/learning-material model, Teacher resource-list route or upload endpoint is present.
- Replaced inline mock Teacher resource cards with an accessible capability-unavailable notice. Removed sample resource titles, types, course labels and file sizes.
- Removed the inert upload/dropzone affordance; the page no longer implies that files can be selected, uploaded, stored, shared or assigned.
- Added responsive `src/features/teacher/pages/TeacherResources.css`; preserved the existing `/teacher/resources` route and shared Teacher shell/components.
- Added `feat/teacher-resources-capability` to GitHub Actions push filters. Frontend only; no backend, database, schema, migration, storage, secret, deployment or live academic record changes.
- PR #33: https://github.com/armanpreet-singh/smart-student-portal/pull/33 is open against `main`.
- GitHub Actions push build run `43583068296` passed on the handoff-inclusive head `b2d92112d0b82cf50ecc28ac1b4ea888334ef7c5` (`npm ci`, `npm run build`). An earlier overlapping build on commit `2c49b45a1929cf9ba7bb89955270404d3127371f` failed because the page referenced `TeacherResources.css` before its creation commit had landed; the subsequent complete-tree build passed. PR-targeted verification for #33 is pending.

## Exact next frontend task — Phase II, Chunk 27 (proposed): Teacher Profile Capability Alignment

1. Audit Teacher Profile fields and actions against backend-main `GET /api/auth/me` and any supported profile endpoints.
2. Remove fabricated employee ID, department, designation, experience, phone and other unsupported profile values or mutations.
3. Display only verified authenticated account fields; use an accessible notice for unsupported staff profile data.
4. Preserve the Teacher Profile route, shared shell, theme and responsive behavior.
5. Update both handoff documents, verify CI and stop.

