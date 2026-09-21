/**
 * Site photography — one unique image per homepage placement (no repeats).
 * Logo and favicon from the Dauby's Shopify CDN; marketing photos in /public/images/.
 */
const shop = (file: string) =>
  `https://daubyshardware.com/cdn/shop/files/${file}`;

const img = (file: string) => `/images/${file}`;

/** Shared alt text for photography used across the site. */
export const imageAlt = {
  heroWelcome:
    "Dauby's True Value Hardware store front on a clear day.",
  heroDepartments:
    "A chair being painted by a white paint brush in a garage.",
  deptPaint:
    "Paint swatches and supplies inside of Dauby's True Value Hardware.",
  deptElectrical:
    "Electrical supplies on shelves inside of Dauby's True Value Hardware.",
  deptPlumbing:
    "Plumbing supplies on shelves inside of Dauby's True Value Hardware.",
  deptTools:
    "Tools and supplies on shelves inside of Dauby's True Value Hardware.",
  bannerPaintMatching:
    "Paint mixing and color matching supplies at Dauby's True Value Hardware.",
  serviceLockRekeying:
    "Keys on a door lock.",
  serviceSpecialOrdering:
    "A close-up of a pen writing on a notebook.",
} as const;

export const images = {
  logo: shop("Dauby_s_Hardware_logo_2000x600px_Shopify.png"),
  favicon: shop("Favicon.png"),

  /** Homepage carousel slide 1. */
  heroWelcome: img("hero-welcome.png"),
  /** Homepage carousel slide 2. */
  heroDepartments: img("hero-departments.png"),

  /** Homepage department cards. */
  deptPaint: img("dept-paint.png"),
  deptElectrical: img("dept-electrical.png"),
  deptPlumbing: img("dept-plumbing.png"),
  deptTools: img("dept-tools.png"),

  /** Homepage paint matching banner. */
  bannerPaintMatching: img("banner-paint-matching.png"),

  /** Homepage service cards. */
  serviceLockRekeying: img("service-lock-rekeying.png"),
  serviceSpecialOrdering: img("service-special-ordering.png"),
} as const;

export const locationSlug = "daubys-true-value-hardware";
export const locationsHref = `/locations/${locationSlug}`;

export function withShopifyLogo<T extends { site: { owner: { logo?: string | null } } }>(
  chrome: T,
): T {
  chrome.site.owner.logo = images.logo;
  return chrome;
}
