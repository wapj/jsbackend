import assert from "node:assert/strict";
import test from "node:test";
import { chapterPath, startNode, waitForOutput } from "./support/process.mjs";
import { REQUIRED_NODE_VERSION } from "./support/repository.mjs";

test("chapter0: the first HTTP server responds end to end", async (t) => {
  assert.equal(process.version, REQUIRED_NODE_VERSION);
  const server = startNode("hello-node.js", [], {
    cwd: chapterPath("chapter0"),
  });
  t.after(() => server.stop());

  await waitForOutput(server, /Hello Node\.js/);
  const response = await fetch("http://127.0.0.1:8000/");
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "hello\nNode.js");
});
