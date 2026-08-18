import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Settings, Search } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StoreShell({
  children,
  title,
  hideBottomNav = false,
  perfFlat = false,
}: {
  children: ReactNode;
  title?: string;
  hideBottomNav?: boolean;
  perfFlat?: boolean;
}) {
  const navigate = useNavigate();
  const goSearch = () => {
    void navigate({ to: "/" });
    window.setTimeout(() => window.dispatchEvent(new CustomEvent("aytr-focus-search")), 60);
  };
  return (
    <div className={cn("min-h-screen", hideBottomNav ? "pb-6" : "pb-28", perfFlat && "perf-flat")}>
      <header className="sticky top-0 z-40 px-4 pt-3">
        <div className="glass mx-auto flex max-w-3xl items-center gap-2 rounded-2xl px-3 py-2.5">
          <Link to="/" className="flex min-w-0 flex-1 items-center gap-3">
            <img
              src={BRAND.logo}
              alt="AYT R STORE logo"
              width={40}
              height={40}
              decoding="async"
              className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
            />
            <div className="min-w-0 leading-tight">
              <p className="font-display text-[15px] font-bold tracking-tight text-white">
                AYT R <span className="text-gradient-accent">STORE</span>
              </p>
              {title && <p className="truncate text-[11px] text-muted-foreground">{title}</p>}
            </div>
          </Link>

          <button
            type="button"
            onClick={goSearch}
            aria-label="Search"
            className="icon-glass flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform active:scale-90"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
          <Link
            to="/settings"
            aria-label="Settings"
            className="icon-glass flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform active:scale-90"
          >
            <Settings className="h-[18px] w-[18px]" strokeWidth={2} />
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pt-4">{children}</main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
