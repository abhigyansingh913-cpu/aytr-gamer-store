import { Link, useRouterState } from "@tanstack/react-router";
import { Settings, Heart, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/categories", label: "Categories", icon: LayoutGrid },
  { to: "/favorites", label: "Favorites", icon: Heart },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="glass flex items-center gap-1 rounded-full p-1.5 shadow-[var(--shadow-gold-lg)]">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-full px-5 py-2.5 text-xs font-medium transition-all duration-300",
                active
                  ? "bg-gradient-gold text-gold-foreground shadow-[var(--shadow-gold)] scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2.2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
