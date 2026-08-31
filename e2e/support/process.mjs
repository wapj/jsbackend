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

const activeProcesses = new Set();
const signalHandlers = new Map();
let handlingSignal = false;

const npmCli =
  process.env.npm_execpath ??
  path.join(
    path.dirname(path.dirname(process.execPath)),
    "lib/node_modules/npm/bin/npm-cli.js"
  );

function mergedEnv(env = {}) {
  const merged = { ...process.env };
  for (const [name, value] of Object.entries(env)) {
    if (value === undefined) delete merged[name];
    else merged[name] = value;
  }
  return merged;
}

function appendOutput(state, chunk) {
  state.output += chunk.toString();
  if (state.output.length > 200_000) {
    state.output = state.output.slice(-200_000);
  }
}

function terminate(child, signal = "SIGTERM") {
  if (!child.pid) return;
  try {
    if (process.platform === "win32") {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill(signal);
      }
    } else process.kill(-child.pid, signal);
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}

function processTargetExists(child) {
  if (!child.pid) return false;
  if (process.platform === "win32") {
    return child.exitCode === null && child.signalCode === null;
  }
  try {
    process.kill(-child.pid, 0);
    return true;
  } catch (error) {
    if (error.code === "ESRCH") return false;
    if (error.code === "EPERM") return true;
    throw error;
  }
}

async function waitForProcessTargetExit(child, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (processTargetExists(child) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  return !processTargetExists(child);
}

function processExitedError(server, description) {
  return new Error(
    `Process exited before ${description} (${
      server.child.signalCode ?? server.child.exitCode ?? "unknown"
    })\n${server.output}`
  );
}

function assertProcessRunning(server, description) {
  if (server.hasExited) throw processExitedError(server, description);
}

async function assertProcessRemainsRunning(
  server,
  description,
  durationMs = 100
) {
  const stillRunning = Symbol("still-running");
  let timeout;
  try {
    const result = await Promise.race([
      server.exited,
      new Promise((resolve) => {
        timeout = setTimeout(() => resolve(stillRunning), durationMs);
      }),
    ]);
    if (result !== stillRunning) {
      throw processExitedError(server, description);
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function stopActiveProcesses() {
  await Promise.allSettled([...activeProcesses].map((server) => server.stop()));
}

async function handleSignal(signal) {
  if (handlingSignal) return;
  handlingSignal = true;
  await stopActiveProcesses();
  process.off(signal, signalHandlers.get(signal));
  process.kill(process.pid, signal);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  const handler = () => {
    void handleSignal(signal);
  };
  signalHandlers.set(signal, handler);
  process.on(signal, handler);
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

  const stopTimeoutMs = options.stopTimeoutMs ?? 3_000;
  let stopping;
  const server = {
    child,
    get output() {
      return state.output;
    },
    get hasExited() {
      return child.exitCode !== null || child.signalCode !== null;
    },
    async stop() {
      if (stopping) return stopping;
      stopping = (async () => {
        try {
          if (!processTargetExists(child)) return;
          terminate(child);
          if (!(await waitForProcessTargetExit(child, stopTimeoutMs))) {
            terminate(child, "SIGKILL");
            if (!(await waitForProcessTargetExit(child, 3_000))) {
              throw new Error(
                `Could not stop process group ${child.pid}\n${server.output}`
              );
            }
          }
          if (!server.hasExited) await exited;
        } finally {
          activeProcesses.delete(server);
        }
      })();
      return stopping;
    },
    exited,
  };
  activeProcesses.add(server);
  exited.then(
    () => {
      if (!processTargetExists(child)) activeProcesses.delete(server);
    },
    () => {
      if (!processTargetExists(child)) activeProcesses.delete(server);
    }
  );
  return server;
}

export async function runProcess(command, args = [], options = {}) {
  const server = startProcess(command, args, options);
  const timeoutMs = options.timeoutMs ?? 30_000;
  const timeout = setTimeout(
    () => terminate(server.child, "SIGKILL"),
    timeoutMs
  );
  timeout.unref();
  let result;
  try {
    result = await server.exited;
  } finally {
    clearTimeout(timeout);
    await server.stop();
  }
  const { code, signal } = result;

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
  if (process.env.JSBACKEND_E2E_SKIP_BUILD === "1") return;
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

export async function waitForPort(server, port, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    assertProcessRunning(server, `listening on port ${port}`);
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
      await assertProcessRemainsRunning(server, `listening on port ${port}`);
      return;
    } catch (error) {
      assertProcessRunning(server, `listening on port ${port}`);
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  throw new Error(`Timed out waiting for port ${port}: ${lastError?.message}`);
}

export async function waitForHttp(
  serverOrUrl,
  urlOrOptions = {},
  maybeOptions = {}
) {
  const hasServer = typeof serverOrUrl !== "string";
  const server = hasServer ? serverOrUrl : undefined;
  const url = hasServer ? urlOrOptions : serverOrUrl;
  const options = hasServer ? maybeOptions : urlOrOptions;
  const deadline = Date.now() + (options.timeoutMs ?? 30_000);
  const statuses = options.statuses ?? [200];
  let lastError;

  while (Date.now() < deadline) {
    if (server) assertProcessRunning(server, `serving ${url}`);
    try {
      const response = await fetch(url, options.fetchOptions);
      await response.body?.cancel();
      if (statuses.includes(response.status)) {
        if (server) {
          await assertProcessRemainsRunning(server, `serving ${url}`);
        }
        return;
      }
      lastError = new Error(`Unexpected readiness status ${response.status}`);
    } catch (error) {
      if (server) assertProcessRunning(server, `serving ${url}`);
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
