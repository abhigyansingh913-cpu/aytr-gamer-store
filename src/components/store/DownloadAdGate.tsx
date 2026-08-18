import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { AdBanner } from "./AdBanner";
import { AdSenseUnit } from "./AdSenseUnit";

/**
 * Interstitial gate shown before a download. A short countdown runs,
 * then the real download handler fires.
 */
export function DownloadAdGate({
  open,
  downloadUrl,
  onClose,
  onConfirm,
}: {
  open: boolean;
  downloadUrl: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (!open) return;
    setCount(5);
    const t = window.setInterval(() => setCount((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [open]);

  if (!open) return null;

  const ready = count === 0;

  const go = () => {
    if (typeof onConfirm === "function") {
      onConfirm();
    } else {
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="glass w-full max-w-sm rounded-3xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-base font-bold text-white">Almost there…</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="icon-glass rounded-full p-1.5 transition-transform active:scale-90"
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
          type="button"
          onClick={go}
          disabled={!ready}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-accent px-6 py-3.5 text-base font-bold text-white transition-transform active:scale-95 disabled:opacity-60"
        >
          <Download className="h-5 w-5" />
          {ready ? "Download Now" : `Please wait ${count}s…`}
        </button>
      </div>
    </div>
  );
}
