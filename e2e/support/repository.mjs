import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

export const REQUIRED_NODE_VERSION = `v${(
  await readFile(path.join(REPOSITORY_ROOT, ".node-version"), "utf8")
).trim()}`;

const SKIPPED_DIRECTORIES = new Set([
  ".codebase-memory",
  ".git",
  ".yarn",
  "coverage",
  "dist",
  "node_modules",
]);

export const REQUIRED_CHAPTERS = [
  "chapter0",
  "chapter2",
  "chapter3",
  "chapter4",
  "chapter5",
  "chapter6",
  "chapter7",
  "chapter8",
  "chapter9",
  "chapter10",
  "chapter11",
  "chapter12",
  "chapter13",
];

export const E2E_TARGETS = [
  { name: "support", file: "e2e/support/process.test.mjs" },
  ...REQUIRED_CHAPTERS.map((name) => ({
    name,
    file: `e2e/${name}.test.mjs`,
  })),
  { name: "bookmark", file: "e2e/bookmark.test.mjs" },
  { name: "nodejs20", file: "e2e/nodejs20.test.mjs" },
];

export async function findRepositoryFiles(rootDir, predicate) {
  const files = [];

  async function walk(directory, relativeDirectory = "") {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && SKIPPED_DIRECTORIES.has(entry.name)) continue;
      const relativePath = path.join(relativeDirectory, entry.name);
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath, relativePath);
      } else if (entry.isFile() && predicate(relativePath)) {
        files.push(relativePath);
      }
    }
  }

  await walk(rootDir);
  return files.sort((left, right) => left.localeCompare(right));
}
