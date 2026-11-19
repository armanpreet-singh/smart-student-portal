import test from "node:test";
import assert from "node:assert/strict";

import {
  fetchNotificationPreferences,
  updateNotificationPreferences
} from "../src/features/shared/notifications/notificationsApi.js";

const API_BASE = "https://ltsu-smart-portal-api-0i8h.onrender.com";
const defaultPreferences = {
  assignmentDeadline24h: true,
  assignmentDeadline1h: true,
  lowAttendanceAlerts: true,
  announcements: true,
  assignmentUpdates: true,
  learningResourceUpdates: true,
  pendingReviewReminders: true,
  platformUpdates: true
};

function withMockedFetch(fetchImplementation, run) {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  globalThis.window = {
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout
  };
  globalThis.fetch = fetchImplementation;
  return Promise.resolve().then(run).finally(() => {
    globalThis.fetch = originalFetch;
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  });
}

function response(data, status = 200) {
  return new Response(JSON.stringify({
    status: status < 400 ? "ok" : "error",
    data
  }), { status, headers: { "Content-Type": "application/json" } });
}

for (const [role, path] of [
  ["STUDENT", "/api/student/notification-preferences"],
  ["TEACHER", "/api/teacher/notification-preferences"]
]) {
  test(`${role} can retrieve personal notification preferences`, async () => {
    const result = await withMockedFetch(async (url, options) => {
      assert.equal(url, `${API_BASE}${path}`);
      assert.equal(options.headers.Authorization, "Bearer session-token");
      return response({ preferences: defaultPreferences });
    }, () => fetchNotificationPreferences("session-token", role));
    assert.deepEqual(result, defaultPreferences);
  });
}

test("notification preferences are updated with a partial authenticated PATCH", async () => {
  const result = await withMockedFetch(async (url, options) => {
    assert.equal(url, `${API_BASE}/api/student/notification-preferences`);
    assert.equal(options.method, "PATCH");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(options.body), { assignmentDeadline24h: false, announcements: false });
    return response({
      preferences: { ...defaultPreferences, assignmentDeadline24h: false, announcements: false }
    });
  }, () => updateNotificationPreferences("session-token", "STUDENT", {
    assignmentDeadline24h: false,
    announcements: false
  }));
  assert.equal(result.assignmentDeadline24h, false);
  assert.equal(result.assignmentDeadline1h, true);
});

test("notification preference client rejects unsupported roles, empty updates and malformed data", async () => {
  await withMockedFetch(
    async () => response({ preferences: defaultPreferences }),
    async () => {
      await assert.rejects(fetchNotificationPreferences("token", "ADMIN"), (error) => error.status === 403);
      await assert.rejects(updateNotificationPreferences("token", "STUDENT", {}), (error) => error.status === 400);
    }
  );
  await withMockedFetch(
    async () => response({ preferences: { ...defaultPreferences, announcements: "yes" } }),
    async () => {
      await assert.rejects(fetchNotificationPreferences("token", "TEACHER"), (error) => error.status === 502);
    }
  );
});
