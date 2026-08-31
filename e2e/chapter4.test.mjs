import assert from "node:assert/strict";
import test from "node:test";
import {
  chapterPath,
  runNpm,
  startNode,
  waitForOutput,
} from "./support/process.mjs";

test("chapter4: npm lifecycle hooks and the Yarn PnP app execute", async (t) => {
  const lifecycle = await runNpm(["run", "hello"], {
    cwd: chapterPath("chapter4", "test-scripts"),
  });
  const pre = lifecycle.indexOf("PRE HELLO");
  const main = lifecycle.indexOf("hello Node.js");
  const post = lifecycle.indexOf("POST HELLO");
  assert.ok(pre >= 0 && pre < main && main < post, lifecycle);

  const cwd = chapterPath("chapter4", "test-yarn");
  const server = startNode(
    ".yarn/releases/yarn-3.8.7.cjs",
    ["node", "index.js"],
    { cwd }
  );
  t.after(() => server.stop());
  await waitForOutput(server, /START SERVER/);
  const response = await fetch("http://127.0.0.1:3000/");
  assert.equal(response.status, 200);
  assert.match(await response.text(), /express/i);
});
