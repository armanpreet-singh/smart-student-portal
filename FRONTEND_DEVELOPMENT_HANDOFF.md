# LTSU Smart Portal — Frontend Development Handoff

Last updated: 2026-11-13
Repository: https://github.com/armanpreet-singh/smart-student-portal
Base branch: `main`
Development branch: `feat/auth-session-provider` (branched from current main)
Current pull request: https://github.com/armanpreet-singh/smart-student-portal/pull/4 (open; mergeable; not merged)
Previous frontend PR #2 (Teacher Attendance) merged into main: `76b7f1a4806c400811b8d6ba5bd955fb133be7a8`
Previous frontend PR #3 (backend login) merged into main: `84607ce7c81512b5529788964672b9b0ca4c92c9`
Base commit for this chunk: `84607ce7c81512b5529788964672b9b0ca4c92c9`

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
- Frontend pull request #2: https://github.com/armanpreet-singh/smart-student-portal/pull/2 — open, mergeable, not merged.
- GitHub Actions run `43429998901` completed with conclusion `success` on the exact snapshot commit. Checkout, Node.js 22 setup, `npm ci`, and `npm run build` all passed. Run `43429991685` also passed on the same commit.
- No deployment was performed.
- Always re-check the live ref, PR and latest CI after this snapshot; documentation-only commits can advance the branch head without changing implementation code.

## UI audit — role and screen inventory

Classification definitions:
- **Ready:** UI and interaction use a currently available backend contract with appropriate permission/data handling and integration states.
- **Needs improvement:** A page exists, but remains mock-backed, has inert actions, mismatched data semantics, or incomplete API/error/permission integration.
- **Missing:** A necessary workflow/page is not present in the frontend.

No existing role page met the full Ready standard at audit time. The page shells and navigation exist, but the current screens are overwhelmingly demonstration UI. Teacher Attendance has been improved in this branch, but remains Needs improvement until authentication is connected and the remaining contract gaps are resolved.

| Role | Screen | Existing condition | Backend integration readiness | Missing work |
|---|---|---|---|---|
| Auth | Login / role selection | The form now posts the backend's `{username,password}` contract, stores the returned Bearer token and routes by the returned account role. | **Needs improvement** — login is connected; session restoration, route guards and forced password-change flow remain separate chunks. | Add shared `/me` session restoration, expiry/logout handling, role guards and forced password-change UI in subsequent chunks. |
| Auth | Route access / session | Student, Teacher, and Admin route trees exist, but `App.jsx` mounts them without authentication/role guards. | **Needs improvement** — backend enforces role/ownership, frontend does not reflect session state. | Auth provider, role-aware route guards, signed-out redirects, password-change gate, logout and expired-session handling. |
| Student | Dashboard Home | Uses mock stats, classes, courses, assignments, announcements, resources and activity. | **Needs improvement** — no composed dashboard endpoint is exposed by backend main. | Replace mock data only as each supported endpoint exists; show empty/loading/error states; avoid fabricating metrics. |
| Student | Courses | Static mock course cards with faculty/progress fields. | **Needs improvement** — backend main has Class and Subject models, but no student course-list endpoint. | Define the student-facing Subject/Class read contract and map IDs/relationships rather than mock faculty/progress values. |
| Student | Attendance | Rich charts, summary cards, subject table and current-day panel are all mock data. | **Needs improvement** — `GET /api/student/attendance` exists on backend main, but UI does not call it. | Connect authenticated self-only API; use backend totals/status history, date filters, proper null/zero denominator, and request states. |
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
| Teacher | Attendance | Previously static/inert; this chunk adds subject discovery, roster, status selection, bulk actions, submit, demo persistence and loading/error/empty states. | **Needs improvement** — page calls current backend main teacher attendance APIs, but login currently cannot provide its token; no rollNumber or class time in backend roster. | Complete auth integration; later integrate draft duty-review/correction endpoints only after merged/deployed; add Copy Absentees/Copy Presentees only after a real rollNumber contract and class-time source exist. |
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

- Shared authenticated session, role guard and forced-password-change workflow are not implemented.
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
- The component reads a short-lived access token from localStorage key `ltsu-access-token`. Phase I, Chunk 1 now writes this key after successful backend login. Session restoration via `/api/auth/me`, proactive expiry handling, logout and role route guards are still not implemented.
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
- Frontend PR #2 is open and not merged: https://github.com/armanpreet-singh/smart-student-portal/pull/2. The PR head at creation was `15b170bdecd77d9ada544e61dfb0251186c6ef7c`; later handoff refreshes advance the head. Do not merge without normal review.

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
## Known issues and integration gaps

- Login is backend-connected and the shared session provider now restores and verifies tokens through `GET /api/auth/me`, handles expiry/network failure and supports logout. Role route guards and forced password-change UI remain outstanding.
- Login, session provider and Teacher Attendance now use a shared auth context/session interface. The underlying short-lived access token remains stored under `ltsu-access-token` for compatibility.
- Backend-main attendance status set differs from the confirmed product policy. Backend draft PR #1 is not merged/deployed and its database migration is not on primary.
- User model and roster response do not include rollNumber; the requested copy output must remain disabled until a dedicated backend field and matching API response are introduced.
- No attendance session/class-time data exists. Current uniqueness is one student/subject/date record, not multiple class sessions in one day.
- No list/existing-record endpoint exists on backend main for teacher attendance on a selected date, so UI cannot restore pre-existing marks on refresh.
- Cloudinary proof uploads on the backend draft require runtime credentials, currently not configured per draft handoff.
- CORS origin must be configured on backend runtime for the actual frontend origin.
- Most non-attendance pages remain mock-backed or have inert controls; see audit above.
- No lint/test scripts currently exist in the frontend package.

## Exact next frontend task — Phase I, Chunk 3

Implement **role-based route protection** only:
1. Add a reusable protected-route component that consumes `useAuth()`.
2. Keep `/` and `/login` public. Protect `/dashboard/*` for `STUDENT`, `/teacher/*` for `TEACHER`, and `/admin/*` for `ADMIN`.
3. While `sessionStatus === "restoring"`, show a loading state; do not decide access from cached user data.
4. For anonymous/expired sessions, redirect to `/login`. For temporary verification-unavailable state, fail closed and show the session-recovery notice rather than mounting protected dashboard content.
5. If a signed-in user opens another role's route, redirect to the dashboard derived from the backend-verified role.
6. Do not implement the forced password-change page in this chunk; keep that for Phase I, Chunk 4.
7. Preserve existing route trees and UI. Build, verify, update both handoff files, read them back and stop.


After this chunk, implement the forced password-change UI as Phase I, Chunk 4. Do not merge/deploy or assume backend draft PR #1 is live.
