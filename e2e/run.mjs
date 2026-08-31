import { spawn } from "node:child_process";
import { once } from "node:events";
import { readdir } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const REQUIRED_NODE_VERSION = "v24.20.0";
const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
let mongoContainer;

if (process.version !== REQUIRED_NODE_VERSION) {
  throw new Error(
    `E2E tests require Node.js ${REQUIRED_NODE_VERSION.slice(1)}; running ${
      process.version
    }`
  );
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      env: process.env,
      stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
    });
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
  process.env.JSBACKEND_E2E_MONGODB_URI = mongoUri;

  const requestedChapters = new Set(
    process.argv.slice(2).map((name) => name.replace(/\.test\.mjs$/, ""))
  );
  const testFiles = (await readdir(path.join(rootDir, "e2e")))
    .filter((name) => /^chapter\d+\.test\.mjs$/.test(name))
    .filter(
      (name) =>
        requestedChapters.size === 0 ||
        requestedChapters.has(name.replace(/\.test\.mjs$/, ""))
    )
    .sort((left, right) =>
      left.localeCompare(right, undefined, { numeric: true })
    )
    .map((name) => path.join("e2e", name));

  if (testFiles.length === 0) {
    throw new Error("No matching chapter E2E tests were found");
  }

  const child = spawn(
    process.execPath,
    ["--test", "--test-concurrency=1", "--test-reporter=spec", ...testFiles],
    {
      cwd: rootDir,
      env: process.env,
      stdio: "inherit",
    }
  );
  const [code, signal] = await once(child, "exit");
  if (code !== 0) {
    throw new Error(`Chapter E2E tests failed (${signal ?? code})`);
  }
}

try {
  await main();
} finally {
  await stopMongo();
}
