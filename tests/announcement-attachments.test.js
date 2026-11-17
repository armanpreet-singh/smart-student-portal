import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), "utf8");

test("Admin and Teacher announcement drafts accept one optional multipart attachment", async () => {
  const [manager, api] = await Promise.all([
    read("features/shared/announcements/AnnouncementsManager.jsx"),
    read("features/shared/announcements/announcementsApi.js")
  ]);

  assert.match(manager, /type="file"/);
  assert.match(manager, /\.pdf/);
  assert.match(manager, /\.docx/);
  assert.match(manager, /\.xlsx/);
  assert.match(manager, /\.jpg/);
  assert.match(manager, /MAX_ANNOUNCEMENT_ATTACHMENT_BYTES/);
  assert.match(manager, /createAnnouncement\(accessToken, role, input, selectedFile\)/);
  assert.match(manager, /updateAnnouncement\([\s\S]*?selectedFile/);
  assert.match(api, /data\.append\("attachment", file, file\.name\)/);
  assert.match(api, /instanceof FormData/);
  assert.match(api, /!\(typeof FormData !== "undefined" && options\.body instanceof FormData\)/);
});

test("Admin, Teacher and Student announcement cards expose authorized attachment downloads", async () => {
  const [manager, feed, api] = await Promise.all([
    read("features/shared/announcements/AnnouncementsManager.jsx"),
    read("features/shared/announcements/AnnouncementsFeed.jsx"),
    read("features/shared/announcements/announcementsApi.js")
  ]);

  assert.match(manager, /downloadAnnouncementAttachment\(accessToken, role, item\.id\)/);
  assert.match(manager, /item\.attachment\.fileName/);
  assert.match(feed, /downloadAnnouncementAttachment\(accessToken, "student", item\.id\)/);
  assert.match(feed, /item\.attachment\.fileName/);
  assert.match(api, /\/\\$\{encodeURIComponent\(announcementId\)\}\/attachment/);
  assert.match(api, /parsedUrl\.protocol !== "https:"/);
});

test("announcement attachment UI has responsive file rows and bounded accepted file size", async () => {
  const [manager, css] = await Promise.all([
    read("features/shared/announcements/AnnouncementsManager.jsx"),
    read("features/shared/announcements/announcements.css")
  ]);

  assert.match(manager, /maximum 20 MB/);
  assert.match(manager, /announcements-selected-file/);
  assert.match(manager, /announcements-current-file/);
  assert.match(css, /\.announcements-attachment-field/);
  assert.match(css, /\.announcements-attachment \{/);
  assert.match(css, /@media \(max-width:640px\)/);
});
