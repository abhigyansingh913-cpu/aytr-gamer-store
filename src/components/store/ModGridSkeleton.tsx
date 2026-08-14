export function ModGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-hidden="true" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass animate-pulse overflow-hidden rounded-2xl p-2">
          <div className="aspect-square rounded-xl bg-[color-mix(in_oklab,var(--gold)_18%,white)]" />
          <div className="space-y-1.5 px-1 pb-1 pt-2.5">
            <div className="h-3 w-3/4 rounded bg-[color-mix(in_oklab,var(--gold)_18%,white)]" />
            <div className="h-2.5 w-1/3 rounded bg-[color-mix(in_oklab,var(--gold)_14%,white)]" />
            <div className="h-6 w-full rounded-lg bg-[color-mix(in_oklab,var(--gold)_20%,white)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
