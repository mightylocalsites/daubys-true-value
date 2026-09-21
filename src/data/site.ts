import type {
  Asset,
  BusinessHours,
  Location,
  SiteData,
  SocialProfiles,
} from "@mightylocalsites/astro-data";
import { images } from "./images";

/** Social profiles not yet in the v1 API — merged into chrome at request time. */
export const socialProfiles: SocialProfiles = {};

export const PRIMARY_TIMEZONE = "America/Chicago";

export const primaryBusinessHours: BusinessHours = {};

const fallbackLocation: Location = {
  id: 0,
  name: "Dauby's True Value Hardware",
  slug: "daubys-true-value-hardware",
  location_type: null,
  address: "1522 10th St",
  address2: null,
  locality: "Tell City",
  administrative_area: "IN",
  postal_code: "47586",
  region: null,
  phone: "(812) 547-2566",
  alternate_phone: null,
  alternate_phone_label: null,
  email: "daubyhwde@gmail.com",
  website: null,
  image: { id: 0, src: images.heroWelcome, alt: "Dauby's True Value Hardware" },
  business_hours: primaryBusinessHours,
  special_hours: [],
};

function assetAlt(raw: Record<string, unknown>): string | null {
  return typeof raw.alt === "string"
    ? raw.alt
    : typeof raw.title === "string"
      ? raw.title
      : null;
}

function resolveAssetUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return null;
}

export function normalizeImage(image: Location["image"]): Asset | null {
  if (!image) return null;
  if (typeof image === "string") {
    const src = resolveAssetUrl(image);
    return src ? { id: 0, src, alt: null } : null;
  }
  if (typeof image !== "object") return null;

  const raw = image as Record<string, unknown>;
  if (raw.data && typeof raw.data === "object") {
    return normalizeImage(raw.data as Location["image"]);
  }

  for (const key of ["src", "url", "href", "full_url", "fullUrl", "original_url", "image_url", "imageUrl", "thumbnail"]) {
    const val = raw[key];
    if (typeof val === "string") {
      const src = resolveAssetUrl(val);
      if (src) {
        return {
          id: typeof raw.id === "number" ? raw.id : 0,
          src,
          alt: assetAlt(raw),
        };
      }
    }
  }

  return null;
}

function pickLocationImage(...candidates: Array<Location["image"] | undefined>): Asset | null {
  for (const candidate of candidates) {
    const normalized = normalizeImage(candidate ?? null);
    if (normalized) return normalized;
  }
  return fallbackLocation.image;
}

export function mergeLocationRecord(
  detail: Location,
  fromList: Location | null | undefined,
): Location {
  const extras = detail as Location & {
    photo?: Location["image"];
    hero_image?: Location["image"];
    gallery?: Array<Location["image"]>;
  };
  const galleryLead = extras.gallery?.[0];

  return {
    ...fromList,
    ...detail,
    image:
      pickLocationImage(
        detail.image,
        extras.photo,
        extras.hero_image,
        galleryLead,
        fromList?.image,
      ) ?? fallbackLocation.image,
  };
}

function businessHoursAreUsable(hours: Location["business_hours"]): boolean {
  if (hours == null) return false;
  if (Array.isArray(hours)) return false;
  if (typeof hours === "object") return Object.keys(hours as object).length > 0;
  return false;
}

export function patchLocation(location: Location): Location {
  return {
    ...location,
    address: location.address ?? fallbackLocation.address,
    locality: location.locality ?? fallbackLocation.locality,
    administrative_area:
      location.administrative_area ?? fallbackLocation.administrative_area,
    postal_code: location.postal_code ?? fallbackLocation.postal_code,
    phone: location.phone ?? fallbackLocation.phone,
    email: location.email ?? fallbackLocation.email,
    image: pickLocationImage(location.image),
    business_hours: businessHoursAreUsable(location.business_hours)
      ? location.business_hours
      : primaryBusinessHours,
    special_hours: location.special_hours ?? [],
  };
}

export function resolveTimezone(timezone: string | null | undefined): string {
  const tz = timezone?.trim();
  if (!tz || tz === "UTC") return PRIMARY_TIMEZONE;
  return tz;
}

export function patchSiteData(site: SiteData): SiteData {
  const locations =
    site.locations.length > 0
      ? site.locations.map(patchLocation)
      : [patchLocation(fallbackLocation)];

  const ownerName = site.owner.name?.trim() || fallbackLocation.name;

  return {
    ...site,
    owner: {
      ...site.owner,
      name: ownerName,
      timezone: resolveTimezone(site.owner.timezone),
    },
    profiles: { ...socialProfiles, ...site.profiles },
    locations,
  };
}
