import { globSync } from "glob";
import path, { resolve } from "path";
import fs from "node:fs";
import handlebars from "vite-plugin-handlebars";
import { fileURLToPath } from "node:url";
import { config } from "./config.materialize";

let currentRoute = "";

// Maps a small set of file extensions to a Content-Type header. The version
// snapshots only ever contain the kinds of files a built docs page ships with.
const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const localKmaterializeRoot = resolve(process.env.KMATERIALIZE_PATH || resolve(__dirname, "../kmaterialize"));
const hasLocalKmaterialize = fs.existsSync(resolve(localKmaterializeRoot, "src/index.ts"));

// `/version/<x.y.z>/...` pages are static snapshots produced by release.js
// after each build (see docs/version/*). They only exist as pre-built HTML,
// so `vite dev` has no route for them and falls back to serving the current
// index.html instead - breaking every relative asset (images, css, js) on
// the page, since they then resolve one directory level too deep.
// This middleware serves docs/version/* directly, the same way the
// deployed static site does, so version pages behave the same in dev.
//
// The built page's own bundle is referenced with root-absolute paths
// (e.g. "/assets/main-xxxx.js", and in turn that CSS's own
// "/assets/some-font.woff2"), which don't carry the version anywhere in
// their URL. For those, we fall back to the Referer header to figure out
// which snapshot they belong to. A single lookup at the immediate parent
// isn't enough though - browsers set Referer to the *stylesheet's* URL for
// resources a stylesheet pulls in (fonts, background images), not to the
// original page - so `servedVersionByUrl` remembers, for every URL we've
// served out of a version snapshot, which version it came from. That lets
// a referer chain of any depth (page -> css -> font) resolve correctly.
function serveVersionSnapshotsPlugin() {
  const versionsRoot = resolve(__dirname, "docs/version");
  const servedVersionByUrl = new Map();

  return {
    name: "serve-version-snapshots",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!fs.existsSync(versionsRoot)) return next();

        const urlPath = decodeURIComponent(req.url.split("?")[0]);
        let version;
        let restPath;

        if (urlPath.startsWith("/version/")) {
          const rest = urlPath.slice("/version/".length); // e.g. "v2.2.2/images/x.svg"
          const slashIndex = rest.indexOf("/");
          version = slashIndex === -1 ? rest : rest.slice(0, slashIndex);
          restPath = slashIndex === -1 ? "/" : rest.slice(slashIndex);
        } else if (req.headers.referer) {
          const refererPath = new URL(req.headers.referer).pathname;
          const refererMatch = refererPath.match(/^\/version\/([^/]+)\//);
          version = refererMatch ? refererMatch[1] : servedVersionByUrl.get(refererPath);
          if (version) restPath = urlPath;
        }

        if (!version) return next();

        const versionDir = path.join(versionsRoot, version);
        const candidates = restPath.endsWith("/")
          ? [path.join(versionDir, restPath, "index.html")]
          : [path.join(versionDir, restPath), path.join(versionDir, restPath, "index.html")];

        const filePath = candidates.find((candidate) => {
          try {
            return fs.statSync(candidate).isFile();
          } catch {
            return false;
          }
        });

        if (!filePath) return next();

        servedVersionByUrl.set(urlPath, version);
        res.setHeader("Content-Type", MIME_TYPES[path.extname(filePath)] || "application/octet-stream");
        fs.createReadStream(filePath).pipe(res);
      });
    },
  };
}

function getMenuItem(item) {
  // Has kids?
  if (item.items) {
    // Keep the section order from config.materialize.js, but make the pages
    // inside each section easier to scan. Sorting a copy avoids mutating the
    // shared navigation config used by search and page generation.
    const sortedItems = [...item.items].sort((a, b) => {
      const pageName = (menuItem) => {
        const page = menuItem.id ? config.pages.find((candidate) => candidate.id === menuItem.id) : undefined;
        return (page?.name || menuItem.name || "").trim();
      };
      return pageName(a).localeCompare(pageName(b), undefined, { sensitivity: "base" });
    });

    // active kids?
    const kidsIds = item.items.map((el) => el.id);
    const kidsPages = config.pages.filter((page) => kidsIds.includes(page.id));
    const hasActiveKid = kidsPages.some((kid) => currentRoute === "/" + kid.url);

    const activeClass = hasActiveKid ? "active" : "";
    return `<li>
      <ul class="collapsible collapsible-accordion">
        <li class="${activeClass}">
          <a class="collapsible-header waves-effect">
          ${item.icon ? `<span class="material-icons">${item.icon}</span>` : ""}
          ${item.name || ""}
          </a>
          <div class="collapsible-body">
            <ul>
              ${sortedItems.map((itm) => getMenuItem(itm)).join("")}
            </ul>
          </div>
        </li>
      </ul>
    </li>`;
  }

  // Merge
  let page = {};
  if (item.id) {
    page = config.pages.find((page) => page.id === item.id);
  }
  const merged = { ...page, ...item };

  // active
  const isActive = currentRoute === "/" + merged.url;
  const activeClass = isActive ? "active" : "";
  return `<li class="${activeClass}">
    <a href="${merged.url || "#"}">
    ${merged.icon ? `<span class="material-icons">${merged.icon}</span>` : ""}
    ${merged.name || "?"}</a>
  </li>`;
}

export default ({ command }) => ({
  root: "./src",
  css: {
    preprocessorOptions: {
      scss: {
        // Vite 4 still invokes Sass through its legacy JS API. Keep the
        // output clean until the Vite major upgrade that switches to the
        // modern compiler API.
        silenceDeprecations: ["legacy-js-api", "import"],
      },
    },
  },
  // In dev, consume the library's TypeScript source directly and allow Vite
  // to watch the sibling repository. The package dependency remains in place
  // for peer resolution and production builds.
  resolve: {
    // The linked library must use the docs' installed Pickr, including in dev.
    dedupe: ['@simonwep/pickr'],
    // The local library contains legacy .mjs stubs beside the live TypeScript
    // components. Prefer TypeScript during docs development so Tabs (and the
    // other components) expose their complete init implementations.
    extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs"],
    alias:
      command === "serve" && hasLocalKmaterialize
        ? [
            { find: /^kmaterialize$/, replacement: resolve(localKmaterializeRoot, "src/index.ts") },
            {
              find: /^kmaterialize\/sass\/materialize\.scss$/,
              replacement: resolve(localKmaterializeRoot, "sass/materialize.scss"),
            },
          ]
        : [],
  },
  server: {
    fs: {
      allow: [resolve(__dirname), localKmaterializeRoot],
    },
  },
  optimizeDeps: {
    include: ['@simonwep/pickr'],
    exclude: command === "serve" ? ["kmaterialize"] : [],
  },
  //base: "./",
  plugins: [
    serveVersionSnapshotsPlugin(),
    handlebars({
      context(pagePath) {
        currentRoute = pagePath;
        const searchUrl = pagePath.substring(1);
        const index = config.pages.find((page) => page.id === "index");
        const page = config.pages.find((page) => page.url === searchUrl);
        // Use default Values if they are not set
        if (page && !page.description) page.description = index.description;
        return { page, config };
      },
      helpers: {
        getmenu: (item) => getMenuItem(item),
      },
      partialDirectory: resolve(__dirname, "partials"),
    }),
  ],
  build: {
    outDir: "./../build", // ====> relative to root Dir
    // outDir sits outside root, so Vite doesn't clear it by default -
    // every build silently accumulated another hashed assets/main-*.js/css
    // pair on top of the last one instead of replacing it.
    emptyOutDir: true,
    rollupOptions: {
      //this is needed for "vite publish" to include all html files, not only the index.
      input: Object.fromEntries(
        globSync("src/*.html").map((file) => {
          return [
            // This remove the file extension from each
            // file, so e.g. nested/foo.js becomes nested/foo
            file.slice(0, file.length - path.extname(file).length),
            // This expands the relative paths to absolute paths, so e.g.
            // src/nested/foo becomes /project/src/nested/foo.js
            fileURLToPath(new URL(file, import.meta.url)),
          ];
        })
      ),
    },
  },
});
