import type { Category, Mod } from "./types";

/**
 * Resolves the display name of a mod's category.
 * - If the mod carries a categoryId, look it up in the managed list.
 * - Otherwise fall back to the legacy free-text `category` field.
 * - Missing/empty values fall back to "Other".
 */
export function categoryNameFor(
  mod: Pick<Mod, "category" | "categoryId">,
  categories: Category[],
): string {
  if (mod.categoryId) {
    const found = categories.find((c) => c.id === mod.categoryId && c.enabled);
    if (found) return found.name;
  }
  const legacy = mod.category?.trim();
  return legacy || "Other";
}

/** A single category label for filters, chips, etc. */
export function categoryLabel(category: Category): string {
  return category.name;
}
