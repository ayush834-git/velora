"use client";

import { useRef, useEffect } from "react";

interface ParticleFieldProps {
  isSpiral?: boolean;
}

export default function ParticleField({ isSpiral = false }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    hue: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles — warm golden palette
    if (particles.current.length === 0) {
      const count = 60;
      for (let i = 0; i < count; i++) {
        particles.current.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2.5 + 0.8,
          opacity: Math.random() * 0.4 + 0.15,
          hue: 30 + Math.random() * 30, // warm golden range
        });
      }
    }

    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const cx = w / 2;
      const cy = h / 2;

      particles.current.forEach((p) => {
        if (isSpiral) {
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) + 0.04;
          const newDist = dist * 0.996;
          p.x = cx + Math.cos(angle) * newDist;
          p.y = cy + Math.sin(angle) * newDist;
          if (dist < 15) {
            p.x = cx + (Math.random() - 0.5) * w;
            p.y = cy + (Math.random() - 0.5) * h;
          }
        } else {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${p.opacity})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [isSpiral]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ position: "absolute", inset: 0 }}
    />
  );
}
