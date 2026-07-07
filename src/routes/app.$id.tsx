import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Download, Heart, Loader2, Tag, HardDrive, Boxes } from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { useMod } from "@/hooks/use-mods";
import { useFavorites } from "@/hooks/use-favorites";
import { cn, cleanImageUrl } from "@/lib/utils";

export const Route = createFileRoute("/app/$id")({
  component: DetailPage,
});

function isSafeUrl(url: string) {
  return /^https?:\/\//i.test(url.trim());
}

function getYoutubeId(url: string): string | null {
  const match = url
    .trim()
    .match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
    );
  return match ? match[1] : null;
}

function DetailPage() {
  const { id } = Route.useParams();
  const { mod, loading } = useMod(id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  if (loading) {
    return (
      <StoreShell>
        <div className="flex flex-col items-center py-24 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--gold-dark)]" />
        </div>
      </StoreShell>
    );
  }

  if (!mod) {
    return (
      <StoreShell>
        <div className="glass rounded-2xl py-16 text-center">
          <p className="font-display text-lg font-semibold">Mod not found</p>
          <Link
            to="/"
            className="mt-4 inline-flex rounded-xl bg-gradient-gold px-4 py-2 text-sm font-semibold text-gold-foreground"
          >
            Back to store
          </Link>
        </div>
      </StoreShell>
    );
  }

  const fav = isFavorite(mod.id);

  const handleDownload = () => {
    if (isSafeUrl(mod.downloadLink)) {
      window.open(mod.downloadLink, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <StoreShell>
      <button
        onClick={() => navigate({ to: "/" })}
        className="glass mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-transform active:scale-95"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="animate-float-up relative overflow-hidden rounded-2xl">
        <img
          src={cleanImageUrl(mod.imageUrl)}
          alt={mod.title}
          className="aspect-video w-full object-cover"
        />
        <button
          onClick={() => toggleFavorite(mod.id)}
          aria-label="Toggle favorite"
          className="glass absolute right-3 top-3 rounded-full p-2 transition-transform active:scale-90"
        >
          <Heart
            className={cn(
              "h-5 w-5",
              fav ? "fill-[var(--gold)] text-[var(--gold-dark)]" : "text-muted-foreground",
            )}
          />
        </button>
      </div>

      <div className="glass animate-float-up mt-4 rounded-2xl p-5">
        <h1 className="font-display text-2xl font-bold">{mod.title}</h1>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Meta icon={Boxes} label="Version" value={`v${mod.version}`} />
          <Meta icon={HardDrive} label="Size" value={mod.size || "—"} />
          <Meta icon={Tag} label="Category" value={mod.category} />
        </div>

        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {mod.description}
        </p>
      </div>

      {mod.screenshots.length > 0 && (
        <div className="animate-float-up mt-4">
          <h2 className="mb-2 px-1 font-display text-base font-semibold">Screenshots</h2>
          <div className="flex snap-x gap-3 overflow-x-auto pb-2">
            {mod.screenshots.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${mod.title} screenshot ${i + 1}`}
                loading="lazy"
                className="glass h-40 w-64 shrink-0 snap-start rounded-2xl object-cover p-1"
              />
            ))}
          </div>
        </div>
      )}

      {mod.youtubeUrl && getYoutubeId(mod.youtubeUrl) && (
        <div className="animate-float-up mt-4">
          <h2 className="mb-2 px-1 font-display text-base font-semibold">Video</h2>
          <div className="glass overflow-hidden rounded-2xl p-1">
            <iframe
              src={`https://www.youtube.com/embed/${getYoutubeId(mod.youtubeUrl)}`}
              title={`${mod.title} video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="aspect-video w-full rounded-xl"
            />
          </div>
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={!isSafeUrl(mod.downloadLink)}
        className="animate-gold-glow mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-gold px-6 py-4 text-base font-bold text-gold-foreground shadow-[var(--shadow-gold-lg)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        <Download className="h-5 w-5" />
        Download {mod.size && `(${mod.size})`}
      </button>
    </StoreShell>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tag;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-gold rounded-xl px-2 py-3">
      <Icon className="mx-auto h-4 w-4 text-[var(--gold-dark)]" />
      <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="line-clamp-1 text-xs font-semibold">{value}</p>
    </div>
  );
}
