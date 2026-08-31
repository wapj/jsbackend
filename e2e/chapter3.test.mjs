import assert from "node:assert/strict";
import test from "node:test";
import { chapterPath, startNode, waitForHttp } from "./support/process.mjs";

test("chapter3: the hand-written router handles routes and methods", async (t) => {
  const server = startNode("simpleServer.js", [], {
    cwd: chapterPath("chapter3"),
  });
  t.after(() => server.stop());
  await waitForHttp("http://127.0.0.1:3000/");

  assert.equal(await (await fetch("http://127.0.0.1:3000/")).text(), "HOME");
  assert.match(
    await (await fetch("http://127.0.0.1:3000/feed")).text(),
    /picture1/
  );
  assert.equal(
    await (await fetch("http://127.0.0.1:3000/", { method: "POST" })).text(),
    "POST is not allowed http method"
  );
  assert.match(
    await (await fetch("http://127.0.0.1:3000/not-found")).text(),
    /404 page not found/
  );
});
