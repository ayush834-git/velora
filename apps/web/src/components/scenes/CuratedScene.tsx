"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { Movie } from "@/types/movie";
import { getImageUrl } from "@/lib/tmdb";
import { IMAGE_SIZES, MOODS } from "@/lib/constants";
import AnimatedText from "@/components/ui/AnimatedText";

interface CuratedSceneProps {
  movies: Movie[];
  onMoodSelect?: (moodId: string, genreIds: number[]) => void;
}

const MOOD_PREFERRED_IDS: Record<string, number[]> = {
  "mind-bending": [157336, 11324, 49538, 68718],  // Interstellar, Shutter Island, X-Men: FC, Django
  "comfort":      [129, 12477, 10681, 372058],     // Spirited Away, Grave of Fireflies, WALL-E, Your Name
  "dark":         [155, 769, 240, 274],             // Dark Knight, GoodFellas, Godfather II, Chinatown
  "romantic":     [140607, 4935, 11036, 8587],      // DDLJ, Howl's Castle, The Notebook, The Vow
  "epic":         [120, 122, 121, 1726],            // LOTR 1/2/3, Iron Man
  "underrated":   [424, 637, 578, 244786],          // Schindler's, Life is Beautiful, Prisoners, Whiplash
};

export default function CuratedScene({ movies, onMoodSelect }: CuratedSceneProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const usedPaths = new Set<string>();
  const moodBackdrops: Record<string, string | null> = {};
  for (const mood of MOODS) {
    const ids = MOOD_PREFERRED_IDS[mood.id] ?? [];
    let chosen: string | null = null;
    // Try preferred IDs first
    for (const id of ids) {
      const movie = movies.find((m) => m.id === id);
      if (movie?.backdrop_path && !usedPaths.has(movie.backdrop_path)) {
        chosen = movie.backdrop_path;
        usedPaths.add(movie.backdrop_path);
        break;
      }
    }
    // Fallback: any movie matching the mood's genres with an unused backdrop
    if (!chosen) {
      const fallback = movies.find(
        (m) => m.backdrop_path &&
               !usedPaths.has(m.backdrop_path) &&
               m.genre_ids.some((g) => mood.genreIds.includes(g))
      );
      if (fallback?.backdrop_path) {
        chosen = fallback.backdrop_path;
        usedPaths.add(fallback.backdrop_path);
      }
    }
    moodBackdrops[mood.id] = chosen;
  }

  return (
    <section
      ref={sectionRef}
      className={`scene relative flex flex-col items-center py-20 md:py-28 transition-all duration-500 ${
        isTransitioning ? "blur-sm scale-105 opacity-80" : ""
      }`}
      id="curated"
    >
      {/* Background */}

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
            ? getImageUrl(moodBackdrops[mood.id]!, IMAGE_SIZES.backdrop.medium)
            : null;

          return (
            <motion.button
              key={mood.id}
              onClick={() => {
                if (onMoodSelect) onMoodSelect(mood.id, mood.genreIds);
                setIsTransitioning(true);
                setTimeout(() => {
                  router.push(`/browse?mood=${mood.id}&genres=${mood.genreIds.join(",")}`);
                }, 400);
              }}
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
              } as React.CSSProperties}
              data-cursor-hover
            >
              {/* Backdrop image */}
              {backdropUrl && (
                <div className="absolute inset-0 bg-ink/5">
                  <Image
                    src={backdropUrl}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover opacity-100 group-hover:scale-110
                      transition-transform duration-700 ease-out"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  {/* Subtle dark gradient for text legibility, avoiding the washed-out white layer */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70" />
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
              <div className="relative z-10 h-full flex flex-col justify-end p-5 md:p-6 drop-shadow-md">
                <h3
                  className="font-display font-semibold text-xl md:text-2xl mb-1 text-white"
                  style={{ color: mood.accentColor, textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
                >
                  {mood.label}
                </h3>
                <p className="text-xs md:text-sm text-white/90 font-medium" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                  {mood.subtitle}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
