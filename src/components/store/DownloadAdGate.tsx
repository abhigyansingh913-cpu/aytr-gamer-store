import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { AdBanner } from "./AdBanner";
import { AdSenseUnit } from "./AdSenseUnit";

/**
 * Interstitial ad gate shown before a download. A short countdown runs,
 * then the actual download link opens on the user's click.
 */
export function DownloadAdGate({
  open,
  downloadUrl,
  onClose,
}: {
  open: boolean;
  downloadUrl: string;
  onClose: () => void;
}) {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (!open) return;
    setCount(5);
    const t = setInterval(() => setCount((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [open]);

  if (!open) return null;

  const ready = count === 0;

  const go = () => {
    window.open(downloadUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="glass animate-float-up w-full max-w-sm rounded-3xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-base font-bold">Almost there…</p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-3 text-xs text-muted-foreground">
          Your download will be ready in a moment. Thanks for supporting the store!
        </p>

        <div className="space-y-3">
          <AdBanner />
          <AdSenseUnit className="min-h-[100px]" />
        </div>

        <button
          onClick={go}
          disabled={!ready}
          className="animate-gold-glow mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-gold px-6 py-3.5 text-base font-bold text-gold-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02] active:scale-95 disabled:animate-none disabled:opacity-60"
        >
          <Download className="h-5 w-5" />
          {ready ? "Download Now" : `Please wait ${count}s…`}
        </button>
      </div>
    </div>
  );
}
