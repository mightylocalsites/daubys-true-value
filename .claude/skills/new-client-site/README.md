# new-client-site

A Claude Code skill that scaffolds a new MightyLocal client site from
`astro-sites/example-site` — clone + scrub, rename the package and Worker, set the
host, decide rentals, pin the SESSION KV id, install, typecheck, build, then
create and push the GitHub repo.

See [`SKILL.md`](./SKILL.md) for the full step-by-step behavior, and
[`docs/NEW-CLIENT-SITE.md`](../../../docs/NEW-CLIENT-SITE.md) for the human-facing
walkthrough of the whole flow.

## Usage

**Create the website in MightyLocal first** — the skill's slug (the alias), host
(the domain), and SESSION KV id all come from there.

From a Claude Code session (working anywhere in the `astro-sites` repo), invoke:

```
/new-client-site
```

…or just ask Claude to "create a new client site from example-site". The skill then
prompts for the few per-site values:

| Prompt | Example | Becomes |
|---|---|---|
| **slug** (kebab-case) | `main-hardware-oh` | the directory, the Worker `name`, and the GitHub repo name — **must be the MightyLocal alias** |
| **host** | `mainhardwareoh.com` | `MIGHTY_SITE_HOST` (the API lookup key) |
| **rentals?** | `no` (default) | whether the rental catalog module is wired in |
| **SESSION KV id** | 32-hex, from CMS → Website → Session Storage | pinned as the `SESSION` binding in `wrangler.jsonc` |
| **create + push repo?** | `yes` (default) | `mightylocalsites/<slug>` on GitHub |

Everything else (nav/footerNav defaults, the fixed API base URL, the framework
`optimizeDeps.exclude` / adapter config) is left as the template ships it.

The new site is created at `../astro-client-sites/<slug>` (sibling of `astro-sites`).

## Environment variables

The skill reads some vars **from your shell** to do its work, and writes others
**into the new site's `.dev.vars`**. A third set must be configured **in the cloud**
(GitHub + Cloudflare) for the site to build and deploy in CI — those are one-time /
account-wide and are *not* handled by the skill.

### 1. Exported in your shell (before running the skill)

```bash
export NODE_AUTH_TOKEN=ghp_xxxxxxxx        # required
export CLOUDFLARE_API_TOKEN=cf_xxxxxxxx    # rarely needed (KV fallback only)
export CLOUDFLARE_ACCOUNT_ID=xxxxxxxx      # rarely needed (with the token above)
export GH_TOKEN=github_pat_xxxxxxxx        # required
```

| Variable | Required? | Purpose |
|---|---|---|
| `NODE_AUTH_TOKEN` | **Required** | PAT with `read:packages`. `.npmrc` maps the `@mightylocalsites` scope to GitHub Packages; without it `npm install` can't resolve the private framework packages. The value is the `credential` field of 1Password → **Development Resources** → *GitHub Token cloudflare-astro-deploy*. |
| `GH_TOKEN` | **Required** | Lets `gh repo create` + `git push` create and populate the client repo, as the deploy bot. In 1Password → **Development Resources** → *Mighty Deploy Bot Github PAT Agent Access*. Use this rather than `gh auth login`. |
| `CLOUDFLARE_API_TOKEN` | Fallback only | Scoped to **Workers KV Storage:Edit**. Used only if no SESSION KV id was supplied, to run `wrangler kv namespace create SESSION`. Normally the id comes from the CMS and no token is needed. |
| `CLOUDFLARE_ACCOUNT_ID` | Fallback only | The account the fallback KV namespace is created under (used with the token above). |

### 2. Written into `<site>/.dev.vars` by the skill (local dev)

`.dev.vars` is gitignored and read by the Cloudflare runtime during `astro dev`. The
skill generates it for you — you don't set these by hand:

| Variable | Value | Notes |
|---|---|---|
| `MIGHTY_API_BASE_URL` | `https://mlapi.newmediaretailer.com` | Fixed constant. |
| `MIGHTY_SITE_HOST` | the host you entered | The API lookup key; also derives the canonical `site` origin at build. |
| `RENTAL_API_BASE_URL` | `https://rental-api.newmediaretailer.com` | **Only when rentals = yes.** |

### 3. Configured in the cloud (one-time / account-wide — not done by the skill)

For CI to build and deploy the pushed repo, these must exist. They're the same across
sites and are **inherited from the `mightylocalsites` org**, so a new repo needs no
secret setup.

**GitHub → repo (or org) Actions secrets** — consumed by `.github/workflows/deploy.yml`:

| Secret | Purpose |
|---|---|
| `NODE_AUTH_TOKEN` | So the CI `npm ci` can pull the private framework packages. |
| `CF_WFP_DEPLOY_KEY` | Cloudflare API token with Workers Scripts:Edit + Workers for Platforms — used by `wrangler deploy`. |
| `CLOUDFLARE_ACCOUNT_ID` | Target Cloudflare account. |

**Cloudflare → Worker → Settings → Variables** (prod runtime/build):

| Variable | Where | Notes |
|---|---|---|
| `MIGHTY_SITE_HOST` | Build + Runtime | Build: derives the canonical `site`. Runtime: the API lookup key. Defaults to the request `Host` at runtime if unset. |
| `MIGHTY_API_BASE_URL` | Runtime | Optional — defaults to the shared backend. |
| `RENTAL_API_TOKEN` | Secrets Store binding | **Rentals only** — bound via the `secrets_store_secrets` block in `wrangler.jsonc` (same token across sites). |

## After the skill finishes

The skill leaves you a ready, installed, built, and pushed repo. The remaining manual
steps (only if not already handled account-wide) are the cloud config in section 3
above, plus attaching the custom domain in the Cloudflare dashboard. Pushing to
`master` triggers `.github/workflows/deploy.yml`, which deploys the Worker into the
`production-sites` dispatch namespace.
