import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import test from "node:test";
import {
  buildNest,
  chapterPath,
  createTempDir,
  jsonRequest,
  mongoEnv,
  startNode,
  startNpm,
  waitForHttp,
} from "./support/process.mjs";

async function exerciseBlog(t, directory, env = {}) {
  const cwd = chapterPath("chapter8", directory);
  await buildNest(cwd);
  const server = startNode("dist/main.js", [], { cwd, env });
  t.after(() => server.stop());
  await waitForHttp("http://127.0.0.1:3000/blog");

  const title = `${directory} e2e`;
  const createResponse = await fetch("http://127.0.0.1:3000/blog", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title, content: "created", name: "wapj" }),
  });
  assert.equal(createResponse.status, 201);
  assert.equal(await createResponse.text(), "success");

  const posts = await jsonRequest("http://127.0.0.1:3000/blog");
  const created = posts.find((post) => post.title === title);
  assert.ok(created, `${directory} did not persist the created post`);
  const id = created.id ?? created._id;
  assert.ok(id);

  const fetched = await jsonRequest(`http://127.0.0.1:3000/blog/${id}`);
  assert.equal(fetched.content, "created");

  const updateResponse = await fetch(`http://127.0.0.1:3000/blog/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title, content: "updated", name: "wapj" }),
  });
  assert.equal(updateResponse.status, 200);
  const updated = await jsonRequest(`http://127.0.0.1:3000/blog/${id}`);
  assert.equal(updated.content, "updated");

  const deleteResponse = await fetch(`http://127.0.0.1:3000/blog/${id}`, {
    method: "DELETE",
  });
  assert.equal(deleteResponse.status, 200);
  const remaining = await jsonRequest("http://127.0.0.1:3000/blog");
  assert.equal(
    remaining.some((post) => (post.id ?? post._id) === id),
    false
  );

  await server.stop();
}

test("chapter8: Nest hello apps and all blog repositories work end to end", async (t) => {
  const helloTs = chapterPath("chapter8", "hello-nestjs");
  await buildNest(helloTs);
  const typescriptServer = startNode("dist/main.js", [], { cwd: helloTs });
  t.after(() => typescriptServer.stop());
  await waitForHttp("http://127.0.0.1:3000/");
  assert.match(await (await fetch("http://127.0.0.1:3000/")).text(), /nestjs/i);
  await typescriptServer.stop();

  const helloJs = chapterPath("chapter8", "hello-nestjs-javascript");
  const javascriptServer = startNpm(["run", "start"], { cwd: helloJs });
  t.after(() => javascriptServer.stop());
  await waitForHttp("http://127.0.0.1:3000/");
  assert.match(await (await fetch("http://127.0.0.1:3000/")).text(), /nestjs/i);
  await javascriptServer.stop();

  await exerciseBlog(t, "blog-memory");

  const temporary = await createTempDir("jsbackend-blog-file-");
  t.after(() => temporary.cleanup());
  const dataFile = `${temporary.directory}/blog.data.json`;
  await writeFile(dataFile, "[]", "utf8");
  await exerciseBlog(t, "blog-file", { BLOG_DATA_FILE: dataFile });

  await exerciseBlog(t, "blog-mongodb", mongoEnv());
});
