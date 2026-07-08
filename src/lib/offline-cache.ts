import { get, set } from "idb-keyval";
import type { Mod } from "@/lib/types";

const MODS_KEY = "aytr-cached-mods";
const TIMESTAMP_KEY = "aytr-cached-at";

export async function cacheMods(mods: Mod[]) {
  try {
    await set(MODS_KEY, mods);
    await set(TIMESTAMP_KEY, Date.now());
  } catch {
    /* IndexedDB may be unavailable */
  }
}

export async function loadCachedMods(): Promise<Mod[]> {
  try {
    const mods = await get<Mod[]>(MODS_KEY);
    return mods ?? [];
  } catch {
    return [];
  }
}

export async function getCachedAt(): Promise<number | null> {
  try {
    const ts = await get<number>(TIMESTAMP_KEY);
    return ts ?? null;
  } catch {
    return null;
  }
}
