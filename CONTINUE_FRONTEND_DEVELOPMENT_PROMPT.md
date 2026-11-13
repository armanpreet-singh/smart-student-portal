# Continue LTSU Smart Portal — Frontend Development

You are continuing work on the existing frontend in https://github.com/armanpreet-singh/smart-student-portal. Do not recreate or redesign the project.

## First actions

1. Read the latest `FRONTEND_DEVELOPMENT_HANDOFF.md` and this prompt from the frontend repository before changing files.
2. Verify live branch heads, pull requests and the current file contents. Do not assume the commit hashes below remain the latest.
3. Current branch: `feat/admin-student-directory`, stacked on `feat/admin-class-subject-catalogue` (PR #9). PR #9 remains open against main: https://github.com/armanpreet-singh/smart-student-portal/pull/9. Phase II, Chunk 4 PR #10 is open against the PR #9 branch: https://github.com/armanpreet-singh/smart-student-portal/pull/10. Phase II PRs #7 and #8 and frontend PRs #2–#6 are merged into main.
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

## Exact next task — Phase II, Chunk 5

Implement Admin Teacher Directory read integration only:
1. Inspect `src/features/admin/pages/TeachersPage.jsx` and `facultyListData` mock.
2. Use backend-main GET `/api/admin/users` with the shared Bearer token and `role=TEACHER`; endpoint is ADMIN-only and requires `mustChangePassword=false`.
3. Supported query: `search` (max 80 characters), `isActive=true|false`, 1-based `page` and `pageSize` (1–100); always send `role=TEACHER`.
4. User fields include id, fullName, username, nullable email, role, nullable classId, mustChangePassword, isActive, timestamps and nullable class `{ id, code, name }`.
5. Do not invent employee IDs, department, faculty specialization, experience or assigned subjects. The endpoint does not return teacher-subject assignments.
6. Add server-side search, active filter, pagination and loading/error/empty/retry states. Keep creation, status/reset mutations and subject assignments outside this read-only slice.
7. Build, verify, update/read both handoff docs and stop. Do not merge/deploy unless requested.
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

Continue with Phase II, Chunk 2 (Admin Attendance Overview) as specified above. Verify backend-main contracts before editing, finish one chunk, update both handoff files, verify CI and stop.
