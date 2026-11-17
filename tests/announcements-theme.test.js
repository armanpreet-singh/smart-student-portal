import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), "utf8");

test("announcement surfaces use the shared theme-aware dashboard surface token", async () => {
  const [announcements, dashboard] = await Promise.all([
    read("features/shared/announcements/announcements.css"),
    read("features/dashboard/styles/dashboard.css"),
  ]);

  assert.match(dashboard, /\.d-layout\.dark-mode\s*\{[\s\S]*?--d-surface:\s*#1e293b/);
  assert.match(announcements, /\.announcements-card\s*\{[^}]*background:\s*var\(--d-surface,\s*#fff\)/);
  assert.doesNotMatch(announcements, /var\(--d-card\b/);
});

test("announcement text retains theme-aware foreground tokens for card contrast", async () => {
  const announcements = await read("features/shared/announcements/announcements.css");

  assert.match(announcements, /\.announcements-card h2\s*\{[^}]*color:\s*var\(--d-text\)/);
  assert.match(announcements, /\.announcements-message\s*\{[^}]*color:\s*var\(--d-text-secondary\)/);
  assert.match(announcements, /\.announcements-audience[^}]*\{[^}]*color:\s*var\(--d-text-secondary\)/);
  assert.match(announcements, /\.announcements-meta\s*\{[^}]*color:\s*var\(--d-text-secondary\)/);
});
