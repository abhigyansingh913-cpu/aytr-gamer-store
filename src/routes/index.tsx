import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const { mods, loading } = useMods();
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("aytr-splash-seen")) setShowSplash(false);
  }, []);

  const finishSplash = () => {
    sessionStorage.setItem("aytr-splash-seen", "1");
    setShowSplash(false);
  };

  if (showSplash) return <Splash onFinish={finishSplash} />;

  return (
    <StoreShell title="Discover premium mods">
      <section className="glass-gold animate-float-up mb-5 rounded-2xl p-5">
        <h2 className="font-display text-xl font-bold">
          Welcome to <span className="text-gradient-gold">AYT R STORE</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse texture packs, skins, add-ons & templates — all in one premium hub.
        </p>
      </section>

      <div className="animate-float-up mb-5 space-y-3">
        <AdBanner />
        <AdSenseUnit className="min-h-[90px]" />
      </div>



      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--gold-dark)]" />
          <p className="mt-3 text-sm">Loading mods…</p>
        </div>
      ) : mods.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {mods.map((mod, i) => (
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

function EmptyState() {
  return (
    <div className="glass animate-float-up flex flex-col items-center rounded-2xl py-16 text-center">
      <PackageOpen className="h-10 w-10 text-[var(--gold-dark)]" />
      <p className="mt-4 font-display text-lg font-semibold">No mods yet</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Uploaded mods will appear here automatically. Add some from the admin
        panel in Settings.
      </p>
    </div>
  );
}
