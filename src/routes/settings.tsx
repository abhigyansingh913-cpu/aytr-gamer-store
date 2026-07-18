import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Youtube, Send, LifeBuoy, ShieldCheck, ChevronRight, Sparkles } from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

const LINKS = [
  {
    label: "YouTube",
    desc: "@aytr_bro",
    href: "https://youtube.com/@aytr_bro?si=13dn0cSldDCppV8T",
    icon: Youtube,
  },
  {
    label: "Telegram",
    desc: "@aytrshorts",
    href: "https://t.me/aytrshorts",
    icon: Send,
  },
  {
    label: "Support",
    desc: "Get help & updates",
    href: "https://t.me/+qVXVsbtyMzo5N2Rl",
    icon: LifeBuoy,
  },
] as const;

function SettingsPage() {
  const navigate = useNavigate();

  return (
    <StoreShell title="Settings & links">
      <div className="flex flex-col gap-3">
        {LINKS.map(({ label, desc, href, icon: Icon }, i) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="glass animate-float-up group flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-gold-lg)]"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold text-gold-foreground shadow-[var(--shadow-gold)]">
              <Icon className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <p className="font-display font-semibold">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </a>
        ))}
      </div>

      <div className="mt-8 border-t border-[var(--glass-border)] pt-6">
        <button
          onClick={() => navigate({ to: "/admin" })}
          className="glass flex w-full items-center gap-3 rounded-2xl p-4 text-left opacity-70 transition-opacity hover:opacity-100"
        >
          <ShieldCheck className="h-5 w-5 text-[var(--gold-dark)]" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Admin Panel</p>
            <p className="text-xs text-muted-foreground">Secure login required</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        AYT R STORE · Premium mods & add-ons
      </p>
    </StoreShell>
  );
}
