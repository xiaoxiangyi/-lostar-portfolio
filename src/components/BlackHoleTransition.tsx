"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  active: boolean;
  /** 黑幕完全覆蓋畫面的瞬間（建議父層在此切換 scene） */
  onMidpoint?: () => void;
  /** 黑幕完全收縮、轉場結束（父層應重置 transitioning state） */
  onComplete?: () => void;
};

type Phase = "idle" | "expand" | "hold" | "contract" | "done";

const EXPAND_MS = 1100;
const HOLD_MS = 200;
const CONTRACT_MS = 1000;

export default function BlackHoleTransition({
  active,
  onMidpoint,
  onComplete,
}: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const startedRef = useRef(false);

  // 把 callback 用 ref 包，避免父層 re-render 改變函式 ref 而觸發 useEffect 清掉計時器
  const midpointRef = useRef(onMidpoint);
  const completeRef = useRef(onComplete);
  useEffect(() => {
    midpointRef.current = onMidpoint;
    completeRef.current = onComplete;
  }, [onMidpoint, onComplete]);

  useEffect(() => {
    // active 變回 false 時重設，讓元件可重複使用（未來加返回功能用）
    if (!active) {
      startedRef.current = false;
      setPhase("idle");
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;

    // prefers-reduced-motion：直接跳過動畫，立即通知 midpoint + complete
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      midpointRef.current?.();
      const t = setTimeout(() => completeRef.current?.(), 150);
      return () => clearTimeout(t);
    }

    setPhase("expand");

    const t1 = setTimeout(() => {
      setPhase("hold");
      midpointRef.current?.();
    }, EXPAND_MS);

    const t2 = setTimeout(() => {
      setPhase("contract");
    }, EXPAND_MS + HOLD_MS);

    const t3 = setTimeout(() => {
      setPhase("done");
      completeRef.current?.();
    }, EXPAND_MS + HOLD_MS + CONTRACT_MS);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [active]);

  const isCovering = phase === "expand" || phase === "hold";
  const isContracting = phase === "contract";

  const blackHoleScale = isCovering ? 2.2 : 0;
  const blackHoleTransition =
    phase === "expand"
      ? `transform ${EXPAND_MS}ms cubic-bezier(0.6, 0, 0.85, 0.15)`
      : phase === "contract"
        ? `transform ${CONTRACT_MS}ms cubic-bezier(0.2, 0.7, 0.4, 1)`
        : "none";

  const overlayOpacity = phase === "done" || phase === "idle" ? 0 : 1;

  return (
    <div
      className="fixed inset-0 z-[200] pointer-events-none"
      style={{
        opacity: overlayOpacity,
        transition: phase === "done" ? "opacity 200ms ease-out" : "none",
      }}
    >
      {/* 中央黑洞：真正圓形（border-radius:50% + vmax 確保各種比例下都圓） */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: "100vmax",
          height: "100vmax",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, #000 60%, rgba(0,0,0,0.85) 82%, rgba(0,0,0,0.35) 95%, transparent 100%)",
          transform: `translate(-50%, -50%) scale(${blackHoleScale})`,
          transition: blackHoleTransition,
          transformOrigin: "center",
        }}
      />
    </div>
  );
}
