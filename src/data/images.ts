/**
 * Site photography for Dauby's True Value Hardware.
 * Marketing images live in /public/images (deploy with static assets).
 * Logo uses Shopify CDN; run `npx mighty-migrate-images` to move to R2 later.
 */
const shop = (file: string, width?: number) =>
  width
    ? `https://daubyshardware.com/cdn/shop/files/${file}?width=${width}`
    : `https://daubyshardware.com/cdn/shop/files/${file}`;

const img = (file: string) => `/images/${file}`;

/** Shared alt text for photography used across the site. */
export const imageAlt = {
  heroWelcome:
    "Exterior of a True Value hardware store with a green roof, red sign, storefront windows, carts, and an empty parking lot in daylight.",
  heroDepartments:
    "Person painting in a workshop beside an A-frame ladder, with a rolling tool cabinet, supplies, and bright window creating an industrious mood.",
  aboutHero:
    "A paint roller applies fresh white paint to a wall, creating a clean, minimalist surface in a calm, neutral setting.",
  bannerPaintMatching:
    "A bright room ready for painting, with a wooden ladder, covered floor, paint can, brushes, trays, blue tape, and protective plastic sheeting.",
  deptHero:
    "Close-up of red organizer bins filled with shiny metal tools and hardware, including sockets, clamps, rods, and a black-handled tool.",
  deptPaint:
    "Paint store display featuring hundreds of colorful paint swatches in organized panels, creating a bright, orderly showroom scene.",
  deptElectrical:
    "Hardware store aisle packed with cables, adapters, electronics, tools, and accessories on pegboards, creating a busy, well-organized retail scene.",
  deptPlumbing:
    "Hardware store aisle displaying rows of plumbing supplies—pipes, valves, fittings, hoses, and tools—organized on pegboard shelves.",
  deptTools:
    "Hardware store aisle displaying pegboards packed with saw blades, drill accessories, filters, regulators, tools, and automotive supplies.",
  svcHero:
    "Close-up of an architect's hand using a black pen to draw detailed building blueprints on white paper, conveying precision and focus.",
  svcLockRekeying:
    "Close-up of a metal key in a door lock, with a blurred green outdoor background, symbolizing access, security, and new opportunity.",
  svcSpecialOrdering:
    "Close-up of a hand holding a black-and-silver pen, writing in a lined spiral notebook on a desk in an office; focused, productive mood.",
} as const;

export type MarketingImageKey = keyof typeof imageAlt;

export const images = {
  logo: shop("Dauby_s_Hardware_logo_2000x600px_Shopify.png"),
  favicon: shop("Favicon.png"),

  /** Homepage carousel. */
  heroWelcome: img("hero-welcome.png"),
  heroDepartments: img("hero-departments.png"),

  /** Interior page heroes. */
  deptHero: img("dept-hero.png"),
  svcHero: img("svc-hero.png"),
  aboutHero: img("about-hero.png"),

  /** Homepage department tiles. */
  deptPaint: img("dept-paint.png"),
  deptElectrical: img("dept-electrical.png"),
  deptPlumbing: img("dept-plumbing.png"),
  deptTools: img("dept-tools.png"),

  /** Homepage paint banner. */
  bannerPaintMatching: img("banner-paint-matching.png"),

  /** Homepage service tiles. */
  svcLockRekeying: img("svc-lock-rekeying.png"),
  svcSpecialOrdering: img("svc-special-ordering.png"),
} as const;

export const locationSlug = "daubys-true-value-hardware";
export const locationsHref = `/locations/${locationSlug}`;

export function withShopifyLogo<T extends { site: { owner: { logo?: string | null } } }>(
  chrome: T,
): T {
  chrome.site.owner.logo = images.logo;
  return chrome;
}
