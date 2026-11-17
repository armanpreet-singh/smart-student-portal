import test from "node:test";
import assert from "node:assert/strict";
import { getNameInitials } from "../src/features/shared/profile/nameInitials.js";

test("returns first and last initials for a two-part name", () => {
  assert.equal(getNameInitials("Shahid Mushtaq"), "SM");
});

test("uses first and last names when the full name contains middle names", () => {
  assert.equal(getNameInitials("Armanpreet Singh Kumar"), "AK");
});

test("trims and normalizes whitespace", () => {
  assert.equal(getNameInitials("  shahid   mushtaq  "), "SM");
});

test("single-part names use one initial", () => {
  assert.equal(getNameInitials("Madonna"), "M");
});

test("supports Unicode names without splitting surrogate pairs", () => {
  assert.equal(getNameInitials("Émile Zola"), "ÉZ");
});

test("returns empty string for missing or whitespace-only names", () => {
  assert.equal(getNameInitials(null), "");
  assert.equal(getNameInitials("   "), "");
  assert.equal(getNameInitials(42), "");
});

test("ignores standalone punctuation tokens", () => {
  assert.equal(getNameInitials("Shahid - Mushtaq"), "SM");
});
