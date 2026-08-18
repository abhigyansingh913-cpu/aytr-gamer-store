import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { AppCard } from "@/components/store/AppCard";
import { ModGridSkeleton } from "@/components/store/ModGridSkeleton";
import { useMods } from "@/hooks/use-mods";
import { useFavorites } from "@/hooks/use-favorites";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const { mods, loading } = useMods();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const favMods = mods.filter((m) => favorites.includes(m.id));

  return (
    <StoreShell title="Your saved items">
      {loading && mods.length === 0 ? (
        <ModGridSkeleton />
      ) : favMods.length === 0 ? (
        <div className="surface animate-fade-up flex flex-col items-center rounded-2xl py-16 text-center">
          <Heart className="h-10 w-10 text-accent-red" />
          <p className="mt-4 font-display text-lg font-semibold text-white">No favorites yet</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Tap the heart on any item to save it here.
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex rounded-xl bg-accent-red px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-red)]"
          >
            Explore the store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {favMods.map((mod, i) => (
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
