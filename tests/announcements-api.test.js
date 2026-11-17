import test from "node:test";
import assert from "node:assert/strict";

import { isAnnouncementRecord } from "../src/features/shared/announcements/announcementsApi.js";

const record = {
  id: "announcement-1",
  authorId: "teacher-1",
  title: "Class update",
  message: "Bring your lab notebook.",
  audience: "CLASS",
  classId: "class-1",
  subjectId: "subject-1",
  publishedAt: "2026-11-16T13:00:00.000Z",
  createdAt: "2026-11-16T12:00:00.000Z",
  updatedAt: "2026-11-16T13:00:00.000Z",
  author: { id: "teacher-1", fullName: "Teacher One", role: "TEACHER" },
  class: {
    id: "class-1",
    code: "CSE-1",
    name: "Computer Science",
    academicYear: "2026-2027"
  },
  subject: {
    id: "subject-1",
    code: "CSE-101",
    name: "Programming",
    class: { id: "class-1", code: "CSE-1", name: "Computer Science" }
  },
  attachment: null
};

test("announcement API accepts a persisted Teacher class announcement", () => {
  assert.equal(isAnnouncementRecord(record), true);
});

test("announcement API accepts an Admin all-users announcement without class context", () => {
  assert.equal(isAnnouncementRecord({
    ...record,
    authorId: "admin-1",
    audience: "ALL_USERS",
    classId: null,
    subjectId: null,
    publishedAt: null,
    author: { id: "admin-1", fullName: "Administrator", role: "ADMIN" },
    class: null,
    subject: null
  }), true);
});

test("announcement API rejects invalid audience, author and publication timestamps", () => {
  assert.equal(isAnnouncementRecord({ ...record, audience: "PUBLIC" }), false);
  assert.equal(isAnnouncementRecord({ ...record, author: { ...record.author, role: "STUDENT" } }), false);
  assert.equal(isAnnouncementRecord({ ...record, publishedAt: "not-a-date" }), false);
  assert.equal(isAnnouncementRecord({ ...record, subject: { ...record.subject, class: null } }), false);
});


test("announcement API accepts validated attachment metadata for a published Student notice", () => {
  assert.equal(isAnnouncementRecord({
    ...record,
    attachment: {
      fileName: "semester-circular.pdf",
      mimeType: "application/pdf",
      bytes: 4096,
      format: "pdf"
    }
  }), true);
});

test("announcement API rejects incomplete or malformed attachment metadata", () => {
  assert.equal(isAnnouncementRecord({
    ...record,
    attachment: { fileName: "notice.pdf", mimeType: "application/pdf", bytes: -1, format: "pdf" }
  }), false);
  assert.equal(isAnnouncementRecord({
    ...record,
    attachment: { fileName: "", mimeType: "application/pdf", bytes: 10, format: "pdf" }
  }), false);
  assert.equal(isAnnouncementRecord({
    ...record,
    attachment: { fileName: "payload.exe", mimeType: "application/x-msdownload", bytes: 10, format: "exe" }
  }), false);
});
