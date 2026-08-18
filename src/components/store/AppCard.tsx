import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Download, Star } from "lucide-react";
import type { Mod } from "@/lib/types";
import { cn, cleanImageUrl, onImageError } from "@/lib/utils";

function AppCardBase({
  mod,
  index = 0,
  isFavorite,
  onToggleFavorite,
}: {
  mod: Mod;
  index?: number;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const eager = index < 4;
  return (
    <div
      className="surface group flex flex-col overflow-hidden rounded-2xl"
      style={{ contentVisibility: "auto", containIntrinsicSize: "280px" }}
    >
      <Link
        to="/app/$id"
        params={{ id: mod.id }}
        className="relative block aspect-square overflow-hidden rounded-t-2xl bg-black/40"
      >
        <img
          src={cleanImageUrl(mod.imageUrl)}
          alt={mod.title}
          width={300}
          height={300}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={onImageError}
          fetchPriority={eager ? "high" : "low"}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {mod.featured && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent-red px-2 py-0.5 text-[10px] font-bold text-white shadow-[var(--shadow-red)]">
            <Star className="h-3 w-3 fill-current" /> Featured
          </span>
        )}
      </Link>

      <button
        type="button"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        onClick={() => onToggleFavorite(mod.id)}
        className="icon-glass absolute right-3 top-3 z-10 rounded-full p-1.5 transition-transform active:scale-90"
        style={{ contentVisibility: "visible" }}
      >
        <Heart
          className={cn(
            "h-4 w-4",
            isFavorite ? "fill-accent-red text-accent-red" : "text-white/80",
          )}
        />
      </button>

      <div className="flex flex-1 flex-col gap-1 p-2.5 pt-2">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-white/60">
            {mod.category}
          </span>
          <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-semibold text-white/50">
            <Download className="h-3 w-3" />
            {mod.downloads.toLocaleString()}
          </span>
        </div>

        <h3 className="line-clamp-1 font-display text-sm font-semibold text-white">{mod.title}</h3>
        <p className="line-clamp-1 text-[11px] text-muted-foreground">{mod.description}</p>
        <p className="text-[10px] font-medium text-white/40">v{mod.version}</p>

        <Link
          to="/app/$id"
          params={{ id: mod.id }}
          className="mt-1.5 inline-flex items-center justify-center gap-1 rounded-lg bg-accent-red/90 px-2 py-1.5 text-xs font-bold text-white transition-colors hover:bg-accent-red active:scale-95"
        >
          <Download className="h-3.5 w-3.5" />
          Open
        </Link>
      </div>
    </div>
  );
}

export const AppCard = memo(
  AppCardBase,
  (a, b) =>
    a.mod.id === b.mod.id &&
    a.isFavorite === b.isFavorite &&
    a.index === b.index &&
    a.onToggleFavorite === b.onToggleFavorite,
);
