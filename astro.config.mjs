// @ts-check
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import mightySite from "@mightylocalsites/astro-site";

// SSR on Cloudflare Workers: each request fetches live v1 data. The API's
// `s-maxage=3600` lets Cloudflare's edge cache the upstream JSON, and pages
// re-emit that Cache-Control so the rendered HTML is edge-cached too.
//
// `mightySite()` injects all the standard routes and feeds them this site's nav.
// `ui` selects the theme package (default "@mightylocalsites/astro-ui-minimal"); swap it per site
// to ship a different design against the same API contract. Everything else here
// is override-only: drop a `src/pages/<route>.astro` to replace a page.

// The domain lives in one place: the MIGHTY_SITE_HOST env var (the API lookup
// key). The canonical `site` origin below is derived from it. NOTE: `.dev.vars`
// is a Cloudflare-runtime file and is NOT in `process.env` when this config runs
// — `host` is only set where the var is a real process env (the Cloudflare
// Workers build, or a shell/CI export), which is exactly where the canonical matters.
const host = process.env.MIGHTY_SITE_HOST;

export default defineConfig({
  output: "server",
  // `imageService: "compile"` opts out of the runtime Cloudflare Images binding.
  // Use it when a site renders only plain <img> (no astro:assets) — there's
  // nothing to optimize at runtime, so no `IMAGES` binding is needed. Local
  // imported images, if added, are still optimized at build time. Drop this
  // option (adapter default `cloudflare-binding`) if you adopt <Image> on
  // remote URLs and want on-the-fly optimization — then bind `IMAGES`.
  adapter: cloudflare({ imageService: "compile" }),
  // REQUIRED in every standalone site. The framework packages ship `.ts` source
  // that imports the `virtual:mightylocal/site-config` module, which Vite's dep
  // pre-bundler (esbuild) can't resolve — so they must be excluded from
  // pre-bundling or `astro dev` crashes. The integration can't set this for you
  // (an `updateConfig` exclude doesn't reach the dev optimizer); it only works
  // declared here, in the site's own config. Keep this block when you clone.
  vite: {
    optimizeDeps: {
      exclude: [
        "@mightylocalsites/astro-site",
        "@mightylocalsites/astro-data",
        "@mightylocalsites/astro-ui-minimal",
      ],
    },
    plugins: [
      {
        name: "mightylocal-site-chrome",
        enforce: "pre",
        resolveId(id, importer) {
          const fromWrapper = importer?.replace(/\\/g, "/").endsWith("/src/lib/site-chrome.ts");
          if (fromWrapper) return null;
          if (
            id === "@mightylocalsites/astro-site/data" ||
            id.replace(/\\/g, "/").endsWith("/astro-site/src/data.ts")
          ) {
            return fileURLToPath(new URL("./src/lib/site-chrome.ts", import.meta.url));
          }
          return null;
        },
      },
    ],
  },
  // Canonical origin for SEO / absolute JSON-LD links, derived from the env host.
  // `SITE` overrides; undefined in local dev → Astro.site falls back to Astro.url.
  site: process.env.SITE || (host ? `https://${host}` : undefined),
  integrations: [
    mightySite({
      ui: "@mightylocalsites/astro-ui-minimal",
      nav: [
        { label: "Departments", href: "/departments" },
        { label: "Services", href: "/services" },
        { label: "Offers", href: "/offers" },
        { label: "Events", href: "/events" },
        { label: "About Us", href: "/about-us" },
        { label: "Location", href: "/locations/daubys-true-value-hardware" },
        { label: "Contact", href: "/contact" },
      ],
      // You can opt out of inherited routes like /events here. This only
      // works on routes coming from the framework (astro-site) package.
      disabledRoutes: [],
      footerNav: [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms of Service", href: "/terms-of-service" },
        { label: "Accessibility Statement", href: "/accessibility-statement" },
      ],
      // Opt into the framework CSP baseline (FA, Elfsight, Turnstile, GA, Maps).
      // `csp: {}` enables it as-is; extra origins would merge into that map.
      security: {
        csp: {},
      },
    }),
    // Per-site brand color. The pre-header background and every button both
    // derive from --ml-color-primary, so a one-token :root override recolors
    // them. mightySite() has no color option and the theme lives in
    // node_modules, so this tiny inline integration is the injection point:
    // a `page-ssr` import makes Astro link src/styles/brand.css on EVERY page —
    // including framework-injected routes (/offers, /contact, /locations) where
    // the pre-header also appears. (CSP allows same-origin styles.)
    {
      name: "site-brand-css",
      hooks: {
        "astro:config:setup": ({ injectScript }) => {
          injectScript("page-ssr", `import "/src/styles/brand.css";`);
        },
      },
    },
  ],
});
