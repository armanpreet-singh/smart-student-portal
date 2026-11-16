import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../src/${path}`, import.meta.url), "utf8");
}

test("branded toasts use one visibility animation owner", async () => {
  const component = await source("components/ui/Toast.jsx");
  const helpers = await source("components/ui/toastUtils.jsx");

  assert.doesNotMatch(component, /framer-motion|motion\.div/);
  assert.match(component, /toast\.dismiss\(toastId\)/);
  assert.match(helpers, /toast\.custom/);
  assert.match(helpers, /duration,/);
  assert.match(helpers, /position: "top-right"/);
});

test("toast timeout and progress bar share the same configured duration", async () => {
  const component = await source("components/ui/Toast.jsx");
  const helpers = await source("components/ui/toastUtils.jsx");
  const css = await source("components/ui/Toast.css");

  assert.match(helpers, /const DEFAULT_DURATION = 4200/);
  assert.match(component, /--toast-duration/);
  assert.match(css, /animation: toastProgress var\(--toast-duration, 4000ms\) linear forwards/);
  assert.match(css, /animation-play-state: paused/);
});

test("toast styling supports dark theme and reduced-motion preferences", async () => {
  const css = await source("components/ui/Toast.css");

  assert.match(css, /\[data-theme="dark"\] \.ltsu-toast/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.toast-progress-fill \{ animation: none/);
});

for (const path of [
  "features/shared/announcements/AnnouncementsManager.jsx",
  "features/teacher/pages/TeacherResources.jsx",
  "features/teacher/pages/TeacherAttendance.jsx",
  "features/teacher/pages/TeacherAssignments.jsx"
]) {
  test(`${path} uses the shared branded toast feedback`, async () => {
    const component = await source(path);

    assert.match(component, /showSuccessMessage|showErrorMessage/);
    assert.doesNotMatch(component, /toast\.(success|error)\(/);
  });
}
