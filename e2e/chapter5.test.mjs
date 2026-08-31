import assert from "node:assert/strict";
import test from "node:test";
import { chapterPath, runNode } from "./support/process.mjs";

test("chapter5: callback and Promise registration flows complete", async () => {
  const cwd = chapterPath("chapter5", "callback-promise-async-await");
  const callback = await runNode("callback-test.js", [], { cwd });
  assert.match(callback, /save andy to DB/);
  assert.match(callback, /email to andy@test\.com/);
  assert.match(callback, /success register andy/);

  const promise = await runNode("promise-test2.js", [], { cwd });
  assert.match(promise, /save andy to DB/);
  assert.match(promise, /email to andy@test\.com/);
  assert.match(promise, /success register andy/);
});
