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

if (!alreadyLinked) {
  pkg.dependencies.kmaterialize = target;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

console.log(`kmaterialize -> ${target}`);

if (mode === "latest") {
  // A plain `pnpm install` reuses whatever version is already resolved in
  // pnpm-lock.yaml for the "latest" specifier - it does NOT re-check the
  // npm registry just because the "latest" dist-tag moved on to a newer
  // publish (confirmed: a build shipped a week-old version this way even
  // though package.json said "latest" the whole time). `pnpm update
  // --latest` is what actually re-resolves the dist-tag - but it also
  // rewrites package.json's specifier to the exact pinned version as a
  // side effect, so put "latest" back afterwards.
  execSync("corepack pnpm update kmaterialize --latest", { stdio: "inherit", cwd: rootDir });
  const pkgAfterUpdate = JSON.parse(readFileSync(pkgPath, "utf8"));
  if (pkgAfterUpdate.dependencies.kmaterialize !== "latest") {
    pkgAfterUpdate.dependencies.kmaterialize = "latest";
    writeFileSync(pkgPath, JSON.stringify(pkgAfterUpdate, null, 2) + "\n");
    execSync("corepack pnpm install", { stdio: "inherit", cwd: rootDir });
  }
} else {
  execSync("corepack pnpm install", { stdio: "inherit", cwd: rootDir });
}

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
