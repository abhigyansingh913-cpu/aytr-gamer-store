import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Download,
  HardDrive,
  Heart,
  Loader2,
  Share2,
  Star,
  Tag,
  Boxes,
  FileX,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { StoreShell } from "@/components/store/StoreShell";
import { DownloadAdGate } from "@/components/store/DownloadAdGate";
import { AppCard } from "@/components/store/AppCard";
import { useMod } from "@/hooks/use-mods";
import { useMods } from "@/hooks/use-mods";
import { useFavorites } from "@/hooks/use-favorites";
import { incrementDownloads } from "@/lib/store-data";
import { cn, cleanImageUrl, onImageError } from "@/lib/utils";

export const Route = createFileRoute("/app/$id")({
  component: DetailPage,
});

function isSafeUrl(url: string) {
  return /^https?:\/\//i.test(url.trim());
}

function getYoutubeId(url: string): string | null {
  const match = url
    .trim()
    .match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
}

/** One download per item per session (prevents accidental count inflation). */
function shouldCountDownload(id: string): boolean {
  try {
    const key = "aytr-downloaded";
    const raw = window.localStorage.getItem(key);
    const set = new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
    if (set.has(id)) return false;
    set.add(id);
    window.localStorage.setItem(key, JSON.stringify([...set]));
    return true;
  } catch {
    return true;
  }
}

function DetailPage() {
  const { id } = Route.useParams();
  const { mod, loading } = useMod(id);
  const { mods } = useMods();
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();
  const [gateOpen, setGateOpen] = useState(false);
  const [countBusy, setCountBusy] = useState(false);

  useEffect(() => {
    if (mod) {
      document.title = `${mod.title} — AYT R STORE`;
      return () => {
        document.title = "AYT R STORE — Premium Minecraft Mods & Add-ons";
      };
    }
  }, [mod]);

  const goBack = () => {
    if (window.history.length > 1) {
      router.history.back();
    } else {
      void router.navigate({ to: "/" });
    }
  };

  const share = async () => {
    const url = window.location.href;
    const data = {
      title: mod ? mod.title : "AYT R STORE",
      text: mod ? `Check out "${mod.title}" on AYT R STORE!` : "AYT R STORE",
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* user dismissed share */
    }
  };

  if (loading) {
    return (
      <StoreShell>
        <div className="flex flex-col items-center py-24 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-accent-red" />
        </div>
      </StoreShell>
    );
  }

  if (!mod) {
    return (
      <StoreShell>
        <div className="surface flex flex-col items-center rounded-2xl py-16 text-center">
          <FileX className="h-10 w-10 text-accent-red" />
          <p className="mt-4 font-display text-lg font-semibold text-white">Item not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            It may have been removed or unpublished.
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex rounded-xl bg-accent-red px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-red)]"
          >
            Back to store
          </Link>
        </div>
      </StoreShell>
    );
  }

  const fav = isFavorite(mod.id);
  const related = mods.filter((m) => m.category === mod.category && m.id !== mod.id).slice(0, 6);
  const hasFile = isSafeUrl(mod.downloadLink);
  const updated = new Date(mod.updatedAt || mod.createdAt).toLocaleDateString();

  const handleDownload = () => {
    if (hasFile) setGateOpen(true);
  };

  const onDownload = async () => {
    if (!hasFile) {
      toast.error("This item has no download link yet.");
      return;
    }
    setCountBusy(true);
    try {
      if (shouldCountDownload(mod.id)) {
        await incrementDownloads(mod.id);
      }
    } catch {
      /* counting is best-effort; never block the download */
    } finally {
      setCountBusy(false);
    }
    const win = window.open(mod.downloadLink, "_blank", "noopener,noreferrer");
    if (!win) {
      toast.error("Pop-up blocked — allow pop-ups or tap the link again.");
    }
  };

  return (
    <StoreShell>
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={goBack}
          className="icon-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-transform active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={share}
          aria-label="Share"
          className="icon-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-transform active:scale-95"
        >
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>

      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={cleanImageUrl(mod.imageUrl)}
          alt={mod.title}
          onError={onImageError}
          decoding="async"
          className="aspect-video w-full object-cover bg-black/40"
        />
        <button
          type="button"
          onClick={() => toggleFavorite(mod.id)}
          aria-label="Toggle favorite"
          className="icon-glass absolute right-3 top-3 rounded-full p-2 transition-transform active:scale-90"
        >
          <Heart
            className={cn("h-5 w-5", fav ? "fill-accent-red text-accent-red" : "text-white/85")}
          />
        </button>
        {mod.featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent-red px-2 py-0.5 text-[11px] font-bold text-white shadow-[var(--shadow-red)]">
            <Star className="h-3 w-3 fill-current" /> Featured
          </span>
        )}
      </div>

      <div className="surface mt-4 rounded-2xl p-5">
        <h1 className="font-display text-2xl font-bold text-white">{mod.title}</h1>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          <Meta icon={Boxes} label="Version" value={`v${mod.version || "—"}`} />
          <Meta icon={HardDrive} label="Size" value={mod.size || "—"} />
          <Meta icon={Download} label="Downloads" value={mod.downloads.toLocaleString()} />
          <Meta icon={Calendar} label="Updated" value={updated} />
        </div>

        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {mod.description}
        </p>

        {mod.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {mod.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-white/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {mod.screenshots.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-2 px-1 font-display text-base font-semibold text-white">Screenshots</h2>
          <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto pb-2">
            {mod.screenshots.map((src, i) => (
              <img
                key={i}
                src={cleanImageUrl(src)}
                alt={`${mod.title} screenshot ${i + 1}`}
                loading="lazy"
                decoding="async"
                onError={onImageError}
                className="h-40 w-64 shrink-0 snap-start rounded-2xl object-cover bg-black/40"
              />
            ))}
          </div>
        </div>
      )}

      {mod.youtubeUrl && getYoutubeId(mod.youtubeUrl) && (
        <div className="mt-4">
          <h2 className="mb-2 px-1 font-display text-base font-semibold text-white">Video</h2>
          <div className="surface overflow-hidden rounded-2xl">
            <iframe
              src={`https://www.youtube.com/embed/${getYoutubeId(mod.youtubeUrl)}`}
              title={`${mod.title} video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="aspect-video w-full"
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleDownload}
        disabled={!hasFile || countBusy}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-accent px-6 py-4 text-base font-bold text-white shadow-[var(--shadow-red)] transition-transform active:scale-95 disabled:opacity-60"
      >
        {countBusy ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : hasFile ? (
          <Download className="h-5 w-5" />
        ) : (
          <WifiOff className="h-5 w-5" />
        )}
        {hasFile ? `Download ${mod.size ? `(${mod.size})` : ""}` : "Download unavailable"}
      </button>
      {!hasFile && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          The download link for this item is missing or invalid. Please check back later.
        </p>
      )}

      {related.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 px-1 font-display text-base font-semibold text-white">
            More in {mod.category}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {related.map((m) => (
              <AppCard
                key={m.id}
                mod={m}
                isFavorite={isFavorite(m.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </div>
      )}

      <DownloadAdGate
        open={gateOpen}
        downloadUrl={mod.downloadLink}
        onClose={() => setGateOpen(false)}
        onConfirm={onDownload}
      />
    </StoreShell>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof Tag; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.04] px-2 py-3">
      <Icon className="mx-auto h-4 w-4 text-accent-red" />
      <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="line-clamp-1 text-xs font-semibold text-white">{value}</p>
    </div>
  );
}
