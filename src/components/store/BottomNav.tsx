import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Settings, Heart, LayoutGrid } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/categories", label: "Categories", icon: LayoutGrid },
  { to: "/favorites", label: "Favorites", icon: Heart },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { favorites } = useFavorites();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="glass flex items-center gap-1 rounded-full p-1.5 shadow-[var(--shadow-gold-lg)]">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          const isFavs = to === "/favorites";
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-full px-4 py-2.5 text-xs font-medium transition-all duration-300 sm:px-5",
                active
                  ? "bg-gradient-gold text-gold-foreground shadow-[var(--shadow-gold)] scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
              )}
            >
              <span className="relative">
                <Icon className="h-5 w-5" strokeWidth={2.2} />
                {isFavs && favorites.length > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                    {favorites.length}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
