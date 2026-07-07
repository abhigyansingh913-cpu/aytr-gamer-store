export const CATEGORIES = [
  "Texture Packs",
  "Skins",
  "APKs",
  "Add-ons",
  "MC Templates",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Mod {
  id: string;
  title: string;
  description: string;
  category: Category;
  imageUrl: string;
  screenshots: string[];
  downloadLink: string;
  version: string;
  size: string;
  youtubeUrl?: string;
  createdAt: number;
}

export type ModInput = Omit<Mod, "id" | "createdAt">;
