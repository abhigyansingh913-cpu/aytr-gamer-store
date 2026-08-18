import { useCallback, useEffect, useState } from "react";
import { get, onValue, ref } from "firebase/database";
import { db } from "@/lib/firebase";
import { cacheMods, loadCachedMods } from "@/lib/offline-cache";
import { DB_PATHS, MOD_FETCH_LIMIT } from "@/lib/constants";
import { normalizeCategory, normalizeMod, type Category, type Mod } from "@/lib/types";

function toModList(value: Record<string, Record<string, unknown>> | null): Mod[] {
  const list: Mod[] = value
    ? Object.entries(value)
        .map(([id, data]) => normalizeMod(id, data))
        .slice(0, MOD_FETCH_LIMIT)
    : [];
  list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return list;
}

function toCategoryList(value: Record<string, Record<string, unknown>> | null): Category[] {
  const list: Category[] = value
    ? Object.entries(value).map(([id, data]) => normalizeCategory(id, data))
    : [];
  list.sort((a, b) => a.order - b.order);
  return list;
}

/** Public store hook — only published mods, newest first, cached offline. */
export function useMods() {
  const [mods, setMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    loadCachedMods().then((cached) => {
      if (cancelled) return;
      if (cached.length > 0) {
        setMods(cached);
        setFromCache(true);
        setLoading(false);
      }
    });

    const modsRef = ref(db, DB_PATHS.mods);
    const unsub = onValue(
      modsRef,
      (snapshot) => {
        if (cancelled) return;
        const list = toModList(snapshot.val() as Record<string, Record<string, unknown>> | null);
        const published = list.filter((m) => m.published);
        setMods(published);
        setFromCache(false);
        setLoading(false);
        void cacheMods(published);
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
  }, [attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  const refresh = useCallback(() => setAttempt((a) => a + 1), []);

  return { mods, loading, error, fromCache, retry, refresh };
}

/** Admin store hook — ALL mods including unpublished. */
export function useAdminMods() {
  const [mods, setMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await get(ref(db, DB_PATHS.mods));
      const list = toModList(snapshot.val() as Record<string, Record<string, unknown>> | null);
      setMods(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
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

/** Single mod detail (live). */
export function useMod(id: string) {
  const [mod, setMod] = useState<Mod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    loadCachedMods().then((cached) => {
      if (cancelled) return;
      const found = cached.find((m) => m.id === id);
      if (found) {
        setMod(found);
        setLoading(false);
      }
    });

    const modRef = ref(db, `${DB_PATHS.mods}/${id}`);
    const unsub = onValue(
      modRef,
      (snapshot) => {
        if (cancelled) return;
        const value = snapshot.val() as Record<string, unknown> | null;
        if (value) {
          setMod(normalizeMod(id, value));
        } else {
          setMod(null);
        }
        setLoading(false);
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
  }, [id]);

  return { mod, loading, error };
}

/** Managed categories, merged with fallback defaults when none exist. */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await get(ref(db, DB_PATHS.categories));
      const list = toCategoryList(snapshot.val() as Record<string, Record<string, unknown>> | null);
      const enabled = list.filter((c) => c.enabled);
      setCategories(enabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { categories, loading, error, refresh };
}

/** Admin variant — includes disabled categories. */
export function useAdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await get(ref(db, DB_PATHS.categories));
      const list = toCategoryList(snapshot.val() as Record<string, Record<string, unknown>> | null);
      setCategories(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { categories, loading, error, refresh };
}
