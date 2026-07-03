import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { AppCard } from "@/components/store/AppCard";
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

  const filtered =
    active === "All" ? mods : mods.filter((m) => m.category === active);

  return (
    <StoreShell title="Browse by category">
      <div className="mb-4 flex flex-wrap gap-2">
        {(["All", ...CATEGORIES] as const).map((cat) => (
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
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--gold-dark)]" />
        </div>
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
