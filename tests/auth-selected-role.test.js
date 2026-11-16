import test from "node:test";
import assert from "node:assert/strict";

import { loginWithUsername } from "../src/features/auth/api/authApi.js";

function withMockedBrowserFetch(fetchImplementation, run) {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  globalThis.window = {
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
  };
  globalThis.fetch = fetchImplementation;

  return Promise.resolve()
    .then(run)
    .finally(() => {
      globalThis.fetch = originalFetch;
      if (originalWindow === undefined) {
        delete globalThis.window;
      } else {
        globalThis.window = originalWindow;
      }
    });
}

function loginResponse(role) {
  return new Response(JSON.stringify({
    status: "ok",
    data: {
      accessToken: "test-access-token",
      tokenType: "Bearer",
      user: { id: "user-1", role, mustChangePassword: false },
    },
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

test("login submits the selected portal role and accepts a matching account", async () => {
  let submittedBody;

  const result = await withMockedBrowserFetch(async (_url, options) => {
    submittedBody = JSON.parse(options.body);
    return loginResponse("STUDENT");
  }, () => loginWithUsername({
    username: " student.one ",
    password: "student-password",
    requestedRole: "STUDENT",
  }));

  assert.deepEqual(submittedBody, {
    username: "student.one",
    password: "student-password",
    requestedRole: "STUDENT",
  });
  assert.equal(result.user.role, "STUDENT");
});

test("login rejects a successful response whose role differs from the selected portal", async () => {
  await assert.rejects(
    withMockedBrowserFetch(
      async () => loginResponse("STUDENT"),
      () => loginWithUsername({
        username: "student.one",
        password: "student-password",
        requestedRole: "ADMIN",
      }),
    ),
    (error) => (
      error.status === 403 &&
      error.message === "These credentials do not belong to the selected portal. Choose the correct portal and try again."
    ),
  );
});

test("login rejects an invalid portal selection before contacting the API", async () => {
  let requestCount = 0;

  await withMockedBrowserFetch(async () => {
    requestCount += 1;
    return loginResponse("STUDENT");
  }, async () => {
    await assert.rejects(
      loginWithUsername({
        username: "student.one",
        password: "student-password",
        requestedRole: "SUPER_ADMIN",
      }),
      (error) => error.status === 400,
    );
  });

  assert.equal(requestCount, 0);
});
