export function ModGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-hidden="true" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="surface animate-pulse overflow-hidden rounded-2xl">
          <div className="aspect-square bg-white/5" />
          <div className="space-y-1.5 p-2.5">
            <div className="h-3 w-3/4 rounded bg-white/10" />
            <div className="h-2.5 w-1/3 rounded bg-white/5" />
            <div className="h-6 w-full rounded-lg bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
