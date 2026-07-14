import { useCallback, useEffect, useState } from "react";
import { get, onValue, ref } from "firebase/database";
import { db } from "@/lib/firebase";
import { cacheMods, loadCachedMods } from "@/lib/offline-cache";
import type { Mod } from "@/lib/types";

function toModList(value: Record<string, Omit<Mod, "id">> | null): Mod[] {
  const list: Mod[] = value
    ? Object.entries(value).map(([id, data]) => ({
        id,
        ...data,
        screenshots: data.screenshots ?? [],
      }))
    : [];
  list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return list;
}

export function useMods() {
  const [mods, setMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Load cached data immediately for offline speed
    loadCachedMods().then((cached) => {
      if (cancelled) return;
      if (cached.length > 0) {
        setMods(cached);
        setFromCache(true);
        setLoading(false);
      }
    });

    const modsRef = ref(db, "mods");
    const unsub = onValue(
      modsRef,
      (snapshot) => {
        if (cancelled) return;
        const value = snapshot.val() as Record<string, Omit<Mod, "id">> | null;
        const list = toModList(value);
        setMods(list);
        setFromCache(false);
        setLoading(false);
        cacheMods(list);
      },
      (err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return { mods, loading, error, fromCache };
}

export function useAdminMods() {
  const [mods, setMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await get(ref(db, "mods"));
      const value = snapshot.val() as Record<string, Omit<Mod, "id">> | null;
      const list = toModList(value);
      setMods(list);
      cacheMods(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load mods");
      const cached = await loadCachedMods();
      if (cached.length > 0) setMods(cached);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    if (typeof window === "undefined") return;
    window.addEventListener("aytr-admin-mods-refresh", refresh);
    return () => window.removeEventListener("aytr-admin-mods-refresh", refresh);
  }, [refresh]);

  return { mods, loading, error, refresh };
}

export function useMod(id: string) {
  const { mods, loading, error } = useMods();
  return { mod: mods.find((m) => m.id === id) ?? null, loading, error };
}
