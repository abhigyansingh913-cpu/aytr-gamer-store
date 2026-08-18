import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, Check, Bot, Sparkles, RefreshCw, ArrowLeft } from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { toast } from "sonner";

export const Route = createFileRoute("/connect")({
  component: ConnectPage,
});

function ConnectPage() {
  const navigate = useNavigate();
  const [mcpUrl, setMcpUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMcpUrl(new URL("/mcp", window.location.origin).toString());
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(mcpUrl);
      setCopied(true);
      toast.success("MCP URL copied");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <StoreShell title="Connect an AI assistant">
      <button
        onClick={() => navigate({ to: "/settings" })}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="glass animate-fade-up rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl icon-glass">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">Your MCP server URL</h2>
            <p className="text-xs text-muted-foreground">
              Paste this into ChatGPT or Claude to browse the store from your assistant.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-white/5 p-2">
          <code className="flex-1 truncate px-2 text-sm font-medium">{mcpUrl || "…"}</code>
          <button
            onClick={copy}
            disabled={!mcpUrl}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-accent px-3 py-2 text-sm font-semibold text-white transition-transform active:scale-95 disabled:opacity-50"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Your assistant can browse mods, read full mod details, and see the current banners — the
          same info shown in the store.
        </p>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <ClientCard
          icon={<Bot className="h-5 w-5" />}
          title="Connect with ChatGPT"
          steps={[
            <>
              Open{" "}
              <ExtLink href="https://chatgpt.com/#settings/Connectors/Advanced">
                Settings → Connectors → Advanced
              </ExtLink>{" "}
              and enable <b>Developer mode</b> (read the risk notice).
            </>,
            <>
              In the chat composer's <b>+</b> menu, turn on <b>Developer mode</b>.
            </>,
            <>
              Click <b>Add sources</b>, then <b>Connect more</b>.
            </>,
            <>Name the connector and paste the MCP URL above.</>,
            <>Ask ChatGPT to use AYT R STORE.</>,
          ]}
        />
        <ClientCard
          icon={<Bot className="h-5 w-5" />}
          title="Connect with Claude"
          steps={[
            <>
              Open{" "}
              <ExtLink href="https://claude.ai/customize/connectors?modal=add-custom-connector">
                Claude → Connectors → Add custom connector
              </ExtLink>
              .
            </>,
            <>Name the connector and paste the MCP URL above.</>,
            <>Enable the connector from the chat composer, then ask Claude to use AYT R STORE.</>,
          ]}
        />
      </section>

      <div className="glass mt-6 rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl icon-glass">
            <RefreshCw className="h-6 w-6" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">Refresh after the store updates</h2>
            <p className="text-xs text-muted-foreground">
              Assistants cache the tool list. After we ship changes, refresh the connector to pick
              them up.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ClientCard
            compact
            title="ChatGPT"
            steps={[
              <>
                Open ChatGPT app preferences and pick AYT R STORE under <b>Enabled apps</b>.
              </>,
              <>
                Next to <b>Information</b>, click <b>Refresh</b>.
              </>,
              <>If the URL changed, paste the latest URL above.</>,
              <>Start a new chat and ask ChatGPT to use AYT R STORE.</>,
            ]}
          />
          <ClientCard
            compact
            title="Claude"
            steps={[
              <>Open the Connectors page and select this connector.</>,
              <>Refresh or update the connector's tools.</>,
              <>If the URL changed, paste the latest URL above.</>,
              <>Ask Claude to use AYT R STORE.</>,
            ]}
          />
        </div>
      </div>
    </StoreShell>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-accent-red underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  );
}

function ClientCard({
  icon,
  title,
  steps,
  compact,
}: {
  icon?: React.ReactNode;
  title: string;
  steps: React.ReactNode[];
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "rounded-xl border border-[var(--glass-border)] bg-white/50 p-4"
          : "glass animate-fade-up rounded-2xl p-5"
      }
    >
      <div className="mb-3 flex items-center gap-2">
        {icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg icon-glass">
            {icon}
          </span>
        )}
        <h3 className="font-display font-semibold">{title}</h3>
      </div>
      <ol className="ml-5 list-decimal space-y-2 text-sm text-foreground/90">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  );
}
