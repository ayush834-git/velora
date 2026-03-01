"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Movie } from "@/types/movie";
import MovieCard from "@/components/ui/MovieCard";
import AnimatedText from "@/components/ui/AnimatedText";

interface GridSceneProps {
  movies: Movie[];
  isLoading?: boolean;
  hasError?: boolean;
}

export default function GridScene({
  movies,
  isLoading = false,
  hasError = false,
}: GridSceneProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });
  const skeletonCount = 8;

  return (
    <section
      ref={sectionRef}
      className="scene relative py-20 md:py-28"
      id="grid"
    >

      {/* Section heading */}
      <div className="relative z-10 px-6 md:px-12 mb-12 max-w-7xl mx-auto">
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          className="font-display text-xs tracking-[0.4em] uppercase text-golden-warm/60 mb-3 block"
        >
          More Films
        </motion.span>
        <AnimatedText
          text="Continue Exploring"
          className="font-display font-extralight text-ink"
          style={{ fontSize: "var(--text-subheadline)" }}
          splitBy="words"
          as="h2"
        />
      </div>

      {/* Horizontal scroll */}
      <div className="relative z-10">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-cream to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-cream to-transparent z-20 pointer-events-none" />

        <div className="scroll-container flex gap-5 md:gap-7 px-10 md:px-16 overflow-x-auto py-4 snap-x snap-mandatory">
          {isLoading &&
            Array.from({ length: skeletonCount }).map((_, i) => {
              const isLarger = i % 3 === 1;
              return (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="snap-center flex-shrink-0"
                >
                  <div
                    className="relative rounded-2xl bg-gradient-to-br from-cream-warm/80 to-cream animate-pulse overflow-hidden"
                    style={{
                      width: isLarger ? 260 : 220,
                      height: isLarger ? 390 : 330,
                      boxShadow: "0 10px 40px rgba(0,0,0,0.05), 0 2px 10px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div className="absolute inset-0 shimmer" />
                  </div>
                </motion.div>
              );
            })}

          {!isLoading &&
            movies.map((movie, i) => {
              const isLarger = i % 3 === 1;
              return (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="snap-center flex-shrink-0"
                >
                  <MovieCard
                    movie={movie}
                    width={isLarger ? 260 : 220}
                    height={isLarger ? 390 : 330}
                    showInfo={true}
                    preferBackdrop={true}
                  />
                </motion.div>
              );
            })}

          {!isLoading && movies.length === 0 && (
            <div className="w-full text-center py-16 text-ink-soft/70">
              {hasError ? "Could not load films right now." : "No films available."}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
