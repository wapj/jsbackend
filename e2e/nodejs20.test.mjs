import assert from "node:assert/strict";
import { chmod, copyFile, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import {
  chapterPath,
  createTempDir,
  runNode,
  runProcess,
} from "./support/process.mjs";

test("nodejs20: built-in feature examples execute on Node.js 24", async (t) => {
  const root = chapterPath("nodejs20_major_features");

  const environment = await runProcess(
    process.execPath,
    ["--env-file=.env", "env-test.js"],
    { cwd: path.join(root, "env-test") }
  );
  assert.match(environment, /dev/);
  assert.match(environment, /jsbackend/);

  const permissions = await runProcess(
    process.execPath,
    ["--permission", "file-permission.js"],
    { cwd: path.join(root, "permission-model") }
  );
  assert.match(permissions, /ERR_ACCESS_DENIED/);

  const recursive = await runNode("read-directories.js", [], {
    cwd: path.join(root, "recursive-read-dirs"),
  });
  assert.match(recursive, /test4\.txt/);

  const loader = await runProcess(
    process.execPath,
    [
      "--import=./register.js",
      "--input-type=module",
      "--eval",
      'const loaded = await import("andy:andy"); loaded.test();',
    ],
    { cwd: path.join(root, "esm-loader-hook") }
  );
  assert.match(loader, /Hello Node\.JS! I am Andy/);

  const nodeTests = await runProcess(
    process.execPath,
    ["--test", "calculator.test.js", "http-request.test.js"],
    {
      cwd: path.join(root, "test-runner"),
      env: { NODE_TEST_CONTEXT: undefined },
    }
  );
  assert.match(nodeTests, /Calculator/);

  const loggerUrl = pathToFileURL(
    path.join(root, "test-runner", "logger.js")
  ).href;
  const { default: logOperation } = await import(loggerUrl);
  const messages = [];
  const originalLog = console.log;
  try {
    console.log = (...args) => messages.push(args.join(" "));
    logOperation("add", 3);
  } finally {
    console.log = originalLog;
  }
  assert.deepEqual(messages, ["Operation: add, Result: 3"]);

  const v8 = await runNode("v8_upgrade.js", [], { cwd: root });
  assert.match(v8, /New Buffer Size: 8/);
  assert.match(v8, /New Shared Buffer Size: 8/);

  const temporary = await createTempDir("jsbackend-sea-");
  t.after(() => temporary.cleanup());
  const seaSource = path.join(root, "sea", "hello.js");
  const seaConfig = path.join(temporary.directory, "sea-config.json");
  const seaBlob = path.join(temporary.directory, "sea-prep.blob");
  const seaExecutable = path.join(
    temporary.directory,
    process.platform === "win32" ? "hello.exe" : "hello"
  );
  await copyFile(seaSource, path.join(temporary.directory, "hello.js"));
  await writeFile(
    seaConfig,
    `${JSON.stringify({ main: "hello.js", output: seaBlob })}\n`
  );
  await runProcess(process.execPath, ["--experimental-sea-config", seaConfig], {
    cwd: temporary.directory,
  });
  await copyFile(process.execPath, seaExecutable);
  await chmod(seaExecutable, 0o755);
  if (process.platform === "darwin") {
    await runProcess("codesign", ["--remove-signature", seaExecutable]);
  }

  const postjectArgs = [
    chapterPath("node_modules", "postject", "dist", "cli.js"),
    seaExecutable,
    "NODE_SEA_BLOB",
    seaBlob,
    "--sentinel-fuse",
    "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2",
  ];
  if (process.platform === "darwin") {
    postjectArgs.push("--macho-segment-name", "NODE_SEA");
  }
  await runProcess(process.execPath, postjectArgs, { timeoutMs: 120_000 });
  if (process.platform === "darwin") {
    await runProcess("codesign", ["--sign", "-", seaExecutable]);
  }
  assert.match(
    await runProcess(seaExecutable, ["wapj"], {
      cwd: temporary.directory,
    }),
    /Hello, wapj!/
  );
});
