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
    <StoreShell title="Your saved mods">
      {loading && mods.length === 0 ? (
        <ModGridSkeleton />
      ) : favMods.length === 0 ? (
        <div className="glass animate-float-up flex flex-col items-center rounded-2xl py-16 text-center">
          <Heart className="h-10 w-10 text-[var(--gold-dark)]" />
          <p className="mt-4 font-display text-lg font-semibold">No favorites yet</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Tap the heart on any mod to save it here.
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex rounded-xl bg-gradient-gold px-4 py-2 text-sm font-semibold text-gold-foreground"
          >
            Explore mods
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
