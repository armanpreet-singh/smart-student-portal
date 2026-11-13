# LTSU Smart Portal — Frontend Development Handoff

Last updated: 2026-11-13
Repository: https://github.com/armanpreet-singh/smart-student-portal
Base branch: `main`
Development branch: `feat/student-attendance-api` (branched from current main)
Current pull request: Phase II, Chunk 1 — PR #7 (to be opened against `main`)
Previous frontend PR #4 (session provider) merged into main: `132b49e3269c99577f515121a60b0c99a7185f0f`
Previous frontend PR #5 (role route protection) merged into main: `9dc22f762c8b82cd5e59d34110e269f5af9d3b07`
Previous frontend PRs #2 (Teacher Attendance) and #3 (backend login) are also merged into main.
Base commit for this chunk: `4c8f5b5a9ed75f739f79cb7a14ec931570834a57`

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
| Student | Announcements | Static cards with relative timestamps. | **Needs improvement** — no announcement API/model exists on backend main. | Backend announcement audience, publishing and read-state contract required. |
| Student | Academic Calendar | Static event list with stale fixed dates. | **Needs improvement** — no calendar/event API/model exists on backend main. | Backend event/calendar contract and date/time-zone handling required. |
| Student | Profile | Profile fields, roll number, contact and academic details are hardcoded. | **Needs improvement** — `GET /api/auth/me` returns safe identity fields but no rollNumber, phone, program or batch. | Bind only returned fields; separately define missing profile data fields before displaying them as real account data. |
| Student | Settings | Display name/email/phone save to browser localStorage only. | **Needs improvement** — backend supports password change, not profile/settings mutation. | Connect password-change flow; keep local preferences separate from authoritative account data. |
| Teacher | Dashboard Home | Mock faculty identity, metrics, timetable, insights and announcements. | **Needs improvement** — assigned-subject API exists but dashboard composition does not. | Use authenticated assigned-subject data and only add statistics supported by actual endpoints. |
| Teacher | My Classes | Mock classes and attendance percentages. | **Needs improvement** — `GET /api/teacher/subjects` exists on backend main but is not used here. | Fetch assigned active subjects; reflect subject/class IDs, active state and assignment restrictions. |
| Teacher | Attendance | Uses the shared session token with current backend-main subject discovery, roster and bulk-attendance APIs; supports demo fixtures separately. | **Needs improvement** — live integration exists; no rollNumber or class time is exposed by backend main. | Validate with a real Teacher account; do not add roll-number clipboard or draft-only duty-review/correction behavior until the backend contract is live. |
| Teacher | Assignments | Mock submissions and filters; Create Assignment action is inert. | **Needs improvement** — no assignment API/model exists on backend main or inspected draft. | Backend assignment/submission API and permission contract required. |
| Teacher | Students | Mock roll numbers, attendance and CGPA; name-only filtering. | **Needs improvement** — per-subject roster exists but returns id, fullName and username only. | Connect roster scoped to assigned subject; do not present username as roll number; CGPA and global teacher directory are unsupported. |
| Teacher | Announcements | Static list; New Announcement button has no action. | **Needs improvement** — no announcement API/model exists. | Backend announcement publishing/targeting contract required. |
| Teacher | Timetable | Hardcoded weekday schedule. | **Needs improvement** — no timetable API/model exists. | Backend timetable/session and class-time contract required. |
| Teacher | Learning Resources | Static cards and decorative upload area. | **Needs improvement** — no learning-resource upload/list API exists. | Backend resource authorization, metadata, upload constraints and storage contract required. |
| Teacher | Academic Calendar | Static fixed events. | **Needs improvement** — no calendar API/model exists. | Backend calendar/event contract required. |
| Teacher | Profile | Hardcoded employee ID, contact details, experience and specialization. | **Needs improvement** — `/api/auth/me` supplies only basic account identity/role/class fields. | Bind known account fields and specify any additional staff profile model/contract before displaying values as authoritative. |
| Teacher | Settings | Form submits to console.log. | **Needs improvement** — backend password-change route exists; profile/system settings mutations do not. | Implement password change using API; separate unsupported preferences from account data. |
| Admin | Dashboard Home | Static institutional totals/insights and quick-action cards. | **Needs improvement** — no aggregate dashboard endpoint exists. | Use current admin endpoints for actual counts and avoid unverified institutional metrics. |
| Admin | Student Directory | Static users; Add Student inert; search filters only mock name. | **Needs improvement** — backend main has paginated/searchable `GET /api/admin/users`, `POST /api/admin/users` and account status/reset endpoints. | Connect role=STUDENT directory, page/pageSize/search/active filters, create form, status and password-reset flows; do not infer roll number. |
| Admin | Faculty Directory | Static faculty and subject labels; Add Faculty inert. | **Needs improvement** — admin user directory and provisioning APIs exist for TEACHER. | Connect role=TEACHER listing/creation/status/reset and assignment relationships. |
| Admin | Course Catalog | Static “courses” contain credits/faculty/department/semester fields unlike backend Class/Subject. | **Needs improvement** — admin Class and Subject CRUD APIs exist. | Map this section to Class + Subject models or provide separate management screens; remove unsupported credits/faculty/department assumptions. |
| Admin | Departments | Mock department/HOD/student/faculty counts. | **Needs improvement** — no Department model/API exists. | Backend department structure and authorized management/read API required. |
| Admin | Attendance Overview | Static department-wise percent chart. | **Needs improvement** — `GET /api/admin/attendance` exists on main and returns overall/per-subject aggregates with date/class/subject filters. | Connect report endpoint and replace unsupported department grouping with class/subject filters. |
| Admin | Announcements | Static sample rows; New Announcement button inert. | **Needs improvement** — no announcement API/model exists. | Backend announcement targeting and publication contract required. |
| Admin | Academic Calendar | Static fixed events. | **Needs improvement** — no calendar/event API/model exists. | Backend event/calendar contract required. |
| Admin | Reports & Analytics | Mock student growth, department, enrollment and attendance charts. | **Needs improvement** — only the subject-level attendance aggregate report is currently exposed. | Connect only supported attendance report first; other metrics require backend APIs and source definitions. |
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
- PR #6: https://github.com/armanpreet-singh/smart-student-portal/pull/6 — open, mergeable, not merged.
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
- PR #7 will target `main`; do not merge it without an explicit request.
- GitHub Actions build run `43441634414` completed successfully on implementation head `c818fae279b174a585e0c17b258b270d5a6a9b23` (`npm ci` and `npm run build`). Cloudflare Pages preview was pending at the first implementation snapshot; final head status will be rechecked after documentation updates.
- No lint or unit-test scripts are configured. Live Student-account end-to-end testing remains outstanding.

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

## Exact next frontend task — Phase II, Chunk 2

Implement the **Admin Attendance Overview API integration** only:
1. Inspect the existing Admin Attendance page and `deptAttendanceData` mock before changing it.
2. Use backend-main `GET /api/admin/attendance` with the shared Bearer token. It is ADMIN-only and also requires `mustChangePassword=false`.
3. Supported optional query parameters are `fromDate`, `toDate`, `classId`, and `subjectId`. Dates use `YYYY-MM-DD`; when both are provided, fromDate must be on or before toDate.
4. Response data is `{ period, filters, summary, subjects }`. Overall and per-subject summaries contain PRESENT, ABSENT, LATE, EXCUSED counts, totalRecords, eligibleSessions, attendedSessions and nullable attendancePercentage; each row includes subject and class identity fields.
5. Preserve the LTSU Admin layout, but remove unsupported department-wise figures/grouping. Present only overall and class/subject-level aggregates returned by backend. Use existing admin class/subject directory endpoints only where needed to populate real filters.
6. Add loading/error/empty/retry states and derive all totals/charts from API data. Do not use mock values as a live fallback.
7. Build, verify, update/read both handoff documents and stop. Do not merge/deploy unless explicitly requested.

After this chunk, continue one UI integration slice at a time using only verified backend-main contracts. Do not assume backend draft PR #1 is live.
