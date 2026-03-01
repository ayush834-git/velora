/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Movie } from "@/types/movie";
import { getImageUrl } from "@/lib/tmdb";
import { IMAGE_SIZES, MOODS } from "@/lib/constants";
import AnimatedText from "@/components/ui/AnimatedText";

interface CuratedSceneProps {
  movies: Movie[];
  onMoodSelect?: (moodId: string, genreIds: number[]) => void;
}

export default function CuratedScene({ movies, onMoodSelect }: CuratedSceneProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });

  const moodBackdrops: Record<string, string | null> = {};
  MOODS.forEach((mood, index) => {
    const found = movies.find((m) =>
      m.genre_ids.some((g) => mood.genreIds.includes(g))
    );
    const fallback = movies.length > 0 ? movies[index % movies.length] : null;
    moodBackdrops[mood.id] =
      found?.backdrop_path || fallback?.backdrop_path || null;
  });

  return (
    <section
      ref={sectionRef}
      className="scene relative min-h-screen flex flex-col items-center justify-center py-20 md:py-28"
      id="curated"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream-warm to-cream" />

      {/* Section heading */}
      <div className="relative z-10 text-center mb-14 md:mb-20 px-6">
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-display text-xs tracking-[0.4em] uppercase text-golden-warm/70 mb-4 block"
        >
          Curated Intelligence
        </motion.span>
        <AnimatedText
          text="What story are you craving?"
          className="font-display font-extralight text-ink"
          style={{ fontSize: "var(--text-headline)" }}
          delay={0.3}
          splitBy="words"
          as="h2"
        />
      </div>

      {/* Mood grid */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {MOODS.map((mood, i) => {
          const backdropUrl = moodBackdrops[mood.id]
            ? getImageUrl(moodBackdrops[mood.id], IMAGE_SIZES.backdrop.medium)
            : null;

          return (
            <motion.button
              key={mood.id}
              onClick={() => onMoodSelect?.(mood.id, mood.genreIds)}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={
                isInView
                  ? { opacity: 1, y: 0, scale: 1 }
                  : {}
              }
              transition={{
                duration: 1,
                delay: 0.4 + i * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mood-card relative overflow-hidden rounded-2xl md:rounded-3xl h-44 md:h-56
                cursor-pointer group text-left border border-white/40"
              style={{
                "--mood-glow": `${mood.accentColor}30`,
                background: "rgba(255,252,248,0.6)",
                backdropFilter: "blur(16px)",
              } as React.CSSProperties}
              data-cursor-hover
            >
              {/* Backdrop image */}
              {backdropUrl && (
                <div className="absolute inset-0">
                  <img
                    src={backdropUrl}
                    alt=""
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110
                      transition-all duration-700 ease-out"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/30 to-transparent" />
                </div>
              )}

              {/* Accent corner glow */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 group-hover:opacity-40
                  transition-opacity duration-500 -translate-y-1/2 translate-x-1/2"
                style={{
                  background: `radial-gradient(circle, ${mood.accentColor}, transparent)`,
                }}
              />

              {/* Label */}
              <div className="relative z-10 h-full flex flex-col justify-end p-5 md:p-6">
                <h3
                  className="font-display font-semibold text-xl md:text-2xl mb-1"
                  style={{ color: mood.accentColor }}
                >
                  {mood.label}
                </h3>
                <p className="text-xs md:text-sm text-ink-soft/70">{mood.subtitle}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
