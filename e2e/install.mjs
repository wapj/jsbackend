import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const REQUIRED_NODE_VERSION = "v24.20.0";
const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const npmCli =
  process.env.npm_execpath ??
  path.join(
    path.dirname(path.dirname(process.execPath)),
    "lib/node_modules/npm/bin/npm-cli.js"
  );

const packageDirectories = [
  "chapter6/test-mongoose",
  "chapter6/try-mongo",
  "chapter7/board",
  "chapter7/board-tailwind",
  "chapter8/blog-file",
  "chapter8/blog-memory",
  "chapter8/blog-mongodb",
  "chapter8/hello-nestjs",
  "chapter8/hello-nestjs-javascript",
  "chapter9/config-test",
  "chapter9/weather_api_test",
  "chapter10/nest-auth-test",
  "chapter11/nest-auth-test",
  "chapter12/nest-file-upload",
  "chapter13/echo-websocket",
  "chapter13/nest-chat",
  "chapter13/simple-nest-chat",
];

if (process.version !== REQUIRED_NODE_VERSION) {
  throw new Error(
    `E2E dependency installation requires Node.js ${REQUIRED_NODE_VERSION.slice(
      1
    )}; running ${process.version}`
  );
}

function npmCi(directory) {
  return new Promise((resolve, reject) => {
    process.stdout.write(`Installing ${directory}\n`);
    const child = spawn(
      process.execPath,
      [npmCli, "ci", "--no-audit", "--no-fund"],
      {
        cwd: path.join(rootDir, directory),
        env: process.env,
        stdio: "inherit",
      }
    );
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else
        reject(new Error(`npm ci failed for ${directory} (${signal ?? code})`));
    });
  });
}

for (const directory of packageDirectories) {
  await npmCi(directory);
}
