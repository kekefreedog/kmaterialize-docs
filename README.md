# Kmaterialize documentation

Documentation, live examples, and optional integrations for [Kmaterialize](https://github.com/kekefreedog/kmaterialize). Pages use Vite, TypeScript, Sass, and Handlebars partials.

## Requirements

- Node.js 22 (the version used by deployment).
- Corepack and the pnpm version declared in `package.json`.
- Git.

## Build the docs

```sh
git clone https://github.com/kekefreedog/kmaterialize-docs.git
cd kmaterialize-docs
corepack pnpm install --frozen-lockfile
corepack pnpm build
corepack pnpm preview
```

Open the preview URL printed in the terminal. The generated website is in `build/`.

`pnpm build` first updates Kmaterialize to the latest published npm release, then checks for local dependency paths, runs TypeScript checks, and builds every documentation page with Vite. It requires registry access and can update `package.json` and `pnpm-lock.yaml`; review and commit those changes when preparing a release.

To build exactly the dependency versions already recorded in the lockfile, without refreshing Kmaterialize:

```sh
corepack pnpm install --frozen-lockfile
node scripts/check-no-local-deps.mjs
corepack pnpm exec tsc --noEmit
corepack pnpm exec vite build
corepack pnpm preview
```

## Develop with the local library

`pnpm dev` links the sibling `../kmaterialize` checkout before starting Vite. To use a different checkout, set `KMATERIALIZE_PATH` to its absolute path. Library TypeScript and Sass changes are watched directly.

```sh
git clone https://github.com/kekefreedog/kmaterialize.git ../kmaterialize
corepack pnpm dev
```

If no local checkout exists, `pnpm dev` uses the published library instead.

Local development changes the library dependency to a `file:` path. Before committing or tagging, run `pnpm build` to restore the published dependency. The pre-commit hook and deployment workflow reject local dependency paths.

## Where to edit

- `src/*.html`: documentation pages and examples.
- `partials/`: shared header, sidebar, and footer.
- `config.materialize.js`: navigation and page metadata.
- `src/style.scss`: shared styles and enhancement imports.
- `src/components/`: reusable extensions demonstrated by the docs.
- `src/*-demo.ts` and `src/*-demo.scss`: page-specific examples.

## Publish a docs release

1. Publish the Kmaterialize tag first and wait for its **Publish to npm** workflow to succeed.
2. Run `pnpm build` in this repository so the docs consume the new npm release.
3. Check the preview, review the dependency changes, and commit the documentation changes.
4. Push the commit and a new, unused `v`-prefixed docs tag to `kekefreedog/kmaterialize-docs`.
5. Wait for the **Deploy** workflow to succeed.

A `v*` tag push triggers deployment. Publishing a GitHub Release also triggers deployment, so doing both starts two runs. A push to `main` alone does not deploy. Maintainers can also run **Deploy** manually from GitHub Actions.

Deployment builds `build/` and uploads it using rsync over SSH. It requires these repository secrets: `DEPLOY_SSH_KEY`, `DEPLOY_SSH_HOST`, `DEPLOY_SSH_PORT`, `DEPLOY_SSH_USER`, and `DEPLOY_PATH`.

### Library features and documentation

Reusable component code and styling belong to the sibling `kmaterialize` package.
This repository contains documentation, example data, and demo event handlers.
Do not add reusable implementations under `src/components` or `src/enhancement`.
The production build checks that the installed package exports the documented
features; publish the matching library release before deploying these docs.

Crazy button is documented at `crazy-button.html` under **Web components**.
It uses the library's `CrazyButton` and `Kmcomponent` exports and registers
`crazy-button` plus the compatible `regular-btn` alias. Spreadsheet enhancements
are available through `kmaterialize/sass/enhancement/spreadsheet.scss`; Tippy's
optional adapter is available through `kmaterialize/tippy`.
