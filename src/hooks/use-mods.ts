import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "@/lib/firebase";
import type { Mod } from "@/lib/types";

export function useMods() {
  const [mods, setMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const modsRef = ref(db, "mods");
    const unsub = onValue(
      modsRef,
      (snapshot) => {
        const value = snapshot.val() as Record<string, Omit<Mod, "id">> | null;
        const list: Mod[] = value
          ? Object.entries(value).map(([id, data]) => ({
              id,
              ...data,
              screenshots: data.screenshots ?? [],
            }))
          : [];
        list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
        setMods(list);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  return { mods, loading, error };
}

export function useMod(id: string) {
  const { mods, loading, error } = useMods();
  return { mod: mods.find((m) => m.id === id) ?? null, loading, error };
}
