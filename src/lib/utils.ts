import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SyntheticEvent } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const IMAGE_FALLBACK =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="#f3ead1"/><g fill="#caa64e"><rect x="110" y="110" width="80" height="80" rx="12"/><rect x="130" y="130" width="40" height="40" rx="6"/></g></svg>`,
  );

/** Handles a broken image by swapping in a branded placeholder. */
export function onImageError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.src !== IMAGE_FALLBACK) {
    img.src = IMAGE_FALLBACK;
  }
}

/**
 * Extracts a clean direct URL from a raw string that may contain a pasted
 * HTML embed snippet (e.g. ibb.co's `<a href="..."><img src="..."></a>`).
 */
export function cleanImageUrl(raw: string): string {
  if (!raw) return "";
  const value = raw.trim();

  // 1) Pull the src out of an <img ... src="..."> if present.
  const imgMatch = value.match(/<img[^>]*\ssrc=["']([^"']+)["']/i);
  if (imgMatch?.[1]) return imgMatch[1].trim();

  // 2) Otherwise grab the first direct image URL in the string.
  const directMatch = value.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif|avif)/i);
  if (directMatch?.[0]) return directMatch[0];

  // 3) Fall back to the value up to the first quote/angle bracket.
  return value.split(/["'<>]/)[0].trim();
}
