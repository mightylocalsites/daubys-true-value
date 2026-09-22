---
name: new-client-site
description: Scaffold a new MightyLocal client site from astro-sites/example-site — clone + scrub, rename the package and Worker, set the host, decide rentals, pin the SESSION KV id from the MightyLocal CMS, install, typecheck, build, then create and push the GitHub repo. Use when asked to create, spin up, or onboard a new client site, or start a new site from example-site.
---

# Create a new MightyLocal client site

Turns `astro-sites/example-site` into a fully-configured, installed, verified, and
pushed client site under `astro-client-sites/<slug>`. A client site is **config +
overrides only** — you are producing a clone with the per-site values filled in.

Follow the **live template files**, not `docs/DEPLOYING-A-NEW-SITE.md` (which has
drifted). Do the phases in order. `docs/NEW-CLIENT-SITE.md` is the human-facing version
of this same flow.

## Prerequisites (check first, stop early with a clear message if missing)

- **The site already exists in the MightyLocal CMS** (Website → created with an alias, a
  domain saved, and Session Storage showing an **Active** KV id). That's where the slug,
  host, and SESSION KV id in Phase A come from — don't invent them.
- **`NODE_AUTH_TOKEN`** exported in the shell (PAT with `read:packages`). Without it
  `npm install` cannot resolve the private `@mightylocalsites/*` packages. Check with
  `[ -n "$NODE_AUTH_TOKEN" ]`.
- **`gh`** authenticated (`gh auth status`) — needed for the repo create/push (Phase E).
- **Only for the Phase D fallback** (no KV id supplied — rare): either
  `CLOUDFLARE_API_TOKEN` (scoped to **Workers KV Storage:Edit**) **and**
  `CLOUDFLARE_ACCOUNT_ID`, or an existing `wrangler login` session. Not needed on the
  normal path.

## Phase A — Gather inputs (prompt only for what varies)

Ask the user for:
1. **slug** — kebab-case (e.g. `main-hardware-oh`). This **must be the site's MightyLocal
   alias, verbatim** — the edge routes a domain to its alias and dispatches to the Worker
   of that name, so a mismatch means the site never receives traffic. It becomes the
   directory name, the Worker `name`, and the GitHub repo name. Validate
   `^[a-z0-9]+(-[a-z0-9]+)*$` and confirm `astro-client-sites/<slug>` does not already exist.
2. **host** — the domain saved in the CMS (e.g. `mainhardwareoh.com`) → `MIGHTY_SITE_HOST`.
3. **rentals?** — default **no**.
4. **SESSION KV id** — the 32-hex **Cloudflare KV session ID** shown in the CMS under
   Website → Session Storage (the auto-provisioned `{alias}-session` namespace). Pinned in
   Phase D. If the user doesn't have it, point them at that screen before continuing.
5. **create + push GitHub repo?** — default **yes**, target `mightylocalsites/<slug>`.

**Do NOT prompt for these** — they are fixed / left at the template default:
- `MIGHTY_API_BASE_URL` is always `https://mlapi.newmediaretailer.com`.
- `RENTAL_API_BASE_URL` default is `https://rental-api.newmediaretailer.com` (rentals only).
- `nav` / `footerNav` — keep the template defaults untouched (rentals=yes adds one nav item; see Phase C).

## Phase B — Scaffold (mechanical, via the helper script)

Run the helper — it copies the template, scrubs artifacts, and writes a clean
`.dev.vars`:

```bash
astro-sites/.claude/skills/new-client-site/scripts/scaffold.sh <slug> <host> <true|false>
```

It prints `TARGET=<abs path>`; use that path for the rest. Do the config edits in
Phase C — the script deliberately does **not** touch `package.json`,
`wrangler.jsonc`, or `astro.config.mjs`.

## Phase C — Per-site config edits (targeted Edits in `<TARGET>`)

1. **`package.json`** — set `"name": "@mightylocalsites/<slug>"` and update
   `"description"` to name the client + host. Leave scripts/deps as-is.
2. **`wrangler.jsonc`** — set `"name": "<slug>"` (the Worker script id; must be
   unique). Leave the SESSION KV block for Phase D.
3. **`astro.config.mjs`** — leave `nav` / `footerNav` at the template defaults.
4. **Rentals** — most sites are **not** rental, so default the prompt to no. The
   template's rental default is **in flux** (a `chore/template-rentals-opt-in` branch
   toggles whether the wiring ships active or commented), so do **not** assume a
   state — inspect the freshly cloned `astro.config.mjs` and **normalize to the
   user's choice**. Check whether the `mightyRental()` integration entry is active
   (uncommented) or commented.

   The **four rental pieces** (toggle all together — all-or-nothing):
   - in `astro.config.mjs`: the `import mightyRental from "@mightylocalsites/astro-rental";`
     line, the `"@mightylocalsites/astro-rental",` entry in `vite.optimizeDeps.exclude`,
     and the `mightyRental()` integration entry (after `mightySite()`).
   - in `wrangler.jsonc`: the `secrets_store_secrets` block (the `RENTAL_API_TOKEN` binding).

   - **rentals = yes:** ensure all four are **active** (uncomment any that are
     commented), and add `{ label: "Rentals", href: "/rental/catalog" }` to `nav`.
     (`RENTAL_API_BASE_URL` is already in `.dev.vars` from the script.)
   - **rentals = no (default):** ensure all four are **absent/commented** (remove or
     comment out any that are active). A leftover active `secrets_store_secrets`
     block on a non-rental site fails the Workers-for-Platforms deploy with `code: 10021`.

**Do not** touch `vite.optimizeDeps.exclude` for the three core packages,
`imageService: "compile"`, or `site` — keep them exactly as cloned. Never add
`pages_build_output_dir` or put env vars in `wrangler.jsonc`.

## Phase D — Install, pin KV, verify (run inside `<TARGET>`)

```bash
npm install
```

Then pin the **SESSION KV** id from Phase A (before typecheck/build/commit so it is in
the initial push) — Edit `wrangler.jsonc` to add, after `compatibility_flags`:

```jsonc
"kv_namespaces": [{ "binding": "SESSION", "id": "<id>" }]
```

The id belongs to the `{alias}-session` namespace the MightyLocal CMS already
provisioned. **Do not run `wrangler kv namespace create` on the normal path** — it would
create a second, orphaned namespace that the CMS doesn't know about.

- **Fallback, only if no id was supplied and can't be retrieved:** run
  `npx wrangler kv namespace create SESSION`, parse the 32-hex id from its output, and
  pin that. Flag it in the Phase F summary so the CMS record can be reconciled.
- If neither is possible (no id, no wrangler auth), do **not** abort. Leave the KV
  unpinned and note in the Phase F summary that the id must be pinned before the first
  deploy (an unpinned namespace auto-provisions at deploy time and can wedge on
  `already exists [code: 10014]`).

Then verify:

```bash
npm run typecheck    # REQUIRED — contract/prop mismatches fail here, not at build
npm run build        # emits dist/server (worker) + dist/client (assets)
```

Both must pass before Phase E. Optionally offer a `npm run dev` smoke-test
(http://localhost:4321) — don't block on it.

## Phase E — Create the GitHub repo and push (if the user opted in)

The default branch is **`master`** (the copied `.github/workflows/deploy.yml`
triggers on `master`, and existing client repos use it):

```bash
cd <TARGET>
git init -b master
git add -A
git commit -m "Initial site from example-site"   # include the Co-Authored-By trailer
gh repo create mightylocalsites/<slug> --private --source=. --remote=origin --push
```

Fallback if `--source` isn't wanted: `git remote add origin
git@github.com:mightylocalsites/<slug>.git` then `git push -u origin master`.

## Phase F — Closing status

Report concisely: the created path, the repo URL, whether SESSION KV was pinned (with
the id) or left for manual pinning, and that the CI workflow will deploy on the next
push to `master`. No long manual-followup checklist.

## Correctness rules (do not violate)

- Follow the **live `example-site`**, not the drifted doc.
- The directory, the Worker `name`, and the GitHub repo name must **all equal the
  MightyLocal alias** — routing resolves domain → alias → Worker script name.
- The SESSION KV id comes from the **CMS**, not from `wrangler kv namespace create`.
- **Never** carry `node_modules` / `dist` / `.astro` / `.wrangler` /
  `worker-configuration.d.ts` / `.dev.vars` into the new repo (the script scrubs them).
- Default branch is **`master`**, never `main`.
- Rentals are **opt-in; most sites are non-rental** (default no). The template's
  shipped default varies, so detect it and normalize — the four rental pieces toggle
  all-or-nothing. A leftover active `secrets_store_secrets` block on a non-rental
  site fails the deploy with `code: 10021`.
- `worker-configuration.d.ts` is generated by `wrangler types` (gitignored, `pre*`
  hooks) — never commit or hand-edit it.
