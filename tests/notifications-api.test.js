import test from "node:test";
import assert from "node:assert/strict";

import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "../src/features/shared/notifications/notificationsApi.js";

const API_BASE = "https://ltsu-smart-portal-api-0i8h.onrender.com";
const notification = {
  id: "notification-1",
  type: "ANNOUNCEMENT",
  title: "New announcement",
  message: "The semester notice is available.",
  href: "/dashboard/announcements",
  readAt: null,
  createdAt: "2026-11-16T12:00:00.000Z"
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

function response(data, status = 200, message = "") {
  return new Response(JSON.stringify({
    status: status < 400 ? "ok" : "error",
    data,
    message
  }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

for (const [role, apiPath] of [
  ["ADMIN", "/api/admin/notifications"],
  ["TEACHER", "/api/teacher/notifications"],
  ["STUDENT", "/api/student/notifications"]
]) {
  test(`${role} notification feed uses its own authenticated endpoint`, async () => {
    const result = await withMockedFetch(async (url, options) => {
      assert.equal(url, `${API_BASE}${apiPath}?limit=40`);
      assert.equal(options.headers.Authorization, "Bearer session-token");
      assert.equal(options.headers.Accept, "application/json");
      return response({ notifications: [notification], unreadCount: 1 });
    }, () => fetchNotifications("session-token", role));

    assert.equal(result.unreadCount, 1);
    assert.equal(result.notifications[0].id, "notification-1");
  });
}

test("notification feed rejects malformed notification data and unread counts", async () => {
  await withMockedFetch(
    async () => response({ notifications: [{ ...notification, createdAt: "invalid" }], unreadCount: 1 }),
    async () => {
      await assert.rejects(
        fetchNotifications("session-token", "STUDENT"),
        (error) => error.status === 502
      );
    }
  );
  await withMockedFetch(
    async () => response({ notifications: [notification], unreadCount: -1 }),
    async () => {
      await assert.rejects(
        fetchNotifications("session-token", "STUDENT"),
        (error) => error.status === 502
      );
    }
  );
});

test("mark one notification read uses an account-scoped PATCH", async () => {
  await withMockedFetch(async (url, options) => {
    assert.equal(url, `${API_BASE}/api/teacher/notifications/notification%2F1/read`);
    assert.equal(options.method, "PATCH");
    assert.equal(options.headers.Authorization, "Bearer teacher-token");
    return response({ id: "notification/1", read: true });
  }, () => markNotificationRead("teacher-token", "TEACHER", "notification/1"));
});

test("mark one notification read requires server confirmation", async () => {
  await withMockedFetch(
    async () => response({ id: "other", read: true }),
    async () => {
      await assert.rejects(
        markNotificationRead("teacher-token", "TEACHER", "notification-1"),
        (error) => error.status === 502
      );
    }
  );
});

test("mark all notifications read uses the role-scoped read-all endpoint", async () => {
  const result = await withMockedFetch(async (url, options) => {
    assert.equal(url, `${API_BASE}/api/admin/notifications/read-all`);
    assert.equal(options.method, "POST");
    assert.equal(options.headers.Authorization, "Bearer admin-token");
    return response({ updatedCount: 4 });
  }, () => markAllNotificationsRead("admin-token", "ADMIN"));

  assert.equal(result.updatedCount, 4);
});

test("notifications reject missing sessions and unsupported roles before network calls", async () => {
  let calls = 0;
  await withMockedFetch(async () => {
    calls += 1;
    return response({ notifications: [], unreadCount: 0 });
  }, async () => {
    await assert.rejects(fetchNotifications("", "STUDENT"), (error) => error.status === 401);
    await assert.rejects(fetchNotifications("token", "UNKNOWN"), (error) => error.status === 403);
    await assert.rejects(markAllNotificationsRead("token", "UNKNOWN"), (error) => error.status === 403);
  });
  assert.equal(calls, 0);
});
