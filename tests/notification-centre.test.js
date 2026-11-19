import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../src/${path}`, import.meta.url), "utf8");
}

test("Student and Teacher routes expose their own notification centre", async () => {
  const [studentRoutes, teacherRoutes] = await Promise.all([
    source("features/dashboard/routes/DashboardRoutes.jsx"),
    source("features/teacher/routes/TeacherRoutes.jsx")
  ]);
  assert.match(studentRoutes, /path="notifications"[\s\S]*role="STUDENT"/);
  assert.match(teacherRoutes, /path="notifications"[\s\S]*role="TEACHER"/);
});

test("Student and Teacher sidebars link to their notification centre", async () => {
  const [studentSidebar, teacherSidebar] = await Promise.all([
    source("features/dashboard/components/Sidebar/Sidebar.jsx"),
    source("features/teacher/components/Sidebar/TeacherSidebar.jsx")
  ]);
  assert.match(studentSidebar, /\/dashboard\/notifications/);
  assert.match(teacherSidebar, /\/teacher\/notifications/);
  assert.match(studentSidebar, /Notification Centre/);
  assert.match(teacherSidebar, /Notification Centre/);
});

test("dedicated notification centre provides inbox filters, preferences and saved reminders", async () => {
  const page = await source("features/shared/notifications/NotificationCenterPage.jsx");
  const css = await source("features/shared/notifications/notification-centre.css");
  assert.match(page, /Reminder preferences/);
  assert.match(page, /Save preferences/);
  assert.match(page, /markAllNotificationsRead/);
  assert.match(page, /FILTERS/);
  assert.match(page, /fetchNotificationPreferences/);
  assert.match(page, /updateNotificationPreferences/);
  assert.match(page, /Email and browser push delivery are not enabled/);
  assert.match(css, /\.d-notification-centre-grid/);
  assert.match(css, /@media\(max-width:980px\)/);
});

test("bell preview includes a role-aware link to the full notification centre", async () => {
  const component = await source("features/shared/notifications/NotificationBell.jsx");
  assert.match(component, /Open Notification Centre/);
  assert.match(component, /role === "TEACHER" \? "\/teacher\/notifications" : "\/dashboard\/notifications"/);
});
