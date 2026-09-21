# CLAUDE.md

Guidance for agents working in a **MightyLocal client site** repo (a clone of this
template). For the full build/configure/deploy walkthrough, read `README.md` — it's
the authoritative guide. This file is the short orientation + the non-obvious rules.

## What this repo is

A per-client website that is **config + overrides only**. The routes, data fetching,
caching, and chrome all come from three framework packages, consumed with plain
`^semver` ranges (published to GitHub Packages; a `.npmrc` maps the `@mightylocalsites`
scope to the registry, and the build env needs a `NODE_AUTH_TOKEN`):

- `@mightylocalsites/astro-data` — headless SDK: the typed v1 API client + all data types
  + pure helpers (`hours`, `format`, `social`, `seo`). **This is the API contract.**
- `@mightylocalsites/astro-ui-minimal` — the default presentational theme (swappable per site).
- `@mightylocalsites/astro-site` — the `mightySite()` integration that injects the standard
  SSR routes and the data/config plumbing.

`astro.config.mjs` calls `mightySite({...})` — **that config IS the site.** A site with
zero override pages is fully functional. To change a page, drop your own
`src/pages/<route>.astro`; to opt out of one, use `mightySite({ disabledRoutes })`.
Restart the dev server after adding/removing an override page (the inject-or-skip
decision is made once at config time).

## The API / data structure

Don't look for a hand-written schema doc — the **types are the contract**, and they're
generated/checked so they can't drift. Read them directly in your `node_modules`:

- `@mightylocalsites/astro-data/src/generated.ts` — per-record shapes (`Offer`, `Location`,
  `Event`, `Owner`, `Feature`, `Announcement`, …). **Generated — never hand-edit.**
- `@mightylocalsites/astro-data/src/types.ts` — composite shapes (`SiteData`, `SiteContent`,
  `SiteSettings`) with the source-of-truth notes and the gotchas inline.
- `@mightylocalsites/astro-data/src/client.ts` — the three v1 endpoints, host resolution,
  and the `Cache-Control` passthrough contract.

Pages reach all of this through `@mightylocalsites/astro-site/data`
(`getSiteChrome`, `siteClient`, `applyCache`, `getSiteConfig`).

## Rules that aren't obvious from the types

- **Never read `business_hours` / `special_hours` off the data directly** — the stored
  shape has drifted and is deliberately typed loose. Always go through the `hours`
  helpers in `@mightylocalsites/astro-data` (timezone-aware open/closed state).
- **Use the helpers generally:** `socialLinks()` for `profiles`, the `seo` builders for
  JSON-LD, `format` for addresses/phones. Don't re-derive these by hand.
- **Import the client from the `/client` subpath** (`@mightylocalsites/astro-data/client`),
  not the package index (the index re-exports only types + pure helpers).
- **Thread `cacheControl`.** When a page fetches a content node, pass its
  `content.cacheControl` to `applyCache(Astro.response, …)`, or the HTML falls back to
  `defaultCache` and won't track that node's freshness.
- **Don't add a loose prop to `SiteLayout`.** To add a chrome field, extend `SiteData`
  (and the API) so it reaches every page through the `getSiteChrome` bundle.
- **Env, not config.** `MIGHTY_API_BASE_URL` + `MIGHTY_SITE_HOST` go in `.dev.vars`
  (dev) / the Cloudflare Workers dashboard or build vars (prod) — never in `wrangler.jsonc`.
- **Deploys to Workers, not Pages.** `@astrojs/cloudflare` v13 is Workers-only;
  deploy with `wrangler deploy`. No `pages_build_output_dir`. See `README.md` §11.

## Commands

```bash
npm run dev         # astro dev → http://localhost:4321
npm run typecheck   # astro check — REQUIRED before build; contract mismatches fail here
npm run build       # astro build → ./dist (Cloudflare Workers build: worker + assets)
npm run preview     # preview the built worker locally
```
