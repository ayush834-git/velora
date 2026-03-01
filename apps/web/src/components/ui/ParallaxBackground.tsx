"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function ParallaxBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, index) => ({
        id: index,
        left: `${(index * 17 + 11) % 96}%`,
        top: `${(index * 23 + 7) % 88}%`,
        size: 2 + (index % 3),
        duration: 9 + (index % 6),
        delay: (index % 5) * -0.8,
      })),
    []
  );

  useEffect(() => {
    let rafId = 0;
    const updateScrollVar = () => {
      document.documentElement.style.setProperty("--scroll", `${window.scrollY.toFixed(2)}`);
      rafId = window.requestAnimationFrame(updateScrollVar);
    };
    rafId = window.requestAnimationFrame(updateScrollVar);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const handleMouse = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      });
    };

    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <div ref={containerRef} className="parallax-container">
      <div
        className="parallax-layer parallax-sky"
        style={{
          transform: `translate3d(${mouse.x * -5}px, calc(var(--scroll) * -0.08px + ${mouse.y * -5}px), 0)`,
        }}
      />

      <div
        className="parallax-layer parallax-clouds"
        style={{
          transform: `translate3d(${mouse.x * -12}px, calc(var(--scroll) * -0.18px + ${mouse.y * -10}px), 0)`,
        }}
      />

      <div
        className="parallax-layer parallax-rays"
        style={{
          transform: `translate3d(${mouse.x * -18}px, calc(var(--scroll) * -0.26px + ${mouse.y * -15}px), 0)`,
        }}
      />

      <div
        className="parallax-layer parallax-wash"
        style={{
          transform: `translate3d(${mouse.x * -25}px, calc(var(--scroll) * -0.34px + ${mouse.y * -20}px), 0)`,
        }}
      />

      <div className="absolute inset-0 z-[2] pointer-events-none">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="gold-particle"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-[40vh] z-10"
        style={{
          background: "linear-gradient(to top, #faf8f5 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
