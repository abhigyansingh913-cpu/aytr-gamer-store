/**
 * AYT R STORE data model.
 *
 * Kept backward-compatible with the original schema:
 *  - `mods/{id}` still uses `title/description/category/imageUrl/screenshots/
 *    downloadLink/version/size/youtubeUrl/createdAt`.
 *  - New fields are optional on read and defaulted when missing, so legacy
 *    records keep working without a data migration.
 */

/** Default categories shown when the admin has not created any yet. */
export const FALLBACK_CATEGORIES = [
  "Texture Packs",
  "Skins",
  "Add-ons",
  "MC Templates",
  "Other",
] as const;

export type FallbackCategory = (typeof FALLBACK_CATEGORIES)[number];

export interface Category {
  id: string;
  name: string;
  /** Legacy string names (e.g. "APKs") are preserved as display names too. */
  slug?: string;
  order: number;
  enabled: boolean;
  createdAt: number;
}

export interface Mod {
  id: string;
  title: string;
  description: string;
  /** Legacy free-text category name (always present on old records). */
  category: string;
  /** Optional link to a managed category node. */
  categoryId?: string;
  imageUrl: string;
  screenshots: string[];
  downloadLink: string;
  version: string;
  size: string;
  youtubeUrl?: string;
  tags: string[];
  downloads: number;
  featured: boolean;
  published: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Ad {
  id: string;
  imageUrl: string;
  linkUrl: string;
  active: boolean;
  createdAt: number;
}

export type ModInput = Omit<Mod, "id" | "createdAt" | "updatedAt" | "downloads">;

/** Normalizes a raw record into a full Mod with safe defaults. */
export function normalizeMod(id: string, data: Record<string, unknown> | null | undefined): Mod {
  const createdAt = typeof data?.createdAt === "number" ? data.createdAt : Date.now();
  return {
    id,
    title: String(data?.title ?? "Untitled"),
    description: String(data?.description ?? ""),
    category: String(data?.category ?? "Other"),
    categoryId: typeof data?.categoryId === "string" ? data.categoryId : undefined,
    imageUrl: String(data?.imageUrl ?? ""),
    screenshots: Array.isArray(data?.screenshots) ? data.screenshots.map(String) : [],
    downloadLink: String(data?.downloadLink ?? ""),
    version: String(data?.version ?? ""),
    size: String(data?.size ?? ""),
    youtubeUrl: typeof data?.youtubeUrl === "string" ? data.youtubeUrl : undefined,
    tags: Array.isArray(data?.tags) ? data.tags.map(String) : [],
    downloads: typeof data?.downloads === "number" ? data.downloads : 0,
    featured: Boolean(data?.featured),
    published: data?.published === false ? false : true,
    createdAt,
    updatedAt: typeof data?.updatedAt === "number" ? data.updatedAt : createdAt,
  };
}

export function normalizeCategory(
  id: string,
  data: Record<string, unknown> | null | undefined,
): Category {
  return {
    id,
    name: String(data?.name ?? "Category"),
    slug: typeof data?.slug === "string" ? data.slug : undefined,
    order: typeof data?.order === "number" ? data.order : 0,
    enabled: data?.enabled === false ? false : true,
    createdAt: typeof data?.createdAt === "number" ? data.createdAt : Date.now(),
  };
}
