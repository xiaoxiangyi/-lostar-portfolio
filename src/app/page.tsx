"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import StarryBackground from "@/components/StarryBackground";
import HUDFooter from "@/components/HUDFooter";
import LoadingOverlay from "@/components/LoadingOverlay";
import BlackHoleTransition from "@/components/BlackHoleTransition";
import Starmap from "@/components/Starmap";

// 在 client 用 layoutEffect（paint 前同步執行避免 FOUC）、server 退回 useEffect
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function TitleScreen() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const characterRef = useRef<HTMLImageElement | null>(null);
  const charBoxRef = useRef<HTMLDivElement | null>(null);
  const titleBoxRef = useRef<HTMLDivElement | null>(null);
  const loRef = useRef<HTMLImageElement | null>(null);
  const starRef = useRef<HTMLImageElement | null>(null);
  const haloRef = useRef<HTMLDivElement | null>(null);
  const tagRef = useRef<HTMLDivElement | null>(null);
  const pressRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);

  // 鎖 boot 觸發避免快速連點重複觸發（useState 有 batch 延遲所以另用 ref）
  const bootedRef = useRef(false);

  const [loaded, setLoaded] = useState(false);
  const [booted, setBooted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [scene, setScene] = useState<"title" | "starmap">("title");

  // Skip Intro：略過 Title 開場直接觸發黑洞轉場進 STARMAP
  const triggerSkip = () => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    setBooted(true);
    setTransitioning(true);
  };

  useIsoLayoutEffect(() => {
    // 場景非 title 時不啟動 Title 動畫，避免操作已 unmount 的元素導致 GSAP target null warning
    if (!loaded || scene !== "title") return;

    // 先同步把元素 opacity 設為 0，避免 React 渲染完成、GSAP 還沒套用的「閃出來」FOUC
    gsap.set(
      [
        loRef.current,
        starRef.current,
        characterRef.current,
        haloRef.current,
        tagRef.current,
        pressRef.current,
        footerRef.current,
      ],
      { opacity: 0 },
    );

    // 前庭敏感族群：偵測到 reduced-motion 直接跳過進場動畫，所有元素直接顯示
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(
        [
          rootRef.current,
          loRef.current,
          starRef.current,
          characterRef.current,
          haloRef.current,
          tagRef.current,
          pressRef.current,
          footerRef.current,
        ],
        { opacity: 1, x: 0, y: 0, scale: 1, filter: "none" },
      );
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(
        [
          loRef.current,
          starRef.current,
          characterRef.current,
          haloRef.current,
          tagRef.current,
          pressRef.current,
        ],
        { opacity: 0 },
      );

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        rootRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        0,
      )
        // LO/STAR 先到位
        .fromTo(
          loRef.current,
          { opacity: 0, x: -160, filter: "blur(8px)" },
          { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.9 },
          0.45,
        )
        .fromTo(
          starRef.current,
          { opacity: 0, x: 160, filter: "blur(8px)" },
          { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.9 },
          0.45,
        )
        // 文字落定後輕微震動
        .fromTo(
          [loRef.current, starRef.current],
          { scale: 1 },
          {
            scale: 1.03,
            duration: 0.15,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut",
          },
          1.35,
        )
        // 人物從畫面下方升起，切過文字
        .fromTo(
          characterRef.current,
          { opacity: 0, y: 200, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 1.3, ease: "power4.out" },
          1.5,
        )
        // 光環點亮
        .fromTo(
          haloRef.current,
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(2)" },
          2.2,
        )
        // HUD footer
        .fromTo(
          footerRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 },
          2.3,
        )
        // tagline + press any key
        .fromTo(
          tagRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5 },
          2.5,
        )
        .fromTo(
          pressRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          2.8,
        );

      // idle 呼吸動畫（人物與光環）
      tl.to(
        characterRef.current,
        {
          y: -4,
          duration: 3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        },
        ">",
      );

      return () => tl.kill();
    }, rootRef);

    return () => ctx.revert();
  }, [loaded, scene]);

  useEffect(() => {
    if (scene !== "title") return;
    const onBoot = (e: Event) => {
      // 排除 SKIP 按鈕（它有自己的 triggerSkip handler，避免被 window listener 搶先觸發 onBoot 流程）
      if (
        e.target instanceof Element &&
        e.target.closest("[data-skip-button]")
      ) {
        return;
      }
      // 用 ref 守門避免 race（useState 非同步、依賴 booted 會 re-bind listener）
      if (bootedRef.current) return;
      bootedRef.current = true;
      setBooted(true);
      gsap.to(pressRef.current, {
        opacity: 0,
        y: -8,
        duration: 0.35,
        ease: "power2.in",
      });
      // 0.3s 後啟動黑洞轉場
      setTimeout(() => setTransitioning(true), 300);
    };
    window.addEventListener("keydown", onBoot);
    window.addEventListener("pointerdown", onBoot);
    return () => {
      window.removeEventListener("keydown", onBoot);
      window.removeEventListener("pointerdown", onBoot);
    };
  }, [scene]);

  // 場景回到 title 時重設 boot 狀態（為未來「返回 Title」鋪路）
  useEffect(() => {
    if (scene === "title") {
      bootedRef.current = false;
      setBooted(false);
    }
  }, [scene]);

  // Parallax：滑鼠移動帶動背景、字體、人物以不同速度位移製造深度感
  useEffect(() => {
    if (!loaded) return;
    // 前庭敏感族群：完全停用滑鼠 parallax
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    const onMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const tick = () => {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;

      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(${-curX * 12}px, ${-curY * 6}px, 0)`;
      }
      if (titleBoxRef.current) {
        titleBoxRef.current.style.transform = `translate3d(${-curX * 18}px, ${-curY * 8}px, 0)`;
      }
      if (charBoxRef.current) {
        charBoxRef.current.style.transform = `translate3d(${-curX * 8}px, ${-curY * 4}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [loaded]);

  const monoStyle = { fontFamily: "var(--font-geist-mono)" };

  return (
    <>
      {!loaded && (
        <LoadingOverlay
          duration={1800}
          onComplete={() => setLoaded(true)}
        />
      )}
      <div
        ref={rootRef}
        className={`relative w-full h-screen overflow-hidden text-[var(--color-text)] ${
          loaded ? "" : "invisible"
        }`}
      >
        <StarryBackground ref={bgRef} />

      {/* === Title Scene（含轉場時的吸入效果） === */}
      {scene === "title" && (
      <div
        className="absolute inset-0"
        style={{
          transformOrigin: "center",
          transform: transitioning
            ? "scale(0.18) rotate(180deg)"
            : "scale(1) rotate(0deg)",
          filter: transitioning ? "blur(18px)" : "blur(0px)",
          opacity: transitioning ? 0 : 1,
          transition:
            "transform 1.3s cubic-bezier(0.6, 0, 0.85, 0.15), filter 1.1s ease-in, opacity 1.2s ease-in",
        }}
      >
      {/* sr-only 主標題：給螢幕閱讀器與 SEO，視覺隱藏 */}
      <h1 className="sr-only">LOSTAR — XiangYi Xiao Portfolio</h1>

      {/* Top-left brand strip — semantic header */}
      <header className="fixed top-4 left-4 z-40 select-none flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full overflow-hidden border border-[rgba(30,144,255,0.45)] bg-[rgba(10,14,39,0.7)] backdrop-blur flex items-center justify-center"
          style={{ boxShadow: "0 0 14px rgba(30,144,255,0.35)" }}
        >
          <img
            src="/assets/logo.png"
            alt="LOSTAR 標誌"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hidden sm:flex flex-col leading-tight">
          <span
            className="text-[10px] tracking-[0.2em] text-[var(--color-text-muted)]"
            style={monoStyle}
          >
            LOSTAR
          </span>
          <span
            className="text-[11px] tracking-[0.18em] text-[var(--color-text)]"
            style={monoStyle}
          >
            XiangYi Xiao
          </span>
        </div>
      </header>

      {/* Skip Intro 按鈕（火箭）：右上角，點擊直接觸發黑洞轉場進 STARMAP */}
      {!transitioning && (
        <button
          type="button"
          data-skip-button
          onClick={(e) => {
            e.stopPropagation();
            triggerSkip();
          }}
          aria-label="跳過開場進入星圖"
          className="fixed top-4 right-4 z-40 group flex items-center gap-2 px-3 py-2 rounded-sm border border-[rgba(30,144,255,0.35)] bg-[rgba(10,14,39,0.65)] backdrop-blur text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-all select-none"
        >
          <img
            src="/assets/icon-skip.png"
            alt=""
            aria-hidden="true"
            className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-transform group-hover:translate-x-0.5"
          />
          <span
            className="text-[10px] tracking-[0.3em]"
            style={monoStyle}
          >
            SKIP
          </span>
        </button>
      )}

      {/* Hero composition：人物大尺寸佔據主體，Lo/star 環繞在身上 */}
      <main className="relative z-10 w-full h-full">
        {/* Title 外層處理絕對定位，內層 titleBoxRef 處理 parallax 位移 */}
        <div className="absolute inset-x-0 top-[36%] md:top-[42%] -translate-y-1/2 z-20">
          <div
            ref={titleBoxRef}
            className="flex justify-between items-center pointer-events-none will-change-transform pl-[4vw] pr-[4vw] md:pl-[29vw] md:pr-[23vw]"
          >
            {/* LO：外層 glitch、內層呼吸光 */}
            <div style={{ animation: "title-glitch 9s linear infinite" }}>
              <img
                ref={loRef}
                src="/assets/title-lo-trim.png"
                alt=""
                aria-hidden="true"
                className="block w-auto h-[clamp(50px,8vh,75px)] md:h-[clamp(80px,14vh,180px)]"
                style={{
                  animation: "title-breathe 4.5s ease-in-out infinite",
                }}
              />
            </div>
            {/* STAR：外層 glitch（錯開節奏）、內層呼吸光 */}
            <div style={{ animation: "title-glitch 11s linear infinite 1.5s" }}>
              <img
                ref={starRef}
                src="/assets/title-star-trim.png"
                alt=""
                aria-hidden="true"
                className="block w-auto h-[clamp(50px,8vh,75px)] md:h-[clamp(80px,14vh,180px)]"
                style={{
                  animation: "title-breathe 4.5s ease-in-out infinite 0.8s",
                }}
              />
            </div>
          </div>
        </div>

        {/* 人物：外層處理絕對定位（含 -translate-x-1/2 置中），內層 charBoxRef 處理 parallax */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none bottom-[-20vh] md:bottom-[-30vh] h-screen aspect-[2480/3508] max-w-[100vw] md:max-w-[70vw]"
        >
          <div ref={charBoxRef} className="relative w-full h-full will-change-transform">
            {/* halo 加成光暈，浮在人物頭頂 */}
            <div
              ref={haloRef}
              aria-hidden
              className="absolute top-[6%] left-1/2 -translate-x-1/2 w-[70%] max-w-[260px] aspect-[3/1]"
              style={{
                background: "var(--halo-gradient)",
                filter: "blur(22px) saturate(1.5)",
                borderRadius: "50%",
                opacity: 0.7,
                mixBlendMode: "screen",
              }}
            />

            {/* 人物：fit 容器，腿/腳因 bottom 負值被 viewport 自然截掉 */}
            <img
              ref={characterRef}
              src="/assets/character.png"
              alt=""
              aria-hidden="true"
              className="block w-full h-full object-contain object-bottom"
              style={{
                filter:
                  "drop-shadow(0 12px 32px rgba(30,144,255,0.45)) drop-shadow(0 0 22px rgba(0,0,0,0.6))",
              }}
            />
          </div>
        </div>

        {/* Tagline + press any key：固定在底部 HUD 上方 */}
        <div className="absolute left-1/2 bottom-16 -translate-x-1/2 z-40 flex flex-col items-center gap-3 pointer-events-none">
          <div ref={tagRef} className="text-center" style={monoStyle}>
            <p className="text-[10px] md:text-xs tracking-[0.4em] text-[var(--color-text-muted)]">
              LOST · SEARCHING · CONNECTING
            </p>
          </div>

          <div
            ref={pressRef}
            className="flex items-center gap-3 text-[var(--color-text)]"
            style={monoStyle}
          >
            <span
              className="w-2 h-2 rotate-45 bg-[var(--color-accent)]"
              style={{ boxShadow: "0 0 8px var(--color-accent)" }}
            />
            <span
              className="text-xs md:text-sm tracking-[0.3em]"
              style={{ animation: "blink 1.6s ease-in-out infinite" }}
            >
              PRESS ANY KEY TO BOOT SYSTEM
            </span>
            <span
              className="w-2 h-2 rotate-45 bg-[var(--color-accent)]"
              style={{ boxShadow: "0 0 8px var(--color-accent)" }}
            />
          </div>
        </div>
      </main>

        <div ref={footerRef}>
          <HUDFooter booted={booted} />
        </div>
      </div>
      )}

      {/* === STARMAP Scene === */}
      {scene === "starmap" && <Starmap />}

      {/* === 黑洞轉場 Overlay：中段切 scene，後段反向收縮揭露 STARMAP === */}
      <BlackHoleTransition
        active={transitioning}
        onMidpoint={() => setScene("starmap")}
        onComplete={() => setTransitioning(false)}
      />
      </div>
    </>
  );
}
