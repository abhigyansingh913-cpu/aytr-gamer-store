import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BottomNav } from "./BottomNav";

const LOGO = "https://i.ibb.co/JjQZmMfc/Picsart-26-04-24-17-21-31-070.jpg";

export function StoreShell({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 px-4 pt-4">
        <div className="glass mx-auto flex max-w-3xl items-center gap-3 rounded-2xl px-4 py-2.5">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={LOGO}
              alt="AYT R STORE logo"
              className="h-10 w-10 rounded-xl object-cover ring-1 ring-[var(--glass-border)]"
            />
            <div className="leading-tight">
              <p className="font-display text-base font-bold tracking-tight">
                AYT R <span className="text-gradient-gold">STORE</span>
              </p>
              {title && (
                <p className="text-xs text-muted-foreground">{title}</p>
              )}
            </div>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
