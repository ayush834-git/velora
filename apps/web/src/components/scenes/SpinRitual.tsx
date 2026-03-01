"use client";

import { useRef, useState, useCallback, useLayoutEffect, useMemo, useEffect } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";
import { AnimatePresence, motion } from "framer-motion";
import { Movie } from "@/types/movie";
import { getImageUrl } from "@/lib/tmdb";
import { IMAGE_SIZES } from "@/lib/constants";
import AnimatedText from "@/components/ui/AnimatedText";
import ParticleField from "@/components/ui/ParticleField";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fetchSpinMovie } from "@/lib/api";
import {
  getBackdropPath,
  getMovieRating,
  getPosterPath,
  normalizeBackendMovie,
} from "@/lib/movie-utils";
import { useFilters } from "@/context/FilterContext";

interface SpinRitualProps {
  movies: Movie[];
  onResult?: (movie: Movie) => void;
}

type SpinPhase = "idle" | "spinning" | "revealing" | "done";

const GENRE_TO_ID: Record<string, number> = {
  Action: 28,
  Drama: 18,
  Comedy: 35,
  "Sci-Fi": 878,
  Horror: 27,
  Romance: 10749,
  Thriller: 53,
  Animation: 16,
};

const MOOD_TO_GENRE_IDS: Record<string, number[]> = {
  "Mind-Bending": [878, 9648, 53],
  Comfort: [35, 10751, 16],
  Dark: [27, 53, 80],
  Uplifting: [35, 10751, 10402],
  Epic: [28, 12, 14],
  Romantic: [10749, 18],
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function SpinRitual({ movies, onResult }: SpinRitualProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<SpinPhase>("idle");
  const [flashIndex, setFlashIndex] = useState(0);
  const [chosenMovie, setChosenMovie] = useState<Movie | null>(null);
  const [previewMovie, setPreviewMovie] = useState<Movie | null>(null);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [isPreviewTransitioning, setIsPreviewTransitioning] = useState(false);
  const [spinRippleKey, setSpinRippleKey] = useState(0);
  const [posterTilt, setPosterTilt] = useState({ x: 0, y: 0 });
  const [shadowFocus, setShadowFocus] = useState({ x: 50, y: 24 });
  const apiResultRef = useRef<Movie | null>(null);
  const prefersReduced = useReducedMotion();
  const { filters } = useFilters();

  const spinFilters = useMemo(
    () => ({
      genre: filters.genre,
      mood: filters.mood,
      era: filters.era,
      language: filters.language,
      rating: filters.rating,
    }),
    [filters.genre, filters.mood, filters.era, filters.language, filters.rating]
  );

  const flashPool = useMemo(() => {
    if (movies.length === 0) return movies;
    let pool = movies;

    if (filters.mood && MOOD_TO_GENRE_IDS[filters.mood]) {
      const moodIds = MOOD_TO_GENRE_IDS[filters.mood];
      pool = pool.filter((movie) => movie.genre_ids?.some((id) => moodIds.includes(id)));
    }

    if (filters.genre && GENRE_TO_ID[filters.genre]) {
      const genreId = GENRE_TO_ID[filters.genre];
      pool = pool.filter((movie) => movie.genre_ids?.includes(genreId));
    }

    return pool.length > 0 ? pool : movies;
  }, [filters.genre, filters.mood, movies]);

  useEffect(() => {
    let active = true;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;

    const beginTimer = setTimeout(() => {
      if (!active) return;
      setIsFilterLoading(true);
      setIsPreviewTransitioning(true);
    }, 0);

    fetchSpinMovie(spinFilters)
      .then((movie) => {
        if (!active) return;
        setPreviewMovie(normalizeBackendMovie(movie));
      })
      .catch((error) => {
        console.error("Failed to refresh filtered spin movie", error);
      })
      .finally(() => {
        settleTimer = setTimeout(() => {
          if (!active) return;
          setIsFilterLoading(false);
          setIsPreviewTransitioning(false);
        }, 180);
      });

    return () => {
      active = false;
      clearTimeout(beginTimer);
      if (settleTimer) clearTimeout(settleTimer);
    };
  }, [spinFilters]);

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
    if (phase !== "idle" || flashPool.length === 0) return;
    setPhase("spinning");
    setSpinRippleKey((key) => key + 1);
    setPosterTilt({ x: 0, y: 0 });
    setShadowFocus({ x: 50, y: 24 });

    apiResultRef.current = null;
    fetchSpinMovie(spinFilters)
      .then((data) => {
        apiResultRef.current = normalizeBackendMovie(data);
      })
      .catch((error) => {
        console.error("Spin API request failed", error);
        apiResultRef.current = flashPool[Math.floor(Math.random() * flashPool.length)] || null;
      });

    let count = 0;
    const flash = () => {
      setFlashIndex(Math.floor(Math.random() * flashPool.length));
      count += 1;
      if (count < 24) {
        setTimeout(flash, 55 + count * 2);
        return;
      }

      const reveal = () => {
        const selected =
          apiResultRef.current || flashPool[Math.floor(Math.random() * flashPool.length)] || null;
        if (!selected) {
          setPhase("idle");
          return;
        }

        setChosenMovie(selected);
        setPhase("revealing");

        setTimeout(() => {
          setPhase("done");
          onResult?.(selected);
        }, 420);
      };

      if (apiResultRef.current) {
        reveal();
      } else {
        setTimeout(reveal, 220);
      }
    };

    flash();
  }, [flashPool, onResult, phase, spinFilters]);

  const reset = useCallback(() => {
    setPhase("idle");
    setChosenMovie(null);
    apiResultRef.current = null;
    setPosterTilt({ x: 0, y: 0 });
    setShadowFocus({ x: 50, y: 24 });
  }, []);

  const handlePosterMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    setPosterTilt({
      x: clamp(-ny * 12, -6, 6),
      y: clamp(nx * 12, -6, 6),
    });
    setShadowFocus({
      x: clamp((nx + 0.5) * 100, 8, 92),
      y: clamp((ny + 0.5) * 100, 8, 92),
    });
  };

  const handlePosterLeave = () => {
    setPosterTilt({ x: 0, y: 0 });
    setShadowFocus({ x: 50, y: 24 });
  };

  const canSpin = phase === "idle" && flashPool.length > 0;
  const flashMovie = flashPool[flashIndex] || flashPool[0] || null;
  const flashPosterPath = flashMovie ? getPosterPath(flashMovie) : null;
  const chosenPosterPath = chosenMovie ? getPosterPath(chosenMovie) : null;
  const previewPosterPath = previewMovie ? getPosterPath(previewMovie) : null;
  const chosenRating = chosenMovie ? getMovieRating(chosenMovie) : 0;
  const backdropMovie = chosenMovie || previewMovie || flashMovie;
  const backdropPath = backdropMovie ? getBackdropPath(backdropMovie) || getPosterPath(backdropMovie) : null;
  const backdropSrc = backdropPath ? getImageUrl(backdropPath, IMAGE_SIZES.backdrop.large) : null;
  const backdropBlur = backdropPath ? getImageUrl(backdropPath, "w92") : undefined;

  return (
    <section
      ref={sectionRef}
      className="scene relative min-h-screen flex items-center justify-center py-24"
      id="spin"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream-warm to-cream" />
      {backdropSrc && (
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={backdropSrc}
            alt=""
            fill
            sizes="100vw"
            quality={90}
            priority
            placeholder={backdropBlur ? "blur" : "empty"}
            blurDataURL={backdropBlur}
            className="object-cover scale-110 blur-[20px] opacity-50"
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-cream/50 via-cream/72 to-cream" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_34%,rgba(24,22,27,0.3)_100%)]" />

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
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.42 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.08, duration: 0.35 }}
                className="font-display text-xs tracking-[0.4em] uppercase text-golden-warm/75 mb-4 block"
              >
                The Ritual
              </motion.span>

              <AnimatedText
                text="One click. One film."
                className="font-display font-extralight text-ink mb-6"
                style={{ fontSize: "var(--text-headline)" }}
                delay={0.08}
                stagger={0.03}
                splitBy="words"
                as="h2"
              />

              <div className="relative w-56 h-56 md:w-72 md:h-72 mx-auto my-10">
                <div className="spin-ring w-full h-full" />
                <div className="spin-ring w-[85%] h-[85%] top-[7.5%] left-[7.5%]" />
                <div className="spin-ring w-[70%] h-[70%] top-[15%] left-[15%]" />

                {(isFilterLoading || isPreviewTransitioning) && phase !== "spinning" && (
                  <div className="absolute inset-[23%] rounded-full overflow-hidden">
                    <div className="absolute inset-0 shimmer opacity-70" />
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {phase === "spinning" ? (
                      <motion.div
                        key={flashIndex}
                        initial={{ opacity: 0, scale: 0.86, rotateY: -45 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.86, rotateY: 45 }}
                        transition={{ duration: 0.08 }}
                        className="relative w-28 h-40 md:w-36 md:h-52 rounded-xl overflow-hidden shadow-xl"
                      >
                        {flashPosterPath ? (
                          <Image
                            src={getImageUrl(flashPosterPath, IMAGE_SIZES.poster.small)}
                            alt=""
                            fill
                            sizes="(max-width:1200px) 33vw, 144px"
                            quality={90}
                            priority
                            placeholder="blur"
                            blurDataURL={getImageUrl(flashPosterPath, "w92")}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-cream-warm/80" />
                        )}
                      </motion.div>
                    ) : (
                      <motion.button
                        key="spin-btn"
                        onClick={spin}
                        whileHover={canSpin ? { scale: 1.04 } : undefined}
                        whileTap={canSpin ? { scale: 0.95 } : undefined}
                        disabled={!canSpin}
                        className="spin-glow-pulse relative overflow-hidden w-28 h-28 md:w-36 md:h-36 rounded-full cursor-pointer
                          btn-primary
                          text-white font-display text-xl md:text-2xl tracking-[0.2em] uppercase
                          shadow-[0_8px_40px_rgba(216,154,63,0.35)]
                          hover:shadow-[0_14px_52px_rgba(232,168,56,0.56)]
                          transition-shadow duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                        data-cursor-hover
                      >
                        {spinRippleKey > 0 && (
                          <AnimatePresence>
                            <motion.span
                              key={spinRippleKey}
                              initial={{ scale: 0, opacity: 0.35 }}
                              animate={{ scale: 2.8, opacity: 0 }}
                              transition={{ duration: 0.45, ease: "easeOut" }}
                              className="absolute inset-0 rounded-full border border-white/60"
                            />
                          </AnimatePresence>
                        )}
                        <span className="relative z-10">{flashPool.length > 0 ? "SPIN" : "..."}</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="h-16 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {previewPosterPath && (
                    <motion.div
                      key={previewMovie?.id || "preview"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isPreviewTransitioning ? 0.25 : 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.28 }}
                      className="relative w-12 h-16 rounded-md overflow-hidden shadow-md"
                    >
                      <Image
                        src={getImageUrl(previewPosterPath, IMAGE_SIZES.poster.small)}
                        alt=""
                        fill
                        sizes="(max-width:1200px) 33vw, 48px"
                        quality={90}
                        priority
                        placeholder="blur"
                        blurDataURL={getImageUrl(previewPosterPath, "w92")}
                        className="object-cover"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.58 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-ink-muted text-sm mt-4 italic"
              >
                One click. One film. No paradox of choice.
              </motion.p>
            </motion.div>
          )}

          {(phase === "revealing" || phase === "done") && chosenMovie && (
            <motion.div
              key={`reveal-${chosenMovie.id}`}
              initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.04 }}
                className="font-display text-xs tracking-[0.3em] uppercase text-golden-warm mb-4"
              >
                Fate has spoken
              </motion.span>

              <motion.div
                layoutId={`movie-card-${chosenMovie.id}`}
                onMouseMove={handlePosterMove}
                onMouseLeave={handlePosterLeave}
                style={{
                  transformStyle: "preserve-3d",
                  boxShadow: `0 28px 64px rgba(0,0,0,0.28), ${(posterTilt.y / 6) * 12}px ${
                    (posterTilt.x / 6) * 10
                  }px 26px rgba(243,166,58,0.22)`,
                }}
                animate={{ rotateX: posterTilt.x, rotateY: posterTilt.y }}
                transition={{ type: "spring", stiffness: 180, damping: 18, mass: 0.45 }}
                className="relative w-48 h-72 md:w-56 md:h-84 rounded-2xl overflow-hidden mb-6"
              >
                {chosenPosterPath ? (
                  <Image
                    src={getImageUrl(chosenPosterPath, IMAGE_SIZES.poster.large)}
                    alt={chosenMovie.title}
                    fill
                    sizes="(max-width:1200px) 33vw, 224px"
                    quality={90}
                    priority
                    placeholder="blur"
                    blurDataURL={getImageUrl(chosenPosterPath, "w92")}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-cream-warm/80" />
                )}

                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at ${shadowFocus.x}% ${shadowFocus.y}%, rgba(255,255,255,0.24) 0%, transparent 62%)`,
                  }}
                />

                <motion.div
                  className="absolute -top-3 -right-3 rounded-full h-12 w-12 flex items-center justify-center text-sm font-semibold text-white bg-gradient-to-br from-[#f7c873] to-[#f3a63a] shadow-[0_8px_20px_rgba(243,166,58,0.3)]"
                  animate={{ x: posterTilt.y * 1.4, y: -posterTilt.x * 1.4 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18, mass: 0.5 }}
                  style={{ transform: "translateZ(24px)" }}
                >
                  {chosenRating.toFixed(1)}
                </motion.div>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="font-display font-light text-ink"
                style={{ fontSize: "var(--text-subheadline)" }}
              >
                {chosenMovie.title}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.08 }}
                className="text-ink-soft text-sm mt-2"
              >
                {chosenMovie.release_date?.slice(0, 4)} ·{" "}
                {chosenMovie.original_language?.toUpperCase()}
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                onClick={reset}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="mt-8 btn-premium text-sm tracking-[0.03em] uppercase
                  btn-primary font-display text-white border border-golden/45
                  transition-all duration-300 cursor-pointer"
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
