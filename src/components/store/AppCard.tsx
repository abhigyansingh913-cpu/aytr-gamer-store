import { Link } from "@tanstack/react-router";
import { Heart, Download } from "lucide-react";
import type { Mod } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AppCard({
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
  return (
    <div
      className="group glass animate-float-up relative flex flex-col overflow-hidden rounded-2xl p-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-gold-lg)]"
      style={{ animationDelay: `${Math.min(index * 60, 480)}ms` }}
    >
      <Link
        to="/app/$id"
        params={{ id: mod.id }}
        className="relative block aspect-square overflow-hidden rounded-xl"
      >
        <img
          src={mod.imageUrl}
          alt={mod.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span className="absolute left-2 top-2 rounded-full bg-gradient-gold px-2 py-0.5 text-[10px] font-semibold text-gold-foreground shadow">
          {mod.category}
        </span>
      </Link>

      <button
        type="button"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        onClick={() => onToggleFavorite(mod.id)}
        className="glass absolute right-3 top-3 z-10 rounded-full p-1.5 transition-transform active:scale-90"
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            isFavorite
              ? "fill-[var(--gold)] text-[var(--gold-dark)]"
              : "text-muted-foreground",
          )}
        />
      </button>

      <div className="flex flex-1 flex-col gap-1 px-1 pt-2">
        <h3 className="line-clamp-1 font-display text-sm font-semibold">
          {mod.title}
        </h3>
        <p className="text-[11px] text-muted-foreground">v{mod.version}</p>
        <Link
          to="/app/$id"
          params={{ id: mod.id }}
          className="mt-1.5 inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-gold px-2 py-1.5 text-xs font-semibold text-gold-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.03] active:scale-95"
        >
          <Download className="h-3.5 w-3.5" />
          Open
        </Link>
      </div>
    </div>
  );
}
