## Requirements

This project uses pnpm with workspaces. So pnpm [should be installed](https://pnpm.io/installation).

## Project generation

This project has been generated from with a `$ pnpm create vite` command and selecting the vanilla-ts project.

The site depends on [Kmaterialize](https://github.com/kekefreedog/kmaterialize) as a regular npm package
(`"kmaterialize": "latest"` in `package.json`), so `pnpm install` always pulls whatever is currently
published on npm — no extra step needed to get the newest library release.

[Kmaterialize](https://github.com/kekefreedog/kmaterialize) is *also* checked out as a git submodule in
`packages/materialize` and declared as a [pnpm workspace](https://pnpm.io/workspaces) project, but that's
optional and only matters if you want to develop the library itself alongside the docs (see below) — the
docs site's own build never reads from that folder.

Typescript has been configured to treat all projects in /packages folder as typescript packages.

head, navbar and footer in all html pages has been defined using [vite-plugin-handlebars](https://github.com/alexlafroscia/vite-plugin-handlebars).

## Instructions to develop

```
git clone https://github.com/kekefreedog/kmaterialize-docs.git
cd kmaterialize-docs
pnpm install
pnpm dev
```

`pnpm dev` (and `npm run dev`, if pnpm isn't on your PATH — see `scripts/link-kmaterialize.mjs`) automatically
points `kmaterialize` at `file:/Users/kzarshenas/Sites/CrazyProject/kmaterialize` on disk before starting Vite,
so edits to the library show up immediately without a publish/`pnpm update` round trip. It always re-syncs a
fresh copy into `node_modules/kmaterialize` too (pnpm's store otherwise caches a local `file:` dependency and
won't notice source edits on its own).

This means **`package.json`/`pnpm-lock.yaml` will show `kmaterialize` pinned to that local path while you're
developing** — that's expected and fine locally, but it must never reach a commit (see next section).

### Building — and the one rule that actually matters here

```
pnpm build
pnpm preview
```

`pnpm build` switches `kmaterialize` back to the published `"latest"` npm version *first*, so the shipped
site never depends on a path that only exists on a dev machine. It also force-refreshes the resolution
(`pnpm update kmaterialize --latest`), not just a plain reinstall — pnpm otherwise happily reuses a
stale resolved version from the lockfile even when a newer release exists on npm.

**Golden rule: never `git commit` right after `pnpm dev`.** A local `file:` dependency that leaks into a
commit — and worse, into a tagged release — breaks CI outright (a path that doesn't exist on the runner).
This happened once (`v1.4.0`, patched by `v1.4.1`). To make that structurally hard to repeat:

- `pnpm build` itself refuses to proceed (`scripts/check-no-local-deps.mjs`) if a `file:` dependency is
  still present anywhere in `package.json`/`pnpm-lock.yaml`, right after switching to `"latest"` and before
  compiling anything.
- A pre-commit hook runs the same check and blocks the commit. It activates automatically the first time
  you `pnpm install` (via the `prepare` script), or manually: `git config core.hooksPath .githooks`.
- The `Deploy` workflow (`.github/workflows/deploy.yml`) runs the same check again as its very first step,
  before `pnpm install` even runs — so even a hook bypassed with `--no-verify` still can't reach deploy.

If any of these ever fires, just run `node scripts/link-kmaterialize.mjs latest` (or `pnpm build`, which
does it for you) before retrying.

## Deployment

Pushing to `main` does **not** deploy by itself. Publishing a GitHub Release (or running the `Deploy`
workflow manually from the Actions tab) builds the site and `rsync`s it over SSH to the host. That
workflow (`.github/workflows/deploy.yml`) expects these repo secrets to already be set:

- `DEPLOY_SSH_KEY` — private key authorized on the target server
- `DEPLOY_SSH_HOST`, `DEPLOY_SSH_PORT`, `DEPLOY_SSH_USER` — connection details
- `DEPLOY_PATH` — absolute path on the server to sync `build/` into

### New Release (for Maintainers)

The docs should be kept in the core repo as markdown files for quick editing. This repo should then
collect all the markdown files from the core repo and compile them into a collection of nice html files,
The versions are managed in docs/version/ to keep different versions. The workflow was removed for now.

This has to be done after release process of the [core repo](https://github.com/kekefreedog/kmaterialize) and releasing on npm

- Update version string in **src/public/info**, **src/getting-started.html**, **partials/navbar.html**
- Run docs locally and check manually with `pnpm dev` & `pnpm build`
- run `node release.js` to create new version
- goto docs folder and run locally via `npx http-server -c-1 -p 8080` and test in browser
- Make PR into main
- Publish a GitHub Release to deploy (see Deployment above)
- Spread news via social media channels
