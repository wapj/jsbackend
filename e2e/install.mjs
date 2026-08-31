import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  REQUIRED_NODE_VERSION,
  findRepositoryFiles,
} from "./support/repository.mjs";

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

if (process.version !== REQUIRED_NODE_VERSION) {
  throw new Error(
    `E2E dependency installation requires Node.js ${REQUIRED_NODE_VERSION.slice(
      1
    )}; running ${process.version}`
  );
}

const packageDirectories = (
  await findRepositoryFiles(
    rootDir,
    (relativePath) => path.basename(relativePath) === "package-lock.json"
  )
)
  .filter((relativePath) => relativePath !== "package-lock.json")
  .map((relativePath) => path.dirname(relativePath));

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
