import assert from "node:assert/strict";
import test from "node:test";
import { chapterPath, runNpm } from "./support/process.mjs";

test("chapter11: the session authentication E2E suite passes", async () => {
  const output = await runNpm(["run", "test:e2e", "--", "--runInBand"], {
    cwd: chapterPath("chapter11", "nest-auth-test"),
    timeoutMs: 120_000,
  });
  assert.match(output, /PASS .*app\.e2e-spec\.ts/);
});
