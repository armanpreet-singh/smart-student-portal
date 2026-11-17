import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), "utf8");

test("selected sidebar item retains the original active colour when hovered or focused", async () => {
  const globalStyles = await read("styles/GlobalStyles.js");
  const sidebar = await read("features/dashboard/styles/sidebar.css");

  assert.match(sidebar, /\.d-nav-link\.active\s*\{[^}]*background: rgba\(30, 58, 138, 0\.1\);[^}]*color: var\(--d-text-secondary\);/s);
  assert.match(globalStyles, /\.d-nav-link\.active,\s*\.d-nav-link\.active:hover,\s*\.d-nav-link\.active:focus-visible\s*\{\s*background: rgba\(30, 58, 138, 0\.1\);\s*color: var\(--d-primary\);/);
  assert.doesNotMatch(globalStyles, /\.d-nav-link\.active:hover\s*\{\s*background-color: color-mix/);
});

test("unselected sidebar items keep the new subtle hover highlight", async () => {
  const globalStyles = await read("styles/GlobalStyles.js");
  assert.match(globalStyles, /\.d-nav-link:not\(\.disabled\):not\(\.active\):hover\s*\{\s*background-color: color-mix/);
});
