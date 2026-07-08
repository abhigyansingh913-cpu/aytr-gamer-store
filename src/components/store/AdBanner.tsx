import { useEffect, useState } from "react";
import { useAds } from "@/hooks/use-ads";
import { cleanImageUrl, cn } from "@/lib/utils";

function isSafeUrl(url: string) {
  return /^https?:\/\//i.test(url.trim());
}

/**
 * Shows the admin-managed custom banner ads. Rotates every 6s when more
 * than one active banner exists. Renders nothing when there are none.
 */
export function AdBanner({ className }: { className?: string }) {
  const { ads } = useAds();
  const active = ads.filter((a) => a.active && cleanImageUrl(a.imageUrl));
  const [i, setI] = useState(0);

  useEffect(() => {
    if (active.length <= 1) return;
    const t = setInterval(
      () => setI((p) => (p + 1) % active.length),
      6000,
    );
    return () => clearInterval(t);
  }, [active.length]);

  if (active.length === 0) return null;

  const ad = active[i % active.length];
  const img = cleanImageUrl(ad.imageUrl);

  const inner = (
    <div className="relative overflow-hidden rounded-2xl">
      <span className="glass absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        Ad
      </span>
      <img
        src={img}
        alt="Sponsored"
        loading="lazy"
        className="w-full object-cover"
      />
    </div>
  );

  if (isSafeUrl(ad.linkUrl)) {
    return (
      <a
        href={ad.linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={cn("block active:scale-[0.99]", className)}
      >
        {inner}
      </a>
    );
  }

  return <div className={className}>{inner}</div>;
}
