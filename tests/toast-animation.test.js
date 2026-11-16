import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../src/${path}`, import.meta.url), "utf8");
}

test("Sonner owns the toast stack and the single enter/exit animation", async () => {
  const app = await source("App.jsx");
  const component = await source("components/ui/Toast.jsx");
  const helpers = await source("components/ui/toastUtils.jsx");

  assert.match(app, /import \{ Toaster \} from "sonner"/);
  assert.match(app, /visibleToasts=\{4\}/);
  assert.match(app, /theme=\{theme\}/);
  assert.match(app, /swipeDirections=\{\["right", "left"\]\}/);
  assert.match(component, /import \{ toast \} from "sonner"/);
  assert.match(component, /toast\.dismiss\(toastId\)/);
  assert.match(helpers, /import \{ toast \} from "sonner"/);
  assert.match(helpers, /toast\.custom/);
  assert.match(helpers, /toastId=\{currentToastId\}/);
  assert.match(helpers, /duration,/);
  assert.match(helpers, /position: "top-right"/);
  assert.doesNotMatch(app + component + helpers, /react-hot-toast|framer-motion|motion\.div/);
});

test("toast timeout and progress bar share the same configured duration", async () => {
  const component = await source("components/ui/Toast.jsx");
  const helpers = await source("components/ui/toastUtils.jsx");
  const css = await source("components/ui/Toast.css");
  const app = await source("App.jsx");

  assert.match(helpers, /const DEFAULT_DURATION = 4200/);
  assert.match(app, /duration=\{4200\}/);
  assert.match(component, /--toast-duration/);
  assert.match(css, /animation: toastProgress var\(--toast-duration, 4200ms\) linear forwards/);
  assert.match(css, /animation-play-state: paused/);
});

test("toast styling supports dark theme, mobile layouts and reduced motion", async () => {
  const css = await source("components/ui/Toast.css");

  assert.match(css, /\[data-theme="dark"\] \.ltsu-toast/);
  assert.match(css, /max-width: calc\(100vw - 24px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /data-sonner-toast/);
  assert.match(css, /transition: none !important/);
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

test("the package manifest and lockfile both pin Sonner and remove React Hot Toast", async () => {
  const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const lock = JSON.parse(await readFile(new URL("../package-lock.json", import.meta.url), "utf8"));

  assert.equal(manifest.dependencies.sonner, "^2.0.8");
  assert.equal(lock.packages[""].dependencies.sonner, "^2.0.8");
  assert.equal(lock.packages["node_modules/sonner"].version, "2.0.8");
  assert.equal(manifest.dependencies["react-hot-toast"], undefined);
  assert.equal(lock.packages["node_modules/react-hot-toast"], undefined);
});


test("toast uses compact type-specific status icons instead of the university logo", async () => {
  const component = await source("components/ui/Toast.jsx");
  const css = await source("components/ui/Toast.css");
  const app = await source("App.jsx");

  assert.match(component, /CheckCircle2/);
  assert.match(component, /XCircle/);
  assert.match(component, /AlertTriangle/);
  assert.match(component, /className="toast-status-icon"/);
  assert.doesNotMatch(component, /ltsuLogo|toast-logo|<img/);
  assert.match(css, /width: min\(340px, calc\(100vw - 32px\)\)/);
  assert.match(css, /\.toast-status-icon\s*\{[^}]*width: 34px;[^}]*height: 34px;/s);
  assert.match(css, /\.toast-progress\s*\{[^}]*height: 2px;/s);
  assert.match(app, /width: "min\(340px, calc\(100vw - 32px\)\)"/);
  assert.doesNotMatch(css, /border-left:\s*4px/);
});
