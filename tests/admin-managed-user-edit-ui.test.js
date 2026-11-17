import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../src/${path}`, import.meta.url), "utf8");
}

test("both Admin directories expose a shared managed-account edit dialog", async () => {
  const students = await source("features/admin/pages/StudentsPage.jsx");
  const teachers = await source("features/admin/pages/TeachersPage.jsx");
  const dialog = await source("features/admin/components/ManagedUserEditDialog.jsx");

  assert.match(students, /<ManagedUserEditDialog/);
  assert.match(teachers, /<ManagedUserEditDialog/);
  assert.match(students, /setEditingStudent\(student\)/);
  assert.match(teachers, /setEditingTeacher\(teacher\)/);
  assert.match(dialog, /role="dialog"/);
  assert.match(dialog, /aria-modal="true"/);
  assert.match(dialog, /updateAdminManagedUser/);
});

test("Student edit includes roll number and class while Teacher edit keeps subject assignments separate", async () => {
  const dialog = await source("features/admin/components/ManagedUserEditDialog.jsx");
  const teachers = await source("features/admin/pages/TeachersPage.jsx");

  assert.match(dialog, /value=\{form\.rollNumber\}/);
  assert.match(dialog, /Official roll number/);
  assert.match(dialog, /fetchActiveStudentClassOptions/);
  assert.match(dialog, /isStudent && \(/);
  assert.match(teachers, /setUpdateSuccessMessage\("Teacher account " \+ updated\.fullName/);
  assert.match(dialog, /Account role, password and activation status are managed separately/);
});

test("Admin edit dialog does not expose password, role or activation controls", async () => {
  const dialog = await source("features/admin/components/ManagedUserEditDialog.jsx");

  assert.doesNotMatch(dialog, /type="password"/);
  assert.doesNotMatch(dialog, /name="role"|name="isActive"/);
  assert.match(dialog, /Changing the username changes the account's sign-in name/);
});
