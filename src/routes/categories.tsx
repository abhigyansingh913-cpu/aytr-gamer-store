import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PackageOpen, RefreshCw } from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { AppCard } from "@/components/store/AppCard";
import { ModGridSkeleton } from "@/components/store/ModGridSkeleton";
import { CategoryChips } from "@/components/store/CategoryChips";
import { useCategories, useMods } from "@/hooks/use-mods";
import { useFavorites } from "@/hooks/use-favorites";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const [active, setActive] = useState<string>("all");
  const { mods, loading, error, retry } = useMods();
  const { categories } = useCategories();
  const { isFavorite, toggleFavorite } = useFavorites();

  const chips = useMemo(() => {
    const names = new Set<string>();
    for (const c of categories) names.add(c.name);
    for (const m of mods) names.add(m.category);

    const counts = new Map<string, number>();
    for (const m of mods) counts.set(m.category, (counts.get(m.category) ?? 0) + 1);

    const list = [{ id: "all", label: "All", count: mods.length }];
    for (const name of Array.from(names)) {
      list.push({ id: name, label: name, count: counts.get(name) ?? 0 });
    }
    return list;
  }, [categories, mods]);

  const filtered = useMemo(
    () => (active === "all" ? mods : mods.filter((m) => m.category === active)),
    [mods, active],
  );

  return (
    <StoreShell title="Browse by category">
      <div className="mb-4">
        <CategoryChips chips={chips} activeId={active} onSelect={setActive} />
      </div>

      {error ? (
        <div className="surface flex flex-col items-center rounded-2xl py-16 text-center">
          <RefreshCw className="h-10 w-10 text-accent-red" />
          <p className="mt-4 font-display text-lg font-semibold text-white">
            Couldn't load categories
          </p>
          <button
            type="button"
            onClick={retry}
            className="mt-4 rounded-xl bg-accent-red px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-red)] active:scale-95"
          >
            Try again
          </button>
        </div>
      ) : loading && mods.length === 0 ? (
        <ModGridSkeleton />
      ) : filtered.length === 0 ? (
        <div className="surface flex flex-col items-center rounded-2xl py-16 text-center">
          <PackageOpen className="h-10 w-10 text-accent-red" />
          <p className="mt-3 text-sm text-muted-foreground">No items in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((mod, i) => (
            <AppCard
              key={mod.id}
              mod={mod}
              index={i}
              isFavorite={isFavorite(mod.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </StoreShell>
  );
}
