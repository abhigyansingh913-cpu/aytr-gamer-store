import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, PackageOpen } from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { AppCard } from "@/components/store/AppCard";
import { AdBanner } from "@/components/store/AdBanner";
import { AdSenseUnit } from "@/components/store/AdSenseUnit";
import { Splash } from "@/components/store/Splash";
import { useMods } from "@/hooks/use-mods";
import { useFavorites } from "@/hooks/use-favorites";

export const Route = createFileRoute("/")({
  component: Index,
});

const PAGE_SIZE = 12;

function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const { mods, loading } = useMods();
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("aytr-splash-seen")) setShowSplash(false);
  }, []);

  const finishSplash = useCallback(() => {
    sessionStorage.setItem("aytr-splash-seen", "1");
    setShowSplash(false);
  }, []);

  const shownMods = useMemo(() => mods.slice(0, visible), [mods, visible]);
  const canLoadMore = mods.length > visible;

  if (showSplash) return <Splash onFinish={finishSplash} />;

  return (
    <StoreShell title="Discover premium mods">
      <section className="glass-gold mb-5 rounded-2xl p-5">
        <h2 className="font-display text-xl font-bold">
          Welcome to <span className="text-gradient-gold">AYT R STORE</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse texture packs, skins, add-ons & templates — all in one premium hub.
        </p>
      </section>

      <div className="mb-5 space-y-3">
        <AdBanner />
        <AdSenseUnit className="min-h-[90px]" />
      </div>

      {loading && mods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--gold-dark)]" />
          <p className="mt-3 text-sm">Loading mods…</p>
        </div>
      ) : mods.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {shownMods.map((mod, i) => (
              <AppCard
                key={mod.id}
                mod={mod}
                index={i}
                isFavorite={isFavorite(mod.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
          {canLoadMore && (
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="mt-4 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-bold active:scale-95"
            >
              Load more ({mods.length - visible})
            </button>
          )}
        </>
      )}

      {mods.length > 0 && !canLoadMore && (
        <div className="mt-6 space-y-3">
          <AdBanner />
          <AdSenseUnit className="min-h-[90px]" />
        </div>
      )}
    </StoreShell>
  );
}

function EmptyState() {
  return (
    <div className="glass flex flex-col items-center rounded-2xl py-16 text-center">
      <PackageOpen className="h-10 w-10 text-[var(--gold-dark)]" />
      <p className="mt-4 font-display text-lg font-semibold">No mods yet</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Uploaded mods will appear here automatically. Add some from the admin
        panel in Settings.
      </p>
    </div>
  );
}
