import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../src/${path}`, import.meta.url), "utf8");
}

test("primary and secondary actions use distinct LTSU interaction treatments", async () => {
  const styles = await source("styles/GlobalStyles.js");
  assert.match(styles, /\.btn-primary, \.btn-accent, \.d-btn-primary, \.login-btn-primary/);
  assert.match(styles, /translateY\(-2px\)/);
  assert.match(styles, /scale\(\.98\)/);
  assert.match(styles, /\.btn-secondary, \.btn-outline-white, \.login-btn-secondary/);
  assert.match(styles, /ltsu-secondary-glow/);
});

test("sidebar, profile menu and icon buttons use separate interaction patterns", async () => {
  const styles = await source("styles/GlobalStyles.js");
  assert.match(styles, /\.d-nav-link:not\(\.disabled\)/);
  assert.match(styles, /\.d-dropdown-item/);
  assert.match(styles, /\.d-icon-btn, \.d-menu-btn, \.d-close-btn, \.pw-toggle/);
  assert.match(styles, /border-radius: 50%/);
});

test("cards lift exactly three pixels and table actions transition without shifting position", async () => {
  const styles = await source("styles/GlobalStyles.js");
  const card = await source("features/dashboard/components/DashboardCard/DashboardCard.jsx");
  assert.match(styles, /translateY\(-3px\)/);
  assert.match(styles, /\.d-layout table button:not\(:disabled\)/);
  assert.match(card, /d-card-interactive/);
  assert.doesNotMatch(card, /whileHover/);
});

test("text links animate an underline and disabled controls have no hover animation", async () => {
  const styles = await source("styles/GlobalStyles.js");
  assert.match(styles, /\.nav-link, \.footer-link, \.d-link-btn/);
  assert.match(styles, /transform: scaleX\(0\)/);
  assert.match(styles, /transform: scaleX\(1\)/);
  assert.match(styles, /:disabled, \[aria-disabled="true"\]/);
  assert.match(styles, /transition: none !important/);
});

test("interactions preserve keyboard focus and reduced-motion preferences", async () => {
  const styles = await source("styles/GlobalStyles.js");
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
  assert.match(styles, /@media \(hover: hover\) and \(pointer: fine\)/);
});
