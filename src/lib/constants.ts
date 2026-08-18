import { FALLBACK_CATEGORIES } from "./types";

/** RTDB paths */
export const DB_PATHS = {
  mods: "mods",
  ads: "ads",
  categories: "categories",
  /** Node holding admin UIDs for RTDB-rule authorization. */
  admins: "admins",
} as const;

/** Storage folders */
export const STORAGE = {
  thumbnails: "thumbnails",
  screenshots: "screenshots",
  files: "files",
  banners: "banners",
} as const;

/** Client-side caps (avoids pulling unbounded datasets on mid-range devices). */
export const MOD_FETCH_LIMIT = 300;

export const MAX_IMAGE_MB = 5;
export const MAX_FILE_MB = 200;
export const MAX_SCREENSHOTS = 8;
export const MAX_TAGS = 6;
export const MAX_TAG_LENGTH = 24;

/** Home sections */
export const HOME = {
  featured: 4,
  latest: 8,
  popular: 8,
  pageSize: 12,
} as const;

/** Version string of the current app build (shown in admin dashboard). */
export const APP_VERSION = "2.0.0";

/** Branding */
export const BRAND = {
  name: "AYT R STORE",
  tagline: "Premium Minecraft mods & add-ons",
  logo: "https://i.ibb.co/JjQZmMfc/Picsart-26-04-24-17-21-31-070.jpg",
};

export function legacyCategoryName(category: string): string {
  if (!category) return "Other";
  return FALLBACK_CATEGORIES.includes(category as (typeof FALLBACK_CATEGORIES)[number])
    ? category
    : category;
}
