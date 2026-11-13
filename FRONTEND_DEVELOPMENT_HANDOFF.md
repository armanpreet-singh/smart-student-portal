# LTSU Smart Portal — Frontend Development Handoff

Last updated: 2026-11-13
Repository: https://github.com/armanpreet-singh/smart-student-portal
Base branch: `main`
Development branch: `ui/teacher-attendance-workflow`
Pull request: https://github.com/armanpreet-singh/smart-student-portal/pull/2 (open; not merged)
Base commit at branch creation: `51f4b51e8a3a8e89e06bbef38bdfb574bb849020`

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

## Final branch, PR and build verification

- Final verified development branch head: `4cd0587b42b85e56ba98049b6017e21bf4dc37ed`.
- Branch comparison with `main`: 9 commits ahead, 0 behind; six intended files changed. `main` remains at the original base commit.
- Frontend pull request #2: https://github.com/armanpreet-singh/smart-student-portal/pull/2 — open, mergeable, not merged.
- Final-head GitHub Actions build: run `43429782257`, conclusion `success` on the exact final head. Checkout, Node.js 22, `npm ci`, and `npm run build` all passed.
- No deployment was performed.

## UI audit — role and screen inventory

Classification definitions:
- **Ready:** UI and interaction use a currently available backend contract with appropriate permission/data handling and integration states.
- **Needs improvement:** A page exists, but remains mock-backed, has inert actions, mismatched data semantics, or incomplete API/error/permission integration.
- **Missing:** A necessary workflow/page is not present in the frontend.

No existing role page met the full Ready standard at audit time. The page shells and navigation exist, but the current screens are overwhelmingly demonstration UI. Teacher Attendance has been improved in this branch, but remains Needs improvement until authentication is connected and the remaining contract gaps are resolved.

| Role | Screen | Existing condition | Backend integration readiness | Missing work |
|---|---|---|---|---|
| Auth | Login / role selection | Existing form selects student/faculty/admin, but submit uses a simulated timeout and always reports failure; it logs submitted data. | **Needs improvement** — backend login exists but form field/role contract does not match. | Submit `{username,password}` to `POST /api/auth/login`; map backend roles exactly; store access token; call `/api/auth/me`; handle forced password change and expiry. |
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
- The component currently reads a short-lived access token from localStorage key `ltsu-access-token`. Existing LoginForm is still simulated and does not populate this key; authenticated API mode therefore requires the next auth/session chunk.
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

## Known issues and integration gaps

- Login remains mock-only. It needs the backend login/me/password-change flow and protected role routes before any live attendance API call can be authenticated.
- The new attendance page expects the future UI auth layer to expose a token under localStorage key `ltsu-access-token`, or refactor the page to consume a shared auth provider.
- Backend-main attendance status set differs from the confirmed product policy. Backend draft PR #1 is not merged/deployed and its database migration is not on primary.
- User model and roster response do not include rollNumber; the requested copy output must remain disabled until a dedicated backend field and matching API response are introduced.
- No attendance session/class-time data exists. Current uniqueness is one student/subject/date record, not multiple class sessions in one day.
- No list/existing-record endpoint exists on backend main for teacher attendance on a selected date, so UI cannot restore pre-existing marks on refresh.
- Cloudinary proof uploads on the backend draft require runtime credentials, currently not configured per draft handoff.
- CORS origin must be configured on backend runtime for the actual frontend origin.
- Most non-attendance pages remain mock-backed or have inert controls; see audit above.
- No lint/test scripts currently exist in the frontend package.

## Exact next frontend task

Implement the **shared authentication and role-guard workflow** only:
1. Connect LoginForm to `POST /api/auth/login` with the backend's exact `{ username, password }` payload; do not send a client-selected role as an authorization claim.
2. Map returned backend roles exactly: STUDENT → `/dashboard`, TEACHER → `/teacher`, ADMIN → `/admin`.
3. Establish a shared auth/session layer that stores the short-lived token consistently with Teacher Attendance (currently expects `ltsu-access-token`), calls `GET /api/auth/me`, and handles loading, invalid/expired token and logout.
4. Enforce role-specific route guards. Never treat a frontend role selector as authorization.
5. Implement the forced password-change screen/flow for `mustChangePassword=true` using `POST /api/auth/change-password`; do not mount protected feature pages until the user completes it.
6. Preserve existing login/dashboard theme and role-specific navigation; do not redesign dashboards or implement other screens in this chunk.
7. Configure API base URL through `VITE_API_BASE_URL`; document backend CORS dependency without hardcoding production secrets/URLs.
8. Add the smallest useful auth utility/tests if feasible; run build and verify behavior as available, update both handoff files, read them back, commit, and stop.

After this auth chunk, return to the integration gaps in the audit. Do not merge/deploy or assume backend draft PR #1 is live.
