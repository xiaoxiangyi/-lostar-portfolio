"use client";

import { useEffect, useState } from "react";

export default function HUDFooter({ booted }: { booted: boolean }) {
  const [time, setTime] = useState<string>("--:--:--");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      setTime(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const monoStyle = { fontFamily: "var(--font-geist-mono)" };

  return (
    <footer
      className="fixed bottom-0 inset-x-0 z-40 pointer-events-none"
      data-hud-footer
      aria-label="系統狀態列"
    >
      <div className="mx-4 mb-4">
        <div className="flex items-stretch justify-between gap-3 bg-[rgba(10,14,39,0.75)] backdrop-blur-md border border-[rgba(30,144,255,0.35)] rounded-sm px-4 py-2 text-[10px] tracking-[0.18em] text-[var(--color-text-muted)]">
          <div className="flex items-center gap-4" style={monoStyle}>
            <span className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"
                style={{
                  animation: "twinkle 1.6s ease-in-out infinite",
                  boxShadow: "0 0 6px var(--color-accent)",
                }}
              />
              <span>SIGNAL</span>
            </span>
            <span className="hidden sm:flex items-center gap-2">
              <span className="w-24 h-1.5 bg-[rgba(255,255,255,0.08)] overflow-hidden rounded-sm">
                <span
                  className="block h-full"
                  style={{
                    width: "24%",
                    background:
                      "linear-gradient(90deg, var(--color-accent), #79c8ff)",
                    animation: "signal-pulse 2.4s ease-in-out infinite",
                    transformOrigin: "left center",
                  }}
                />
              </span>
              <span className="text-[var(--color-text)]">24%</span>
            </span>
          </div>

          <div
            className="hidden md:flex items-center gap-2 text-[var(--color-text)]"
            style={monoStyle}
          >
            <span>SYS · TIME</span>
            <span className="text-[var(--color-accent)]">{time}</span>
          </div>

          <div className="flex items-center gap-3" style={monoStyle}>
            <span className="hidden sm:inline">MODE</span>
            <span
              className={
                booted
                  ? "text-[#79ff97]"
                  : "text-[var(--color-rainbow-3)]"
              }
              style={
                booted
                  ? {}
                  : { animation: "blink 1.6s ease-in-out infinite" }
              }
            >
              {booted ? "▶ SYSTEM ONLINE" : "◉ STANDBY"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
