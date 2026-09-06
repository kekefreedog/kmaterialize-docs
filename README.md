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

`pnpm install` resolves `kmaterialize` from npm, so that's all you need to just work on the docs site.

### Developing against a local copy of the library

If you're also changing the library itself and want those changes reflected immediately in the docs:

```
git submodule init
git submodule update
```

Then point `package.json`'s `kmaterialize` dependency at `"workspace:*"` instead of `"latest"`, and add
back the `kmaterialize`/`kmaterialize/sass` aliases in `vite.config.js` pointing at
`packages/materialize/src` and `packages/materialize/sass` — this makes edits in `packages/materialize`
show up instantly in the browser. Remember to revert both before merging, since the deployed site expects
the published npm package.

Also browser debugging displays the files exactly as they are in the source.

Note: when a new page is selected it takes some time to render completely the page. This not happens in the build version.

## Instructions to build site

```
pnpm build
pnpm preview
```

`pnpm build` always builds against whatever `kmaterialize` version `pnpm install` last resolved from npm —
if the library published a new release and you want it reflected, run `pnpm install` again first (a plain
`pnpm update kmaterialize` also works, but rewrites the `"latest"` specifier in package.json to the exact
resolved version, so change it back to `"latest"` afterwards if you do that).

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
