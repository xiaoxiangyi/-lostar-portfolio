"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";

type Star = {
  top: string;
  left: string;
  size: number;
  delay: number;
  duration: number;
};

type Particle = {
  left: string;
  size: number;
  delay: number;
  duration: number;
  color: string;
};

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateStars(count: number, seed = 42): Star[] {
  const rand = seededRandom(seed);
  return Array.from({ length: count }, () => ({
    top: `${rand() * 100}%`,
    left: `${rand() * 100}%`,
    size: rand() < 0.85 ? 1 : rand() < 0.97 ? 2 : 3,
    delay: rand() * 6,
    duration: 2 + rand() * 4,
  }));
}

function generateParticles(count: number, seed = 99): Particle[] {
  const rand = seededRandom(seed);
  const colors = [
    "rgba(255,255,255,0.9)",
    "rgba(30,144,255,0.7)",
    "rgba(180,160,255,0.65)",
  ];
  return Array.from({ length: count }, () => ({
    left: `${rand() * 100}%`,
    size: 1 + rand() * 2.5,
    delay: rand() * 25,
    duration: 18 + rand() * 25,
    color: colors[Math.floor(rand() * colors.length)],
  }));
}

type ShootingStar = { id: number; top: string; angle: string; duration: number };

const StarryBackground = forwardRef<HTMLDivElement>(function StarryBackground(
  _props,
  ref,
) {
  const stars = useMemo(() => generateStars(180), []);
  const particles = useMemo(() => generateParticles(28), []);

  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const spawn = () => {
      counterRef.current += 1;
      const id = counterRef.current;
      const top = `${5 + Math.random() * 35}%`;
      const angle = `${-15 - Math.random() * 20}deg`;
      const duration = 1.2 + Math.random() * 0.8;
      setShootingStars((prev) => [...prev, { id, top, angle, duration }]);
      setTimeout(() => {
        setShootingStars((prev) => prev.filter((s) => s.id !== id));
      }, duration * 1000 + 200);
      timer = setTimeout(spawn, 4000 + Math.random() * 9000);
    };
    timer = setTimeout(spawn, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-95"
        style={{
          backgroundImage: "url(/assets/bg-nebula.png)",
          filter: "brightness(1.05) saturate(1.25) contrast(1.05)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 50% 45%, black 35%, rgba(0,0,0,0.7) 70%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 50% 45%, black 35%, rgba(0,0,0,0.7) 70%, transparent 100%)",
          animation: "nebula-drift 60s ease-in-out infinite",
        }}
      />

      <div
        className="absolute inset-0 mix-blend-screen opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 55%, rgba(30,144,255,0.35), rgba(108,99,255,0.18) 40%, transparent 70%)",
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(10,14,39,0.85) 0%, rgba(10,14,39,0.35) 40%, transparent 100%)",
        }}
      />

      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,0.85)`,
              animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              bottom: "-10vh",
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {shootingStars.map((s) => (
          <span
            key={s.id}
            className="absolute"
            style={
              {
                top: s.top,
                left: "100vw",
                width: "180px",
                height: "2px",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.95), rgba(135,206,250,0.7), transparent)",
                boxShadow: "0 0 10px rgba(255,255,255,0.9)",
                animation: `shooting-star ${s.duration}s cubic-bezier(0.3,0.7,0.5,1) forwards`,
                "--angle": s.angle,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
});

export default StarryBackground;
