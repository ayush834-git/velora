/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Movie } from "@/types/movie";
import { getImageUrl } from "@/lib/tmdb";
import { IMAGE_SIZES } from "@/lib/constants";
import AnimatedText from "@/components/ui/AnimatedText";
import ParticleField from "@/components/ui/ParticleField";

interface SpinSceneProps {
  movies: Movie[];
  onResult?: (movie: Movie) => void;
}

type SpinPhase = "idle" | "spinning" | "revealing" | "done";

export default function SpinScene({ movies, onResult }: SpinSceneProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });
  const [phase, setPhase] = useState<SpinPhase>("idle");
  const [flashIndex, setFlashIndex] = useState(0);
  const [chosenMovie, setChosenMovie] = useState<Movie | null>(null);

  const spin = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("spinning");

    // Flash posters rapidly
    let count = 0;
    const interval = setInterval(() => {
      setFlashIndex(Math.floor(Math.random() * movies.length));
      count++;
      if (count > 28) {
        clearInterval(interval);
        const chosen = movies[Math.floor(Math.random() * movies.length)];
        setChosenMovie(chosen);
        setPhase("revealing");
        setTimeout(() => {
          setPhase("done");
          onResult?.(chosen);
        }, 2200);
      }
    }, 80 + count * 4);
  }, [movies, onResult, phase]);

  const reset = useCallback(() => {
    setPhase("idle");
    setChosenMovie(null);
  }, []);

  const flashMovie = movies[flashIndex] || movies[0];

  return (
    <section
      ref={sectionRef}
      className="scene relative min-h-screen flex items-center justify-center py-24"
      id="spin"
    >
      {/* Background — warm gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream-warm to-cream" />

      {/* Particle field — golden particles */}
      <div className="absolute inset-0 z-[1] pointer-events-none opacity-50">
        <ParticleField isSpiral={phase === "spinning"} />
      </div>

      {/* Section heading */}
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
                animate={isInView ? { opacity: 1 } : {}}
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

              {/* Spin rings */}
              <div className="relative w-56 h-56 md:w-72 md:h-72 mx-auto my-10">
                <div className="spin-ring w-full h-full" />
                <div className="spin-ring w-[85%] h-[85%] top-[7.5%] left-[7.5%]" />
                <div className="spin-ring w-[70%] h-[70%] top-[15%] left-[15%]" />

                {/* Flash poster during spin */}
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
                        <img
                          src={getImageUrl(flashMovie.poster_path, IMAGE_SIZES.poster.small)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ) : (
                      <motion.button
                        key="spin-btn"
                        onClick={spin}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-28 h-28 md:w-36 md:h-36 rounded-full cursor-pointer
                          bg-gradient-to-br from-golden via-golden-light to-sunset
                          text-white font-display text-xl md:text-2xl tracking-[0.2em] uppercase
                          shadow-[0_8px_40px_rgba(232,168,56,0.35)]
                          hover:shadow-[0_12px_50px_rgba(232,168,56,0.5)]
                          transition-shadow duration-500"
                        data-cursor-hover
                      >
                        SPIN
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 0.5 } : {}}
                transition={{ delay: 1 }}
                className="text-ink-muted text-sm mt-4 italic"
              >
                One click. One film. No paradox of choice.
              </motion.p>
            </motion.div>
          )}

          {/* REVEAL */}
          {(phase === "revealing" || phase === "done") && chosenMovie && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.85, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <span className="font-display text-xs tracking-[0.3em] uppercase text-golden-warm mb-4">
                Fate has spoken
              </span>

              <div className="w-48 h-72 md:w-56 md:h-84 rounded-2xl overflow-hidden shadow-2xl mb-6">
                <img
                  src={getImageUrl(chosenMovie.poster_path, IMAGE_SIZES.poster.large)}
                  alt={chosenMovie.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="font-display font-light text-ink"
                style={{ fontSize: "var(--text-subheadline)" }}>
                {chosenMovie.title}
              </h3>

              <p className="text-ink-soft text-sm mt-2">
                ★ {chosenMovie.vote_average.toFixed(1)} · {chosenMovie.release_date?.slice(0, 4)}
              </p>

              <motion.button
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
