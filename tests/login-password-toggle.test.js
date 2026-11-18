import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), "utf8");

test("login password visibility control has a fixed centered hit area and native button reset", async () => {
  const css = await read("features/auth/pages/LoginPage.css");

  assert.match(css, /\.pw-toggle\s*\{[\s\S]*?top:\s*0/);
  assert.match(css, /\.pw-toggle\s*\{[\s\S]*?right:\s*8px/);
  assert.match(css, /\.pw-toggle\s*\{[\s\S]*?width:\s*40px/);
  assert.match(css, /\.pw-toggle\s*\{[\s\S]*?height:\s*40px/);
  assert.match(css, /\.pw-toggle\s*\{[\s\S]*?appearance:\s*none/);
  assert.match(css, /\.pw-toggle\s*\{[\s\S]*?border-radius:\s*50%/);
  assert.match(css, /\.pw-toggle\s*\{[\s\S]*?box-shadow:\s*none/);
});

test("password toggle does not jump on hover or press and remains keyboard accessible", async () => {
  const css = await read("features/auth/pages/LoginPage.css");
  const form = await read("features/auth/components/LoginForm.jsx");

  assert.match(css, /\.pw-toggle\s*\{[\s\S]*?top:\s*0/);
  assert.match(css, /\.pw-toggle\s*\{[\s\S]*?bottom:\s*0/);
  assert.match(css, /\.pw-toggle\s*\{[\s\S]*?margin:\s*auto 0/);
  assert.match(css, /\.pw-toggle:hover\s*\{[\s\S]*?transform:\s*none/);
  assert.match(css, /\.pw-toggle:active\s*\{[\s\S]*?transform:\s*none/);
  assert.match(css, /\.login-field-wrap\s*\{[\s\S]*?height:\s*56px/);
  assert.match(css, /\.login-field-wrap\s*\{[\s\S]*?flex:\s*0 0 56px/);
  assert.match(css, /\.login-field-wrap\s*\{[\s\S]*?min-height:\s*52px/);
  assert.match(css, /\.pw-toggle:focus-visible\s*\{[\s\S]*?outline:\s*2px solid/);
  assert.match(form, /type="button"\s+className="pw-toggle"/);
  assert.match(form, /onClick=\{togglePw\}/);
  assert.match(form, /aria-label=\{showPw \? "Hide password" : "Show password"\}/);
});
