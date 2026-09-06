#!/usr/bin/env node
// Switches the "kmaterialize" dependency between a local file: link (for
// `pnpm dev`, so fixes to the library show up immediately without a
// tag/publish/pnpm-update round trip) and the published "latest" npm
// version (for `pnpm build`, so the actual shipped site never depends on
// a path that only exists on this machine).
//
// Usage: node scripts/link-kmaterialize.mjs <local|latest>

import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const LOCAL_KMATERIALIZE_PATH = "/Users/kzarshenas/Sites/CrazyProject/kmaterialize";

const mode = process.argv[2];
if (mode !== "local" && mode !== "latest") {
  console.error('Usage: node scripts/link-kmaterialize.mjs <local|latest>');
  process.exit(1);
}

const target = mode === "local" ? `file:${LOCAL_KMATERIALIZE_PATH}` : "latest";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkgPath = path.join(rootDir, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const alreadyLinked = pkg.dependencies.kmaterialize === target;

// node-linker=hoisted (needed for kmaterialize's sass imports to resolve)
// makes pnpm COPY file: dependencies instead of symlinking them, so a
// stale copy would otherwise persist across edits to the library source.
// Always reinstall in local mode to pick those up; skip in latest mode
// since re-hitting the registry on every build for something that never
// changed locally is just wasted time.
if (alreadyLinked && mode === "latest") {
  console.log(`kmaterialize already linked to "${target}", skipping reinstall.`);
  process.exit(0);
}

if (!alreadyLinked) {
  pkg.dependencies.kmaterialize = target;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

console.log(`kmaterialize -> ${target}`);
execSync("corepack pnpm install", { stdio: "inherit", cwd: rootDir });

// pnpm's content-addressable store caches a "file:" directory dependency
// the first time it's packed, and does NOT reliably notice source edits
// afterwards - not on a plain reinstall, not even with `pnpm install
// --force` (confirmed: only `pnpm store prune` busted it). So for local
// dev, bypass that cache entirely: overwrite node_modules/kmaterialize
// with a straight, fresh copy of the source directory every time.
if (mode === "local") {
  const nodeModulesTarget = path.join(rootDir, "node_modules", "kmaterialize");
  console.log(`Refreshing ${nodeModulesTarget} from source (bypassing pnpm's store cache)...`);
  execSync(
    `rsync -a --delete --exclude node_modules --exclude .git "${LOCAL_KMATERIALIZE_PATH}/" "${nodeModulesTarget}/"`,
    { stdio: "inherit" }
  );
}
