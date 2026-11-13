# Continue LTSU Smart Portal — Frontend Development

You are continuing work on the existing frontend in https://github.com/armanpreet-singh/smart-student-portal. Do not recreate or redesign the project.

## First actions

1. Read the latest `FRONTEND_DEVELOPMENT_HANDOFF.md` and this prompt from the frontend repository before changing files.
2. Verify live branch heads, pull requests and the current file contents. Do not assume the commit hashes below remain the latest.
3. Current branch: `feat/auth-forced-password-change`, based on main. PR #6 is open and mergeable, not merged: https://github.com/armanpreet-singh/smart-student-portal/pull/6. Previous frontend PRs #2, #3, #4 and #5 have all been merged into main; PR #4 was merged before PR #5.
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

## Exact next task — Phase II, Chunk 1

Implement Student Attendance API integration only:
1. Inspect the current Student Attendance page and mock data.
2. Use backend-main GET `/api/student/attendance` with the shared Bearer token. Optional `fromDate` and `toDate` query values use YYYY-MM-DD; fromDate must be on or before toDate.
3. Map `period` and `subjects`; each subject includes the subject/class object, `summary`, and `records` with date, status, remarks and recordedAt. Current statuses: PRESENT, ABSENT, LATE, EXCUSED.
4. Preserve existing UI; add date filters and loading/error/empty/retry states, and derive totals/charts from real response data.
5. Keep mock data isolated in demo mode; do not silently switch to demo on a live API failure or invent endpoints.
6. Build, verify, update/read both handoff docs and stop. Do not merge/deploy unless requested.

## Completed Phase I, Chunk 4 — forced password-change workflow

- PR #6: https://github.com/armanpreet-singh/smart-student-portal/pull/6 (open; mergeable; not merged). Branch `feat/auth-forced-password-change`.
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

After auth is complete, choose the next single highest-priority task from the updated handoff, verify current contracts first, and stop at the end of that chunk.
