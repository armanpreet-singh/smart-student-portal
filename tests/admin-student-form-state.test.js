import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createEmptyAdminStudentForm } from "../src/features/admin/utils/adminStudentForm.js";

describe("Admin Student provisioning form reset", () => {
  it("restores every field including the optional official roll number", () => {
    assert.deepEqual(createEmptyAdminStudentForm(), {
      fullName: "",
      username: "",
      email: "",
      classId: "",
      rollNumber: "",
      temporaryPassword: "",
      confirmPassword: "",
    });
  });

  it("returns a fresh independent form object on every reset", () => {
    const first = createEmptyAdminStudentForm();
    first.rollNumber = "000123";
    first.fullName = "Student Name";

    const second = createEmptyAdminStudentForm();
    assert.notEqual(first, second);
    assert.equal(second.rollNumber, "");
    assert.equal(second.fullName, "");
  });
});
