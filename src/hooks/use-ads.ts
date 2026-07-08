import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "@/lib/firebase";
import type { Ad } from "@/lib/types";

export function useAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adsRef = ref(db, "ads");
    const unsub = onValue(
      adsRef,
      (snapshot) => {
        const value = snapshot.val() as Record<
          string,
          Omit<Ad, "id">
        > | null;
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
        setAds(list);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, []);

  return { ads, loading };
}
