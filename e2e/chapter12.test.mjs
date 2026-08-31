import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildNest,
  chapterPath,
  createTempDir,
  startNode,
  waitForHttp,
} from "./support/process.mjs";

test("chapter12: a multipart upload is persisted and served", async (t) => {
  const cwd = chapterPath("chapter12", "nest-file-upload");
  const temporary = await createTempDir("jsbackend-upload-");
  t.after(() => temporary.cleanup());
  await buildNest(cwd);

  const server = startNode("dist/main.js", [], {
    cwd,
    env: { UPLOAD_DIR: temporary.directory },
  });
  t.after(() => server.stop());
  await waitForHttp(server, "http://127.0.0.1:3000/");

  const form = new FormData();
  form.append(
    "file",
    new Blob(["chapter12 upload contents"], { type: "text/plain" }),
    "e2e.txt"
  );
  const upload = await fetch("http://127.0.0.1:3000/file-upload", {
    method: "POST",
    body: form,
  });
  assert.equal(upload.status, 201);
  const message = await upload.text();
  const filename = message.match(/\/uploads\/([^\s"]+)/)?.[1];
  assert.ok(filename, message);

  const download = await fetch(`http://127.0.0.1:3000/uploads/${filename}`);
  assert.equal(download.status, 200);
  assert.equal(await download.text(), "chapter12 upload contents");
  assert.equal(
    await readFile(`${temporary.directory}/${filename}`, "utf8"),
    "chapter12 upload contents"
  );
});
