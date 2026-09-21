/**
 * Site photography — Shopify CDN URLs from daubyshardware.com.
 * Local copies are gitignored; run `npx mighty-migrate-images` to move to R2 later.
 */
const shop = (file: string, width?: number) =>
  width
    ? `https://daubyshardware.com/cdn/shop/files/${file}?width=${width}`
    : `https://daubyshardware.com/cdn/shop/files/${file}`;

/** Shared alt text for photography used across the site. */
export const imageAlt = {
  heroWelcome: "Dauby's True Value Hardware store front on a clear day.",
  heroDepartments: "A chair being painted by a white paint brush in a garage.",
  deptHero: "Hardware and supplies at Dauby's True Value Hardware.",
  deptHardware: "Hardware products and tools at Dauby's True Value Hardware.",
  deptPaint: "Paint swatches and supplies inside of Dauby's True Value Hardware.",
  deptElectrical: "Electrical supplies on shelves inside of Dauby's True Value Hardware.",
  deptPlumbing: "Plumbing supplies on shelves inside of Dauby's True Value Hardware.",
  deptTools: "Tools and supplies on shelves inside of Dauby's True Value Hardware.",
  deptSportingGoods: "Sporting goods and outdoor equipment at Dauby's True Value Hardware.",
  deptSeasonalHoliday: "Seasonal and holiday merchandise at Dauby's True Value Hardware.",
  bannerPaintMatching: "Paint mixing and color matching supplies at Dauby's True Value Hardware.",
  svcHero: "Quotes and estimates at Dauby's True Value Hardware.",
  svcQuotes: "Planning a home renovation project with Dauby's True Value Hardware.",
  svcKeyCutting: "Key cutting service at Dauby's True Value Hardware.",
  svcLockRekeying: "Keys on a door lock.",
  svcPaintMatching: "Paint matching and mixing at Dauby's True Value Hardware.",
  svcSpecialOrdering: "A close-up of a pen writing on a notebook.",
  aboutHero: "Dauby's True Value Hardware in Tell City, Indiana.",
  aboutStory: "Inside Dauby's True Value Hardware in Tell City, Indiana.",
} as const;

export type MarketingImageKey = keyof typeof imageAlt;

export const images = {
  logo: shop("Dauby_s_Hardware_logo_2000x600px_Shopify.png"),
  favicon: shop("Favicon.png"),

  /** Homepage carousel. */
  heroWelcome: shop("Store_1800x800px_Shopify_cbed1a03-5622-4ef7-a16f-1efd3def4313.png", 1920),
  heroDepartments: shop("Store_1800x800px_Shopify_7e52e281-e262-4e30-baeb-5e2b51fd6ada.png", 1920),

  /** Departments page hero + rows. */
  deptHero: shop("Hero_Hardware.png", 1920),
  deptHardware: shop("Store_500x300px_Shopify_03196c42-d392-49f8-8d6c-6e1179d94431.png", 800),
  deptPaint: shop("Untitled_design_-_2023-12-06T092301.304.png", 800),
  deptElectrical: shop("Untitled_design_-_2023-12-06T091058.756.png", 800),
  deptPlumbing: shop("Untitled_design_-_2023-12-06T091513.072.png", 800),
  deptTools: shop("Untitled_design_-_2023-12-06T091747.387.png", 800),
  deptSportingGoods: shop("Store_500x300px_Shopify_2_1b8cbd54-9a91-4086-9a05-89f169f41ef5.png", 800),
  deptSeasonalHoliday: shop("Store_500x300px_Shopify_3_cbf99b5b-faf7-4beb-9a44-ba131b88d21a.png", 800),

  /** Homepage paint banner. */
  bannerPaintMatching: shop("Paint_1800x800px_Shopify.png", 1920),

  /** Services page hero + rows. */
  svcHero: shop("Quotes_Estimates_1800x800px_Shopify.png", 1920),
  svcQuotes: shop("Quotes_Estimates_500x300px_Shopify.png", 800),
  svcKeyCutting: shop("Keys_500x300px_Shopify.png", 800),
  svcLockRekeying: shop("Lock_Rekeying_500x300px_Shopify.png", 800),
  svcPaintMatching: shop("Paint_Matching_Mixing_500x300px_Shopify.png", 800),
  svcSpecialOrdering: shop("Special_Ordering_500x300px_Shopify.png", 800),

  /** About page. */
  aboutHero: shop("Store_1800x800px_Shopify_3.png", 1920),
  aboutStory: shop("Store_1800x800px_Shopify_cbed1a03-5622-4ef7-a16f-1efd3def4313.png", 800),
} as const;

export const locationSlug = "daubys-true-value-hardware";
export const locationsHref = `/locations/${locationSlug}`;

export function withShopifyLogo<T extends { site: { owner: { logo?: string | null } } }>(
  chrome: T,
): T {
  chrome.site.owner.logo = images.logo;
  return chrome;
}
