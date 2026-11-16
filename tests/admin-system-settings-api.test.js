import test from "node:test";
import assert from "node:assert/strict";

import {
  fetchAdminSystemSettings,
  isAdminSystemSettings,
  updateAdminSystemSettings
} from "../src/features/admin/api/adminSystemSettingsApi.js";

const API_BASE = "https://ltsu-smart-portal-api-0i8h.onrender.com";
const settings = {
  id: "global",
  universityName: "Lovely Professional University",
  universityShortName: "LPU",
  supportEmail: "support@example.edu",
  supportPhone: "+91 98765 43210",
  websiteUrl: "https://example.edu",
  currentAcademicYear: "2026-2027",
  attendanceThresholdPercent: 80,
  updatedAt: "2026-11-16T12:00:00.000Z",
  updatedBy: { id: "admin-1", fullName: "Admin One", username: "admin.one" }
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

function jsonResponse(data, status = 200, message = "") {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => ({ status: status < 400 ? "ok" : "error", data, message })
  };
}

test("Admin system settings validator accepts the persisted settings contract", () => {
  assert.equal(isAdminSystemSettings(settings), true);
  assert.equal(isAdminSystemSettings({
    ...settings,
    attendanceThresholdPercent: 101
  }), false);
  assert.equal(isAdminSystemSettings({
    ...settings,
    updatedBy: { id: "admin-1" }
  }), false);
});

test("Admin system settings GET uses the protected settings endpoint", async () => {
  const result = await withMockedFetch(async (url, options) => {
    assert.equal(url, `${API_BASE}/api/admin/system-settings`);
    assert.equal(options.method, undefined);
    assert.equal(options.headers.Authorization, "Bearer admin-token");
    assert.equal(options.headers.Accept, "application/json");
    return jsonResponse({ settings });
  }, () => fetchAdminSystemSettings("admin-token"));

  assert.deepEqual(result, settings);
});

test("Admin system settings PUT persists editable values with the Admin session", async () => {
  const input = {
    universityName: settings.universityName,
    universityShortName: settings.universityShortName,
    supportEmail: settings.supportEmail,
    supportPhone: settings.supportPhone,
    websiteUrl: settings.websiteUrl,
    currentAcademicYear: settings.currentAcademicYear,
    attendanceThresholdPercent: settings.attendanceThresholdPercent
  };

  const result = await withMockedFetch(async (url, options) => {
    assert.equal(url, `${API_BASE}/api/admin/system-settings`);
    assert.equal(options.method, "PUT");
    assert.equal(options.headers.Authorization, "Bearer admin-token");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(options.body), input);
    return jsonResponse({ settings });
  }, () => updateAdminSystemSettings("admin-token", input));

  assert.equal(result.attendanceThresholdPercent, 80);
});

test("Admin system settings API maps expired-session, forbidden and server errors", async () => {
  for (const [status, expected] of [
    [401, /session is no longer valid/i],
    [403, /only an administrator/i],
    [503, /temporarily unavailable/i]
  ]) {
    await withMockedFetch(
      async () => jsonResponse(null, status, "private server detail"),
      async () => {
        await assert.rejects(
          fetchAdminSystemSettings("admin-token"),
          (error) => error.status === status && expected.test(error.message)
        );
      }
    );
  }
});

test("Admin system settings API rejects missing credentials and malformed responses", async () => {
  let calls = 0;
  await withMockedFetch(async () => {
    calls += 1;
    return jsonResponse({ settings });
  }, async () => {
    await assert.rejects(fetchAdminSystemSettings(""), (error) => error.status === 401);
  });
  assert.equal(calls, 0);

  await withMockedFetch(
    async () => jsonResponse({ settings: { ...settings, id: "not-global" } }),
    async () => {
      await assert.rejects(
        fetchAdminSystemSettings("admin-token"),
        (error) => error.status === 502
      );
    }
  );
});
