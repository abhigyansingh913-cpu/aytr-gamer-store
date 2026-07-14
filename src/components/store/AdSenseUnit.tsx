import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT, ADSENSE_ENABLED } from "@/lib/ads-config";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/use-hydrated";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Renders a Google AdSense responsive display unit.
 * Returns null until a valid publisher ID is set in `ads-config.ts`.
 */
export function AdSenseUnit({
  slot,
  className,
}: {
  slot?: string;
  className?: string;
}) {
  const hydrated = useHydrated();
  const pushed = useRef(false);

  useEffect(() => {
    if (!hydrated || !ADSENSE_ENABLED || pushed.current) return;

    if (!document.querySelector(`script[src*="${ADSENSE_CLIENT}"]`)) {
      const script = document.createElement("script");
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
      document.head.appendChild(script);
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* AdSense not ready yet */
    }
  }, [hydrated]);

  if (!ADSENSE_ENABLED || !hydrated) return null;

  return (
    <ins
      className={cn("adsbygoogle block", className)}
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
