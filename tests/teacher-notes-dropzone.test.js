import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), "utf8");

test("Teacher notes uploader supports click and keyboard access to native file picker", async () => {
  const page = await read("features/teacher/pages/TeacherResources.jsx");
  assert.match(page, /className="t-resources-native-file-input"/);
  assert.match(page, /ref=\{fileInputRef\}/);
  assert.match(page, /role="button"/);
  assert.match(page, /tabIndex=\{0\}/);
  assert.match(page, /handleDropZoneKeyDown/);
  assert.match(page, /fileInputRef\.current\?\.click\(\)/);
});

test("Teacher notes uploader accepts drag/drop and gives a drag-active visual state", async () => {
  const page = await read("features/teacher/pages/TeacherResources.jsx");
  const css = await read("features/teacher/pages/TeacherResources.css");
  assert.match(page, /onDragEnter=/);
  assert.match(page, /onDragOver=/);
  assert.match(page, /onDragLeave=/);
  assert.match(page, /onDrop=\{handleFileDrop\}/);
  assert.match(page, /is-drag-active/);
  assert.match(css, /\.t-resources-dropzone\.is-drag-active/);
});

test("Uploader keeps 20MB/type validation and rejects empty files or multi-file drops", async () => {
  const page = await read("features/teacher/pages/TeacherResources.jsx");
  assert.match(page, /const MAX_FILE_BYTES = 20 \* 1024 \* 1024/);
  assert.match(page, /ALLOWED_EXTENSIONS\.has\(extension\)/);
  assert.match(page, /file\.size > MAX_FILE_BYTES/);
  assert.match(page, /file\.size === 0/);
  assert.match(page, /files\.length > 1/);
});

test("Selected file can be removed or replaced, and upload uses the unchanged resource service", async () => {
  const page = await read("features/teacher/pages/TeacherResources.jsx");
  assert.match(page, /t-resources-remove-file/);
  assert.match(page, /setForm\(\(current\) => \(\{ \.\.\.current, file: null \}\)\)/);
  assert.match(page, /uploadTeacherLearningResource\(accessToken/);
  assert.match(page, /fileInputRef\.current\) fileInputRef\.current\.value = ""/);
});

test("Dropzone styles include responsive, focus-visible and reduced-motion behavior", async () => {
  const css = await read("features/teacher/pages/TeacherResources.css");
  assert.match(css, /:focus-visible \+ \.t-resources-dropzone/);
  assert.match(css, /@media \(max-width: 600px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
