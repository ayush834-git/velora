"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "@/lib/gsapConfig";
import { IMAGE_SIZES } from "@/lib/constants";
import { getBackdropPath, getPosterPath } from "@/lib/movie-utils";
import { getImageUrl } from "@/lib/tmdb";
import { Movie } from "@/types/movie";

interface ParallaxBackgroundProps {
  movies?: Movie[];
}

type ParticleSpec = {
  top: string;
  left: string;
  delay: string;
  duration: string;
};

function uniquePaths(paths: string[]) {
  const seen = new Set<string>();
  return paths.filter((path) => {
    if (seen.has(path)) return false;
    seen.add(path);
    return true;
  });
}

export default function ParallaxBackground({ movies = [] }: ParallaxBackgroundProps) {
  const panLayerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const visualPaths = useMemo(() => {
    const raw = movies
      .map((movie) => getBackdropPath(movie) ?? getPosterPath(movie))
      .filter((path): path is string => Boolean(path));
    return uniquePaths(raw).slice(0, 10);
  }, [movies]);

  const particles = useMemo<ParticleSpec[]>(
    () =>
      Array.from({ length: 16 }).map((_, index) => ({
        top: `${6 + (index * 11) % 82}%`,
        left: `${4 + (index * 17) % 90}%`,
        delay: `${(index * 0.8).toFixed(2)}s`,
        duration: `${(10 + (index % 5) * 3).toFixed(2)}s`,
      })),
    []
  );

  const normalizedIndex = visualPaths.length > 0 ? activeIndex % visualPaths.length : 0;
  const activePath = visualPaths[normalizedIndex] ?? null;

  useEffect(() => {
    if (visualPaths.length <= 1) return undefined;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % visualPaths.length);
    }, 30000);

    return () => window.clearInterval(interval);
  }, [visualPaths.length]);

  useLayoutEffect(() => {
    if (!panLayerRef.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.to(panLayerRef.current, {
        y: "8%",
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });
    }, panLayerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="parallax-container" aria-hidden="true">
      <div className="parallax-layer parallax-sky" />
      <div className="parallax-layer parallax-clouds" />
      <div className="parallax-layer parallax-rays" />
      <div className="parallax-layer parallax-wash" />

      <div ref={panLayerRef} className="absolute inset-0">
        <AnimatePresence mode="wait">
          {activePath && (
            <motion.div
              key={activePath}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.08 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={getImageUrl(activePath, IMAGE_SIZES.backdrop.original)}
                alt=""
                fill
                priority
                quality={90}
                sizes="100vw"
                className="object-cover scale-[1.08] blur-[40px] saturate-[0.85] mix-blend-multiply"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-cream/30 via-cream/42 to-cream/75" />

      {particles.map((particle) => (
        <span
          key={`${particle.top}-${particle.left}`}
          className="gold-particle"
          style={{
            top: particle.top,
            left: particle.left,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}
    </div>
  );
}
