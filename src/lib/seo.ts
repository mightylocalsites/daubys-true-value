/** SEO helpers — canonical URLs and shared Open Graph defaults. */
import { images } from "../data/images";

export const DEFAULT_OG_IMAGE = images.heroWelcome;

export function pageCanonical(url: URL, site?: URL | string | null): string {
  return new URL(url.pathname, site ?? url.origin).href;
}
