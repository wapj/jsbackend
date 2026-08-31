import { spawn } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { E2E_TARGETS, REQUIRED_NODE_VERSION } from "./support/repository.mjs";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
let mongoContainer;
let receivedSignal;
let signalCleanup;
const activeChildren = new Map();
const signalHandlers = new Map();

if (process.version !== REQUIRED_NODE_VERSION) {
  throw new Error(
    `E2E tests require Node.js ${REQUIRED_NODE_VERSION.slice(1)}; running ${
      process.version
    }`
  );
}

function trackChild(child, processGroup = false) {
  const tracked = { pid: child.pid, processGroup };
  activeChildren.set(child, tracked);
  const removeIfStopped = () => {
    if (!processTargetExists(child, tracked)) activeChildren.delete(child);
  };
  child.once("error", removeIfStopped);
  child.once("exit", removeIfStopped);
  return child;
}

function processTargetExists(child, tracked) {
  if (!tracked.pid) return false;
  if (process.platform === "win32" || !tracked.processGroup) {
    return child.exitCode === null && child.signalCode === null;
  }
  try {
    process.kill(-tracked.pid, 0);
    return true;
  } catch (error) {
    if (error.code === "ESRCH") return false;
    if (error.code === "EPERM") return true;
    throw error;
  }
}

function terminateChild(child, tracked, signal = "SIGTERM") {
  if (!tracked.pid) return;
  try {
    if (process.platform === "win32" || !tracked.processGroup) {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill(signal);
      }
    } else process.kill(-tracked.pid, signal);
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}

async function waitForActiveChildren(timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    for (const [child, tracked] of activeChildren) {
      if (!processTargetExists(child, tracked)) activeChildren.delete(child);
    }
    if (activeChildren.size === 0) return true;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  return false;
}

async function stopActiveChildren(signal) {
  for (const [child, tracked] of activeChildren) {
    terminateChild(child, tracked, signal);
  }
  if (await waitForActiveChildren(8_000)) return;

  for (const [child, tracked] of activeChildren) {
    terminateChild(child, tracked, "SIGKILL");
  }
  if (!(await waitForActiveChildren(3_000))) {
    process.stderr.write("Could not stop every E2E child process\n");
  }
}

function handleSignal(signal) {
  if (receivedSignal) return;
  receivedSignal = signal;
  signalCleanup = stopActiveChildren(signal);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  const handler = () => handleSignal(signal);
  signalHandlers.set(signal, handler);
  process.on(signal, handler);
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = trackChild(
      spawn(command, args, {
        cwd: rootDir,
        env: process.env,
        stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
      })
    );
    let output = "";

    child.stdout?.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr?.on("data", (chunk) => {
      output += chunk;
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve(output.trim());
        return;
      }
      reject(
        new Error(
          `${command} ${args.join(" ")} failed (${signal ?? code})\n${output}`
        )
      );
    });
  });
}

function waitForPort(port, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;

  return new Promise((resolve, reject) => {
    const attempt = () => {
      if (receivedSignal) {
        reject(new Error(`Interrupted by ${receivedSignal}`));
        return;
      }
      const socket = net.createConnection({ host: "127.0.0.1", port });
      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() >= deadline) {
          reject(
            new Error(`MongoDB did not accept connections on port ${port}`)
          );
          return;
        }
        setTimeout(attempt, 200);
      });
    };
    attempt();
  });
}

function assertLocalMongoUri(uri) {
  const parsed = new URL(uri);
  if (
    parsed.protocol !== "mongodb:" ||
    !["127.0.0.1", "localhost"].includes(parsed.hostname)
  ) {
    throw new Error(
      "JSBACKEND_E2E_MONGODB_URI must point to a local MongoDB instance"
    );
  }
}

async function startMongo() {
  if (process.env.JSBACKEND_E2E_MONGODB_URI) {
    assertLocalMongoUri(process.env.JSBACKEND_E2E_MONGODB_URI);
    return process.env.JSBACKEND_E2E_MONGODB_URI;
  }

  mongoContainer = `jsbackend-e2e-${process.pid}-${Math.random()
    .toString(16)
    .slice(2, 8)}`;
  await run("docker", [
    "run",
    "--detach",
    "--rm",
    "--name",
    mongoContainer,
    "--publish",
    "127.0.0.1::27017",
    "mongo:7",
    "--quiet",
  ]);
  if (receivedSignal) throw new Error(`Interrupted by ${receivedSignal}`);

  const binding = await run("docker", ["port", mongoContainer, "27017/tcp"]);
  const port = Number(binding.match(/:(\d+)$/)?.[1]);
  if (!port) {
    throw new Error(`Could not determine MongoDB port from: ${binding}`);
  }

  await waitForPort(port);
  return `mongodb://127.0.0.1:${port}/jsbackend_e2e?directConnection=true`;
}

async function stopMongo() {
  if (!mongoContainer) return;
  try {
    await run("docker", ["rm", "--force", mongoContainer]);
  } catch (error) {
    process.stderr.write(`MongoDB cleanup warning: ${error.message}\n`);
  } finally {
    mongoContainer = undefined;
  }
}

async function main() {
  const mongoUri = await startMongo();
  if (receivedSignal) throw new Error(`Interrupted by ${receivedSignal}`);
  process.env.JSBACKEND_E2E_MONGODB_URI = mongoUri;

  const requestedTargets = new Set(
    process.argv
      .slice(2)
      .map((name) => path.basename(name).replace(/\.test\.mjs$/, ""))
  );
  const knownTargets = new Set(E2E_TARGETS.map(({ name }) => name));
  const unknownTargets = [...requestedTargets].filter(
    (name) => !knownTargets.has(name)
  );
  if (unknownTargets.length > 0) {
    throw new Error(`Unknown E2E targets: ${unknownTargets.join(", ")}`);
  }
  const testFiles = E2E_TARGETS.filter(
    ({ name }) => requestedTargets.size === 0 || requestedTargets.has(name)
  ).map(({ file }) => file);

  if (testFiles.length === 0) {
    throw new Error("No matching chapter E2E tests were found");
  }
  if (receivedSignal) throw new Error(`Interrupted by ${receivedSignal}`);

  const processGroup = process.platform !== "win32";
  const child = trackChild(
    spawn(
      process.execPath,
      [
        "--test",
        "--test-concurrency=1",
        "--test-reporter=spec",
        "--test-timeout=600000",
        ...testFiles,
      ],
      {
        cwd: rootDir,
        detached: processGroup,
        env: process.env,
        stdio: "inherit",
      }
    ),
    processGroup
  );
  const [code, signal] = await once(child, "exit");
  if (code !== 0 && !receivedSignal) {
    throw new Error(`Chapter E2E tests failed (${signal ?? code})`);
  }
}

let failure;
try {
  await main();
} catch (error) {
  failure = error;
} finally {
  await stopMongo();
  if (signalCleanup) await signalCleanup;
}

if (receivedSignal) {
  for (const [signal, handler] of signalHandlers) {
    process.off(signal, handler);
  }
  process.kill(process.pid, receivedSignal);
} else if (failure) {
  throw failure;
}
