/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useLayoutEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";
import { Movie } from "@/types/movie";
import { getImageUrl } from "@/lib/tmdb";
import { IMAGE_SIZES, ANIMATION } from "@/lib/constants";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ChaosSceneProps {
  movies: Movie[];
}

/*
  FOLLOW.ART-inspired poster choreography with GSAP ScrollTrigger.
  
  Philosophy:
  - Cards are cinematic floating objects inside a shared perspective container.
  - They enter diagonally as if wind is carrying them across space.
  - Scroll moves the camera through the card field via GSAP scrub, not individual cards.
  - Mouse tilts the entire perspective stage via GSAP spring.
  - Typography is anchored behind everything — cards drift over it.
  - Easing is slow, confident, editorial. No bounce. No elastic.
*/

// Poster layout: final resting positions in the perspective field
const POSTER_CHOREOGRAPHY = [
  // Row 1 — top-left cluster, slightly receded
  { x: -420, y: -200, z: -80,  rotX: 4,   rotY: 12,  rotZ: -8,   w: 200, h: 300, delay: 0    },
  { x: -180, y: -240, z: 20,   rotX: -3,  rotY: -8,  rotZ: 5,    w: 220, h: 330, delay: 0.12 },
  { x: 60,   y: -190, z: -40,  rotX: 2,   rotY: 6,   rotZ: -3,   w: 190, h: 285, delay: 0.06 },
  
  // Row 2 — center band, prominent
  { x: -340, y: -20,  z: 60,   rotX: -2,  rotY: -10, rotZ: 6,    w: 210, h: 315, delay: 0.18 },
  { x: -100, y: 10,   z: 100,  rotX: 3,   rotY: 5,   rotZ: -4,   w: 240, h: 360, delay: 0.24 },
  { x: 150,  y: -40,  z: 40,   rotX: -4,  rotY: -7,  rotZ: 3,    w: 200, h: 300, delay: 0.15 },
  { x: 380,  y: -10,  z: -20,  rotX: 2,   rotY: 9,   rotZ: -5,   w: 190, h: 285, delay: 0.21 },

  // Row 3 — bottom spread, fading depth
  { x: -400, y: 200,  z: -60,  rotX: -3,  rotY: 8,   rotZ: 4,    w: 180, h: 270, delay: 0.30 },
  { x: -160, y: 220,  z: 30,   rotX: 4,   rotY: -6,  rotZ: -3,   w: 200, h: 300, delay: 0.27 },
  { x: 100,  y: 180,  z: -30,  rotX: -2,  rotY: 5,   rotZ: 6,    w: 185, h: 278, delay: 0.33 },
  { x: 340,  y: 210,  z: 50,   rotX: 3,   rotY: -9,  rotZ: -4,   w: 210, h: 315, delay: 0.36 },

  // Peripheral accents — edges of frame
  { x: 480,  y: -180, z: -100, rotX: 5,   rotY: 14,  rotZ: -7,   w: 170, h: 255, delay: 0.09 },
  { x: -500, y: 80,   z: -90,  rotX: -4,  rotY: -12, rotZ: 5,    w: 175, h: 263, delay: 0.39 },
  { x: 440,  y: 140,  z: -70,  rotX: 3,   rotY: 11,  rotZ: -6,   w: 165, h: 248, delay: 0.42 },
];

// Confident editorial easing — slow in, slow out, no bounce
const WIND_EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1.0];

export default function ChaosScene({ movies }: ChaosSceneProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-8%" });
  const prefersReduced = useReducedMotion();

  // ── GSAP ScrollTrigger: camera scrub through card field ──
  useLayoutEffect(() => {
    if (prefersReduced || !sectionRef.current || !stageRef.current) return;

    const ctx = gsap.context(() => {
      // Camera Z push — scroll moves us "into" the card field
      // Camera Y drift — subtle vertical shift
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: ANIMATION.duration.scrubLag, // 1.2s catch-up lag for cinematic feel
        animation: gsap
          .timeline()
          .fromTo(
            stageRef.current,
            { z: 80, y: 40 },
            { z: -60, y: -30, ease: "none" }
          ),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReduced]);

  // ── Mouse tilt on entire perspective stage (GSAP spring) ──
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!sectionRef.current || !stageRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    // GSAP spring tilt on the perspective stage
    gsap.to(stageRef.current, {
      rotateX: y * -2.5,
      rotateY: x * 3,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  }, []);

  // Attach mouse listener
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    section.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => section.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const posters = movies.slice(0, POSTER_CHOREOGRAPHY.length);

  return (
    <section
      ref={sectionRef}
      className="scene relative min-h-[140vh] flex items-center justify-center overflow-hidden"
      id="chaos"
      style={{ perspective: `${ANIMATION.depth.perspective}px` }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream-warm/60 to-cream" />

      {/* ===== ANCHORED TYPOGRAPHY — behind everything ===== */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
        <div className="text-center select-none">
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
      </div>

      {/* ===== PERSPECTIVE STAGE ===== */}
      {/* GSAP ScrollTrigger controls Z + Y. Mouse tilts rotateX/Y via GSAP spring. */}
      <div
        ref={stageRef}
        className="relative w-full max-w-7xl mx-auto h-[90vh] flex items-center justify-center z-[2]"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {posters.map((movie, i) => {
          const config = POSTER_CHOREOGRAPHY[i];

          // Diagonal entry vector — cards arrive from top-right to bottom-left
          const entryAngle = -35;
          const entryDistance = 1200 + i * 80;
          const rad = (entryAngle * Math.PI) / 180;
          const entryX = Math.cos(rad) * entryDistance;
          const entryY = Math.sin(rad) * entryDistance;

          return (
            <motion.div
              key={movie.id}
              className="absolute group"
              initial={{
                x: prefersReduced ? config.x : entryX,
                y: prefersReduced ? config.y : entryY,
                rotateX: prefersReduced ? config.rotX : config.rotX * 4,
                rotateY: prefersReduced ? config.rotY : config.rotY * 3,
                rotateZ: prefersReduced ? config.rotZ : config.rotZ * 2.5,
                opacity: prefersReduced ? 1 : 0,
                scale: prefersReduced ? 1 : 0.6,
              }}
              animate={
                isInView
                  ? {
                      x: config.x,
                      y: config.y,
                      rotateX: config.rotX,
                      rotateY: config.rotY,
                      rotateZ: config.rotZ,
                      opacity: 1,
                      scale: 1,
                    }
                  : {}
              }
              transition={{
                duration: 2.2 + i * 0.06,
                delay: config.delay,
                ease: WIND_EASE,
              }}
              style={{
                left: "50%",
                top: "50%",
                marginLeft: -(config.w / 2),
                marginTop: -(config.h / 2),
                transformStyle: "preserve-3d",
                transform: `translateZ(${config.z}px)`,
                zIndex: Math.round((config.z + 100) / 20),
                willChange: "transform",
              }}
            >
              {/* The poster card */}
              <div
                className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-700"
                style={{
                  width: config.w,
                  height: config.h,
                  boxShadow: `
                    0 ${8 + (config.z + 100) * 0.15}px ${
                    30 + (config.z + 100) * 0.3
                  }px rgba(0,0,0,0.08),
                    0 ${2 + (config.z + 100) * 0.04}px ${
                    8 + (config.z + 100) * 0.1
                  }px rgba(0,0,0,0.04)
                  `,
                }}
              >
                {/* Hover: slight lift + subtle glow */}
                <div className="w-full h-full transition-transform duration-700 ease-out group-hover:translate-y-[-6px] group-hover:scale-[1.015]">
                  <img
                    src={getImageUrl(
                      movie.poster_path,
                      IMAGE_SIZES.poster.medium
                    )}
                    alt={movie.title}
                    className="w-full h-full object-cover rounded-xl"
                    loading="lazy"
                    draggable={false}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>

                {/* Hover glow — soft warm edge light */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{
                    boxShadow:
                      "inset 0 0 30px rgba(232, 168, 56, 0.08), 0 0 40px rgba(232, 168, 56, 0.06)",
                  }}
                />

                {/* Hover info — title + rating */}
                <div className="absolute bottom-0 left-0 right-0 p-3 rounded-b-xl bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-700 ease-out pointer-events-none">
                  <p className="font-display text-xs text-white/90 font-medium truncate">
                    {movie.title}
                  </p>
                  <span className="text-[10px] text-golden-light">
                    ★ {movie.vote_average.toFixed(1)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ===== FOREGROUND TEXT ===== */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-[12vh] pointer-events-none z-[3]">
        <motion.h3
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 1.6, delay: 1.2, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="font-display font-extralight text-ink text-center leading-[1.1]"
          style={{ fontSize: "var(--text-headline)" }}
        >
          500,000 films exist.
        </motion.h3>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 0.5 } : {}}
          transition={{ duration: 1.4, delay: 1.8, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="font-body text-ink-soft text-center mt-3"
          style={{ fontSize: "var(--text-body)" }}
        >
          How do you choose just one?
        </motion.p>
      </div>
    </section>
  );
}
