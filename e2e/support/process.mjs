import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import net from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const ROOT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

const npmCli =
  process.env.npm_execpath ??
  path.join(
    path.dirname(path.dirname(process.execPath)),
    "lib/node_modules/npm/bin/npm-cli.js"
  );

function mergedEnv(env = {}) {
  return { ...process.env, ...env };
}

function appendOutput(state, chunk) {
  state.output += chunk.toString();
  if (state.output.length > 200_000) {
    state.output = state.output.slice(-200_000);
  }
}

function terminate(child, signal = "SIGTERM") {
  if (!child.pid || child.exitCode !== null) return;
  try {
    if (process.platform === "win32") child.kill(signal);
    else process.kill(-child.pid, signal);
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}

export function startProcess(command, args = [], options = {}) {
  const state = { output: "" };
  const child = spawn(command, args, {
    cwd: options.cwd ?? ROOT_DIR,
    env: mergedEnv(options.env),
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (chunk) => appendOutput(state, chunk));
  child.stderr.on("data", (chunk) => appendOutput(state, chunk));

  const exited = once(child, "exit").then(([code, signal]) => ({
    code,
    signal,
  }));

  return {
    child,
    get output() {
      return state.output;
    },
    get hasExited() {
      return child.exitCode !== null || child.signalCode !== null;
    },
    async stop() {
      if (child.exitCode === null && child.signalCode === null) {
        terminate(child);
        const forced = setTimeout(() => terminate(child, "SIGKILL"), 3_000);
        forced.unref();
        await exited;
        clearTimeout(forced);
      }
    },
    exited,
  };
}

export async function runProcess(command, args = [], options = {}) {
  const server = startProcess(command, args, options);
  const timeoutMs = options.timeoutMs ?? 30_000;
  const timeout = setTimeout(
    () => terminate(server.child, "SIGKILL"),
    timeoutMs
  );
  timeout.unref();
  const { code, signal } = await server.exited;
  clearTimeout(timeout);

  if (code !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed (${signal ?? code})\n${
        server.output
      }`
    );
  }
  return server.output;
}

export function startNode(script, args = [], options = {}) {
  const cwd = options.cwd ?? ROOT_DIR;
  const target = path.isAbsolute(script) ? script : path.resolve(cwd, script);
  return startProcess(process.execPath, [target, ...args], { ...options, cwd });
}

export function runNode(script, args = [], options = {}) {
  const cwd = options.cwd ?? ROOT_DIR;
  const target = path.isAbsolute(script) ? script : path.resolve(cwd, script);
  return runProcess(process.execPath, [target, ...args], { ...options, cwd });
}

export function startNpm(args, options = {}) {
  return startProcess(process.execPath, [npmCli, ...args], options);
}

export function runNpm(args, options = {}) {
  return runProcess(process.execPath, [npmCli, ...args], {
    timeoutMs: 120_000,
    ...options,
  });
}

export async function buildNest(cwd) {
  await runNpm(["run", "build"], { cwd, timeoutMs: 120_000 });
}

export function chapterPath(chapter, ...parts) {
  return path.join(ROOT_DIR, chapter, ...parts);
}

export function mongoEnv(extra = {}) {
  const mongoUri = process.env.JSBACKEND_E2E_MONGODB_URI;
  assert.ok(mongoUri, "The E2E runner must provide a local MongoDB URI");
  const preload = path.join(ROOT_DIR, "e2e/support/redirect-mongo.cjs");
  const nodeOptions = [process.env.NODE_OPTIONS, `--require=${preload}`]
    .filter(Boolean)
    .join(" ");
  return {
    ...extra,
    JSBACKEND_E2E_MONGODB_URI: mongoUri,
    NODE_OPTIONS: nodeOptions,
  };
}

export async function waitForOutput(server, pattern, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (pattern.test(server.output)) return;
    if (server.hasExited) {
      throw new Error(
        `Process exited before producing ${pattern}\n${server.output}`
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for ${pattern}\n${server.output}`);
}

export async function waitForPort(port, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      await new Promise((resolve, reject) => {
        const socket = net.createConnection({ host: "127.0.0.1", port });
        socket.once("connect", () => {
          socket.destroy();
          resolve();
        });
        socket.once("error", (error) => {
          socket.destroy();
          reject(error);
        });
      });
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  throw new Error(`Timed out waiting for port ${port}: ${lastError?.message}`);
}

export async function waitForHttp(url, options = {}) {
  const deadline = Date.now() + (options.timeoutMs ?? 30_000);
  const statuses = options.statuses ?? [200];
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, options.fetchOptions);
      await response.body?.cancel();
      if (statuses.includes(response.status)) return;
      lastError = new Error(`Unexpected readiness status ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(
    `Timed out waiting for ${url}: ${lastError?.message ?? "unknown error"}`
  );
}

export async function eventually(operation, options = {}) {
  const deadline = Date.now() + (options.timeoutMs ?? 20_000);
  let lastError;
  while (Date.now() < deadline) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw lastError ?? new Error("Timed out waiting for operation");
}

export async function jsonRequest(url, options = {}, expectedStatus = 200) {
  const response = await fetch(url, options);
  const text = await response.text();
  assert.equal(
    response.status,
    expectedStatus,
    `${options.method ?? "GET"} ${url}: ${text}`
  );
  return text ? JSON.parse(text) : undefined;
}

export async function createTempDir(prefix) {
  const directory = await mkdtemp(path.join(tmpdir(), prefix));
  return {
    directory,
    async cleanup() {
      await rm(directory, { recursive: true, force: true });
    },
  };
}
