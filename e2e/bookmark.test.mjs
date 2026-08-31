import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import {
  buildNest,
  chapterPath,
  createTempDir,
  jsonRequest,
  startNode,
  waitForHttp,
} from "./support/process.mjs";

test("bookmark: CRUD and short URL redirects use an isolated database", async (t) => {
  const cwd = chapterPath("bookmark-app");
  const temporary = await createTempDir("jsbackend-bookmark-");
  t.after(() => temporary.cleanup());
  await buildNest(cwd);

  const server = startNode("dist/main.js", [], {
    cwd,
    env: { DATABASE_PATH: path.join(temporary.directory, "bookmark.sqlite") },
  });
  t.after(() => server.stop());
  await waitForHttp(server, "http://127.0.0.1:3000/bookmarks/all");

  const created = await jsonRequest(
    "http://127.0.0.1:3000/bookmarks",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Node.js 24",
        url: "https://nodejs.org/",
      }),
    },
    201
  );
  assert.equal(created.title, "Node.js 24");
  assert.match(created.shortUrl, /^[\w-]{8}$/);

  const redirect = await fetch(`http://127.0.0.1:3000/${created.shortUrl}`, {
    redirect: "manual",
  });
  assert.equal(redirect.status, 302);
  assert.equal(redirect.headers.get("location"), "https://nodejs.org/");

  const updated = await jsonRequest(
    `http://127.0.0.1:3000/bookmarks/${created.id}`,
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Node.js 24 LTS" }),
    }
  );
  assert.equal(updated.title, "Node.js 24 LTS");

  const bookmarks = await jsonRequest("http://127.0.0.1:3000/bookmarks/all");
  assert.equal(bookmarks.length, 1);
  assert.equal(bookmarks[0].id, created.id);

  const deleted = await fetch(`http://127.0.0.1:3000/bookmarks/${created.id}`, {
    method: "DELETE",
  });
  assert.equal(deleted.status, 200);
  assert.deepEqual(
    await jsonRequest("http://127.0.0.1:3000/bookmarks/all"),
    []
  );
});
