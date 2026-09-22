# MightyLocal custom site — master build prompt

Copy the prompt block below into a new chat to build a full custom marketing site
like **daubys-true-value**. Replace every `{PLACEHOLDER}` before sending.

**Reference sites in this monorepo:**

| Role | Repo folder |
|---|---|
| Homepage layout (carousel, tiles, banner) | `stoppel-supply-ks` |
| Icon grids + local chrome infrastructure | `ac-hall-hardware-wallace-nc` |
| Framework page overrides (no hero images) | `bville-supply-baldwinsville-ny` |
| Completed example of this prompt | `daubys-true-value` |

---

## Prompt (copy from here)

```
Build the complete custom marketing site for {CLIENT_NAME} from the live client
site and MightyLocal scaffold.

Live client site (content source): https://{HOST}/
MightyLocal site slug / Worker name: {SLUG}
Target repo folder: {SLUG}

Design/layout template: stoppel-supply-ks (homepage only)
Interior content pattern: ac-hall-hardware-wallace-nc (icon-led grids — NOT alternating image rows)
Framework page pattern: bville-supply-baldwinsville-ny (local SiteLayout, text-only page headers)
Completed reference: daubys-true-value (same stack — read it for file patterns)

---

## Business facts (from live site + MightyLocal)

Fill these in before building:

- Name: {CLIENT_NAME}
- Address: {STREET}, {CITY}, {STATE} {ZIP}
- Phone: {PHONE}
- Email: {EMAIL}
- City label for heroes: {CITY}, {STATE}
- Location slug (from API/MightyLocal): {LOCATION_SLUG}
- Brand primary color: {BRAND_HEX} (e.g. #a00c24 for True Value red)
- Pre-header announcement (if any): {PREHEADER_TEXT or "none"}
- Homepage tagline: {TAGLINE from live site}

---

## Current state (read before changing anything)

The repo is scaffolded from example-site. Expect Stoppel/template placeholders
(Russell KS copy, amber brand, generic favicon, framework SiteLayout on some routes).

Before editing:
1. Read what already exists in `src/pages/`, `src/layouts/`, `src/components/`, `src/data/`
2. Do not rebuild working pages from scratch unless something is wrong
3. Use `primary.locality` + `primary.administrative_area` for city/state labels
   (NOT `city` / `state` on the Location type)

---

## Goal

Deliver a fully branded site where:

- **Homepage** matches Stoppel's image-heavy layout with this client's copy
- **Custom pages** (departments, services, about-us) use ONE hero image each +
  icon-led body content (no alternating photo rows)
- **Framework pages** (contact, offers, events, locations) use local SiteLayout
  and text-only headers — **no hero images**
- Every page shares the same header, pre-header, footer, fonts, and brand color
- No template/Stoppel placeholder copy or images remain

---

## Site chrome (copy from ac-hall / daubys)

Local overrides required:

```
src/layouts/SiteLayout.astro
src/components/Header.astro
src/components/PreHeader.astro
src/components/Footer.astro
src/components/FaviconLinks.astro
src/components/InteriorHero.astro      ← shared full-bleed hero for custom pages only
src/lib/site-chrome.ts                 ← getSiteChrome, getLocationSafe
src/lib/seo.ts
src/styles/brand.css                   ← --ml-color-primary + hero scrim tokens
src/styles/site.css                    ← icon grids, contact layout, shared hero styles
src/middleware.ts                      ← favicon injection for framework routes
```

Every custom and override page imports local `SiteLayout`, not
`@mightylocalsites/ui` SiteLayout directly.

---

## Footer (required)

In `astro.config.mjs`:

```js
footerNav: [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Accessibility Statement", href: "/accessibility-statement" },
],
```

- `/privacy-policy` and `/terms-of-service` — override pages; HTML from
  `https://{HOST}/policies/privacy-policy` and `…/terms-of-service` into
  `src/data/privacy-policy.ts` and `src/data/terms-of-service.ts`
  (see chatsworth-hardware or daubys-true-value)
- `/accessibility-statement` — framework route (override only if off-brand)
- Footer reads `footerNav` from chrome — no hardcoded legal links in components

Nav order should match live site, typically:
Departments, Services, Offers, Events, About Us, Location, Contact

Fix Location nav href: `/locations/{LOCATION_SLUG}`

---

## Page-by-page scope

### Homepage — `src/pages/index.astro` (Stoppel structure, image-heavy)

Match `stoppel-supply-ks/src/pages/index.astro`:

1. Full-bleed hero carousel (2 slides, white overlay text)
2. Intro link row: Departments, Services, Location & Hours
3. Special Offers via `OfferList` + `getSiteContentSafe(["offers"])`
4. Featured departments — 4 square **image** tiles (homepage subset)
5. Full-bleed marketing banner with CTA
6. Services — 2 square **image** tiles (homepage subset)
7. Optional ElfSight reviews (if configured)
8. Centered `ContactForm`

Rules:
- Homepage is the ONLY page with multiple marketing photos beyond single heroes
- Hero/banner overlay text explicitly `#fff`
- Brand accents use `--ml-color-primary` / site CSS vars, not Stoppel amber
- No duplicate images within the same page
- `withShopifyLogo`, `FaviconLinks`, `pageCanonical`, `DEFAULT_OG_IMAGE`

---

### Departments — `src/pages/departments.astro`

- ONE full-bleed hero (`InteriorHero` or shared hero classes): title "Departments",
  `{CITY}, {STATE}`, Contact Us CTA
- Intro paragraph from `content.ts`
- **Icon grid** for every department — NOT alternating image rows

```astro
<ul class="dept-grid dept-grid--page">
  {departments.map((d) => (
    <li class="dept-grid__item">
      <span class="dept-grid__icon"><i class={d.icon}></i></span>
      <div>
        <h2>{d.title}</h2>
        <p>{d.body}</p>
        {d.bullets && <ul class="dept-bullets">…</ul>}
      </div>
    </li>
  ))}
</ul>
```

- CTA band at bottom (Contact + phone)
- Copy verbatim from live site

---

### Services — `src/pages/services.astro`

Same pattern as departments: hero + icon grid (`svc-grid svc-grid--page`) + CTA band.

---

### About Us — `src/pages/about-us.astro`

- ONE full-bleed hero
- Single icon-led intro card below — no story photo row

⚠️ If the live About page has no body copy, **STOP and ask** — do not invent history.

---

### Framework pages — override with local SiteLayout (required)

**No hero images.** Text-only `page-hero` header inside `page-flow`, then the
framework component. See bville-supply-baldwinsville-ny.

| Route | Design |
|---|---|
| `/contact` | `page-hero` + quick links (address/phone/email) + map/form split. **No store hours in the form panel.** |
| `/offers` | `page-hero` + `OfferList` |
| `/offers/[slug]` | `OfferDetail` in `page-flow` |
| `/events` | `page-hero` + `EventList` |
| `/events/[slug]` | `EventDetail` + JSON-LD |
| `/locations` | Redirect to single store slug when only one location |
| `/locations/[slug]` | `LocationDetail` + JSON-LD (no hero) |

Each override uses: local `SiteLayout`, `getSiteChrome`, `withShopifyLogo`,
`FaviconLinks slot="head"`, `src/styles/site.css`.

**Restart `npm run dev` after adding override pages.**

---

## Shared data files

### `src/data/content.ts`
- `siteTagline`, `departmentsIntro`, `servicesIntro`, `aboutIntro`
- Full `departments[]` and `services[]`: `{ icon, title, body, bullets? }`
- Homepage subsets: `homeDepartments`, `homeServices` with optional `homepageImage`

### `src/data/images.ts`
- Logo + alt text map from Shopify CDN: `https://{HOST}/cdn/shop/files/…`
- Heroes only: carousel slides, homepage banner, `deptHero`, `svcHero`, `aboutHero`
- Homepage tile images on subset items — interior pages do NOT use row images
- `locationSlug`, `locationsHref`, `withShopifyLogo()` helper
- Local `*.png` is gitignored — use CDN until `npx mighty-migrate-images`

### `src/data/site.ts`
- Fallback location when API data is sparse
- `patchSiteData`, `patchLocation`, `resolveTimezone`
- `getLocationSafe()` in `lib/site-chrome.ts`

---

## Brand + interior hero overlay

### `src/styles/brand.css`

```css
:root:root {
  --ml-color-primary: {BRAND_HEX};
  --ml-color-primary-contrast: #ffffff;

  /* Black scrim — accessible white text over busy photos (WCAG AA) */
  --interior-hero-scrim: linear-gradient(
    145deg,
    rgb(0 0 0 / 0.72) 0%,
    rgb(0 0 0 / 0.52) 48%,
    rgb(0 0 0 / 0.68) 100%
  );
  --interior-hero-text-shadow: 0 1px 3px rgba(0, 0, 0, 0.55);
}
```

Apply via shared classes in `site.css` on custom-page hero overlays only
(`.interior-hero__overlay`, `.dept-hero__overlay`, etc.). White title/location
text with `text-shadow`.

---

## Favicon (required)

Scaffold ships a generic Stoppel `public/favicon.svg` — replace it.

1. Download `Favicon.png` from `https://{HOST}/cdn/shop/files/Favicon.png`
   → `public/favicon.png` (gitignored PNG exception: `!public/favicon.*`)
2. Branded `public/favicon.svg` (simple mark in brand color)
3. `FaviconLinks.astro`:
   ```astro
   <meta name="theme-color" content="{BRAND_HEX}" />
   <link rel="icon" type="image/png" href="/favicon.png" />
   <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
   <link rel="apple-touch-icon" href="/favicon.png" />
   ```
4. `middleware.ts` — inject same tags on framework pages missing `rel="icon"`

---

## Image inventory (minimum)

**Homepage:** heroWelcome, heroDepartments, 4 dept tiles, banner, 2 service tiles

**Interior heroes only:** deptHero, svcHero, aboutHero

If any required image is missing, **STOP and list what's needed** — no mismatched
placeholders, no duplicates on the same page.

---

## Local dev + deploy

### `.dev.vars` (critical)
```
MIGHTY_API_BASE_URL=https://mlapi.newmediaretailer.com
MIGHTY_SITE_HOST={HOST}
```
Wrong host = wrong API data in dev (another client's offers, JSON-LD, etc.).

### Verify
```bash
npm run typecheck   # 0 errors
npm run build       # succeeds; framework routes logged as overridden
npm run dev         # http://localhost:4321
```

### Deploy
- Pin SESSION KV id from MightyLocal CMS in `wrangler.jsonc`
- Ship `.github/workflows/deploy.yml` (push to `master` → Workers for Platforms)
- Push to `mightylocalsites/{SLUG}`
- Manual: `npm run build && npx wrangler deploy --dispatch-namespace production-sites`

---

## Do NOT

- Use alternating image/text rows on departments or services (icons only)
- Put hero images on contact, offers, events, or locations
- Show store hours in the contact form panel
- Invent About Us history when live site has none
- Use Stoppel cfImage paths, Russell KS copy, or template amber brand
- Use `primary.city` / `primary.state` (use `locality` / `administrative_area`)
- Commit `.dev.vars`, `node_modules`, `dist`, or local marketing PNGs

---

## Verification checklist

- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run build` — succeeds
- [ ] No Stoppel/template references in copy or images
- [ ] Homepage: Stoppel layout + client copy + image tiles
- [ ] Departments / Services / About: hero + icon grids (no row photos)
- [ ] Contact / Offers / Events / Locations: branded chrome, **no hero images**
- [ ] Contact form panel has no store hours
- [ ] Footer: Privacy Policy, Terms of Service, Accessibility Statement
- [ ] Favicon + theme-color on all routes
- [ ] Interior hero overlays use black gradient scrim + white text
- [ ] `.dev.vars` `MIGHTY_SITE_HOST` = `{HOST}`
- [ ] Location nav → `/locations/{LOCATION_SLUG}`
```

---

## Quick-fill example (Dauby's True Value)

| Placeholder | Value |
|---|---|
| `{CLIENT_NAME}` | Dauby's True Value Hardware |
| `{HOST}` | daubyshardware.com |
| `{SLUG}` | daubys-true-value |
| `{LOCATION_SLUG}` | daubys-true-value-hardware |
| `{CITY}` / `{STATE}` | Tell City / IN |
| `{BRAND_HEX}` | #a00c24 |
| `{PHONE}` | (812) 547-2566 |
| `{EMAIL}` | daubyhwde@gmail.com |
