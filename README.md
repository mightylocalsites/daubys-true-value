# Building a MightyLocal site for a client

This folder is the **per-client site template**. To stand up a new client site you
clone this template, point it at the client's domain, pick a UI theme, set the
nav, and add any custom pages. Everything else — the standard routes, the data
fetching, the caching, the page chrome — comes from the framework packages and
needs no code in the site itself.

A site is **config + overrides only**. The bulk of a working site is three
installed packages:

| Package | What it gives you | Swappable? |
|---|---|---|
| `@mightylocalsites/astro-data` | Typed v1 API client + types + pure helpers (`hours`, `format`, `social`, `seo`/JSON-LD). No Astro. | no — the shared contract |
| `@mightylocalsites/astro-ui-minimal` | All presentation: components, `BaseLayout`, `SiteLayout`, styles. The default theme; pages import it through the bare `@mightylocalsites/ui` contract. | **yes** — pick a theme per site |
| `@mightylocalsites/astro-site` | The `mightySite()` integration: injects the standard SSR routes + data/config plumbing. | no |

Sites are **SSR on Cloudflare Workers**. Each request fetches live data from the v1
unified API, resolved by the site's **host**. The rendered HTML is edge-cached
using the same `Cache-Control` the API returns, so dynamic pages cache like the
JSON they're built from.

> **Workers, not Pages.** The `@astrojs/cloudflare` adapter (v13+, paired with
> Astro 6) targets Cloudflare **Workers** — it has no Pages mode. Deploy with
> `wrangler deploy` (or Workers Builds), not as a Pages project. See §11.

---

## TL;DR — the whole checklist

1. **Clone** this template into a new repo for the client and rename the package.
2. **Set env**: copy `.dev.vars.example` → `.dev.vars`, fill in
   `MIGHTY_API_BASE_URL` + `MIGHTY_SITE_HOST`.
3. **Configure** `astro.config.mjs`: set `site` (canonical URL), `ui` (theme),
   `nav`, `footerNav`, optionally `disabledRoutes`.
4. **Run** `npm run dev` (in the site folder) and check the injected routes
   render against live data.
5. **Override** any page by dropping `src/pages/<route>.astro` (restart dev
   after adding/removing one).
6. **Build & verify**: `npm run typecheck` then `npm run build`.
7. **Deploy** to Cloudflare Workers (`wrangler deploy` or Workers Builds),
   setting the env vars as build/Worker variables.

---

## Prerequisites

- Node 18+ and npm.
- Access to a running v1 API (`MIGHTY_API_BASE_URL`) and the client's **host**
  registered in MightyLocal (`MIGHTY_SITE_HOST`) — the host is how the API
  resolves which owner/locations to serve.
- A Cloudflare account (Workers), for deployment.

The three framework packages install from **GitHub Packages**. The template's
`.npmrc` maps the `@mightylocalsites` scope to that registry, so you need a
`NODE_AUTH_TOKEN` with `read:packages` in your shell (and later in CI and the
Cloudflare Workers build env) for `npm install` to fetch them.

---

## 1. Create the site repo

Each client site is **its own Git repo** that installs the framework from GitHub
Packages — it isn't part of the framework monorepo. Copy this template out to a
fresh repo and re-init git:

```bash
cp -r example-site ../acme-bakery
cd ../acme-bakery
rm -rf .git && git init -b master
```

The template already carries everything a standalone site needs: `.npmrc` (maps
the `@mightylocalsites` scope to GitHub Packages), `.gitignore`, the framework
deps as published `^semver` ranges, `astro.config.mjs`, `wrangler.jsonc`, and
`.dev.vars.example`.

Then edit `package.json`:

- Set `"name"` to `@mightylocalsites/<client-slug>` (e.g. `@mightylocalsites/acme-bakery`).
- Leave the framework deps as published `^semver` ranges — these resolve from
  GitHub Packages:

  ```jsonc
  "dependencies": {
    "@astrojs/cloudflare": "^13.6.0",
    "@mightylocalsites/astro-data": "^0.1.0",
    "@mightylocalsites/astro-ui-minimal": "^0.1.0",
    "@mightylocalsites/astro-site": "^0.1.0",
    "astro": "^6.4.2"
  }
  ```

Then install (needs `NODE_AUTH_TOKEN` with `read:packages`, since the framework
packages come from GitHub Packages):

```bash
export NODE_AUTH_TOKEN=<token>   # also set this in CI + the Cloudflare Workers build env
npm install
```

> The site's `dependencies` are the single place each framework version is pinned
> — grep across your client repos to see which sites run which theme/contract
> version. To move a site to a newer framework release, bump the `^semver` range
> (or `npm update`) and redeploy.

---

## 2. Set the environment

Two env vars drive a site. Copy the example and fill them in:

```bash
# from the site folder
cp .dev.vars.example .dev.vars
```

```ini
# .dev.vars
MIGHTY_API_BASE_URL=https://app.mightylocal.example.com   # the v1 API base
MIGHTY_SITE_HOST=acmebakery.com                           # resolves the owner in v1
```

How env resolution works (Astro 6 + `@astrojs/cloudflare` v13):

- The adapter **removed `Astro.locals.runtime.env`**. Env is read via
  `import { env } from "cloudflare:workers"`.
- `getSiteConfig()` checks, in precedence order: `cloudflare:workers` env →
  `process.env` → `import.meta.env`, treating empty strings as unset.
- For `astro dev`, `.dev.vars` is read by the Cloudflare runtime. You can also
  use `.env` or shell exports.
- **Don't** declare these in `wrangler.jsonc` — an empty default there would
  shadow the real values.
- A missing var throws a clear error at request time
  (`Missing MIGHTY_API_BASE_URL …`), so misconfiguration surfaces immediately.

`worker-configuration.d.ts` (which types the `cloudflare:workers` module) is
generated by `wrangler types` and is gitignored. The `dev`/`build`/`typecheck`
scripts regenerate it automatically via `pre*` npm hooks — you don't run it by
hand.

---

## 3. Configure `astro.config.mjs`

This is the heart of a site. Everything client-specific lives here.

```js
// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import mightySite from "@mightylocalsites/astro-site";

// One source of truth for the domain: MIGHTY_SITE_HOST (the API lookup key).
// The canonical `site` below is derived from it. `.dev.vars` is NOT in
// process.env at config time, so `host` is set only on Cloudflare Workers builds
// and shell/CI — exactly where the canonical matters; dev falls back to the URL.
const host = process.env.MIGHTY_SITE_HOST;

export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  // REQUIRED — keep this block. The framework packages ship `.ts` source that
  // imports a Vite virtual module the dep pre-bundler can't resolve; without the
  // exclude, `astro dev` crashes on a standalone install. (The integration can't
  // set this for you — it has to be in the site's own config.)
  vite: {
    optimizeDeps: {
      exclude: [
        "@mightylocalsites/astro-site",
        "@mightylocalsites/astro-data",
        "@mightylocalsites/astro-ui-minimal",
      ],
    },
  },
  // Canonical origin for SEO / absolute JSON-LD links, derived from the env host.
  // `SITE` overrides; undefined in local dev → Astro.site falls back to Astro.url.
  site: process.env.SITE || (host ? `https://${host}` : undefined),
  integrations: [
    mightySite({
      ui: "@mightylocalsites/astro-ui-minimal",   // the theme (see §4)
      nav: [                                  // header nav (see §5)
        { label: "Locations", href: "/locations" },
        { label: "Offers", href: "/offers" },
        { label: "Contact", href: "/contact" },
      ],
      footerNav: [
        { label: "Accessibility Statement", href: "/accessibility-statement" },
      ],
      // disabledRoutes: ["/events"],         // opt out of framework routes (see §6)
      // defaultCache: "public, max-age=60, s-maxage=3600",  // fallback Cache-Control
    }),
  ],
});
```

`mightySite()` options:

| Option | Default | Purpose |
|---|---|---|
| `nav` | framework `primaryNav` (Locations, Contact) | Header nav items |
| `footerNav` | `[]` | Footer nav items |
| `ui` | `"@mightylocalsites/astro-ui-minimal"` | Which concrete theme package the bare `@mightylocalsites/ui` contract resolves to |
| `disabledRoutes` | `[]` | Framework routes to NOT inject (they 404 naturally) |
| `defaultCache` | `public, max-age=60, s-maxage=3600` | `Cache-Control` used when the API sends none |

Set `site` to the client's real domain — it's used for canonical URLs and
absolute JSON-LD links.

---

## 4. Pick a UI theme

The `ui` option chooses the entire visual layer. The framework's injected pages
import all presentation through the bare `@mightylocalsites/ui` specifier;
`mightySite({ ui })` redirects that specifier to the theme you name, at both the
runtime (Vite alias) and type (injected `.d.ts` shim) layers.

- Omit `ui` → the default theme `@mightylocalsites/astro-ui-minimal`. (`@mightylocalsites/ui`
  is the abstract contract, not a package, so it is always aliased to a concrete
  theme — passing the contract itself as `ui` is rejected.)
- Pass another contract-conforming theme → e.g.
  `ui: "@mightylocalsites/astro-ui-modern"`. Add it to the site's `dependencies` too.

Any theme must implement the same contract: the named component exports +
`SiteLayout`'s prop shape, all typed off `@mightylocalsites/astro-data`. If a theme is
missing a component or has the wrong prop shape, **that site's build fails** — the
contract is enforced per-site, for free.

For a one-off look, prefer **per-page overrides** (§7) over authoring a whole new
theme. Reserve new `ui-*` themes for genuine, reusable design systems.

---

## 5. Set the navigation

`nav` (header) and `footerNav` (footer) are arrays of `{ label, href }`:

```js
nav: [
  { label: "Departments", href: "/departments" },  // points at an override page
  { label: "Offers", href: "/offers" },             // points at a framework route
  { label: "Locations", href: "/locations/downtown" },     // deep link to one location
  { label: "Contact", href: "/contact" },
],
```

`href` can point at any route the site actually serves — a framework-injected
route, one of your override pages, or a deep link. There's no validation that a
nav target exists, so keep nav and routes in sync.

---

## 6. The standard routes you get for free

`mightySite()` injects these SSR routes (their `.astro` files live in
`@mightylocalsites/astro-site`, not in the site):

```
/                         /offers              /events
/locations                /offers/[slug]       /events/[slug]
/locations/[slug]         /promotions          /contact
/promotions/[id]          /accessibility-statement
404
```

Phase-1 content scope (what the v1 API serves today): **locations**, **offers**,
**featured promotions** (routed `/promotions`, typed `Feature`), **events**
(slug-based, with a recurring `dates[]`), and the **announcements** banner. Job
postings, team, videos, campaigns, per-site theming, and geosearch widgets are
deferred — they need new v1 API nodes first.

**Opting out of a route.** Pass `disabledRoutes` to skip injecting one — requests
to it then 404 naturally, no override file needed:

```js
mightySite({ disabledRoutes: ["/events", "/promotions"], /* … */ })
```

The leading slash is optional (`"events"` === `"/events"`). An unknown pattern
logs a warning at config time, so typos surface immediately.

---

## 7. Overriding a page

To replace any framework page, drop your own file at the matching path under
`src/pages/`. The integration scans `src/pages/` at config time and **skips
injecting** any route the site already defines, so your page is the sole
definition (no route-collision warning).

| To override… | Create… |
|---|---|
| `/` | `src/pages/index.astro` |
| `/contact` | `src/pages/contact.astro` |
| `/locations/[slug]` | `src/pages/locations/[slug].astro` |
| `/offers` | `src/pages/offers/index.astro` (or `offers.astro`) |

You can also add **brand-new pages** that aren't framework routes at all (e.g.
`/about-us`, `/departments`, `/services`) — just create the file and link to it
from `nav` — they render inside `SiteLayout` exactly like the override pages (§7).

> ⚠️ **Restart the dev server after adding or removing an override page.** The
> inject-or-skip decision is made once at `astro:config:setup`, so a new/removed
> page isn't picked up until restart. Editing an existing override hot-reloads
> fine.

### Images on override pages → Cloudflare R2

Images the **API** returns (offers, events, locations, the logo) are already
hosted for you — render `asset.src` directly. But if an override page hardcodes
its own marketing images (a hero, a gallery, a third-party CDN URL, or a file in
`public/`), move them onto the shared R2 CDN (`mightylocalcdn.com`, one folder
per project) so they're served resized through Cloudflare image transforms.

A CLI ships with the framework — run it **from the site root**:

```bash
npx mighty-migrate-images                          # dry run: lists every image + planned edit
npx mighty-migrate-images --rewrite --bucket <r2-bucket>   # upload to R2 + rewrite source
```

It discovers remote URLs (including `${CONST}/…` template literals) and local
`public/`/relative paths, uploads the originals into `mightylocalcdn.com/<project>/`
(slugified, deduped, idempotent), and rewrites each reference to
`cfImage("<project>/<file>", { width })` from `@mightylocalsites/astro-data`,
which builds the `/cdn-cgi/image/…` URL. `astro:assets` imports are reported for
manual handling. Review the diff and `image-manifest.json`, then
`npm run typecheck && npm run build`. (API-driven images are intentionally left
alone.)

### Anatomy of a page

Every page follows the same shape — fetch the chrome, render inside
`SiteLayout`. A minimal static page (chrome only):

```astro
---
import { SiteLayout } from "@mightylocalsites/ui";
import { getSiteChrome } from "@mightylocalsites/astro-site/data";

const chrome = await getSiteChrome(Astro.response);
const { owner } = chrome.site;
---

<SiteLayout
  {...chrome}
  title={`About | ${owner.name}`}
  description="A short, client-specific description for SEO."
>
  <h1>About {owner.name}</h1>
  <!-- your markup -->
</SiteLayout>
```

`getSiteChrome(Astro.response)`:

- fetches `/sites/data` (owner, locations, announcements),
- applies the site-data `Cache-Control` to the response,
- returns a spreadable `{ site, nav, footerNav }` bundle.

`SiteLayout` takes that whole bundle as one set of props plus per-page
`title`/`description` (and optional `canonical`/`ogImage`/`logo`). **Never add a
fifth loose chrome prop** — extend `SiteData` (and the API) instead so the field
reaches every page through the bundle. Pages that need chrome data in their own
markup destructure it from `chrome.site` (e.g. `owner.name`, `locations`).

### A page that fetches content

A page whose freshness is driven by a content node (offers/events/features)
fetches it in parallel and re-applies the cache from that node:

```astro
---
import { SiteLayout, OfferList, ContactForm } from "@mightylocalsites/ui";
import { getSiteChrome, siteClient, applyCache, getSiteConfig } from "@mightylocalsites/astro-site/data";

const [chrome, content] = await Promise.all([
  getSiteChrome(Astro.response),
  siteClient().getSiteContent(["offers"]),
]);
// Offers drive this page's freshness, so re-emit the content Cache-Control.
applyCache(Astro.response, content.cacheControl);

const offers = content.data.offers ?? [];
const { apiBaseUrl, host } = getSiteConfig();
---

<SiteLayout {...chrome} title={chrome.site.owner.name} description="…">
  {offers.length > 0 && <OfferList offers={offers} hrefBase="/offers" />}
  <ContactForm apiBaseUrl={apiBaseUrl} host={host} />
</SiteLayout>
```

**Don't drop `cacheControl`.** Threading the upstream value through
`applyCache()` is what lets Cloudflare edge-cache the HTML. Losing it falls back
to the configured `defaultCache`.

---

## 8. The data layer (`@mightylocalsites/astro-site/data`)

Everything a page needs to talk to the API:

| Export | Use |
|---|---|
| `getSiteChrome(response)` | Fetch the `{ site, nav, footerNav }` bundle + apply site-data cache. The default for most pages. |
| `siteClient()` | A per-request typed v1 client. Call its methods directly for content/locations. |
| `applyCache(response, cacheControl)` | Re-emit a `Cache-Control` (override the default after a content fetch). |
| `getSiteConfig()` | `{ apiBaseUrl, host }` — e.g. to pass to the client-side `ContactForm`. |

`siteClient()` methods (each returns `{ data, cacheControl }`):

- `getSiteData()` → `SiteData` (owner, locations, announcements)
- `getSiteContent(nodes)` → `SiteContent`; `nodes` ⊆ `["offers", "features", "events"]`
- `getLocation(slug)` → a single `Location`, or `null` on 404

A non-OK API response throws `MightyApiError` (with `.status`).

### Caching model, briefly

SSR re-emits the upstream API's `Cache-Control` onto the page response so
Cloudflare edge-caches the rendered HTML the same way it caches the JSON.
`getSiteChrome` sets the (more static) site-data header by default; a
content-driven page overrides it with `applyCache(Astro.response,
content.cacheControl)` after fetching the node.

---

## 9. Components available from `@mightylocalsites/ui`

Import named components (and data types) from one specifier:

```astro
import { LocationList, OfferCard, type Location } from "@mightylocalsites/ui";
```

Chrome / shared:
`PreHeader`, `Header`, `Footer`, `SocialLinks`, `AnnouncementBanner`,
`StatusBadge`, `RichText`, `ContactForm`, `ElfSightGoogleReviews`,
`BaseLayout`, `SiteLayout`.

Content (card / list / detail per type):
`LocationCard`/`LocationList`/`LocationDetail`,
`OfferCard`/`OfferList`/`OfferDetail`,
`FeatureCard`/`FeatureList`/`FeatureDetail`,
`EventCard`/`EventList`/`EventDetail`.

Styles (import in a layout/page if a theme needs them explicitly):

```astro
import "@mightylocalsites/ui/styles";        // component CSS
import "@mightylocalsites/ui/styles/global"; // global CSS
```

> **Business hours:** never read `business_hours` off the data directly — its
> shape has drifted over time. Always go through the `hours` helpers in
> `@mightylocalsites/astro-data`, which normalize day values and compute open/closed state
> timezone-aware (using the owner timezone). `StatusBadge` already does this.

---

## 10. Run, typecheck, build

From the site folder (`NODE_AUTH_TOKEN` set so the framework packages install):

```bash
npm install            # installs deps, incl. framework packages from GitHub Packages
npm run dev            # astro dev (regenerates wrangler types first) → http://localhost:4321
npm run typecheck      # astro check (catches contract/prop mismatches)
npm run build          # astro build → ./dist
npm run preview        # preview the built worker locally
```

Always run `npm run typecheck` before building — it's where a wrong component
prop or a theme that doesn't satisfy the contract fails.

---

## 11. Deploy to Cloudflare Workers

The `@astrojs/cloudflare` adapter targets **Workers** (not Pages). `astro build`
emits the worker to `./dist/server` and static assets to `./dist/client`, and
writes the deployable config to `./dist/server/wrangler.json` (which adds `main`
and the `ASSETS` assets binding). A `.wrangler/deploy/config.json` redirect lets
plain `wrangler deploy` from the repo root pick that up. **Do not** create a Pages
project or add `pages_build_output_dir` — Pages rejects the Workers `ASSETS`
binding.

**One-time: create the `SESSION` KV namespace.** The adapter wires a KV session
driver even when sessions are unused, so the deploy needs a `SESSION` binding.
Auto-provisioning is unreliable in non-interactive CI, so create and pin it:

```bash
npx wrangler login                       # authorize your Cloudflare account
npx wrangler kv namespace create SESSION # copy the returned id
```
```jsonc
// wrangler.jsonc
"kv_namespaces": [{ "binding": "SESSION", "id": "<id>" }]
```
(`ASSETS` is automatic; no `IMAGES` binding is needed because the adapter uses
`imageService: "compile"`.)

**Deploy — pick one:**

- **Workers Builds (Git):** dashboard → Workers & Pages → Create → Workers →
  Import a repository. Build command `npm run build`, deploy command
  `npx wrangler deploy`.
- **Manual:** `npm run build && npx wrangler deploy`.

**Variables** — Workers Builds separates build-time from runtime:

| Variable | Build | Runtime | Value |
|---|:--:|:--:|---|
| `NODE_AUTH_TOKEN` | ✅ | — | PAT w/ `read:packages` (npm install) |
| `NODE_VERSION` | ✅ | — | `22` |
| `MIGHTY_SITE_HOST` | ✅ | ✅ | the client host (build = canonical URL; runtime = data key) |
| `MIGHTY_API_BASE_URL` | — | ✅ | the v1 API base |
| `SITE` | optional | — | overrides the canonical origin if set |

Set runtime vars in the Worker's **Settings → Variables and Secrets**; build vars
in the **Workers Builds** build configuration.

**Custom domain:** Worker → **Settings → Domains & Routes** → add the client's domain.

That's it — the deployed site fetches live v1 data per request and edge-caches
the HTML per the API's `Cache-Control`.

---

## Files in this template

```
example-site/
  astro.config.mjs       # ← the main thing you edit: mightySite({ ui, nav, footerNav, … })
  package.json           # name + the three file: framework deps
  wrangler.jsonc         # Cloudflare Workers config (don't put the env vars here)
  tsconfig.json          # extends astro strict
  .dev.vars.example      # copy → .dev.vars and fill in the two env vars
  src/
    env.d.ts             # references the framework's ambient types (env + virtual module)
    pages/               # (optional) override / custom pages go here
  worker-configuration.d.ts  # generated by wrangler types (gitignored)
```

If `src/pages/` doesn't exist yet, create it when you add your first override.
A site with zero override pages is fully functional — it serves every framework
route against live data.
