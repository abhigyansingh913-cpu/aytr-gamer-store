import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT, ADSENSE_ENABLED } from "@/lib/ads-config";
import { cn } from "@/lib/utils";

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
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_ENABLED || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* AdSense not ready yet */
    }
  }, []);

  if (!ADSENSE_ENABLED) return null;

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
