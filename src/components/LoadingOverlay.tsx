"use client";

import { useEffect, useState } from "react";

type Props = {
  duration?: number;
  onComplete?: () => void;
};

export default function LoadingOverlay({
  duration = 1800,
  onComplete,
}: Props) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setProgress(t);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setFading(true);
        setTimeout(() => onComplete?.(), 350);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, onComplete]);

  const pct = Math.round(progress * 100);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[var(--color-deep-space)] flex flex-col items-center justify-center transition-opacity duration-300 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(30,144,255,0.35), transparent 70%)",
              filter: "blur(14px)",
            }}
          />
          <img
            src="/assets/loading-char.gif"
            alt=""
            aria-hidden
            className="relative w-28 h-28 object-contain"
            style={{
              filter: "drop-shadow(0 0 12px rgba(30,144,255,0.5))",
            }}
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          <span
            className="text-[10px] tracking-[0.4em] text-[var(--color-text-muted)]"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            SYSTEM BOOTING
          </span>
          <div className="w-48 h-[3px] bg-[rgba(255,255,255,0.08)] overflow-hidden rounded-sm">
            <div
              className="h-full"
              style={{
                width: `${pct}%`,
                background:
                  "linear-gradient(90deg, var(--color-accent), #79c8ff)",
                boxShadow: "0 0 8px var(--color-accent)",
              }}
            />
          </div>
          <span
            className="text-[10px] tracking-[0.3em] text-[var(--color-accent)]"
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            {String(pct).padStart(3, "0")}%
          </span>
        </div>
      </div>
    </div>
  );
}
