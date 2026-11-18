import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { fetchAdminAuditLogs } from "../src/features/admin/api/adminAuditApi.js";

const API_BASE = "https://ltsu-smart-portal-api-0i8h.onrender.com";

const log = {
  id: "audit-1",
  actorId: "admin-1",
  actorName: "Admin One",
  actorUsername: "admin.one",
  action: "USER_RETIRED",
  entityType: "USER",
  entityId: "student-1",
  entityLabel: "Student One (@student.one)",
  details: { role: "STUDENT" },
  ipAddress: "203.0.113.10",
  userAgent: "Audit test browser",
  createdAt: "2026-11-18T10:00:00.000Z"
};

let originalFetch;
let originalWindow;
let calls;

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  };
}

beforeEach(() => {
  originalFetch = globalThis.fetch;
  originalWindow = globalThis.window;
  calls = [];
  globalThis.window = {
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis)
  };
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
});

describe("Admin audit log API", () => {
  it("sends authenticated search and date/action filters and validates the response", async () => {
    globalThis.fetch = async (url, options) => {
      calls.push({ url: String(url), options });
      return jsonResponse(200, {
        status: "ok",
        data: {
          logs: [log],
          pagination: { page: 1, pageSize: 25, total: 1, totalPages: 1 }
        }
      });
    };

    const result = await fetchAdminAuditLogs("admin-token", {
      page: 1,
      pageSize: 25,
      search: "Admin One",
      action: "USER_RETIRED",
      entityType: "USER",
      fromDate: "2026-11-01",
      toDate: "2026-11-18"
    });

    assert.equal(
      calls[0].url,
      `${API_BASE}/api/admin/audit-logs?page=1&pageSize=25&search=Admin+One&action=USER_RETIRED&entityType=USER&fromDate=2026-11-01&toDate=2026-11-18`
    );
    assert.equal(calls[0].options.method, "GET");
    assert.equal(calls[0].options.headers.Authorization, "Bearer admin-token");
    assert.deepEqual(result.logs, [log]);
    assert.equal(result.pagination.total, 1);
  });

  it("rejects a missing token without issuing a request", async () => {
    globalThis.fetch = async () => {
      throw new Error("Fetch must not run for a missing token.");
    };
    await assert.rejects(
      fetchAdminAuditLogs(""),
      (error) => error.status === 401 && /session is unavailable/i.test(error.message)
    );
  });

  it("maps expired sessions and permission failures", async () => {
    globalThis.fetch = async () => jsonResponse(401, { status: "error" });
    await assert.rejects(
      fetchAdminAuditLogs("expired"),
      (error) => error.status === 401 && /session is no longer valid/i.test(error.message)
    );

    globalThis.fetch = async () => jsonResponse(403, { status: "error" });
    await assert.rejects(
      fetchAdminAuditLogs("wrong-role"),
      (error) => error.status === 403 && /only an administrator/i.test(error.message)
    );
  });

  it("rejects malformed audit log payloads", async () => {
    globalThis.fetch = async () => jsonResponse(200, {
      status: "ok",
      data: {
        logs: [{ ...log, actorId: 123 }],
        pagination: { page: 1, pageSize: 25, total: 1, totalPages: 1 }
      }
    });

    await assert.rejects(
      fetchAdminAuditLogs("admin-token"),
      (error) => error.status === 502 && /unexpected response/i.test(error.message)
    );
  });
});
