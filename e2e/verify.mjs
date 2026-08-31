import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { runNpm, runProcess } from "./support/process.mjs";
import {
  E2E_TARGETS,
  REQUIRED_CHAPTERS,
  REQUIRED_NODE_VERSION,
  findRepositoryFiles,
} from "./support/repository.mjs";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

assert.equal(
  process.version,
  REQUIRED_NODE_VERSION,
  `Repository verification requires Node.js ${REQUIRED_NODE_VERSION.slice(1)}`
);

const rootManifest = JSON.parse(
  await readFile(path.join(rootDir, "package.json"), "utf8")
);
assert.equal(
  rootManifest.engines?.node,
  REQUIRED_NODE_VERSION.slice(1),
  "package.json and .node-version must require the same Node.js version"
);

const actualChapters = (await readdir(rootDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && /^chapter\d+$/.test(entry.name))
  .map((entry) => entry.name)
  .sort((left, right) =>
    left.localeCompare(right, undefined, { numeric: true })
  );
assert.deepEqual(
  actualChapters,
  REQUIRED_CHAPTERS,
  "Every chapter directory must have an explicit E2E target"
);

for (const { file } of E2E_TARGETS) {
  await access(path.join(rootDir, file));
}

const lockFiles = await findRepositoryFiles(
  rootDir,
  (relativePath) => path.basename(relativePath) === "package-lock.json"
);
const packageDirectories = lockFiles.map((relativePath) =>
  path.dirname(relativePath)
);
for (const directory of packageDirectories) {
  await access(path.join(rootDir, directory, "package.json"));
}

const javaScriptFiles = await findRepositoryFiles(rootDir, (relativePath) =>
  /\.(?:c|m)?js$/.test(relativePath)
);
for (const relativePath of javaScriptFiles) {
  await runProcess(process.execPath, ["--check", relativePath], {
    cwd: rootDir,
  });
}

const buildDirectories = [];
const typecheckDirectories = [];
for (const directory of packageDirectories.filter(
  (directory) => directory !== "."
)) {
  const manifest = JSON.parse(
    await readFile(path.join(rootDir, directory, "package.json"), "utf8")
  );
  if (manifest.scripts?.build) buildDirectories.push(directory);
  if (manifest.scripts?.typecheck) typecheckDirectories.push(directory);
}
for (const directory of buildDirectories) {
  process.stdout.write(`Building ${directory}\n`);
  await runNpm(["run", "build"], {
    cwd: path.join(rootDir, directory),
    timeoutMs: 180_000,
  });
}
for (const directory of typecheckDirectories) {
  process.stdout.write(`Type-checking ${directory}\n`);
  await runNpm(["run", "typecheck"], {
    cwd: path.join(rootDir, directory),
    timeoutMs: 120_000,
  });
}

await runProcess(
  process.execPath,
  [
    path.join(rootDir, "appendix-typescript/node_modules/typescript/bin/tsc"),
    "--noEmit",
  ],
  { cwd: path.join(rootDir, "appendix-typescript"), timeoutMs: 120_000 }
);

process.stdout.write(
  `Verified ${javaScriptFiles.length} JavaScript files, ${buildDirectories.length} builds, ` +
    `${typecheckDirectories.length + 1} type checks, ${
      packageDirectories.length
    } lockfile packages, ` +
    `and ${E2E_TARGETS.length} E2E targets.\n`
);
