#!/usr/bin/env node
// Refuses to let a "file:" dependency (a path that only exists on this
// machine, e.g. kmaterialize's local dev link) reach a commit, a push, or
// CI. This exists because v1.4.0 was tagged and pushed with kmaterialize
// still pinned to file:/Users/.../kmaterialize - CI failed with a
// cryptic ENOENT instead of a clear error, and the broken tag/release
// had to be patched over with v1.4.1.
//
// Usage: node scripts/check-no-local-deps.mjs
// Exits non-zero (and prints exactly what's wrong) if package.json or
// pnpm-lock.yaml reference a file: path anywhere.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const offenders = [];

const pkgPath = path.join(rootDir, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
for (const section of ["dependencies", "devDependencies"]) {
  for (const [name, version] of Object.entries(pkg[section] ?? {})) {
    if (typeof version === "string" && version.startsWith("file:")) {
      offenders.push(`package.json: "${name}": "${version}"`);
    }
  }
}

const lockPath = path.join(rootDir, "pnpm-lock.yaml");
if (existsSync(lockPath)) {
  const lock = readFileSync(lockPath, "utf8");
  for (const line of lock.split("\n")) {
    if (/specifier:\s*file:|version:\s*file:/.test(line)) {
      offenders.push(`pnpm-lock.yaml: ${line.trim()}`);
    }
  }
}

if (offenders.length > 0) {
  console.error("\n✖ Found a local file: dependency - this must never be committed/tagged/deployed:\n");
  offenders.forEach((o) => console.error(`  ${o}`));
  console.error(
    "\nRun `node scripts/link-kmaterialize.mjs latest` (or `npm run build`, which does it " +
    "for you) to switch back to the published version before committing.\n"
  );
  process.exit(1);
}

console.log("✓ No local file: dependencies found.");
