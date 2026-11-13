# Continue LTSU Smart Portal — Frontend Development

You are continuing work on the existing frontend in https://github.com/armanpreet-singh/smart-student-portal. Do not recreate or redesign the project.

## First actions

1. Read the latest `FRONTEND_DEVELOPMENT_HANDOFF.md` and this prompt from the frontend repository before changing files.
2. Verify live branch heads, pull requests and the current file contents. Do not assume the commit hashes below remain the latest.
3. Current authentication branch: `feat/auth-login-api`, stacked on `ui/teacher-attendance-workflow`. Auth PR #3 is open and mergeable, not merged: https://github.com/armanpreet-singh/smart-student-portal/pull/3. Parent attendance PR #2 is open and unmerged: https://github.com/armanpreet-singh/smart-student-portal/pull/2. Retarget PR #3 to main after PR #2 merges.
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

## Exact next task — Phase I, Chunk 2

Implement the shared authentication session provider and session restoration:
1. Read `ltsu-access-token` on app startup and call GET /api/auth/me with Bearer authorization.
2. Keep the current backend user in shared auth context; never trust stale cached role data.
3. Add loading, invalid/expired/inactive account and network handling.
4. Implement logout to clear token and user data and return to login.
5. Refactor Teacher Attendance to consume the shared token/session interface or one shared token utility.
6. Leave route guards and forced password-change UI for subsequent Phase I chunks.
7. Preserve the existing design, run the build, update both handoff documents, read them back and stop.

## Completed Phase I, Chunk 1 — backend-connected login

- Branch: `feat/auth-login-api`, stacked on `ui/teacher-attendance-workflow`; pull request #3 is open and mergeable: https://github.com/armanpreet-singh/smart-student-portal/pull/3.
- Login calls backend-main POST /api/auth/login with exactly `{ username, password }`. The portal selector is not sent.
- Backend-returned roles route to /dashboard, /teacher and /admin; a UI preference mismatch does not override the account role.
- Bearer token stored at localStorage key `ltsu-access-token` for Teacher Attendance compatibility; safe user snapshot stored at `ltsu-auth-user`.
- Includes backend-aligned username and password validation, submit state, timeout, 401/429/5xx/network/CORS feedback, and Remember username.
- VITE_API_BASE_URL is configurable; the documented Render URL is the default. .env.example documents local port 5000 and production override.
- Ensure backend Render CORS_ORIGIN includes the deployed frontend origin. Runtime CORS configuration was not inspected or changed.
- No real account credentials were used. GitHub Actions build run 43433208070 passed on branch head c07aa2a2cfd27715b738ab920bf6a0d2b6f9ad04. There are no frontend lint/unit-test scripts.
- No backend, database, Render environment or deployment changes were made.

## Audit and future work

Read the full screen-by-screen audit and integration gaps from `FRONTEND_DEVELOPMENT_HANDOFF.md`. Broad categories still mock-backed include timetable, assignments, results, resources, announcements, academic calendar, departments and dashboard analytics. Admin also needs a dedicated teacher-subject assignment UI; Student duty-proof UI is dependent on backend draft PR #1 being approved/merged/deployed. Most existing pages need API loading/error/empty states and correct data/permission mapping before they can be marked Ready.

After auth is complete, choose the next single highest-priority task from the updated handoff, verify current contracts first, and stop at the end of that chunk.
