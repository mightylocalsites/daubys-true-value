export { applyCache, getSiteConfig, siteClient } from "@mightylocalsites/astro-site/data";
export type { SiteChrome, SiteConfig } from "@mightylocalsites/astro-site/data";

import { getSiteChrome as baseGetSiteChrome, siteClient } from "@mightylocalsites/astro-site/data";
import type { SiteChrome } from "@mightylocalsites/astro-site/data";
import type { ContentNode, SiteContent } from "@mightylocalsites/astro-data";
import { patchSiteData } from "../data/site";

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
