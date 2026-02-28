"use client";

import { useEffect, useRef, useState } from "react";

export default function ParallaxBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY);
    };
    const handleMouse = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <div ref={containerRef} className="parallax-container">
      {/* Layer 1: Sky — slowest */}
      <div
        className="parallax-layer parallax-sky"
        style={{
          transform: `translate3d(${mouse.x * -5}px, ${scroll * -0.05 + mouse.y * -5}px, 0)`,
        }}
      />

      {/* Layer 2: Clouds */}
      <div
        className="parallax-layer parallax-clouds"
        style={{
          transform: `translate3d(${mouse.x * -12}px, ${scroll * -0.12 + mouse.y * -10}px, 0)`,
        }}
      />

      {/* Layer 3: Light rays */}
      <div
        className="parallax-layer parallax-rays"
        style={{
          transform: `translate3d(${mouse.x * -18}px, ${scroll * -0.2 + mouse.y * -15}px, 0)`,
        }}
      />

      {/* Layer 4: Color wash */}
      <div
        className="parallax-layer parallax-wash"
        style={{
          transform: `translate3d(${mouse.x * -25}px, ${scroll * -0.3 + mouse.y * -20}px, 0)`,
        }}
      />

      {/* Bottom cream fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[40vh] z-10"
        style={{
          background: "linear-gradient(to top, #faf8f5 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
