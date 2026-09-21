# Custom site build prompt (Stoppel homepage + branded chrome)

Copy-paste master prompt for building a full custom marketing site from a live
Shopify client site, using the Stoppel Supply homepage layout and ac-hall / bville
infrastructure patterns.

Replace `{CLIENT}`, `{HOST}`, `{SLUG}`, `{CITY}`, `{STATE}`, and `{LOCATION_SLUG}`
before running.

---

```
Build the complete custom marketing site for {CLIENT} using the Stoppel Supply
homepage template and copy from the live client site.

Live client site (content source): https://{HOST}/
Design/layout template: stoppel-supply-ks (homepage + interior page heroes)
Interior content pattern: ac-hall-hardware-wallace-nc (icon-led grids — NOT alternating image rows)
Framework page pattern: bville-supply-baldwinsville-ny (local SiteLayout overrides for offers, events, locations, contact)
Site infrastructure pattern: ac-hall-hardware-wallace-nc (local SiteLayout, content.ts, images.ts, site.css, brand.css, FaviconLinks, lib/seo.ts, lib/site-chrome.ts)
Target site: {SLUG}

---

## Goal

Replace ALL template-specific content while preserving Stoppel's homepage layout and
interior-page hero banners. Interior custom page body sections use Font Awesome
icons — not photography. Framework routes get branded overrides so every page
matches the site's header, footer, pre-header, and hero style.

---

## Footer (required)

Set `footerNav` in astro.config.mjs to match the live site legal links:

```js
footerNav: [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Accessibility Statement", href: "/accessibility-statement" },
],
```

- `/accessibility-statement` — framework route (override only if it looks off-brand)
- `/privacy-policy` and `/terms-of-service` — create override pages; carry HTML from
  `https://{HOST}/policies/privacy-policy` and `https://{HOST}/policies/terms-of-service`
  into `src/data/privacy-policy.ts` and `src/data/terms-of-service.ts`
  (see chatsworth-hardware pattern)
- Local `Footer.astro` renders `footerNav` from chrome — no hardcoded footer links

---

## Page layout rules

### Homepage — `src/pages/index.astro` (Stoppel structure, image-heavy)

1. Full-bleed hero carousel (2 slides)
2. Intro link row (Departments, Services, Location & Hours)
3. Special Offers via OfferList
4. Featured departments grid — 4 square **image** tiles
5. Full-bleed banner (e.g. Paint Matching & Mixing)
6. Services grid — 2 square **image** tiles
7. Optional ElfSight reviews
8. Centered ContactForm

Homepage is the ONLY page that uses multiple marketing photos beyond heroes.

### Interior custom pages — hero image + icon grid (NOT image rows)

**Departments, Services, About Us** each get:
- ONE full-bleed hero banner (Stoppel-style overlay: title, city/state, Contact CTA)
- Body content below uses **icon-led cards/grids** — no alternating photo rows

Pattern (see ac-hall `departments.astro` / `services.astro`):
```astro
<ul class="dept-grid dept-grid--page">
  {departments.map((d) => (
    <li class="dept-grid__item">
      <span class="dept-grid__icon"><i class={d.icon}></i></span>
      <div>
        <h2>{d.title}</h2>
        <p>{d.body}</p>
        {d.bullets && <ul>...</ul>}
      </div>
    </li>
  ))}
</ul>
```

- Assign a semantic Font Awesome icon per department/service in `content.ts`
- Electrical bullet lists render as `<ul class="dept-bullets">`
- End with a CTA band (Contact + phone)
- Extract shared hero markup into `src/components/InteriorHero.astro`

**About Us** — hero + single icon intro card. Do NOT invent company history if the
live site has none — ask for copy first.

### Framework pages — override with local SiteLayout (required)

Override these routes so they match the rest of the site (see bville pattern):

| Route | Design |
|---|---|
| `/contact` | InteriorHero + quick links (address/phone/email) + map/form split |
| `/offers` | InteriorHero + branded intro + `OfferList` |
| `/offers/[slug]` | Branded `OfferDetail` in `page-flow` |
| `/events` | InteriorHero + branded intro + `EventList` |
| `/events/[slug]` | Branded `EventDetail` + JSON-LD |
| `/locations` | Redirect to single store when only one location |
| `/locations/[slug]` | InteriorHero + `LocationDetail` + JSON-LD |

Each override page uses:
- Local `SiteLayout` (not framework `@mightylocalsites/ui` SiteLayout directly)
- `getSiteChrome` / `withShopifyLogo`
- `FaviconLinks slot="head"`
- `src/styles/site.css`

**Restart `npm run dev` after adding framework override pages** — Astro picks them
up on restart.

---

## Shared infrastructure

### `src/data/content.ts`
- All static copy from live site
- Each department/service: `{ icon, title, body, bullets? }`
- Homepage-only images: optional `homepageImage` key on items featured on `/`

### `src/data/images.ts`
- Logo from Shopify CDN (`https://{HOST}/cdn/shop/files/…`)
- Hero images only: homepage carousel, homepage banner, deptHero, svcHero, aboutHero
- Do NOT assign row images for interior department/service sections
- If local `*.png` is gitignored, use Shopify CDN URLs until `npx mighty-migrate-images`

### `src/data/site.ts`
- Tell City / client fallback location when API data is sparse
- `patchSiteData`, `patchLocation`, `resolveTimezone` helpers
- `getLocationSafe` in `lib/site-chrome.ts` for location detail pages

### `src/styles/brand.css`
- Client brand primary color (e.g. True Value red `#a00c24`)
- NOT Stoppel amber

### `astro.config.mjs`
- Fix Location nav href to `/locations/{LOCATION_SLUG}` from MightyLocal/API
- Full footerNav (Privacy, Terms, Accessibility)

---

## Favicon (required)

The scaffold ships a generic Stoppel `public/favicon.svg` — replace it.

1. Download `Favicon.png` from `https://{HOST}/cdn/shop/files/Favicon.png` → `public/favicon.png`
2. Create a branded `public/favicon.svg` (brand color + simple mark)
3. `src/components/FaviconLinks.astro` — local assets + theme color from brand:
   ```astro
   <meta name="theme-color" content="#a00c24" />
   <link rel="icon" type="image/png" href="/favicon.png" />
   <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
   <link rel="apple-touch-icon" href="/favicon.png" />
   ```
4. `src/middleware.ts` — inject the same favicon tags on framework pages that lack
   `FaviconLinks`; skip injection when `rel="icon"` is already present

Add `FaviconLinks slot="head"` to every custom and framework override page.

---

## Local dev / preview

### `.dev.vars` (critical)
Copy `.dev.vars.example` → `.dev.vars` and set:
```
MIGHTY_API_BASE_URL=https://mlapi.newmediaretailer.com
MIGHTY_SITE_HOST={HOST}
```

If `MIGHTY_SITE_HOST` points at the wrong domain, API data (JSON-LD, offers,
events, location) will show another client's content in dev.

### Verify locally
```bash
npm run typecheck   # 0 errors
npm run build       # succeeds
npm run dev         # http://localhost:4321 — restart after new override pages
```

### Deploy for preview
- Pin SESSION KV id from MightyLocal CMS in `wrangler.jsonc`
- Ship `.github/workflows/deploy.yml` (push to `master` deploys via Workers for Platforms)
- Push to `mightylocalsites/{SLUG}` — CI builds and deploys automatically
- Manual fallback: `npm run build && npx wrangler deploy --dispatch-namespace production-sites`

---

## Image inventory (minimum)

**Homepage:** heroWelcome, heroDepartments, deptPaint, deptElectrical, deptPlumbing,
deptTools, bannerPaintMatching, serviceLockRekeying, serviceSpecialOrdering

**Interior heroes only:** deptHero, svcHero, aboutHero

If a required image is missing, STOP and ask — do not use mismatched placeholders.

---

## Technical rules

- Local `SiteLayout`, `getSiteChrome`, `withShopifyLogo`, `FaviconLinks`
- Location labels: `primary.locality` + `primary.administrative_area` (NOT `city`/`state`)
- Fallback city label: `{CITY}, {STATE}`
- No Stoppel cfImage paths or template placeholder copy
- Hero overlay text explicitly white (#fff)
- Brand accents use site CSS vars, not Stoppel amber

---

## Verification checklist

1. `npm run typecheck` — 0 errors
2. `npm run build` — succeeds; Astro logs framework routes as overridden
3. Audit: no Stoppel/template references in copy or images
4. Interior pages use icons, not row photos
5. Footer shows Privacy Policy, Terms of Service, Accessibility Statement
6. Framework pages (contact, offers, events, locations) use branded SiteLayout + heroes
7. Favicon shows client brand on all routes (including /accessibility-statement via middleware)
8. `.dev.vars` `MIGHTY_SITE_HOST` matches `{HOST}`
```
