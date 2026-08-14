import { useEffect, useState } from "react";

const LOGO = "https://i.ibb.co/JjQZmMfc/Picsart-26-04-24-17-21-31-070.jpg";

export function Splash({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1900;
    const tick = (now: number) => {
      const p = Math.min(100, ((now - start) / duration) * 100);
      setProgress(p);
      if (p < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setLeaving(true);
        setTimeout(onFinish, 550);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(30rem_20rem_at_50%_35%,color-mix(in_oklab,var(--gold-light)_45%,transparent),transparent)]" />
      <div className="animate-float-up flex flex-col items-center">
        <div className="animate-gold-glow rounded-3xl">
          <img
            src={LOGO}
            alt="AYT R STORE"
            className="h-28 w-28 rounded-3xl object-cover ring-1 ring-[var(--glass-border)] shadow-[var(--shadow-gold-lg)]"
          />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">
          AYT R <span className="text-gradient-gold">STORE</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Premium mods & add-ons</p>

        <div
          className="mt-6 max-w-xs text-center animate-float-up"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="font-display text-lg font-bold leading-snug tracking-tight text-foreground">
            WELCOME TO OUR PREMIUM STORE OF MINECRAFT MODS AND APKs
          </h2>
          <p className="mt-3 text-sm font-medium text-[var(--gold-dark)]">Also enjoy all mods</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            THANKS FOR DOWNLOADING
          </p>
        </div>

        <div className="relative mt-8 h-2 w-56 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--gold)_18%,white)]">
          <div
            className="h-full rounded-full bg-gradient-gold transition-[width] duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-xs font-medium text-muted-foreground">
          Loading… {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}
