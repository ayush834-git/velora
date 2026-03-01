"use client";

import { useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  animOpacity1: number;
  animOpacity2: number;
  animTransX: number;
}

const generateParticles = (): Particle[] => {
  const particleCount = 15; // Drastically reduced for performance
  const newParticles: Particle[] = [];

  for (let i = 0; i < particleCount; i++) {
    newParticles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.4 + 0.1,
      animOpacity1: Math.random() * 0.5 + 0.3,
      animOpacity2: Math.random() * 0.5 + 0.3,
      animTransX: Math.random() * 100 - 50,
    });
  }
  return newParticles;
};

const emptySubscribe = () => () => {};

export default function CinematicDust() {
  const [particles] = useState<Particle[]>(() => generateParticles());
  const prefersReduced = useReducedMotion();

  // Safely avoid hydration mismatches without setState-in-effect
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!isMounted || prefersReduced || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full bg-golden-light particle-${p.id}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animation: `floatUp-${p.id} ${p.duration}s linear ${p.delay}s infinite`,
            willChange: "transform, opacity",
          }}
        />
      ))}
      <style dangerouslySetInnerHTML={{ __html: particles.map(p => `
        @keyframes floatUp-${p.id} {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: ${p.animOpacity1}; }
          90% { opacity: ${p.animOpacity2}; }
          100% { transform: translateY(-300px) translateX(${p.animTransX}px); opacity: 0; }
        }
      `).join('\\n') }} />
    </div>
  );
}
