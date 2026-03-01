/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState, useCallback, useLayoutEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";
import { AnimatePresence, motion } from "framer-motion";
import { Movie } from "@/types/movie";
import { getImageUrl } from "@/lib/tmdb";
import { IMAGE_SIZES, ANIMATION } from "@/lib/constants";
import AnimatedText from "@/components/ui/AnimatedText";
import ParticleField from "@/components/ui/ParticleField";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fetchSpinMovie } from "@/lib/api";
import { getMovieRating, getPosterPath, normalizeBackendMovie } from "@/lib/movie-utils";
import { useFilterContext } from "@/context/FilterContext";

interface SpinRitualProps {
  movies: Movie[];
  onResult?: (movie: Movie) => void;
}

type SpinPhase = "idle" | "spinning" | "revealing" | "done";

export default function SpinRitual({ movies, onResult }: SpinRitualProps) {
  const { appliedFilters } = useFilterContext();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<SpinPhase>("idle");
  const [flashIndex, setFlashIndex] = useState(0);
  const [chosenMovie, setChosenMovie] = useState<Movie | null>(null);
  const apiResultRef = useRef<Movie | null>(null);
  const prefersReduced = useReducedMotion();

  useLayoutEffect(() => {
    if (!sectionRef.current || prefersReduced) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=100%",
        pin: true,
        pinSpacing: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReduced]);

  const spin = useCallback(() => {
    if (phase !== "idle" || movies.length === 0) return;
    setPhase("spinning");

    apiResultRef.current = null;
    fetchSpinMovie(appliedFilters)
      .then((data) => {
        apiResultRef.current = normalizeBackendMovie(data);
      })
      .catch((error) => {
        console.error("Spin API request failed", error);
        apiResultRef.current = movies[Math.floor(Math.random() * movies.length)] || null;
      });

    let count = 0;
    const flash = () => {
      setFlashIndex(Math.floor(Math.random() * movies.length));
      count++;
      if (count < 28) {
        setTimeout(flash, 80 + count * 1.1);
      } else {
        const tryReveal = () => {
          const chosen =
            apiResultRef.current ||
            movies[Math.floor(Math.random() * movies.length)] ||
            null;

          if (!chosen) {
            setPhase("idle");
            return;
          }

          setChosenMovie(chosen);
          setPhase("revealing");

          setTimeout(() => {
            setPhase("done");
            onResult?.(chosen);
          }, 2200);
        };

        if (apiResultRef.current) {
          tryReveal();
        } else {
          setTimeout(tryReveal, 300);
        }
      }
    };
    flash();
  }, [movies, onResult, phase, appliedFilters]);

  const reset = useCallback(() => {
    setPhase("idle");
    setChosenMovie(null);
    apiResultRef.current = null;
  }, []);

  const canSpin = phase === "idle" && movies.length > 0;
  const flashMovie = movies[flashIndex] || movies[0] || null;
  const flashPosterPath = flashMovie ? getPosterPath(flashMovie) : null;
  const chosenPosterPath = chosenMovie ? getPosterPath(chosenMovie) : null;
  const chosenRating = chosenMovie ? getMovieRating(chosenMovie) : 0;

  return (
    <section
      ref={sectionRef}
      className="scene relative min-h-screen flex items-center justify-center py-24"
      id="spin"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream-warm to-cream" />

      <div className="absolute inset-0 z-[1] pointer-events-none opacity-50">
        <ParticleField isSpiral={phase === "spinning"} />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto text-center px-6">
        <AnimatePresence mode="wait">
          {(phase === "idle" || phase === "spinning") && (
            <motion.div
              key="spin-ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-display text-xs tracking-[0.4em] uppercase text-golden-warm/70 mb-4 block"
              >
                The Ritual
              </motion.span>

              <AnimatedText
                text="One click. One film."
                className="font-display font-extralight text-ink mb-6"
                style={{ fontSize: "var(--text-headline)" }}
                delay={0.3}
                splitBy="words"
                as="h2"
              />

              <div className="relative w-56 h-56 md:w-72 md:h-72 mx-auto my-10">
                <div className="spin-ring w-full h-full" />
                <div className="spin-ring w-[85%] h-[85%] top-[7.5%] left-[7.5%]" />
                <div className="spin-ring w-[70%] h-[70%] top-[15%] left-[15%]" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {phase === "spinning" ? (
                      <motion.div
                        key={flashIndex}
                        initial={{ opacity: 0, scale: 0.8, rotateY: -60 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotateY: 60 }}
                        transition={{ duration: 0.07 }}
                        className="w-28 h-40 md:w-36 md:h-52 rounded-xl overflow-hidden shadow-xl"
                      >
                        {flashPosterPath ? (
                          <img
                            src={getImageUrl(flashPosterPath, IMAGE_SIZES.poster.small)}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-cream-warm/80" />
                        )}
                      </motion.div>
                    ) : (
                      <motion.button
                        key="spin-btn"
                        onClick={spin}
                        whileHover={canSpin ? { scale: 1.08 } : undefined}
                        whileTap={canSpin ? { scale: 0.95 } : undefined}
                        disabled={!canSpin}
                        className="w-28 h-28 md:w-36 md:h-36 rounded-full cursor-pointer
                          bg-gradient-to-br from-golden via-golden-light to-sunset
                          text-white font-display text-xl md:text-2xl tracking-[0.2em] uppercase
                          shadow-[0_8px_40px_rgba(232,168,56,0.35)]
                          hover:shadow-[0_12px_50px_rgba(232,168,56,0.5)]
                          transition-shadow duration-500 disabled:opacity-70 disabled:cursor-not-allowed"
                        data-cursor-hover
                      >
                        {movies.length > 0 ? "SPIN" : "..."}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1 }}
                className="text-ink-muted text-sm mt-4 italic"
              >
                One click. One film. No paradox of choice.
              </motion.p>
            </motion.div>
          )}

          {(phase === "revealing" || phase === "done") && chosenMovie && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.85, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{
                duration: ANIMATION.duration.spinReveal,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col items-center"
            >
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="font-display text-xs tracking-[0.3em] uppercase text-golden-warm mb-4"
              >
                Fate has spoken
              </motion.span>

              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: ANIMATION.duration.spinReveal,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="w-48 h-72 md:w-56 md:h-84 rounded-2xl overflow-hidden shadow-2xl mb-6"
              >
                {chosenPosterPath ? (
                  <img
                    src={getImageUrl(chosenPosterPath, IMAGE_SIZES.poster.large)}
                    alt={chosenMovie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-cream-warm/80" />
                )}
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="font-display font-light text-ink"
                style={{ fontSize: "var(--text-subheadline)" }}
              >
                {chosenMovie.title}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-ink-soft text-sm mt-2"
              >
                ★ {chosenRating.toFixed(1)} · {chosenMovie.release_date?.slice(0, 4)}
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                onClick={reset}
                whileTap={{ scale: 0.95 }}
                className="mt-8 px-6 py-2.5 rounded-full text-sm tracking-wider uppercase
                  font-display border border-golden/30 text-golden-warm
                  hover:bg-golden/10 transition-all duration-300 cursor-pointer"
                data-cursor-hover
              >
                Spin Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
