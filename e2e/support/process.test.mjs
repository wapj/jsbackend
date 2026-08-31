import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import http from "node:http";
import process from "node:process";
import test from "node:test";
import {
  ROOT_DIR,
  startProcess,
  waitForHttp,
  waitForPort,
} from "./process.mjs";

function readLine(stream, timeoutMs = 5_000) {
  return new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for child output"));
    }, timeoutMs);
    const onData = (chunk) => {
      output += chunk;
      const newline = output.indexOf("\n");
      if (newline === -1) return;
      const line = output.slice(0, newline);
      cleanup();
      resolve(line);
    };
    const onError = (error) => {
      cleanup();
      reject(error);
    };
    const cleanup = () => {
      clearTimeout(timeout);
      stream.off("data", onData);
      stream.off("error", onError);
    };
    stream.on("data", onData);
    stream.on("error", onError);
  });
}

function processExists(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error.code === "ESRCH") return false;
    throw error;
  }
}

async function waitForProcessExit(pid, timeoutMs = 5_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!processExists(pid)) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`Process ${pid} did not exit`);
}

function forceStopProcessGroup(pid) {
  if (!pid || !processExists(pid)) return;
  try {
    if (process.platform === "win32") process.kill(pid, "SIGKILL");
    else process.kill(-pid, "SIGKILL");
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}

test("readiness rejects an exited target even when a stale listener responds", async (t) => {
  const staleServer = http.createServer((_request, response) => {
    response.end("stale");
  });
  staleServer.listen(0, "127.0.0.1");
  await once(staleServer, "listening");
  t.after(() => new Promise((resolve) => staleServer.close(resolve)));
  const port = staleServer.address().port;

  const failedHttpTarget = startProcess(process.execPath, [
    "--eval",
    "process.exit(1)",
  ]);
  await failedHttpTarget.exited;
  await assert.rejects(
    waitForHttp(failedHttpTarget, `http://127.0.0.1:${port}/`, {
      timeoutMs: 500,
    }),
    /Process exited before serving/
  );

  const failedTcpTarget = startProcess(process.execPath, [
    "--eval",
    "process.exit(1)",
  ]);
  await failedTcpTarget.exited;
  await assert.rejects(
    waitForPort(failedTcpTarget, port, 500),
    /Process exited before listening/
  );
});

test("SIGTERM stops detached descendants before the owner exits", async (t) => {
  const parentProgram = [
    'import process from "node:process";',
    'import { startProcess } from "./e2e/support/process.mjs";',
    "const descendant = startProcess(process.execPath, [",
    '  "--eval",',
    '  "setInterval(() => {}, 1000)",',
    "]);",
    "process.stdout.write(`${descendant.child.pid}\\n`);",
    "setInterval(() => {}, 1000);",
  ].join("\n");
  const parent = spawn(
    process.execPath,
    ["--input-type=module", "--eval", parentProgram],
    {
      cwd: ROOT_DIR,
      stdio: ["ignore", "pipe", "pipe"],
    }
  );
  let descendantPid;
  t.after(() => {
    if (parent.exitCode === null && parent.signalCode === null) {
      parent.kill("SIGKILL");
    }
    forceStopProcessGroup(descendantPid);
  });

  descendantPid = Number(await readLine(parent.stdout));
  assert.ok(descendantPid > 0);
  assert.equal(processExists(descendantPid), true);

  parent.kill("SIGTERM");
  const [code, signal] = await once(parent, "exit");
  assert.equal(code, null);
  assert.equal(signal, "SIGTERM");
  await waitForProcessExit(descendantPid);
});

test("cleanup kills a process-group descendant that ignores SIGTERM", async (t) => {
  const leaderProgram = [
    'import { spawn } from "node:child_process";',
    'import process from "node:process";',
    "const grandchild = spawn(process.execPath, [",
    '  "--eval",',
    '  "process.on(\\"SIGTERM\\", () => {}); process.stdout.write(\\"ready\\\\n\\"); setInterval(() => {}, 1000)",',
    '], { stdio: ["ignore", "pipe", "ignore"] });',
    'grandchild.stdout.once("data", () => {',
    "  process.stdout.write(`${grandchild.pid}\\n`);",
    "});",
    'process.on("SIGTERM", () => process.exit(0));',
    "setInterval(() => {}, 1000);",
  ].join("\n");
  const server = startProcess(
    process.execPath,
    ["--input-type=module", "--eval", leaderProgram],
    { stopTimeoutMs: 100 }
  );
  let grandchildPid;
  t.after(() => {
    forceStopProcessGroup(server.child.pid);
    if (grandchildPid && processExists(grandchildPid)) {
      process.kill(grandchildPid, "SIGKILL");
    }
  });

  grandchildPid = Number(await readLine(server.child.stdout));
  assert.ok(grandchildPid > 0);
  assert.equal(processExists(grandchildPid), true);

  await server.stop();
  await waitForProcessExit(grandchildPid);
});
