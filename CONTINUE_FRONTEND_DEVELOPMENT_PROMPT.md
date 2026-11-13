# Continue LTSU Smart Portal — Frontend Development

You are continuing work on the existing frontend in https://github.com/armanpreet-singh/smart-student-portal. Do not recreate or redesign the project.

## First actions

1. Read the latest `FRONTEND_DEVELOPMENT_HANDOFF.md` and this prompt from the frontend repository before changing files.
2. Verify live branch heads, pull requests and the current file contents. Do not assume the commit hashes below remain the latest.
3. Current branch: `feat/auth-session-provider`, based on main. Current PR #4 is open and mergeable, not merged: https://github.com/armanpreet-singh/smart-student-portal/pull/4. Previous frontend PR #2 and PR #3 have both been merged to main in dependency order.
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

## Exact next task — Phase I, Chunk 3

Implement role-based route protection only:
1. Add reusable protected-route logic using `useAuth()`.
2. Keep `/` and `/login` public. Restrict `/dashboard/*` to STUDENT, `/teacher/*` to TEACHER and `/admin/*` to ADMIN.
3. Wait while `sessionStatus` is restoring; never trust cached roles.
4. Redirect anonymous/expired sessions to login. Fail closed when server verification is unavailable and keep the recovery notice visible rather than mounting protected dashboards.
5. Redirect a verified user who opens the wrong role route to their backend-role dashboard.
6. Leave forced password-change UI for Phase I, Chunk 4.
7. Preserve existing dashboards and route trees, build and verify, update/read both handoff documents and stop.

## Completed Phase I, Chunk 1 — backend-connected login

- PR #3 is merged into main at merge commit `84607ce7c81512b5529788964672b9b0ca4c92c9`; parent Teacher Attendance PR #2 was merged first at `76b7f1a4806c400811b8d6ba5bd955fb133be7a8`.
- Login calls backend-main `POST /api/auth/login` with exactly `{ username, password }`; the portal selector is not sent.
- The backend-returned role determines `/dashboard`, `/teacher` or `/admin`.
- Bearer token is stored at localStorage key `ltsu-access-token`; the safe user snapshot is stored as `ltsu-auth-user`.
- Includes backend-aligned validation, timeout, 401/429/5xx/network/CORS feedback and Remember username.
- API URL uses `VITE_API_BASE_URL` with the documented Render service as default.
- No real account credentials were used. Original login build run `43433208070` passed.
- No backend, database or Render environment changes were made.

## Completed Phase I, Chunk 2 — shared authentication session management

- PR #4 contains this chunk: https://github.com/armanpreet-singh/smart-student-portal/pull/4 (open; not merged).
- `AuthProvider` wraps App inside BrowserRouter. It exposes accessToken, backend-verified user, session status, session restoration/retry, establishSession and logout.
- On startup it verifies stored tokens with backend-main `GET /api/auth/me`. Cached user snapshots are not read to authorize a session.
- 401 invalid/expired sessions clear stored auth and return to login. Network/service errors clear the in-memory user, preserve the token for retry, and show a retry/sign-out notice.
- Login writes session state through the provider; Student, Teacher and Admin logout menus clear the shared session.
- Teacher Attendance consumes the provider's token and waits for verified authentication before fetching live subjects.
- GitHub Actions run `43436197757` and PR build run `43436411634` passed on code head `92be2959eb63161718d8b2669e889460a9677ffd`; Cloudflare Pages also passed.
- There are no frontend lint/unit-test scripts. No real account credentials or backend/database/Render changes were used.
## Audit and future work

Read the full screen-by-screen audit and integration gaps from `FRONTEND_DEVELOPMENT_HANDOFF.md`. Broad categories still mock-backed include timetable, assignments, results, resources, announcements, academic calendar, departments and dashboard analytics. Admin also needs a dedicated teacher-subject assignment UI; Student duty-proof UI is dependent on backend draft PR #1 being approved/merged/deployed. Most existing pages need API loading/error/empty states and correct data/permission mapping before they can be marked Ready.

After auth is complete, choose the next single highest-priority task from the updated handoff, verify current contracts first, and stop at the end of that chunk.
