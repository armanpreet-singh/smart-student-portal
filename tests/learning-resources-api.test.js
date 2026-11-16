import test from "node:test";
import assert from "node:assert/strict";

import {
  deleteTeacherLearningResource,
  fetchLearningResourceDownload,
  fetchLearningResources,
  formatResourceBytes,
  isLearningResource,
  uploadTeacherLearningResource
} from "../src/features/shared/resources/learningResourcesApi.js";

const API_BASE = "https://ltsu-smart-portal-api-0i8h.onrender.com";

const resource = {
  id: "resource-1",
  teacherId: "teacher-1",
  subjectId: "subject-1",
  title: "Week 1 notes",
  description: "Introduction to programming.",
  file: {
    fileName: "week-1.pdf",
    mimeType: "application/pdf",
    format: "pdf",
    bytes: 4096
  },
  createdAt: "2026-11-17T10:00:00.000Z",
  updatedAt: "2026-11-17T10:00:00.000Z",
  teacher: { id: "teacher-1", fullName: "Teacher One" },
  subject: {
    id: "subject-1",
    code: "CSE-101",
    name: "Programming",
    class: {
      id: "class-1",
      code: "CSE-1",
      name: "Computer Science",
      academicYear: "2026-2027"
    }
  }
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
  return new Response(JSON.stringify({
    status: status < 400 ? "ok" : "error",
    data,
    message
  }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

test("learning resource record validator accepts a stored resource with class context", () => {
  assert.equal(isLearningResource(resource), true);
  assert.equal(isLearningResource({
    ...resource,
    subject: { ...resource.subject, class: null }
  }), false);
});

test("Teacher resource list uses the authenticated Teacher endpoint", async () => {
  const result = await withMockedFetch(async (url, options) => {
    assert.equal(url, `${API_BASE}/api/teacher/resources`);
    assert.equal(options.method, undefined);
    assert.equal(options.headers.Authorization, "Bearer teacher-token");
    assert.equal(options.headers.Accept, "application/json");
    return jsonResponse({ resources: [resource] });
  }, () => fetchLearningResources("teacher-token", "teacher"));

  assert.equal(result.length, 1);
  assert.equal(result[0].title, "Week 1 notes");
});

test("Student resource list uses the Student read-only endpoint", async () => {
  await withMockedFetch(async (url, options) => {
    assert.equal(url, `${API_BASE}/api/student/resources`);
    assert.equal(options.method, undefined);
    assert.equal(options.headers.Authorization, "Bearer student-token");
    return jsonResponse({ resources: [resource] });
  }, () => fetchLearningResources("student-token", "student"));
});

test("resource list rejects malformed metadata rather than displaying unverified records", async () => {
  await withMockedFetch(
    async () => jsonResponse({ resources: [{ ...resource, file: null }] }),
    async () => {
      await assert.rejects(
        fetchLearningResources("student-token", "student"),
        (error) => error.status === 502 && /invalid resource list/i.test(error.message)
      );
    }
  );
});

test("Teacher upload sends title, description, assigned subject and file as multipart data", async () => {
  const file = new File(["%PDF-1.7"], "week-1.pdf", { type: "application/pdf" });
  let form;
  const result = await withMockedFetch(async (url, options) => {
    assert.equal(url, `${API_BASE}/api/teacher/resources`);
    assert.equal(options.method, "POST");
    assert.equal(options.headers.Authorization, "Bearer teacher-token");
    assert.equal(options.headers["Content-Type"], undefined);
    form = options.body;
    return jsonResponse({ resource });
  }, () => uploadTeacherLearningResource("teacher-token", {
    subjectId: "subject-1",
    title: "Week 1 notes",
    description: "Introduction to programming.",
    file
  }));

  assert.ok(form instanceof FormData);
  assert.equal(form.get("subjectId"), "subject-1");
  assert.equal(form.get("title"), "Week 1 notes");
  assert.equal(form.get("description"), "Introduction to programming.");
  assert.equal(form.get("file").name, "week-1.pdf");
  assert.equal(result.id, "resource-1");
});

test("Teacher upload requires a file before making a network request", async () => {
  let calls = 0;
  await withMockedFetch(async () => {
    calls += 1;
    return jsonResponse({ resource });
  }, async () => {
    await assert.rejects(
      uploadTeacherLearningResource("teacher-token", {
        subjectId: "subject-1", title: "Week 1 notes", file: null
      }),
      (error) => error.status === 400
    );
  });
  assert.equal(calls, 0);
});

test("resource download requests an authenticated, resource-scoped signed link", async () => {
  const download = {
    url: "https://files.example/signed",
    expiresAt: "2026-11-17T10:05:00.000Z",
    fileName: "week-1.pdf",
    mimeType: "application/pdf"
  };
  const result = await withMockedFetch(async (url, options) => {
    assert.equal(url, `${API_BASE}/api/student/resources/resource%2Fone/download`);
    assert.equal(options.headers.Authorization, "Bearer student-token");
    return jsonResponse({ download });
  }, () => fetchLearningResourceDownload("student-token", "student", "resource/one"));

  assert.equal(result.url, download.url);
  assert.equal(result.fileName, download.fileName);
});

test("resource download rejects an incomplete or expired link response", async () => {
  await withMockedFetch(
    async () => jsonResponse({ download: { url: "https://files.example/file" } }),
    async () => {
      await assert.rejects(
        fetchLearningResourceDownload("student-token", "student", "resource-1"),
        (error) => error.status === 502 && /invalid download link/i.test(error.message)
      );
    }
  );
});

test("Teacher deletion uses the authenticated resource-specific endpoint", async () => {
  await withMockedFetch(async (url, options) => {
    assert.equal(url, `${API_BASE}/api/teacher/resources/resource-1`);
    assert.equal(options.method, "DELETE");
    assert.equal(options.headers.Authorization, "Bearer teacher-token");
    return jsonResponse({ id: "resource-1", deleted: true });
  }, () => deleteTeacherLearningResource("teacher-token", "resource-1"));
});

test("Teacher deletion requires the API to confirm the resource was deleted", async () => {
  await withMockedFetch(
    async () => jsonResponse({ id: "resource-other", deleted: true }),
    async () => {
      await assert.rejects(
        deleteTeacherLearningResource("teacher-token", "resource-1"),
        (error) => error.status === 502
      );
    }
  );
});

test("resource API maps oversize, unsupported type, and session errors", async () => {
  for (const [status, message, expected] of [
    [413, "File too large.", /20 MB limit/i],
    [415, "Invalid file type.", /Invalid file type/i],
    [401, "Expired.", /session has expired/i]
  ]) {
    await withMockedFetch(
      async () => jsonResponse({}, status, message),
      async () => {
        await assert.rejects(
          fetchLearningResources("user-token", "student"),
          (error) => error.status === status && expected.test(error.message)
        );
      }
    );
  }
});

test("resource API rejects invalid role and missing session before making requests", async () => {
  let calls = 0;
  await withMockedFetch(async () => {
    calls += 1;
    return jsonResponse({ resources: [] });
  }, async () => {
    await assert.rejects(fetchLearningResources("token", "admin"), (error) => error.status === 400);
    await assert.rejects(fetchLearningResources("", "student"), (error) => error.status === 401);
  });
  assert.equal(calls, 0);
});

test("file sizes are formatted with stable byte, KB and MB units", () => {
  assert.equal(formatResourceBytes(512), "512 B");
  assert.equal(formatResourceBytes(2048), "2.0 KB");
  assert.equal(formatResourceBytes(1572864), "1.5 MB");
});
