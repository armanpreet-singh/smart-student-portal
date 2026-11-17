import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), "utf8");

test("Admin reset dialog sets a new password and confirms it without requesting the old password", async () => {
  const component = await read("features/admin/components/AccountPasswordResetControl.jsx");
  assert.match(component, /New password/);
  assert.match(component, /Confirm new password/);
  assert.match(component, /resetManagedAccountPassword\([\s\S]*form\.newPassword[\s\S]*form\.confirmPassword/);
  assert.doesNotMatch(component, /currentPassword|old password/i);
  assert.match(component, /Confirm identity|Verify the account identity/);
});

test("Admin reset password fields each have independent accessible visibility toggles", async () => {
  const component = await read("features/admin/components/AccountPasswordResetControl.jsx");
  assert.match(component, /showNewPassword \? "text" : "password"/);
  assert.match(component, /showConfirmPassword \? "text" : "password"/);
  assert.match(component, /Show new password/);
  assert.match(component, /Show confirmation password/);
  assert.match(component, /type="button"/);
});

test("Add Student password and confirmation fields each have show/hide controls", async () => {
  const component = await read("features/admin/pages/StudentsPage.jsx");
  assert.match(component, /showCreatePassword \? "text" : "password"/);
  assert.match(component, /showCreateConfirmPassword \? "text" : "password"/);
  assert.match(component, /Show temporary password/);
  assert.match(component, /Show confirmation password/);
});

test("Student creation password visibility controls have styling and accessible focus", async () => {
  const css = await read("features/admin/pages/StudentsPage.css");
  assert.match(css, /\.a-student-create-password-visibility/);
  assert.match(css, /:focus-visible/);
});


test("Admin reset API sends newPassword and expects the new password to be immediately usable", async () => {
  const api = await read("features/admin/api/adminAccountPasswordResetApi.js");
  assert.match(api, /resetManagedAccountPassword\([^)]*newPassword, confirmPassword\)/);
  assert.match(api, /body: JSON\.stringify\(\{ newPassword \}\)/);
  assert.match(api, /user\.mustChangePassword === false/);
  assert.doesNotMatch(api, /temporaryPassword/);
});
