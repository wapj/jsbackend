import assert from "node:assert/strict";
import test from "node:test";
import {
  chapterPath,
  runNode,
  startNode,
  waitForOutput,
} from "./support/process.mjs";

test("chapter2: event-loop ordering and the delayed HTTP response work", async (t) => {
  const cwd = chapterPath("chapter2");
  const eventLoopOutput = await runNode("callstackWithEventloop.js", [], {
    cwd,
  });
  assert.deepEqual(eventLoopOutput.trim().split(/\s+/), ["1", "3", "2"]);

  const server = startNode("hello.js", [], { cwd });
  t.after(() => server.stop());
  await waitForOutput(server, /Hello Node\.js/);
  const response = await fetch("http://127.0.0.1:8000/");
  assert.equal(await response.text(), "hello\nNode.js");
});
