/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";
import { Movie } from "@/types/movie";
import { getImageUrl } from "@/lib/tmdb";
import { IMAGE_SIZES } from "@/lib/constants";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ChaosSceneProps {
  movies: Movie[];
}

type PosterLayout = {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  tilt: number;
};

const POSTER_LAYOUT: PosterLayout[] = [
  { x: -420, y: -170, z: -60, width: 170, height: 250, tilt: -8 },
  { x: -200, y: -190, z: 20, width: 185, height: 275, tilt: 5 },
  { x: 20, y: -180, z: 70, width: 195, height: 290, tilt: -4 },
  { x: 240, y: -170, z: 15, width: 180, height: 265, tilt: 6 },
  { x: -360, y: 20, z: 10, width: 180, height: 265, tilt: 4 },
  { x: -130, y: 10, z: 90, width: 205, height: 305, tilt: -6 },
  { x: 110, y: 0, z: 100, width: 210, height: 315, tilt: 5 },
  { x: 350, y: 15, z: 20, width: 185, height: 275, tilt: -5 },
  { x: -260, y: 190, z: -20, width: 175, height: 260, tilt: 6 },
  { x: -20, y: 200, z: 40, width: 190, height: 280, tilt: -4 },
  { x: 220, y: 185, z: 30, width: 185, height: 270, tilt: 5 },
  { x: 430, y: 190, z: -30, width: 170, height: 255, tilt: -7 },
];

export default function ChaosScene({ movies }: ChaosSceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const posters = useMemo(
    () => movies.slice(0, POSTER_LAYOUT.length),
    [movies]
  );

  useEffect(() => {
    if (prefersReduced || !sectionRef.current || !wrapperRef.current || posters.length === 0) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(
        ".chaos-poster",
        wrapperRef.current || undefined
      );

      gsap.to(cards, {
        rotateY: (i) => (i - posters.length / 2) * 10,
        y: (i) => POSTER_LAYOUT[i]?.y + i * -10,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [posters.length, prefersReduced]);

  return (
    <section ref={sectionRef} className="scene relative h-[200vh] bg-transparent" id="chaos">
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream-warm/60 to-cream" />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
          <h2
            className="font-display font-extralight tracking-[-0.02em] leading-[0.9]"
            style={{
              fontSize: "clamp(5rem, 14vw, 16rem)",
              color: "rgba(26, 26, 46, 0.06)",
              WebkitTextStroke: "1px rgba(26, 26, 46, 0.04)",
            }}
          >
            VELORA
          </h2>
        </div>

        <div
          ref={wrapperRef}
          className="poster-wrapper relative w-full max-w-7xl h-[85vh] z-[2]"
          style={{
            perspective: "1200px",
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {posters.map((movie, i) => {
            const layout = POSTER_LAYOUT[i];
            const rating = typeof movie.vote_average === "number" ? movie.vote_average : 0;

            return (
              <div
                key={movie.id}
                className="chaos-poster absolute"
                style={{
                  left: "50%",
                  top: "50%",
                  width: layout.width,
                  height: layout.height,
                  marginLeft: -(layout.width / 2),
                  marginTop: -(layout.height / 2),
                  transform: `translate3d(${layout.x}px, ${layout.y}px, ${layout.z}px) rotateZ(${layout.tilt}deg)`,
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }}
              >
                <div
                  className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-700 h-full w-full"
                  style={{
                    boxShadow: `
                      0 ${10 + (layout.z + 120) * 0.12}px ${28 + (layout.z + 120) * 0.25}px rgba(0,0,0,0.08),
                      0 ${2 + (layout.z + 120) * 0.04}px ${8 + (layout.z + 120) * 0.08}px rgba(0,0,0,0.04)
                    `,
                  }}
                >
                  <img
                    src={getImageUrl(movie.poster_path, IMAGE_SIZES.poster.medium)}
                    alt={movie.title}
                    className="w-full h-full object-cover rounded-xl"
                    loading="lazy"
                    draggable={false}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  <div className="absolute bottom-0 left-0 right-0 p-3 rounded-b-xl bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none">
                    <p className="font-display text-xs text-white/90 font-medium truncate">
                      {movie.title}
                    </p>
                    <span className="text-[10px] text-golden-light">★ {rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
