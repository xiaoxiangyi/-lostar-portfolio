"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  PLANET_CONTENT,
  type PlanetId,
  type ContentCard,
  type Chapter,
  type WorkImage,
  type CTA,
  type SeriesItem,
  type FeaturedWork,
  type ProfileSection,
  type ExperienceItem,
} from "@/data/planetContent";
import { asset } from "@/lib/asset";

// 手機版偵測（< 768px）— 用於切換縱向卡片排版與星球 y 覆蓋
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

// 星球 PNG 實際長寬比（1430×1170），用於外層 div 顯式寬度
// 避免 `left:X%` 在 mobile 造成 available-width 過窄、img max-width:100% 壓扁
const PLANET_ASPECT = 1430 / 1170;

type Planet = {
  id: string;
  src: string;
  name: string; // 中文類別
  greek: string; // α LOS 等
  western: string; // HAMAL 等
  x: number; // % of width
  y: number; // % of height
  mobileY?: number; // 手機版（< 768px）的 y 覆蓋 — 解決縱向擁擠
  sizeVh: number; // 高度 in vh
  mobileSizeVh?: number; // 手機版的 sizeVh 覆蓋 — 大星球縮小避免霸佔畫面
  labelSide: "left" | "right";
};

const PLANETS: Planet[] = [
  {
    id: "projects",
    src: asset("/assets/星球IMG_1331.PNG"),
    name: "專題作品",
    greek: "α LOS",
    western: "HAMAL",
    x: 22,
    y: 36,
    mobileY: 36,
    sizeVh: 20,
    labelSide: "left",
  },
  {
    id: "drawings",
    src: asset("/assets/星球IMG_1330.PNG"),
    name: "繪圖專案",
    greek: "β LOS",
    western: "SHERATAN",
    x: 50,
    y: 32,
    mobileY: 20,
    sizeVh: 11,
    labelSide: "right",
  },
  {
    id: "profile",
    src: asset("/assets/星球IMG_1333.PNG"),
    name: "個人資料",
    greek: "γ LOS",
    western: "MESARTHIM",
    x: 72,
    y: 54,
    mobileY: 56,
    sizeVh: 28,
    mobileSizeVh: 20,
    labelSide: "right",
  },
  {
    id: "contact",
    src: asset("/assets/星球IMG_1335.PNG"),
    name: "聯絡方式",
    greek: "δ LOS",
    western: "BOTEIN",
    x: 90,
    y: 68,
    mobileY: 78,
    sizeVh: 8,
    labelSide: "left",
  },
  {
    id: "stickers",
    src: asset("/assets/星球IMG_1332.PNG"),
    name: "貼圖創作",
    greek: "35 LOS",
    western: "STICKER",
    x: 38,
    y: 78,
    mobileY: 74,
    sizeVh: 11,
    labelSide: "left",
  },
  {
    id: "illustrations",
    src: asset("/assets/星球IMG_1334.PNG"),
    name: "插圖合輯",
    greek: "41 LOS",
    western: "ILLUS",
    x: 62,
    y: 82,
    mobileY: 88,
    sizeVh: 12,
    labelSide: "left",
  },
];

const CONNECTIONS: [string, string][] = [
  ["projects", "drawings"],
  ["drawings", "profile"],
  ["profile", "contact"],
  ["profile", "illustrations"],
  ["illustrations", "stickers"],
];

export default function Starmap() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const compassRef = useRef<HTMLDivElement | null>(null);
  const subtitleRef = useRef<HTMLDivElement | null>(null);
  const [expandedId, setExpandedId] = useState<PlanetId | null>(null);
  const isMobile = useIsMobile();
  // 手機版優先使用 mobileY，否則用 y
  const getY = (p: Planet) =>
    isMobile && p.mobileY !== undefined ? p.mobileY : p.y;
  // 手機版優先使用 mobileSizeVh，避免大星球佔滿畫面
  const getSize = (p: Planet) =>
    isMobile && p.mobileSizeVh !== undefined ? p.mobileSizeVh : p.sizeVh;

  useEffect(() => {
    // 前庭敏感族群：跳過所有進場動畫，直接顯示終態
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // ★ FOUC 修復：先把所有將進場的元素 set 隱藏，避免 timeline fromTo 因 immediateRender:false
      //              造成元素「先以原樣出現、再被砍到 from 狀態」的閃爍
      gsap.set(root.querySelectorAll("[data-planet-wrap]"), {
        opacity: 0,
        scale: 2.5,
        filter: "blur(20px)",
      });
      gsap.set(root.querySelectorAll("[data-orbit]"), {
        opacity: 0,
        scale: 0.4,
      });
      gsap.set(root.querySelectorAll("[data-line]"), {
        opacity: 0,
        strokeDashoffset: 1000,
      });
      gsap.set(root.querySelectorAll("[data-label]"), { opacity: 0 });
      gsap.set([titleRef.current, compassRef.current, subtitleRef.current], {
        opacity: 0,
      });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1. 標題與羅盤
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.1,
      ).fromTo(
        compassRef.current,
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.4)" },
        0.3,
      );

      // 2. 星球從畫面外飛入（速度感版本）：
      //    - 起點：往外延伸 80vw/vh、scale 2.5（很大像在眼前）、blur(20px)
      //    - 終點：原位、scale 1、blur 0
      //    - 「大顆先到」用 stagger 排序模擬：大顆星球在 stagger 序列前面 → 先開始 → 先到
      //    - 用 function callback 讀 target.dataset 是 GSAP 最穩的 per-element 值取得方式
      const offsetVW = 80;

      // 取 wrap 並按 size 降序排列：大顆先動
      const wrapsRaw = Array.from(
        root.querySelectorAll<HTMLElement>("[data-planet-wrap]"),
      );
      const planetWraps = wrapsRaw.sort((a, b) => {
        const sa = parseFloat(a.dataset.size || "0");
        const sb = parseFloat(b.dataset.size || "0");
        return sb - sa; // 大→小
      });

      // 開發階段 debug：確認 wraps 真的有被抓到
      if (typeof window !== "undefined") {
        console.log("[Starmap] planetWraps count:", planetWraps.length);
      }

      tl.fromTo(
        planetWraps,
        {
          x: (_i: number, target: HTMLElement) => {
            const px = parseFloat(target.dataset.x || "50");
            const py = parseFloat(target.dataset.y || "50");
            const dx = px - 50;
            const dy = py - 50;
            const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
            return `${(dx / len) * offsetVW}vw`;
          },
          y: (_i: number, target: HTMLElement) => {
            const px = parseFloat(target.dataset.x || "50");
            const py = parseFloat(target.dataset.y || "50");
            const dx = px - 50;
            const dy = py - 50;
            const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
            return `${(dy / len) * offsetVW}vh`;
          },
          opacity: 0,
          scale: 2.5,
          filter: "blur(20px)",
        },
        {
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.4,
          stagger: 0.18, // 大顆先 0.18s 後 → 小顆，視覺上「大的先抵達」
          ease: "power3.out",
        },
        1.0,
      );

      // 最後一顆抵達時間：1.0 + (6-1)*0.18 + 1.4 = 3.3s
      const planetsSettleAt = 3.4;

      // 3. 星球軌道環：所有星球到位後依序展開
      tl.fromTo(
        root.querySelectorAll("[data-orbit]"),
        { opacity: 0, scale: 0.4 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: "back.out(2)",
        },
        planetsSettleAt + 0.1,
      );

      // 4. 連接星際線：星球全部到位後才描繪
      tl.fromTo(
        root.querySelectorAll("[data-line]"),
        { strokeDashoffset: 1000, opacity: 0 },
        {
          strokeDashoffset: 0,
          opacity: 1,
          duration: 1.0,
          stagger: 0.15,
          ease: "power2.inOut",
        },
        planetsSettleAt + 0.6,
      );

      // 5. 標籤
      tl.fromTo(
        root.querySelectorAll("[data-label]"),
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
        },
        planetsSettleAt + 1.6,
      );

      // 6. 副標
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        planetsSettleAt + 2.4,
      );

      // 星球持續輕微浮動 idle（在進場結束後啟動）
      root
        .querySelectorAll<HTMLElement>("[data-planet-wrap]")
        .forEach((el, i) => {
          gsap.to(el, {
            y: i % 2 === 0 ? -6 : -10,
            duration: 3 + (i % 3),
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: planetsSettleAt + 3 + i * 0.2,
          });
        });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // 展開動畫：只在 expandedId 從 null → planetId 時 setup
  // 收合動畫：用 cleanup return 處理，當 expandedId 變回 null 時自動跑
  // 用 if (!expandedId) return 自然繞過 StrictMode 雙 mount + 初始 null 兩個情境
  useEffect(() => {
    if (!expandedId) return;

    const root = rootRef.current;
    if (!root) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduced ? 0.01 : 0.8;

    const wraps = root.querySelectorAll<HTMLElement>("[data-planet-wrap]");
    const orbits = root.querySelectorAll("[data-orbit]");
    const lines = root.querySelectorAll("[data-line]");
    const labels = root.querySelectorAll("[data-label]");

    gsap.killTweensOf(wraps);

    const planet = PLANETS.find((p) => p.id === expandedId);
    if (!planet) return;

    wraps.forEach((wrap) => {
      if (wrap.dataset.id === expandedId) {
        gsap.to(wrap, {
          x: `${50 - planet.x}vw`,
          y: `${50 - getY(planet)}vh`,
          scale: 1.3,
          duration: dur,
          ease: "power3.inOut",
        });
      } else {
        gsap.to(wrap, {
          opacity: 0,
          scale: 0.3,
          duration: dur * 0.6,
          ease: "power2.in",
        });
      }
    });
    gsap.to([compassRef.current, subtitleRef.current, titleRef.current], {
      opacity: 0,
      duration: dur * 0.5,
    });
    gsap.to([...orbits, ...lines, ...labels], {
      opacity: 0,
      duration: dur * 0.5,
    });

    // Cleanup = 收合動畫（在 expandedId 變回 null 或 unmount 時跑）
    return () => {
      const root2 = rootRef.current;
      if (!root2) return;
      const reduced2 =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const dur2 = reduced2 ? 0.01 : 0.8;

      const wraps2 = root2.querySelectorAll<HTMLElement>("[data-planet-wrap]");
      const orbits2 = root2.querySelectorAll("[data-orbit]");
      const lines2 = root2.querySelectorAll("[data-line]");
      const labels2 = root2.querySelectorAll("[data-label]");

      gsap.killTweensOf(wraps2);

      wraps2.forEach((wrap) => {
        gsap.to(wrap, {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
          duration: dur2,
          ease: "power3.inOut",
        });
      });
      gsap.to([compassRef.current, subtitleRef.current, titleRef.current], {
        opacity: 1,
        duration: dur2 * 0.7,
        delay: dur2 * 0.3,
      });
      gsap.to([...orbits2, ...lines2, ...labels2], {
        opacity: 1,
        duration: dur2 * 0.7,
        delay: dur2 * 0.3,
      });

      // 收合完成後恢復 idle 浮動
      setTimeout(() => {
        const wraps3 =
          rootRef.current?.querySelectorAll<HTMLElement>("[data-planet-wrap]");
        if (!wraps3) return;
        wraps3.forEach((el, i) => {
          gsap.to(el, {
            y: i % 2 === 0 ? -6 : -10,
            duration: 3 + (i % 3),
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        });
      }, dur2 * 1000 + 400);
    };
  }, [expandedId]);

  const monoStyle = { fontFamily: "var(--font-geist-mono)" };

  // 用名稱查 planet
  const findById = (id: string) => PLANETS.find((p) => p.id === id)!;

  return (
    <div
      ref={rootRef}
      className="relative w-full h-screen overflow-hidden text-[var(--color-text)]"
      role="region"
      aria-label="LOSTAR 星圖：6 個作品分類"
    >
      {/* 給螢幕閱讀器的純文字導航替代 */}
      <nav className="sr-only" aria-label="作品分類導航">
        <ul>
          {PLANETS.map((p) => (
            <li key={p.id}>
              <a href={`#planet-${p.id}`}>
                {p.name}（{p.western}）
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {/* 頂部標題 */}
      <div
        ref={titleRef}
        className="absolute top-8 left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none"
      >
        <div
          className="flex items-center justify-center gap-3 text-[var(--color-text)]"
          style={monoStyle}
        >
          <span className="text-xs opacity-60">✦</span>
          <h1 className="text-2xl md:text-3xl tracking-[0.5em] font-light">
            LOSTAR
          </h1>
          <span className="text-xs opacity-60">✦</span>
        </div>
        <div
          className="mt-2 text-xs tracking-[0.4em] text-[var(--color-text-muted)]"
          style={monoStyle}
        >
          ─── STAR · MAP ───
        </div>
      </div>

      {/* 中央羅盤裝飾 */}
      <div
        ref={compassRef}
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
        style={{ width: "30vh", height: "30vh" }}
      >
        <div
          className="absolute inset-0 rounded-full border border-[rgba(255,255,255,0.08)]"
          style={{ borderStyle: "dashed" }}
        />
        <div
          className="absolute inset-[15%] rounded-full border border-[rgba(255,255,255,0.06)]"
        />
        <div
          className="absolute inset-0 flex items-center justify-center text-[var(--color-text-muted)]"
          style={{ fontSize: "4vh", opacity: 0.4 }}
        >
          ✦
        </div>
      </div>

      {/* 連接線 SVG 層 */}
      <svg
        className="absolute inset-0 w-full h-full z-[15] pointer-events-none"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="line-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(135,206,250,0.0)" />
            <stop offset="50%" stopColor="rgba(135,206,250,0.85)" />
            <stop offset="100%" stopColor="rgba(135,206,250,0.0)" />
          </linearGradient>
          <filter id="line-blur">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        {CONNECTIONS.map(([fromId, toId], i) => {
          const a = findById(fromId);
          const b = findById(toId);
          const ay = getY(a);
          const by = getY(b);
          return (
            <g key={i}>
              {/* 外層光暈 */}
              <line
                data-line
                x1={`${a.x}%`}
                y1={`${ay}%`}
                x2={`${b.x}%`}
                y2={`${by}%`}
                stroke="rgba(135,206,250,0.45)"
                strokeWidth="6"
                strokeLinecap="round"
                filter="url(#line-blur)"
                strokeDasharray="1000"
                strokeDashoffset="1000"
              />
              {/* 主線 */}
              <line
                data-line
                x1={`${a.x}%`}
                y1={`${ay}%`}
                x2={`${b.x}%`}
                y2={`${by}%`}
                stroke="url(#line-glow)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="1000"
                strokeDashoffset="1000"
              />
            </g>
          );
        })}
      </svg>

      {/* 星球 + 軌道環 + 標籤 */}
      {PLANETS.map((p) => {
        const yPos = getY(p);
        const sizeVh = getSize(p);
        // 手機版自動翻轉標籤朝向中央，避免被 viewport 切掉
        const labelLeft = isMobile
          ? p.x >= 50
          : p.labelSide === "left";
        return (
          <div
            key={p.id}
            className="absolute z-20"
            style={{
              left: `${p.x}%`,
              top: `${yPos}%`,
              width: `${sizeVh * PLANET_ASPECT}vh`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              data-planet-wrap
              data-id={p.id}
              data-x={p.x}
              data-y={yPos}
              data-size={sizeVh}
              className="relative will-change-transform"
            >
              {/* 軌道環 */}
              <div
                data-orbit
                aria-hidden
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border pointer-events-none"
                style={{
                  width: `${sizeVh * 1.4}vh`,
                  height: `${sizeVh * 0.4}vh`,
                  borderColor: "rgba(135,206,250,0.4)",
                  borderWidth: "1px",
                  transform: "translate(-50%, -50%) rotateX(72deg)",
                  boxShadow: "0 0 18px rgba(135,206,250,0.25)",
                }}
              />
              {/* 第二層軌道環，較斜 */}
              <div
                data-orbit
                aria-hidden
                className="absolute left-1/2 top-1/2 rounded-full border pointer-events-none"
                style={{
                  width: `${sizeVh * 1.5}vh`,
                  height: `${sizeVh * 0.5}vh`,
                  borderColor: "rgba(255,255,255,0.18)",
                  borderWidth: "1px",
                  transform: "translate(-50%, -50%) rotate(-18deg) rotateX(72deg)",
                }}
              />

              {/* 星球本體 */}
              <button
                data-planet
                type="button"
                onClick={() => setExpandedId(p.id as PlanetId)}
                disabled={expandedId !== null && expandedId !== p.id}
                className={`block cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--color-deep-space)] rounded-full ${
                  expandedId !== null && expandedId !== p.id
                    ? "pointer-events-none"
                    : ""
                }`}
                style={{
                  height: `${sizeVh}vh`,
                  width: "auto",
                  filter:
                    "drop-shadow(0 0 16px rgba(135,206,250,0.45)) drop-shadow(0 8px 24px rgba(0,0,0,0.6))",
                }}
                aria-label={`${p.name}（${p.western}）`}
              >
                <img
                  src={p.src}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-auto select-none"
                  draggable={false}
                />
              </button>

              {/* 標籤 */}
              <div
                data-label
                className={`absolute top-1/2 -translate-y-1/2 ${
                  labelLeft
                    ? "right-full mr-4 text-right"
                    : "left-full ml-4 text-left"
                } whitespace-nowrap pointer-events-none`}
              >
                <div
                  className="text-[10px] tracking-[0.3em] text-[var(--color-text-muted)] flex items-center gap-2"
                  style={{
                    ...monoStyle,
                    justifyContent: labelLeft ? "flex-end" : "flex-start",
                  }}
                >
                  {labelLeft ? null : <span>•</span>}
                  <span>{p.western}</span>
                  {labelLeft ? <span>•</span> : null}
                </div>
                <div
                  className="text-[11px] tracking-[0.2em] text-[var(--color-text-muted)] mt-1"
                  style={monoStyle}
                >
                  {p.greek}
                </div>
                <div
                  className="text-[14px] md:text-[16px] tracking-[0.15em] text-[var(--color-text)] mt-1"
                >
                  {p.name}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* 底部副標 */}
      <div
        ref={subtitleRef}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none"
      >
        <div
          className="text-[10px] tracking-[0.5em] text-[var(--color-text-muted)] flex items-center gap-3"
          style={monoStyle}
        >
          <span className="opacity-50">✦</span>
          <span>SELECT A PLANET TO BEGIN</span>
          <span className="opacity-50">✦</span>
        </div>
      </div>

      {/* 星球展開後的內容（卡片環繞 + 返回按鈕） */}
      {expandedId && (
        <ExpandedView
          planetId={expandedId}
          onClose={() => setExpandedId(null)}
        />
      )}
    </div>
  );
}

// 計算第 i 張卡（共 total 張）在環繞中央的極座標位置
// planetSizeVh：被展開的星球高度，用來動態調整半徑避免卡片撞星球
function getOrbitPosition(
  index: number,
  total: number,
  planetSizeVh: number,
) {
  const baseRadius = total <= 2 ? 22 : total <= 4 ? 26 : 30;
  // 半徑 = 星球放大後半徑 + 安全距離，與 baseRadius 取大者
  const radius = Math.max(planetSizeVh * 0.9 + 14, baseRadius);
  let angleDeg: number;
  if (total === 1) {
    angleDeg = 90; // 正下方
  } else if (total === 2) {
    angleDeg = index === 0 ? 180 : 0; // 正左 / 正右
  } else {
    // 從 -110deg 起順時針平均分布，避開右上角 BACK 按鈕熱區
    angleDeg = -110 + (360 / total) * index;
  }
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.cos(rad) * radius,
    y: Math.sin(rad) * radius,
  };
}

type ExpandedViewProps = {
  planetId: PlanetId;
  onClose: () => void;
};

function ExpandedView({ planetId, onClose }: ExpandedViewProps) {
  const planetData = PLANET_CONTENT[planetId];
  const planet = PLANETS.find((p) => p.id === planetId);

  // ESC 關閉
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const monoStyle = { fontFamily: "var(--font-geist-mono)" };

  return (
    <>
      {/* 返回按鈕：右上角，使用 icon-back */}
      <button
        type="button"
        onClick={onClose}
        aria-label="返回星圖"
        className="fixed top-4 right-4 z-[210] group flex items-center gap-2 px-3 py-2 rounded-sm border border-[rgba(30,144,255,0.4)] bg-[rgba(10,14,39,0.75)] backdrop-blur text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-all"
      >
        <img
          src={asset("/assets/icon-back.png")}
          alt=""
          aria-hidden="true"
          className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-transform group-hover:-translate-x-0.5"
        />
        <span
          className="text-[10px] tracking-[0.3em]"
          style={monoStyle}
        >
          BACK · 返回星圖
        </span>
      </button>

      {/* 依星球資料類型分流：6 種版型 */}
      {planet && planetData.type === "narrative" && (
        <NarrativeView planetData={planetData} planet={planet} />
      )}
      {planetData.type === "info" && (
        <InfoOrbitView
          cards={planetData.cards}
          planet={planet}
          planetId={planetId}
        />
      )}
      {planet && planetData.type === "gallery" && (
        <GalleryView planetData={planetData} planet={planet} />
      )}
      {planet && planetData.type === "series" && (
        <SeriesView planetData={planetData} planet={planet} />
      )}
      {planet && planetData.type === "portfolio" && (
        <PortfolioView planetData={planetData} planet={planet} />
      )}
      {planet && planetData.type === "profile" && (
        <ProfileView planetData={planetData} planet={planet} />
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes card-in {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.6);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );
}

function Card({ card, planetId }: { card: ContentCard; planetId: PlanetId }) {
  const monoStyle = { fontFamily: "var(--font-geist-mono)" };
  // 聯絡星球用 comm icon 強化視覺
  const useCommIcon = planetId === "contact" && !card.image;

  const inner = (
    <div className="flex flex-col gap-2">
      {(card.image || useCommIcon) && (
        <div className="mb-1">
          <img
            src={card.image || asset("/assets/icon-comm.png")}
            alt=""
            aria-hidden="true"
            className="h-6 w-auto opacity-80"
          />
        </div>
      )}
      {card.subtitle && (
        <div
          className="text-[10px] tracking-[0.3em] text-[var(--color-text-muted)] break-all"
          style={monoStyle}
        >
          {card.subtitle}
        </div>
      )}
      <div className="text-base md:text-lg text-[var(--color-text)] tracking-wide">
        {card.title}
      </div>
      {card.description && (
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          {card.description}
        </p>
      )}
      {card.comingSoon && (
        <div
          className="mt-1 text-[10px] tracking-[0.3em] text-[var(--color-rainbow-3)]"
          style={monoStyle}
        >
          ◉ COMING SOON
        </div>
      )}
      {card.href && (
        <div
          className="mt-2 text-[10px] tracking-[0.3em] text-[var(--color-accent)] opacity-80 group-hover:opacity-100 transition-opacity"
          style={monoStyle}
        >
          → {card.download ? "DOWNLOAD" : card.external ? "OPEN" : "VIEW"}
        </div>
      )}
    </div>
  );

  const baseClass =
    "block w-[280px] md:w-[260px] p-5 rounded-sm border bg-[rgba(19,26,59,0.9)] backdrop-blur-md transition-all";

  if (card.href) {
    return (
      <a
        href={card.href}
        {...(card.external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
        {...(card.download ? { download: true } : {})}
        className={`${baseClass} group border-[rgba(30,144,255,0.4)] hover:border-[var(--color-accent)] hover:bg-[rgba(30,144,255,0.12)] hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]`}
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
      >
        {inner}
      </a>
    );
  }

  return (
    <div
      className={`${baseClass} border-[rgba(30,144,255,0.3)]`}
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
    >
      {inner}
    </div>
  );
}

// ============================================================
// InfoOrbitView：原本的 orbit card 環繞排列（用於 info 型星球）
// ============================================================
type InfoOrbitViewProps = {
  cards: ContentCard[];
  planet: (typeof PLANETS)[number] | undefined;
  planetId: PlanetId;
};

function InfoOrbitView({ cards, planet, planetId }: InfoOrbitViewProps) {
  const monoStyle = { fontFamily: "var(--font-geist-mono)" };
  const isMobile = useIsMobile();
  return (
    <>
      {/* 中央星球識別 */}
      <div
        className="fixed top-1/2 left-1/2 z-[25] text-center pointer-events-none"
        style={{
          transform: `translate(-50%, calc(-50% - ${
            (planet?.sizeVh ?? 16) * 0.85 + 6
          }vh))`,
        }}
      >
        <div
          className="text-[10px] tracking-[0.4em] text-[var(--color-text-muted)] mb-2"
          style={monoStyle}
        >
          {planet?.greek} · {planet?.western}
        </div>
        <h2
          className="text-2xl md:text-3xl tracking-[0.3em] text-[var(--color-text)]"
          style={{ animation: "fade-in 0.6s ease-out 0.4s both" }}
        >
          {planet?.name}
        </h2>
      </div>

      {/* 環繞卡片：桌機環繞、手機縱向堆疊 */}
      <div className="fixed inset-0 z-30 pointer-events-none">
        {cards.map((card, i) => {
          // 手機版：星球下方縱向堆疊；桌機版：環繞排列
          let posStyle: React.CSSProperties;
          if (isMobile) {
            const planetSize = planet?.sizeVh ?? 16;
            const cardStartOffset = planetSize / 2 + 10; // 與星球邊緣留 10vh
            const cardSpacing = 22; // vh，卡片中心間距（避免互相貼太近）
            const yOffset = cardStartOffset + i * cardSpacing;
            posStyle = {
              left: "50%",
              top: `calc(50% + ${yOffset}vh)`,
              transform: "translate(-50%, -50%)",
            };
          } else {
            const pos = getOrbitPosition(
              i,
              cards.length,
              planet?.sizeVh ?? 16,
            );
            posStyle = {
              left: `calc(50% + ${pos.x}vh)`,
              top: `calc(50% + ${pos.y}vh)`,
              transform: "translate(-50%, -50%)",
            };
          }
          return (
            <div
              key={card.id}
              className="absolute pointer-events-auto"
              style={{
                ...posStyle,
                animation: `card-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${
                  0.3 + i * 0.08
                }s both`,
              }}
            >
              <Card card={card} planetId={planetId} />
            </div>
          );
        })}
      </div>
    </>
  );
}

// ============================================================
// NarrativeView：完整 case study 敘事頁（用於 narrative 型星球）
// ============================================================
type NarrativeViewProps = {
  planetData: {
    type: "narrative";
    hero: WorkImage;
    intro: string;
    chapters: Chapter[];
    endingCTA?: CTA;
  };
  planet: (typeof PLANETS)[number];
};

function NarrativeView({ planetData, planet }: NarrativeViewProps) {
  const monoStyle = { fontFamily: "var(--font-geist-mono)" };
  const { hero, intro, chapters, endingCTA } = planetData;
  const [activeChapter, setActiveChapter] = useState<string | null>(null);

  // 章節錨點滾動
  const scrollToChapter = (id: string) => {
    const el = document.getElementById(`chapter-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Scroll-spy：偵測當前可視章節，高亮對應導覽項
  useEffect(() => {
    const sections = chapters
      .map((ch) => document.getElementById(`chapter-${ch.id}`))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 取最靠近視窗頂部、且在範圍內的章節
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = visible[0].target.id.replace("chapter-", "");
          setActiveChapter(id);
        }
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [chapters]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#0a0e27] overflow-y-auto"
      style={{ animation: "narrative-in 0.5s ease-out" }}
    >
      {/* 左上角星球徽章 */}
      <div className="fixed top-4 left-4 z-[110] flex items-center gap-3 pointer-events-none">
        <div
          className="w-12 h-12 rounded-full overflow-hidden border border-[rgba(30,144,255,0.45)] bg-[rgba(10,14,39,0.7)] backdrop-blur flex items-center justify-center"
          style={{ boxShadow: "0 0 14px rgba(30,144,255,0.35)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={planet.src}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-contain p-1"
          />
        </div>
        <div className="hidden sm:flex flex-col leading-tight">
          <span
            className="text-[10px] tracking-[0.3em] text-[var(--color-text-secondary)]"
            style={monoStyle}
          >
            {planet.greek} · {planet.western}
          </span>
          <span className="text-sm tracking-[0.2em] text-[var(--color-text)]">
            {planet.name}
          </span>
        </div>
      </div>

      {/* 主版型：sidebar（sticky）+ article（flex 排版讓 sticky 跟著捲動） */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-24 pb-24 flex gap-12">
        {/* 章節導覽（桌機：sticky 在頂部 24 from top；手機：完全隱藏） */}
        <nav
          className="hidden md:block w-52 shrink-0 sticky top-24 self-start"
          aria-label="章節導覽"
        >
          <div
            className="text-[10px] tracking-[0.4em] text-[var(--color-text-muted)] mb-4"
            style={monoStyle}
          >
            CHAPTERS · 章節
          </div>
          <ul className="space-y-2">
            {chapters.map((ch, i) => {
              const isActive = activeChapter === ch.id;
              return (
                <li key={ch.id}>
                  <button
                    type="button"
                    onClick={() => scrollToChapter(ch.id)}
                    aria-current={isActive ? "true" : undefined}
                    className="group flex items-center gap-3 text-left w-full focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] rounded-sm py-1.5"
                  >
                    <span
                      className={`h-px transition-all ${
                        isActive
                          ? "w-12 bg-[var(--color-accent)]"
                          : "w-6 bg-[rgba(135,206,250,0.55)] group-hover:w-10 group-hover:bg-[var(--color-accent)]"
                      }`}
                    />
                    <span
                      className={`text-[11px] tracking-[0.25em] transition-colors ${
                        isActive
                          ? "text-[var(--color-text)]"
                          : "text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)]"
                      }`}
                      style={monoStyle}
                    >
                      {String(i + 1).padStart(2, "0")} · {ch.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 主內容區 */}
        <article className="flex-1 min-w-0 max-w-3xl">
          {/* PROLOGUE / Hero */}
          <section className="mb-20">
            <div
              className="text-[10px] tracking-[0.5em] text-[var(--color-accent)] mb-4"
              style={monoStyle}
            >
              PROLOGUE · 一段關於願望的故事
            </div>
            <div
              className="relative rounded-sm overflow-hidden border border-[rgba(30,144,255,0.3)]"
              style={{ boxShadow: "0 0 32px rgba(30,144,255,0.2)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hero.src}
                alt={hero.alt}
                className="w-full h-auto block"
                loading="eager"
              />
            </div>
            <p
              className="mt-6 text-base md:text-[17px] leading-loose tracking-wide"
              style={{ color: "#F8F4E6" }}
            >
              {intro}
            </p>
          </section>

          {/* Chapters */}
          {chapters.map((ch) => (
            <section
              key={ch.id}
              id={`chapter-${ch.id}`}
              className="mb-20 scroll-mt-24"
            >
              {/* 星塵分隔線 */}
              <div className="flex items-center gap-4 mb-8">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(135,206,250,0.5)] to-transparent" />
                <span className="text-[var(--color-accent)] text-sm">✦</span>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[rgba(135,206,250,0.5)] to-transparent" />
              </div>

              <div
                className="text-[10px] tracking-[0.4em] text-[var(--color-text-muted)] mb-2"
                style={monoStyle}
              >
                {ch.number}
              </div>
              <h3 className="text-xl md:text-2xl tracking-[0.15em] text-[var(--color-text)] mb-6">
                {ch.title}
              </h3>
              <p
                className="text-base md:text-[17px] leading-loose mb-8 tracking-wide"
                style={{ color: "#F8F4E6" }}
              >
                {ch.description}
              </p>

              <ChapterImages
                images={ch.images}
                layout={ch.layout || "single"}
              />
            </section>
          ))}

          {/* Ending CTA */}
          {endingCTA && (
            <section className="mt-16 text-center">
              <div className="flex items-center gap-4 mb-8">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(135,206,250,0.5)] to-transparent" />
                <span className="text-[var(--color-accent)] text-sm">✦</span>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[rgba(135,206,250,0.5)] to-transparent" />
              </div>
              <a
                href={endingCTA.href}
                {...(endingCTA.type === "external"
                  ? { target: "_blank", rel: "noreferrer noopener" }
                  : {})}
                {...(endingCTA.type === "download" ? { download: true } : {})}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-sm border border-[var(--color-accent)] bg-[rgba(30,144,255,0.18)] hover:bg-[rgba(30,144,255,0.3)] transition-all text-[var(--color-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                style={{ boxShadow: "0 0 24px rgba(30,144,255,0.3)" }}
              >
                <span
                  className="text-[11px] tracking-[0.3em]"
                  style={monoStyle}
                >
                  {endingCTA.text} →
                </span>
              </a>
            </section>
          )}
        </article>
      </div>

      <style jsx>{`
        @keyframes narrative-in {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

// 章節圖片排版子元件
function ChapterImages({
  images,
  layout,
}: {
  images: WorkImage[];
  layout: "single" | "grid-2" | "grid-3" | "grid-4";
}) {
  const gridClass =
    layout === "grid-2"
      ? "grid-cols-1 md:grid-cols-2"
      : layout === "grid-3"
        ? "grid-cols-2 md:grid-cols-3"
        : layout === "grid-4"
          ? "grid-cols-2 md:grid-cols-4"
          : "grid-cols-1";

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {images.map((img) => (
        <figure
          key={img.src}
          className="relative rounded-sm overflow-hidden border border-[rgba(30,144,255,0.25)] bg-[rgba(0,0,0,0.3)]"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            alt={img.alt}
            className="w-full h-auto block"
            loading="lazy"
          />
          {img.caption && (
            <figcaption
              className="absolute bottom-0 inset-x-0 px-3 py-2 bg-[rgba(10,14,39,0.9)] backdrop-blur text-[12px] text-[var(--color-text-secondary)] tracking-wide"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

// ============================================================
// 共用 helpers
// ============================================================

/** 「待補充」placeholder 灰框 */
function Placeholder({ label }: { label: string }) {
  return (
    <div
      className="rounded-sm border border-dashed border-[rgba(135,206,250,0.45)] bg-[rgba(30,144,255,0.05)] px-4 py-3 text-center"
    >
      <span
        className="text-[11px] tracking-[0.3em] text-[var(--color-text-muted)]"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        ◇ {label}
      </span>
    </div>
  );
}

/** 共用：星球徽章 + 標題（每個 view 頂部都用） */
function ViewHeader({
  planet,
}: {
  planet: (typeof PLANETS)[number];
}) {
  const monoStyle = { fontFamily: "var(--font-geist-mono)" };
  return (
    <div className="fixed top-4 left-4 z-[110] flex items-center gap-3 pointer-events-none">
      <div
        className="w-12 h-12 rounded-full overflow-hidden border border-[rgba(30,144,255,0.45)] bg-[rgba(10,14,39,0.7)] backdrop-blur flex items-center justify-center"
        style={{ boxShadow: "0 0 14px rgba(30,144,255,0.35)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={planet.src}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-contain p-1"
        />
      </div>
      <div className="hidden sm:flex flex-col leading-tight">
        <span
          className="text-[10px] tracking-[0.3em] text-[var(--color-text-secondary)]"
          style={monoStyle}
        >
          {planet.greek} · {planet.western}
        </span>
        <span className="text-sm tracking-[0.2em] text-[var(--color-text)]">
          {planet.name}
        </span>
      </div>
    </div>
  );
}

/** 共用：標題列裝飾分隔線 */
function SectionDivider() {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(135,206,250,0.5)] to-transparent" />
      <span className="text-[var(--color-accent)] text-sm">✦</span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[rgba(135,206,250,0.5)] to-transparent" />
    </div>
  );
}

/** 共用：可顯示 placeholder 覆蓋的圖片 */
function WorkImageBlock({ img }: { img: WorkImage }) {
  return (
    <figure
      className="relative rounded-sm overflow-hidden border border-[rgba(30,144,255,0.25)] bg-[rgba(0,0,0,0.3)]"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.src}
        alt={img.alt}
        className="w-full h-auto block"
        loading="lazy"
      />
      {img.caption && (
        <figcaption
          className={`absolute bottom-0 inset-x-0 px-3 py-2 backdrop-blur text-[12px] tracking-wide ${
            img.placeholder
              ? "bg-[rgba(30,144,255,0.15)] border-t border-dashed border-[rgba(135,206,250,0.5)] text-[var(--color-text-muted)]"
              : "bg-[rgba(10,14,39,0.9)] text-[var(--color-text-secondary)]"
          }`}
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          {img.placeholder ? `◇ ${img.caption}` : img.caption}
        </figcaption>
      )}
    </figure>
  );
}

// ============================================================
// GalleryView：純圖片瀑布流（ILLUS 插圖合輯）
// ============================================================
type GalleryViewProps = {
  planetData: { type: "gallery"; intro?: string; images: WorkImage[] };
  planet: (typeof PLANETS)[number];
};

function GalleryView({ planetData, planet }: GalleryViewProps) {
  const monoStyle = { fontFamily: "var(--font-geist-mono)" };
  return (
    <div
      className="fixed inset-0 z-[100] bg-[#0a0e27] overflow-y-auto"
      style={{ animation: "narrative-in 0.5s ease-out" }}
    >
      <ViewHeader planet={planet} />

      <article className="max-w-6xl mx-auto px-6 md:px-12 pt-24 pb-24">
        {/* 標題列 */}
        <div className="text-center mb-12">
          <div
            className="text-[10px] tracking-[0.5em] text-[var(--color-accent)] mb-3"
            style={monoStyle}
          >
            {planet.greek} · {planet.western}
          </div>
          <h2 className="text-2xl md:text-3xl tracking-[0.3em] text-[var(--color-text)] mb-4">
            {planet.name}
          </h2>
          {planetData.intro && (
            <p
              className="max-w-2xl mx-auto text-[15px] md:text-base leading-loose tracking-wide"
              style={{ color: "#F8F4E6" }}
            >
              {planetData.intro}
            </p>
          )}
        </div>

        <SectionDivider />

        {/* Masonry 瀑布流（CSS columns 模擬） */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:break-inside-avoid [&>*]:mb-4">
          {planetData.images.map((img) => (
            <WorkImageBlock key={img.src} img={img} />
          ))}
        </div>
      </article>
    </div>
  );
}

// ============================================================
// SeriesView：兩系列分區（STICKER 貼圖）
// ============================================================
type SeriesViewProps = {
  planetData: { type: "series"; intro?: string; series: SeriesItem[] };
  planet: (typeof PLANETS)[number];
};

function SeriesView({ planetData, planet }: SeriesViewProps) {
  const monoStyle = { fontFamily: "var(--font-geist-mono)" };
  return (
    <div
      className="fixed inset-0 z-[100] bg-[#0a0e27] overflow-y-auto"
      style={{ animation: "narrative-in 0.5s ease-out" }}
    >
      <ViewHeader planet={planet} />

      <article className="max-w-6xl mx-auto px-6 md:px-12 pt-24 pb-24">
        {/* 標題列 */}
        <div className="text-center mb-12">
          <div
            className="text-[10px] tracking-[0.5em] text-[var(--color-accent)] mb-3"
            style={monoStyle}
          >
            {planet.greek} · {planet.western}
          </div>
          <h2 className="text-2xl md:text-3xl tracking-[0.3em] text-[var(--color-text)] mb-4">
            {planet.name}
          </h2>
          {planetData.intro && (
            <p
              className="max-w-2xl mx-auto text-[15px] md:text-base leading-loose tracking-wide"
              style={{ color: "#F8F4E6" }}
            >
              {planetData.intro}
            </p>
          )}
        </div>

        {/* 各系列依序列出 */}
        {planetData.series.map((s) => (
          <section key={s.id} className="mb-16">
            <SectionDivider />
            <div
              className="text-[10px] tracking-[0.4em] text-[var(--color-text-muted)] mb-2 text-center"
              style={monoStyle}
            >
              {s.subtitle}
            </div>
            <h3 className="text-xl md:text-2xl tracking-[0.2em] text-[var(--color-text)] mb-3 text-center">
              {s.title}
            </h3>
            <p
              className="max-w-2xl mx-auto text-center text-[14px] md:text-[15px] leading-loose mb-8 tracking-wide"
              style={{ color: "#F8F4E6" }}
            >
              {s.description}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {s.images.map((img) => (
                <div
                  key={img.src}
                  className="aspect-square rounded-sm border border-[rgba(30,144,255,0.25)] bg-[rgba(0,0,0,0.3)] overflow-hidden flex items-center justify-center p-2 hover:border-[var(--color-accent)] hover:bg-[rgba(30,144,255,0.1)] transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </article>
    </div>
  );
}

// ============================================================
// PortfolioView：精選作品 + 其他散圖（SHERATAN 繪圖專案）
// ============================================================
type PortfolioViewProps = {
  planetData: {
    type: "portfolio";
    intro?: string;
    featured?: FeaturedWork[];
    otherWorks?: WorkImage[];
  };
  planet: (typeof PLANETS)[number];
};

function PortfolioView({ planetData, planet }: PortfolioViewProps) {
  const monoStyle = { fontFamily: "var(--font-geist-mono)" };
  return (
    <div
      className="fixed inset-0 z-[100] bg-[#0a0e27] overflow-y-auto"
      style={{ animation: "narrative-in 0.5s ease-out" }}
    >
      <ViewHeader planet={planet} />

      <article className="max-w-6xl mx-auto px-6 md:px-12 pt-24 pb-24">
        {/* 標題列 */}
        <div className="text-center mb-12">
          <div
            className="text-[10px] tracking-[0.5em] text-[var(--color-accent)] mb-3"
            style={monoStyle}
          >
            {planet.greek} · {planet.western}
          </div>
          <h2 className="text-2xl md:text-3xl tracking-[0.3em] text-[var(--color-text)] mb-4">
            {planet.name}
          </h2>
          {planetData.intro && (
            <p
              className="max-w-2xl mx-auto text-[15px] md:text-base leading-loose tracking-wide"
              style={{ color: "#F8F4E6" }}
            >
              {planetData.intro}
            </p>
          )}
        </div>

        {/* Featured 主打作品 — 可多個專案 */}
        {planetData.featured?.map((f) => (
          <section key={f.title} className="mb-16">
            <SectionDivider />
            <div
              className="text-[10px] tracking-[0.4em] text-[var(--color-accent)] mb-2 text-center"
              style={monoStyle}
            >
              FEATURED · {f.subtitle}
            </div>
            <h3 className="text-xl md:text-2xl tracking-[0.2em] text-[var(--color-text)] mb-3 text-center">
              {f.title}
            </h3>
            {f.description.startsWith("待補充") ? (
              <div className="max-w-2xl mx-auto mb-8">
                <Placeholder label={f.description} />
              </div>
            ) : (
              <p
                className="max-w-2xl mx-auto text-left md:text-center text-[14px] md:text-[15px] leading-loose mb-8 tracking-wide whitespace-pre-line"
                style={{ color: "#F8F4E6" }}
              >
                {f.description}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {f.views.map((view) => (
                <WorkImageBlock key={view.src} img={view} />
              ))}
            </div>
          </section>
        ))}

        {/* Other works — 僅在有資料時顯示 */}
        {planetData.otherWorks && planetData.otherWorks.length > 0 && (
          <section>
            <SectionDivider />
            <div
              className="text-[10px] tracking-[0.4em] text-[var(--color-text-muted)] mb-8 text-center"
              style={monoStyle}
            >
              OTHER WORKS · 其他作品
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {planetData.otherWorks.map((img) => (
                <WorkImageBlock key={img.src} img={img} />
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}

// ============================================================
// ProfileView：Bio + Skills + Experience + CV（MESARTHIM）
// ============================================================
type ProfileViewProps = {
  planetData: {
    type: "profile";
    bio: string;
    bioPlaceholder?: boolean;
    skills?: ProfileSection[];
    experience?: ExperienceItem[];
    cv?: { href: string; download?: boolean };
  };
  planet: (typeof PLANETS)[number];
};

function ProfileView({ planetData, planet }: ProfileViewProps) {
  const monoStyle = { fontFamily: "var(--font-geist-mono)" };
  const { bio, bioPlaceholder, skills, experience, cv } = planetData;

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#0a0e27] overflow-y-auto"
      style={{ animation: "narrative-in 0.5s ease-out" }}
    >
      <ViewHeader planet={planet} />

      <article className="max-w-4xl mx-auto px-6 md:px-12 pt-24 pb-24">
        {/* 標題列 */}
        <div className="text-center mb-12">
          <div
            className="text-[10px] tracking-[0.5em] text-[var(--color-accent)] mb-3"
            style={monoStyle}
          >
            {planet.greek} · {planet.western}
          </div>
          <h2 className="text-2xl md:text-3xl tracking-[0.3em] text-[var(--color-text)]">
            {planet.name}
          </h2>
        </div>

        {/* ABOUT */}
        <section className="mb-12">
          <SectionDivider />
          <div
            className="text-[10px] tracking-[0.4em] text-[var(--color-text-muted)] mb-3"
            style={monoStyle}
          >
            ABOUT · 關於我
          </div>
          {bioPlaceholder ? (
            <Placeholder label={bio} />
          ) : (
            <p
              className="text-[15px] md:text-base leading-loose tracking-wide whitespace-pre-line"
              style={{ color: "#F8F4E6" }}
            >
              {bio}
            </p>
          )}
        </section>

        {/* SKILLS */}
        {skills && skills.length > 0 && (
          <section className="mb-12">
            <SectionDivider />
            <div
              className="text-[10px] tracking-[0.4em] text-[var(--color-text-muted)] mb-6"
              style={monoStyle}
            >
              SKILLS · 技能
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {skills.map((sec) => (
                <div
                  key={sec.id}
                  className="rounded-sm border border-[rgba(30,144,255,0.3)] bg-[rgba(19,26,59,0.6)] backdrop-blur p-4"
                  style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
                >
                  <h4
                    className="text-[12px] tracking-[0.3em] text-[var(--color-accent)] mb-3"
                    style={monoStyle}
                  >
                    {sec.title}
                  </h4>
                  {sec.placeholder ? (
                    <Placeholder label={sec.items[0]} />
                  ) : (
                    <ul className="space-y-2">
                      {sec.items.map((item, i) => (
                        <li
                          key={i}
                          className="text-[14px] tracking-wide"
                          style={{ color: "#F8F4E6" }}
                        >
                          • {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EXPERIENCE */}
        {experience && experience.length > 0 && (
          <section className="mb-12">
            <SectionDivider />
            <div
              className="text-[10px] tracking-[0.4em] text-[var(--color-text-muted)] mb-6"
              style={monoStyle}
            >
              EXPERIENCE · 經歷
            </div>
            <ol className="relative border-l border-[rgba(135,206,250,0.4)] ml-3 space-y-6">
              {experience.map((exp, i) => (
                <li key={i} className="ml-6">
                  <span
                    className={`absolute -left-[5px] w-[10px] h-[10px] rounded-full border ${
                      exp.placeholder
                        ? "border-dashed border-[rgba(135,206,250,0.6)] bg-transparent"
                        : "border-[var(--color-accent)] bg-[var(--color-accent)]"
                    }`}
                    style={{
                      boxShadow: exp.placeholder
                        ? "none"
                        : "0 0 8px rgba(30,144,255,0.6)",
                    }}
                  />
                  {exp.placeholder ? (
                    <div className="space-y-2">
                      <Placeholder
                        label={`${exp.time} · ${exp.role} @ ${exp.org}`}
                      />
                      {exp.description && (
                        <p
                          className="text-[12px] text-[var(--color-text-muted)] pl-2"
                          style={monoStyle}
                        >
                          ◇ {exp.description}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div
                        className="text-[11px] tracking-[0.3em] text-[var(--color-accent)] mb-1"
                        style={monoStyle}
                      >
                        {exp.time}
                      </div>
                      <h4
                        className="text-base tracking-wide mb-1"
                        style={{ color: "#F8F4E6" }}
                      >
                        {exp.role}{" "}
                        <span className="text-[var(--color-text-muted)] text-sm">
                          @ {exp.org}
                        </span>
                      </h4>
                      {exp.description && (
                        <p
                          className="text-[14px] leading-relaxed"
                          style={{ color: "#F8F4E6" }}
                        >
                          {exp.description}
                        </p>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* CV 下載 */}
        {cv && (
          <section className="mt-12 text-center">
            <SectionDivider />
            <a
              href={cv.href}
              {...(cv.download ? { download: true } : {})}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-sm border border-[var(--color-accent)] bg-[rgba(30,144,255,0.18)] hover:bg-[rgba(30,144,255,0.3)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              style={{
                color: "#F8F4E6",
                boxShadow: "0 0 24px rgba(30,144,255,0.3)",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span
                className="text-[11px] tracking-[0.3em]"
                style={monoStyle}
              >
                下載完整履歷 · CV.pdf
              </span>
            </a>
          </section>
        )}
      </article>
    </div>
  );
}
