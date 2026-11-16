import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  clearDutyProofRecordBusy,
  markDutyProofRecordBusy,
} from "../src/features/dashboard/utils/studentDutyProofState.js";

describe("Student duty-proof per-record processing state", () => {
  it("keeps concurrent actions on separate records independent", () => {
    const first = markDutyProofRecordBusy({}, "attendance-1", "upload");
    const both = markDutyProofRecordBusy(first, "attendance-2", "download");

    assert.deepEqual(both, {
      "attendance-1": "upload",
      "attendance-2": "download",
    });
  });

  it("clearing one completed record preserves other in-flight actions", () => {
    const both = {
      "attendance-1": "upload",
      "attendance-2": "download",
    };

    assert.deepEqual(
      clearDutyProofRecordBusy(both, "attendance-1"),
      { "attendance-2": "download" },
    );
  });

  it("can replace an action for the same record without mutating prior state", () => {
    const uploading = markDutyProofRecordBusy({}, "attendance-1", "upload");
    const downloading = markDutyProofRecordBusy(
      uploading,
      "attendance-1",
      "download",
    );

    assert.deepEqual(uploading, { "attendance-1": "upload" });
    assert.deepEqual(downloading, { "attendance-1": "download" });
  });

  it("ignores unknown record clears and invalid action values", () => {
    const current = { "attendance-1": "upload" };

    assert.equal(clearDutyProofRecordBusy(current, "attendance-2"), current);
    assert.equal(markDutyProofRecordBusy(current, "attendance-2", "delete"), current);
  });
});
