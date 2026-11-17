import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), "utf8");

test("selected sidebar uses blue text and icons with a pale blue row in light mode", async () => {
  const sidebar = await read("features/dashboard/styles/sidebar.css");
  assert.match(sidebar, /\.d-layout:not\(\.dark-mode\) \.d-sidebar \.d-nav-link\.active,[\s\S]*?background: rgba\(30, 58, 138, 0\.1\);\s*color: var\(--d-primary\);/);
  assert.match(sidebar, /\.d-layout:not\(\.dark-mode\) \.d-sidebar \.d-nav-link\.active svg,[\s\S]*?color: var\(--d-primary\);/);
});

test("selected sidebar uses LTSU gold text and icons with a subtle gold row in dark mode", async () => {
  const sidebar = await read("features/dashboard/styles/sidebar.css");
  assert.match(sidebar, /\.d-layout\.dark-mode \.d-sidebar \.d-nav-link\.active,[\s\S]*?background: rgba\(201, 168, 76, 0\.1\);\s*color: #C9A84C;/);
  assert.match(sidebar, /\.d-layout\.dark-mode \.d-sidebar \.d-nav-link\.active svg,[\s\S]*?color: #C9A84C;/);
  assert.match(sidebar, /box-shadow: inset 0 0 0 1px rgba\(201, 168, 76, 0\.2\)/);
});

test("active theme colours remain on hover and keyboard focus, while unselected hover stays subtle", async () => {
  const sidebar = await read("features/dashboard/styles/sidebar.css");
  const global = await read("styles/GlobalStyles.js");
  assert.match(sidebar, /\.d-nav-link\.active:hover/);
  assert.match(sidebar, /\.d-nav-link\.active:focus-visible/);
  assert.match(global, /\.d-nav-link:not\(\.disabled\):not\(\.active\):hover/);
});
