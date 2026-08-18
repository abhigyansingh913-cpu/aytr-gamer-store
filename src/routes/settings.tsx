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
        {LINKS.map(({ label, desc, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="surface animate-fade-up group flex items-center gap-4 rounded-2xl p-4 transition-transform active:scale-[0.99]"
          >
            <span className="icon-glass flex h-12 w-12 items-center justify-center rounded-xl">
              <Icon className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <p className="font-display font-semibold text-white">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </a>
        ))}
      </div>

      <div className="mt-8 space-y-3 border-t border-white/5 pt-6">
        <button
          type="button"
          onClick={() => navigate({ to: "/connect" })}
          className="surface flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-transform active:scale-[0.99]"
        >
          <span className="icon-glass flex h-10 w-10 items-center justify-center rounded-xl">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="font-display text-sm font-semibold text-white">Connect AI assistant</p>
            <p className="text-xs text-muted-foreground">Use this store from ChatGPT or Claude</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          type="button"
          onClick={() => navigate({ to: "/admin" })}
          className="surface flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-transform active:scale-[0.99]"
        >
          <span className="icon-glass flex h-10 w-10 items-center justify-center rounded-xl">
            <ShieldCheck className="h-5 w-5 text-accent-red" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Admin Panel</p>
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
