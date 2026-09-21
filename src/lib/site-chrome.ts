export { applyCache, getSiteConfig, siteClient } from "@mightylocalsites/astro-site/data";
export type { SiteChrome, SiteConfig } from "@mightylocalsites/astro-site/data";

import { getSiteChrome as baseGetSiteChrome, siteClient } from "@mightylocalsites/astro-site/data";
import type { SiteChrome } from "@mightylocalsites/astro-site/data";
import type { ContentNode, Location, SiteContent } from "@mightylocalsites/astro-data";
import { patchSiteData, patchLocation, mergeLocationRecord } from "../data/site";

/** Site chrome with local social profiles merged from site data. */
export async function getSiteChrome(
  response: { headers: Headers },
): Promise<SiteChrome> {
  const chrome = await baseGetSiteChrome(response);
  return { ...chrome, site: patchSiteData(chrome.site) };
}

const emptyContent: SiteContent = { owner: { id: "" } };

/** Fetch offers/events from the v1 API; degrade to empty lists when unavailable. */
export async function getSiteContentSafe(
  response: { headers: Headers },
  nodes: ContentNode[],
): Promise<{ data: SiteContent; cacheControl: string | null }> {
  try {
    return await siteClient().getSiteContent(nodes);
  } catch {
    response.headers.set("Cache-Control", "no-store");
    return { data: emptyContent, cacheControl: null };
  }
}

function resolveLocationFromList(
  slug: string,
  locations: Location[],
): Location | null {
  const exact = locations.find((loc) => loc.slug === slug);
  if (exact) return exact;
  return locations.length === 1 ? locations[0]! : null;
}

/** Fetch a location by slug; fall back to patched chrome data for single-store sites. */
export async function getLocationSafe(
  slug: string,
  chrome: SiteChrome,
): Promise<{ data: Location | null; cacheControl: string | null }> {
  const fromList = resolveLocationFromList(slug, chrome.site.locations);

  try {
    const result = await siteClient().getLocation(slug);
    if (result.data) {
      return {
        data: patchLocation(mergeLocationRecord(result.data, fromList)),
        cacheControl: result.cacheControl,
      };
    }

    if (fromList && fromList.slug !== slug) {
      const alt = await siteClient().getLocation(fromList.slug);
      if (alt.data) {
        return {
          data: patchLocation(mergeLocationRecord(alt.data, fromList)),
          cacheControl: alt.cacheControl,
        };
      }
    }
  } catch {
    /* API unavailable — use local fallback below */
  }

  return { data: fromList ? patchLocation(fromList) : null, cacheControl: null };
}
