import { useCallback, useEffect, useState } from "react";
import { get, onValue, ref } from "firebase/database";
import { db } from "@/lib/firebase";
import type { Ad } from "@/lib/types";

function toAdList(value: Record<string, Omit<Ad, "id">> | null): Ad[] {
  const list: Ad[] = value
    ? Object.entries(value).map(([id, data]) => ({
        id,
        imageUrl: data.imageUrl ?? "",
        linkUrl: data.linkUrl ?? "",
        active: data.active ?? true,
        createdAt: data.createdAt ?? 0,
      }))
    : [];
  list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return list;
}

export function useAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adsRef = ref(db, "ads");
    const unsub = onValue(
      adsRef,
      (snapshot) => {
        const value = snapshot.val() as Record<string, Omit<Ad, "id">> | null;
        const list = toAdList(value);
        setAds(list);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, []);

  return { ads, loading };
}

export function useAdminAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await get(ref(db, "ads"));
      const value = snapshot.val() as Record<string, Omit<Ad, "id">> | null;
      setAds(toAdList(value));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ads, loading, error, refresh };
}
