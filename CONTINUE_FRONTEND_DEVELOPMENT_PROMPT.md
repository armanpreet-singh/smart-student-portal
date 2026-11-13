# Continue LTSU Smart Portal — Frontend Development

You are continuing work on the existing frontend in https://github.com/armanpreet-singh/smart-student-portal. Do not recreate or redesign the project.

## First actions

1. Read the latest `FRONTEND_DEVELOPMENT_HANDOFF.md` and this prompt from the frontend repository before changing files.
2. Verify live branch heads, pull requests and the current file contents. Do not assume the commit hashes below remain the latest.
3. Current route-guard branch: `feat/auth-role-route-guards`, stacked on `feat/auth-session-provider`. Route-guard PR #5 is open and mergeable, not merged: https://github.com/armanpreet-singh/smart-student-portal/pull/5. Parent session-provider PR #4 is also open and not merged: https://github.com/armanpreet-singh/smart-student-portal/pull/4. After PR #4 merges, retarget PR #5 to main. PR #2 and PR #3 have both been merged to main in dependency order.
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

The component expects a Bearer token at localStorage key `ltsu-access-token`. Existing LoginForm does not yet populate it; the live attendance calls cannot be used until the authentication chunk is completed.

Verified implementation/CI snapshot: branch head `386a37cc5c45e796bfc3ffc5d4b1832ff4576e98`; GitHub Actions run `43429998901` passed checkout, Node.js 22, `npm ci` and `npm run build` on that exact commit (run `43429991685` also passed on the same head). Frontend PR #2 is open, mergeable and unmerged. Subsequent handoff-only commits may advance the branch; always re-check live ref/PR/CI state before continuing.

## Exact next task — Phase I, Chunk 4

Implement the forced password-change workflow only:
1. Use the backend-verified user's `mustChangePassword` value after login/session restoration.
2. Add a dedicated password-change route/page using backend-main POST /api/auth/change-password and the backend's exact request schema.
3. A verified account with mustChangePassword=true may access the password-change route, but must not mount the role dashboard until the change succeeds.
4. Send current/new password fields only; do not send a client user ID or role. Use the Bearer token from `useAuth()`.
5. Validate confirmation client-side, show backend errors and submit/success/loading states.
6. After change success, refresh the user through GET /api/auth/me, then navigate to the dashboard derived from the verified backend role.
7. Preserve existing LTSU design and auth route architecture. Build, verify, update/read both handoff documents and stop.

## Completed Phase I, Chunk 3 — role-based route protection

- Route-guard branch: `feat/auth-role-route-guards`, stacked on session-provider branch `feat/auth-session-provider`.
- Reusable `ProtectedRoute` consumes `useAuth()` and wraps the three role route trees in App: STUDENT `/dashboard/*`, TEACHER `/teacher/*`, ADMIN `/admin/*`.
- Landing `/` and login `/login` remain public.
- Session restoration displays a loading state; anonymous/expired sessions redirect to login; wrong-role navigation redirects to the verified user's role dashboard.
- If server verification is temporarily unavailable, protected dashboard components do not mount; a recovery state is shown with retry banner and sign-out control.
- Forced password-change UI is intentionally left for this next chunk.
- Route guard PR #5: https://github.com/armanpreet-singh/smart-student-portal/pull/5 (open; mergeable; stacked on PR #4). GitHub Actions run `43437899529` passed on head `13087a195042aa02a4fcd2994b3f7ee8ee1c5495`; `npm ci` and `npm run build` passed.

## Completed Phase I, Chunk 1 — backend-connected login

- PR #3 is merged into main at merge commit `84607ce7c81512b5529788964672b9b0ca4c92c9`; parent Teacher Attendance PR #2 was merged first at `76b7f1a4806c400811b8d6ba5bd955fb133be7a8`.
- Login calls backend-main `POST /api/auth/login` with exactly `{ username, password }`; the portal selector is not sent.
- Backend-returned role determines `/dashboard`, `/teacher` or `/admin`; token is stored at localStorage key `ltsu-access-token`.
- Login includes backend-aligned validation, timeout, error feedback and Remember username.
- No live account credentials were used. Build run `43433208070` passed.

## Completed Phase I, Chunk 2 — shared authentication session management

- Parent PR #4 contains the session provider and is open/unmerged at time of this handoff: https://github.com/armanpreet-singh/smart-student-portal/pull/4.
- AuthProvider restores existing token through backend-main GET /api/auth/me. The server-returned user is the only trusted role state; cached user snapshots are not authorization data.
- Invalid/expired sessions clear token/user and go to login. Temporary network/service failures clear in-memory user, preserve token for retry and show recovery controls.
- Login, Student/Teacher/Admin logout menus and Teacher Attendance use shared auth context.
- Build run `43436197757` and PR build `43436411634` passed on the provider code head; Cloudflare Pages passed.
## Audit and future work

Read the full screen-by-screen audit and integration gaps from `FRONTEND_DEVELOPMENT_HANDOFF.md`. Broad categories still mock-backed include timetable, assignments, results, resources, announcements, academic calendar, departments and dashboard analytics. Admin also needs a dedicated teacher-subject assignment UI; Student duty-proof UI is dependent on backend draft PR #1 being approved/merged/deployed. Most existing pages need API loading/error/empty states and correct data/permission mapping before they can be marked Ready.

After auth is complete, choose the next single highest-priority task from the updated handoff, verify current contracts first, and stop at the end of that chunk.
