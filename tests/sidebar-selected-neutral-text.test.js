import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), "utf8");

test("selected sidebar label and icon stay neutral instead of turning blue", async () => {
  const globalStyles = await read("styles/GlobalStyles.js");
  const sidebar = await read("features/dashboard/styles/sidebar.css");

  assert.match(globalStyles, /\.d-nav-link\.active,\s*\.d-nav-link\.active:hover,\s*\.d-nav-link\.active:focus-visible\s*\{\s*background: rgba\(30, 58, 138, 0\.1\);\s*color: var\(--d-text-secondary\);/);
  assert.match(globalStyles, /\.d-nav-link\.active > svg,[\s\S]*?color: var\(--d-text-secondary\);/);
  assert.match(sidebar, /\.d-nav-link\.active\s*\{[^}]*background: rgba\(30, 58, 138, 0\.1\);[^}]*color: var\(--d-text-secondary\);/s);
  assert.doesNotMatch(globalStyles, /\.d-nav-link\.active:hover\s*\{[^}]*color: var\(--d-primary\)/s);
});

test("non-selected links retain their subtle blue-tinted hover highlight", async () => {
  const globalStyles = await read("styles/GlobalStyles.js");
  assert.match(globalStyles, /\.d-nav-link:not\(\.disabled\):not\(\.active\):hover\s*\{[^}]*color: var\(--d-primary\);/s);
});
