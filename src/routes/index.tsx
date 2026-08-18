import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Flame,
  Loader2,
  PackageOpen,
  RefreshCw,
  SearchX,
  Sparkles,
  Timer,
  LayoutGrid,
} from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { AppCard } from "@/components/store/AppCard";
import { Splash } from "@/components/store/Splash";
import { ModGridSkeleton } from "@/components/store/ModGridSkeleton";
import { SearchBar } from "@/components/store/SearchBar";
import { CategoryChips, type Chip } from "@/components/store/CategoryChips";
import { SectionHeader } from "@/components/store/SectionHeader";
import { AdBanner } from "@/components/store/AdBanner";
import { AdSenseUnit } from "@/components/store/AdSenseUnit";
import { useMods, useCategories } from "@/hooks/use-mods";
import { useFavorites } from "@/hooks/use-favorites";
import { HOME, BRAND } from "@/lib/constants";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const { mods, loading, error, fromCache, retry } = useMods();
  const { categories } = useCategories();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("aytr-splash-seen")) setShowSplash(false);
  }, []);

  const finishSplash = useCallback(() => {
    sessionStorage.setItem("aytr-splash-seen", "1");
    setShowSplash(false);
  }, []);

  const catCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of mods) counts.set(m.category, (counts.get(m.category) ?? 0) + 1);
    return counts;
  }, [mods]);

  const chips = useMemo<Chip[]>(() => {
    const list: Chip[] = [{ id: "all", label: "All", count: mods.length }];
    const names = new Set<string>();
    for (const c of categories) names.add(c.name);
    for (const m of mods) names.add(m.category);
    for (const name of Array.from(names)) {
      list.push({ id: name, label: name, count: catCounts.get(name) ?? 0 });
    }
    return list;
  }, [categories, mods, catCounts]);

  const visibleMods = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = mods;
    if (activeCat !== "all") list = list.filter((m) => m.category === activeCat);
    if (q) {
      list = list.filter((m) => {
        const haystack =
          `${m.title} ${m.description} ${m.category} ${m.version} ${m.tags.join(" ")}`.toLowerCase();
        return haystack.includes(q);
      });
    }
    return list;
  }, [mods, query, activeCat]);

  const featured = useMemo(
    () => visibleMods.filter((m) => m.featured).slice(0, HOME.featured),
    [visibleMods],
  );
  const latest = useMemo(
    () => [...visibleMods].sort((a, b) => b.createdAt - a.createdAt).slice(0, HOME.latest),
    [visibleMods],
  );
  const popular = useMemo(
    () => [...visibleMods].sort((a, b) => b.downloads - a.downloads).slice(0, HOME.popular),
    [visibleMods],
  );

  if (showSplash) return <Splash onFinish={finishSplash} />;

  return (
    <StoreShell title={BRAND.tagline}>
      {/* Branding hero */}
      <section className="surface animate-fade-up mb-5 rounded-2xl p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Welcome to
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold leading-tight text-white">
          AYT R <span className="text-gradient-accent">STORE</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {BRAND.tagline}. Fast, secure downloads.
        </p>
      </section>

      <div className="mb-3">
        <SearchBar value={query} onChange={setQuery} autoFocus={false} />
      </div>

      <div className="mb-4">
        <CategoryChips chips={chips} activeId={activeCat} onSelect={(id) => setActiveCat(id)} />
      </div>

      <AdBanner className="mb-4" />

      {error && !fromCache ? (
        <ErrorState onRetry={retry} />
      ) : loading && mods.length === 0 ? (
        <ModGridSkeleton count={6} />
      ) : visibleMods.length === 0 ? (
        <EmptyState
          hasQuery={!!query.trim() || activeCat !== "all"}
          onClear={() => {
            setQuery("");
            setActiveCat("all");
          }}
        />
      ) : (
        <div className="space-y-6">
          {featured.length > 0 && (
            <section>
              <SectionHeader
                title="Featured"
                icon={<Sparkles className="h-4 w-4 text-accent-red" />}
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {featured.map((mod, i) => (
                  <AppCard
                    key={mod.id}
                    mod={mod}
                    index={i}
                    isFavorite={isFavorite(mod.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionHeader
              title="Latest uploads"
              icon={<Timer className="h-4 w-4 text-accent-red" />}
              actionLabel="Browse all"
              onAction={() => navigate({ to: "/categories" })}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {latest.map((mod, i) => (
                <AppCard
                  key={mod.id}
                  mod={mod}
                  index={i}
                  isFavorite={isFavorite(mod.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader
              title="Popular downloads"
              icon={<Flame className="h-4 w-4 text-accent-red" />}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {popular.map((mod, i) => (
                <AppCard
                  key={mod.id}
                  mod={mod}
                  index={i}
                  isFavorite={isFavorite(mod.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader
              title="Categories"
              icon={<LayoutGrid className="h-4 w-4 text-accent-red" />}
              actionLabel="See all"
              onAction={() => navigate({ to: "/categories" })}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {chips
                .filter((c) => c.id !== "all" && (c.count ?? 0) > 0)
                .slice(0, 6)
                .map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => navigate({ to: "/categories" })}
                    className="surface flex flex-col items-start gap-1 rounded-2xl p-4 text-left transition-transform active:scale-95"
                  >
                    <span className="font-display text-sm font-semibold text-white">
                      {chip.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{chip.count} items</span>
                  </button>
                ))}
            </div>
          </section>

          {fromCache && (
            <p className="text-center text-xs text-muted-foreground">
              Showing saved copy — live store data is still loading.
            </p>
          )}
        </div>
      )}

      <AdSenseUnit className="mb-4 mt-6 min-h-[90px]" />
    </StoreShell>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="surface flex flex-col items-center rounded-2xl py-16 text-center">
      <RefreshCw className="h-10 w-10 text-accent-red" />
      <p className="mt-4 font-display text-lg font-semibold text-white">Couldn't load the store</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent-red px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-red)] active:scale-95"
      >
        <RefreshCw className="h-4 w-4" /> Try again
      </button>
    </div>
  );
}

function EmptyState({ hasQuery, onClear }: { hasQuery: boolean; onClear: () => void }) {
  return (
    <div className="surface flex flex-col items-center rounded-2xl py-16 text-center">
      {hasQuery ? (
        <SearchX className="h-10 w-10 text-accent-red" />
      ) : (
        <PackageOpen className="h-10 w-10 text-accent-red" />
      )}
      <p className="mt-4 font-display text-lg font-semibold text-white">
        {hasQuery ? "No matches found" : "No items yet"}
      </p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        {hasQuery
          ? "Try a different keyword or clear the filters."
          : "Published items will appear here automatically."}
      </p>
      {hasQuery && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent-red px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-red)] active:scale-95"
        >
          <Loader2 className="h-4 w-4" /> Clear filters
        </button>
      )}
    </div>
  );
}
