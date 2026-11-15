import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  getStudentDutyProofDownloadUrl,
  submitStudentDutyProof,
} from "../src/features/dashboard/api/studentAttendanceApi.js";

const API_BASE = "https://ltsu-smart-portal-api-0i8h.onrender.com";

let originalFetch;
let originalWindow;
let calls;
let nextResponse;

function response(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

function success(data) {
  nextResponse = response(200, { status: "ok", data });
}

function makeFile(type = "application/pdf", size = 1024, name = "duty-note.pdf") {
  const file = new Blob([new Uint8Array(size)], { type });
  Object.defineProperty(file, "name", { value: name });
  return file;
}

beforeEach(() => {
  originalFetch = globalThis.fetch;
  originalWindow = globalThis.window;
  calls = [];
  nextResponse = null;
  globalThis.window = {
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
  };
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (!nextResponse) throw new Error("No duty-proof response configured.");
    return nextResponse;
  };
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
});

describe("Student duty-proof API contracts", () => {
  it("posts authenticated multipart proof without setting Content-Type manually", async () => {
    success({
      attendance: {
        attendanceId: "attendance-1",
        status: "PRESENT",
        date: "2026-11-14",
        dutyProof: {
          fileName: "duty-note.pdf",
          format: "pdf",
          bytes: 1024,
          submittedAt: "2026-11-15T10:15:00.000Z",
        },
      },
    });

    const file = new Blob([new Uint8Array(1024)], { type: "application/pdf" });
    Object.defineProperty(file, "name", { value: "duty-note.pdf" });
    const result = await submitStudentDutyProof("student-token", "attendance-1", file);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, `${API_BASE}/api/student/attendance/attendance-1/duty-proof`);
    assert.equal(calls[0].options.method, "POST");
    assert.equal(calls[0].options.headers.Authorization, "Bearer student-token");
    assert.equal(calls[0].options.headers.Accept, "application/json");
    assert.equal(Object.hasOwn(calls[0].options.headers, "Content-Type"), false);
    assert.ok(calls[0].options.body instanceof FormData);
    assert.equal(calls[0].options.body.get("proof").type, "application/pdf");
    assert.equal(calls[0].options.body.get("proof").name, "duty-note.pdf");
    assert.equal(result.status, "PRESENT");
    assert.equal(result.dutyProof.fileName, "duty-note.pdf");
  });

  it("rejects files larger than 5 MB and unsupported MIME types before a request", async () => {
    await assert.rejects(
      submitStudentDutyProof("student-token", "attendance-1", makeFile("application/pdf", 5 * 1024 * 1024 + 1)),
      (error) => error.status === 413 && /5 MB or smaller/.test(error.message),
    );
    await assert.rejects(
      submitStudentDutyProof("student-token", "attendance-1", makeFile("text/plain")),
      (error) => error.status === 415 && /PDF, JPEG or PNG/.test(error.message),
    );
    assert.equal(calls.length, 0);
  });

  it("rejects a missing session or file without making a request", async () => {
    await assert.rejects(
      submitStudentDutyProof("", "attendance-1", makeFile()),
      (error) => error.status === 401,
    );
    await assert.rejects(
      submitStudentDutyProof("student-token", "attendance-1", null),
      (error) => error.status === 400,
    );
    assert.equal(calls.length, 0);
  });

  it("explains the backend 503 when Cloudinary proof storage is not configured", async () => {
    nextResponse = response(503, { status: "error", message: "Duty proof storage is not configured." });
    await assert.rejects(
      submitStudentDutyProof("student-token", "attendance-1", makeFile()),
      (error) =>
        error.status === 503 &&
        /storage is not configured yet/i.test(error.message) &&
        /has not been changed/i.test(error.message),
    );
  });

  it("requests an authenticated signed-download URL and validates HTTPS", async () => {
    success({
      dutyProof: {
        attendanceId: "attendance-1",
        fileName: "duty-note.pdf",
        url: "https://res.cloudinary.com/example/private/duty-note.pdf?signature=abc",
        expiresAt: "2026-11-15T10:20:00.000Z",
      },
    });

    const result = await getStudentDutyProofDownloadUrl("student-token", "attendance-1");
    assert.equal(calls[0].url, `${API_BASE}/api/student/attendance/attendance-1/duty-proof`);
    assert.equal(calls[0].options.method, "GET");
    assert.equal(calls[0].options.headers.Authorization, "Bearer student-token");
    assert.equal(result.fileName, "duty-note.pdf");
  });

  it("rejects an unsafe signed URL", async () => {
    success({
      dutyProof: {
        attendanceId: "attendance-1",
        fileName: "duty-note.pdf",
        url: "javascript:alert(1)",
        expiresAt: "2026-11-15T10:20:00.000Z",
      },
    });
    await assert.rejects(
      getStudentDutyProofDownloadUrl("student-token", "attendance-1"),
      (error) => error.status === 502 && /invalid download link/i.test(error.message),
    );
  });

  it("keeps the Student record scope denial as a not-found response", async () => {
    nextResponse = response(404, { status: "error", message: "Duty proof is unavailable." });
    await assert.rejects(
      getStudentDutyProofDownloadUrl("student-token", "another-student-record"),
      (error) => error.status === 404 && /unavailable/i.test(error.message),
    );
  });
});
