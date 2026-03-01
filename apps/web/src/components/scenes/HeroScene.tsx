"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import GlowButton from "@/components/ui/GlowButton";
import BlurUpImage from "@/components/ui/BlurUpImage";
import CinematicDust from "@/components/ui/CinematicDust";
import { Movie } from "@/types/movie";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface HeroSceneProps {
  movies: Movie[];
}

const GHOST_LAYOUT = [
  { top: "8%", left: "3%", rotate: -12, w: 140, h: 200 },
  { top: "55%", left: "6%", rotate: 8, w: 130, h: 190 },
  { top: "12%", right: "4%", rotate: 15, w: 135, h: 195 },
  { top: "50%", right: "6%", rotate: -10, w: 120, h: 175 },
  { top: "30%", left: "12%", rotate: 5, w: 110, h: 160 },
  { top: "35%", right: "10%", rotate: -8, w: 115, h: 168 },
] as const;

export default function HeroScene({ movies }: HeroSceneProps) {
  const prefersReduced = useReducedMotion();
  const ghostPosters = movies.slice(0, 6);
  const title = "Tonight, fate chooses your film.";
  const titleWords = useMemo(() => {
    return title.split(" ").map((word) => ({
      word,
      chars: word.split(""),
    }));
  }, [title]);

  const scrollToSpin = () => {
    const el = document.getElementById("spin");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="scene relative min-h-[110vh] flex items-center justify-center" id="hero">
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-cream/80 via-cream-warm/70 to-cream"
        initial={prefersReduced ? false : { opacity: 0, scale: 1.05 }}
        animate={prefersReduced ? undefined : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      />

      <CinematicDust />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {ghostPosters.map((movie, i) => {
          const layout = GHOST_LAYOUT[i];
          return (
            <motion.div
              key={movie.id}
              className="absolute rounded-xl overflow-hidden"
              style={{
                top: layout.top,
                left: "left" in layout ? layout.left : undefined,
                right: "right" in layout ? layout.right : undefined,
                width: layout.w,
                height: layout.h,
                transform: `rotate(${layout.rotate}deg)`,
                filter: "blur(3px) saturate(0.5) brightness(1.1)",
                willChange: "transform, opacity",
              }}
              initial={prefersReduced ? false : { opacity: 0, y: 18, scale: 0.94 }}
              animate={
                prefersReduced
                  ? undefined
                  : {
                      opacity: 0.14,
                      y: [0, -5, 0],
                      scale: 1,
                    }
              }
              transition={
                prefersReduced
                  ? undefined
                  : {
                      opacity: { duration: 0.34, delay: 0.16 + i * 0.06 },
                      scale: { duration: 0.34, delay: 0.16 + i * 0.06 },
                      y: {
                        duration: 4.6,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: i * 0.14,
                      },
                    }
              }
            >
              <BlurUpImage path={movie.poster_path} alt="" type="poster" fill />
            </motion.div>
          );
        })}
      </div>

      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        <motion.div
          className="mb-6"
          initial={prefersReduced ? false : { opacity: 0, y: 12 }}
          animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-display text-sm md:text-base tracking-[0.5em] uppercase text-golden-warm/80">
            VELORA
          </span>
        </motion.div>

        <h1
          className="font-display font-extralight leading-[0.95] tracking-tight text-ink"
          style={{ fontSize: "var(--text-hero)" }}
          aria-label={title}
        >
          {titleWords.map((wordObj, wi) => {
            const charOffset = titleWords
              .slice(0, wi)
              .reduce((sum, w) => sum + w.chars.length + 1, 0);
            return (
              <span key={wi} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                {wordObj.chars.map((char, ci) => (
                  <motion.span
                    key={`${char}-${ci}`}
                    className="inline-block"
                    initial={
                      prefersReduced
                        ? false
                        : { opacity: 0, y: 24, filter: "blur(8px)" }
                    }
                    animate={
                      prefersReduced
                        ? undefined
                        : { opacity: 1, y: 0, filter: "blur(0px)" }
                    }
                    transition={{
                      duration: 0.28,
                      delay: 0.12 + (charOffset + ci) * 0.018,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{ willChange: "transform, opacity, filter" }}
                  >
                    {char}
                  </motion.span>
                ))}
                {wi < titleWords.length - 1 && "\u00A0"}
              </span>
            );
          })}
        </h1>

        <motion.p
          className="mt-8 md:mt-10 text-ink-soft/80 font-body max-w-lg mx-auto leading-[1.7] tracking-wide"
          style={{ fontSize: "clamp(0.95rem, 1.3vw, 1.15rem)" }}
          initial={prefersReduced ? false : { opacity: 0, y: 10 }}
          animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
        >
          An AI&#8209;powered cinematic ritual that discovers the perfect film
          for this exact moment in your life.
        </motion.p>

        <motion.div
          className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={prefersReduced ? false : { opacity: 0, y: 12 }}
          animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlowButton onClick={scrollToSpin} variant="primary" size="lg">
            Enter VELORA
          </GlowButton>
          <GlowButton onClick={scrollToSpin} variant="secondary" size="lg">
            Spin Now →
          </GlowButton>
        </motion.div>

        <motion.div
          className="absolute -bottom-28 left-1/2 -translate-x-1/2"
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={prefersReduced ? undefined : { opacity: 1 }}
          transition={{ duration: 0.28, delay: 0.62 }}
        >
          <div className="flex flex-col items-center gap-2 animate-bounce-slow">
            <span className="text-xs tracking-[0.2em] uppercase text-ink-muted">
              Scroll to discover
            </span>
            <div className="w-px h-10 bg-gradient-to-b from-golden/40 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
