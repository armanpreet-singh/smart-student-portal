import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  createAdminStudent,
  getRollNumberInputError,
} from "../src/features/admin/api/adminStudentProvisioningApi.js";
import { fetchCurrentUser } from "../src/features/auth/api/authApi.js";
import {
  buildOfficialRollNumberClipboardText,
  getOfficialRollNumbersForStatus,
  getStudentsMissingRollNumberForStatus,
} from "../src/features/teacher/utils/attendanceClipboard.js";

const API_BASE = "https://ltsu-smart-portal-api-0i8h.onrender.com";

const validStudentInput = (overrides = {}) => ({
  fullName: "Student One",
  username: "student.one",
  email: "",
  classId: "",
  rollNumber: "  000CSE/0123  ",
  temporaryPassword: "TemporaryPass123",
  confirmPassword: "TemporaryPass123",
  ...overrides,
});

const createdStudent = (overrides = {}) => ({
  id: "student-1",
  fullName: "Student One",
  username: "student.one",
  email: null,
  role: "STUDENT",
  classId: null,
  rollNumber: "000CSE/0123",
  mustChangePassword: true,
  isActive: true,
  createdAt: "2026-11-15T09:00:00.000Z",
  updatedAt: "2026-11-15T09:00:00.000Z",
  class: null,
  ...overrides,
});

let originalFetch;
let originalWindow;
let calls;

function response(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

beforeEach(() => {
  originalFetch = globalThis.fetch;
  originalWindow = globalThis.window;
  calls = [];
  globalThis.window = {
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
  };
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    return response(200, {
      status: "ok",
      data: { user: createdStudent() },
    });
  };
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalWindow === undefined) {
    delete globalThis.window;
  } else {
    globalThis.window = originalWindow;
  }
});

describe("Official Student roll-number integration", () => {
  it("allows an empty optional roll number and validates the backend character contract", () => {
    assert.equal(getRollNumberInputError(""), "");
    assert.equal(getRollNumberInputError("   "), "");
    assert.equal(getRollNumberInputError("000CSE/0123"), "");
    assert.equal(getRollNumberInputError("A.B_C-12/3"), "");
    assert.match(getRollNumberInputError(" /ABC"), /beginning with a letter or number/i);
    assert.match(getRollNumberInputError("ABC #1"), /1–40 characters/i);
    assert.match(getRollNumberInputError("A".repeat(41)), /1–40 characters/i);
  });

  it("sends the trimmed official roll number without losing leading zeroes", async () => {
    const result = await createAdminStudent(
      "admin-token",
      validStudentInput(),
    );

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, `${API_BASE}/api/admin/users`);
    assert.equal(calls[0].options.method, "POST");
    assert.equal(calls[0].options.headers.Authorization, "Bearer admin-token");
    const body = JSON.parse(calls[0].options.body);
    assert.equal(body.role, "STUDENT");
    assert.equal(body.rollNumber, "000CSE/0123");
    assert.equal(result.rollNumber, "000CSE/0123");
  });

  it("omits a blank optional roll number from Student provisioning requests", async () => {
    await createAdminStudent(
      "admin-token",
      validStudentInput({ rollNumber: "   " }),
    );

    const body = JSON.parse(calls[0].options.body);
    assert.equal(Object.hasOwn(body, "rollNumber"), false);
  });

  it("rejects invalid roll numbers before creating an account", async () => {
    await assert.rejects(
      createAdminStudent(
        "admin-token",
        validStudentInput({ rollNumber: "INVALID #NUMBER" }),
      ),
      (error) =>
        error.status === 400 &&
        /highlighted fields/i.test(error.message) &&
        /rollNumber/.test(Object.keys(error.fieldErrors || {}).join(",")),
    );
    assert.equal(calls.length, 0);
  });

  it("requires a nullable string rollNumber in the Student create response", async () => {
    globalThis.fetch = async () =>
      response(200, {
        status: "ok",
        data: { user: createdStudent({ rollNumber: 123 }) },
      });

    await assert.rejects(
      createAdminStudent("admin-token", validStudentInput()),
      (error) => error.status === 502 && /unexpected account creation response/i.test(error.message),
    );
  });

  it("preserves a leading-zero roll number from the authenticated profile response", async () => {
    globalThis.fetch = async (url, options = {}) => {
      calls.push({ url: String(url), options });
      return response(200, {
        status: "ok",
        data: {
          user: {
            id: "student-1",
            role: "STUDENT",
            rollNumber: "000CSE/0123",
          },
        },
      });
    };

    const user = await fetchCurrentUser("student-token");
    assert.equal(user.rollNumber, "000CSE/0123");
    assert.equal(calls.length, 1);
  });
});

describe("Teacher attendance clipboard selectors", () => {
  const roster = [
    { id: "one", rollNumber: "0001" },
    { id: "two", rollNumber: "  0002 " },
    { id: "three", rollNumber: null },
    { id: "four", rollNumber: "" },
    { id: "five", username: "not-a-roll-number" },
    { id: "six", rollNumber: "0003" },
  ];
  const records = {
    one: "PRESENT",
    two: "ABSENT",
    three: "ABSENT",
    four: "PRESENT",
    five: "LATE",
    six: "ON_DUTY_REVIEW",
  };

  it("copies only explicit PRESENT, ABSENT or ON_DUTY_REVIEW official roll numbers", () => {
    assert.deepEqual(
      getOfficialRollNumbersForStatus(roster, records, "PRESENT"),
      ["0001"],
    );
    assert.deepEqual(
      getOfficialRollNumbersForStatus(roster, records, "ABSENT"),
      ["0002"],
    );
    assert.deepEqual(
      getOfficialRollNumbersForStatus(roster, records, "LATE"),
      [],
    );
    assert.deepEqual(
      getOfficialRollNumbersForStatus(roster, records, "ON_DUTY_REVIEW"),
      ["0003"],
    );
  });

  it("builds a plain roll-number-only clipboard payload", () => {
    assert.equal(
      buildOfficialRollNumberClipboardText(roster, records, "PRESENT"),
      "0001",
    );
    assert.equal(
      buildOfficialRollNumberClipboardText(roster, records, "ABSENT"),
      "0002",
    );
    assert.equal(
      buildOfficialRollNumberClipboardText(roster, records, "ON_DUTY_REVIEW"),
      "0003",
    );
  });

  it("counts students omitted because they have no official roll number", () => {
    assert.equal(
      getStudentsMissingRollNumberForStatus(roster, records, "ABSENT"),
      1,
    );
    assert.equal(
      getStudentsMissingRollNumberForStatus(roster, records, "PRESENT"),
      1,
    );
  });
});
