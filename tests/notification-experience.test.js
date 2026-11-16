import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../src/${path}`, import.meta.url), "utf8");
}

test("shared notification centre exposes all and unread views for every authenticated role", async () => {
  const component = await source("features/shared/notifications/NotificationBell.jsx");
  const api = await source("features/shared/notifications/notificationsApi.js");

  assert.match(component, /role="tablist" aria-label="Filter notifications"/);
  assert.match(component, /setActiveFilter\("all"\)/);
  assert.match(component, /setActiveFilter\("unread"\)/);
  assert.match(component, /filteredNotifications/);
  assert.match(component, /Mark all read/);
  assert.match(api, /ADMIN: "\/api\/admin\/notifications"/);
  assert.match(api, /TEACHER: "\/api\/teacher\/notifications"/);
  assert.match(api, /STUDENT: "\/api\/student\/notifications"/);
});

test("unread attendance and deadline notices create a persistent review banner", async () => {
  const component = await source("features/shared/notifications/NotificationBell.jsx");
  const css = await source("features/shared/notifications/notifications.css");

  assert.match(component, /ATTENDANCE_LOW:[\s\S]*rank: 0/);
  assert.match(component, /ASSIGNMENT_DEADLINE:[\s\S]*rank: 1/);
  assert.match(component, /priorityNotification/);
  assert.match(component, /aria-live=\{priority\.tone === "danger" \? "assertive" : "polite"\}/);
  assert.match(component, /Dismiss this banner; keep it in your notification centre/);
  assert.match(component, /onClick=\{\(\) => void openNotification\(priorityNotification\)\}/);
  assert.match(css, /\.d-notification-priority-banner/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("consequential teacher resource and announcement actions use the accessible in-app confirmation dialog", async () => {
  const dialog = await source("components/ui/ConfirmDialog.jsx");
  const resources = await source("features/teacher/pages/TeacherResources.jsx");
  const announcements = await source("features/shared/announcements/AnnouncementsManager.jsx");

  assert.match(dialog, /role="alertdialog"/);
  assert.match(dialog, /aria-modal="true"/);
  assert.match(dialog, /event\.key === "Escape"/);
  assert.match(resources, /<ConfirmDialog/);
  assert.match(announcements, /<ConfirmDialog/);
  assert.match(announcements, /Publish this announcement\?/);
  assert.doesNotMatch(resources + announcements, /window\.confirm/);
});
