import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { AppCard } from "@/components/store/AppCard";
import { ModGridSkeleton } from "@/components/store/ModGridSkeleton";
import { useMods } from "@/hooks/use-mods";
import { useFavorites } from "@/hooks/use-favorites";
import { CATEGORIES, type Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const [active, setActive] = useState<Category | "All">("All");
  const { mods, loading } = useMods();
  const { isFavorite, toggleFavorite } = useFavorites();

  const counts = new Map<string, number>();
  for (const m of mods) counts.set(m.category, (counts.get(m.category) ?? 0) + 1);

  const filtered = active === "All" ? mods : mods.filter((m) => m.category === active);

  return (
    <StoreShell title="Browse by category">
      <div className="mb-4 flex flex-wrap gap-2">
        {(["All", ...CATEGORIES] as const).map((cat) => {
          const count = cat === "All" ? mods.length : (counts.get(cat) ?? 0);
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-300",
                active === cat
                  ? "bg-gradient-gold text-gold-foreground shadow-[var(--shadow-gold)]"
                  : "glass text-muted-foreground hover:text-foreground",
              )}
            >
              {cat}
              {count > 0 && (
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    active === cat
                      ? "bg-gold-foreground/15 text-gold-foreground"
                      : "bg-[color-mix(in_oklab,var(--gold)_18%,white)] text-[var(--gold-dark)]",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading && mods.length === 0 ? (
        <ModGridSkeleton />
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-sm text-muted-foreground">
          No mods in this category yet.
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
