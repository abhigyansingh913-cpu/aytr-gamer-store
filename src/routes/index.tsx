import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, PackageOpen, Search, SearchX, RefreshCw } from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { AppCard } from "@/components/store/AppCard";
import { AdBanner } from "@/components/store/AdBanner";
import { AdSenseUnit } from "@/components/store/AdSenseUnit";
import { Splash } from "@/components/store/Splash";
import { ModGridSkeleton } from "@/components/store/ModGridSkeleton";
import { useMods } from "@/hooks/use-mods";
import { useFavorites } from "@/hooks/use-favorites";

export const Route = createFileRoute("/")({
  component: Index,
});

const PAGE_SIZE = 12;

function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [query, setQuery] = useState("");
  const { mods, loading, error, fromCache, retry } = useMods();
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("aytr-splash-seen")) setShowSplash(false);
  }, []);

  const finishSplash = useCallback(() => {
    sessionStorage.setItem("aytr-splash-seen", "1");
    setShowSplash(false);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mods;
    return mods.filter((m) => {
      const haystack = `${m.title} ${m.description} ${m.category} ${m.version}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [mods, query]);

  const shownMods = useMemo(() => filtered.slice(0, visible), [filtered, visible]);
  const canLoadMore = filtered.length > visible;

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

      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(PAGE_SIZE);
          }}
          placeholder="Search mods, skins, packs…"
          aria-label="Search mods"
          className="glass h-12 w-full rounded-2xl pl-10 pr-10 text-sm font-medium outline-none transition-shadow focus:shadow-[var(--shadow-gold-lg)]"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setVisible(PAGE_SIZE);
            }}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground"
          >
            <SearchX className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mb-5 space-y-3">
        <AdBanner />
        <AdSenseUnit className="min-h-[90px]" />
      </div>

      {error && !fromCache ? (
        <ErrorState onRetry={retry} />
      ) : loading && mods.length === 0 ? (
        <ModGridSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          hasQuery={!!query.trim()}
          onRefine={() => {
            document.querySelector<HTMLInputElement>('input[aria-label="Search mods"]')?.focus();
          }}
        />
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
              Load more ({filtered.length - visible})
            </button>
          )}
        </>
      )}

      {fromCache && (
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Showing saved copy — live store data is still loading.
        </p>
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

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="glass flex flex-col items-center rounded-2xl py-16 text-center">
      <RefreshCw className="h-10 w-10 text-[var(--gold-dark)]" />
      <p className="mt-4 font-display text-lg font-semibold">Couldn't load the store</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Check your connection and try again.
      </p>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-4 py-2 text-sm font-semibold text-gold-foreground shadow-[var(--shadow-gold)] active:scale-95"
      >
        <RefreshCw className="h-4 w-4" /> Try again
      </button>
    </div>
  );
}

function EmptyState({ hasQuery, onRefine }: { hasQuery: boolean; onRefine?: () => void }) {
  return (
    <div className="glass flex flex-col items-center rounded-2xl py-16 text-center">
      {hasQuery ? (
        <SearchX className="h-10 w-10 text-[var(--gold-dark)]" />
      ) : (
        <PackageOpen className="h-10 w-10 text-[var(--gold-dark)]" />
      )}
      <p className="mt-4 font-display text-lg font-semibold">
        {hasQuery ? "No matches found" : "No mods yet"}
      </p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        {hasQuery
          ? "Try a different keyword or clear the search."
          : "Uploaded mods will appear here automatically. Add some from the admin panel in Settings."}
      </p>
      {hasQuery && onRefine && (
        <button
          onClick={onRefine}
          className="mt-4 text-sm font-semibold text-[var(--gold-dark)] underline underline-offset-2"
        >
          Refine your search
        </button>
      )}
    </div>
  );
}
