import type { SiteData, SocialProfiles } from "@mightylocalsites/astro-data";

/** Social profiles not yet in the v1 API — merged into chrome at request time. */
export const socialProfiles: SocialProfiles = {};

/** Patch API site data with local social links (API values win on conflict). */
export function patchSiteData(site: SiteData): SiteData {
  return {
    ...site,
    profiles: { ...socialProfiles, ...site.profiles },
  };
}
