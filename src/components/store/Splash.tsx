import { useEffect, useState } from "react";
import { BRAND } from "@/lib/constants";

export function Splash({ onFinish }: { onFinish: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const showFor = window.setTimeout(() => {
      setLeaving(true);
      window.setTimeout(onFinish, 320);
    }, 1300);
    return () => window.clearTimeout(showFor);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-300 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <img
        src={BRAND.logo}
        alt=""
        width={112}
        height={112}
        className="h-28 w-28 rounded-3xl object-cover ring-1 ring-white/10"
      />
      <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-white">
        AYT R <span className="text-gradient-accent">STORE</span>
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{BRAND.tagline}</p>
      <div className="mt-8 h-1 w-40 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/3 animate-shimmer-slow rounded-full bg-accent-red" />
      </div>
    </div>
  );
}
