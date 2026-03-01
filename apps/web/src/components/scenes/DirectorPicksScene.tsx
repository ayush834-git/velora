"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { Movie } from "@/types/movie";
import { getImageUrl } from "@/lib/tmdb";
import { IMAGE_SIZES } from "@/lib/constants";

// TMDB IDs of essential films to prioritise in the carousel
const ESSENTIAL_IDS = [238, 278, 240, 424, 389, 129, 155, 550, 637, 13];

interface Props {
  movies: Movie[];
}

export default function DirectorPicksScene({ movies }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-5%" });

  const essentials = movies.filter((m) => ESSENTIAL_IDS.includes(m.id));
  const topRated = movies.filter(
    (m) => !ESSENTIAL_IDS.includes(m.id) && m.vote_average >= 8.0
  );
  const picks = [...essentials, ...topRated].slice(0, 8);

  if (picks.length === 0) return null;

  return (
    <section ref={ref} className="relative py-16 overflow-hidden bg-cream">
      <div className="px-[5vw] mb-8 flex items-end justify-between">
        <div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="block text-[10px] tracking-[0.42em] uppercase text-golden-warm mb-2"
          >
            Essential Cinema
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.12, duration: 0.5 }}
            className="font-display font-extralight text-ink"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}
          >
            Films that define a genre
          </motion.h2>
        </div>
        <span className="hidden md:block text-[11px] text-ink-muted tracking-wider">
          Drag to explore →
        </span>
      </div>

      <div
        className="flex gap-4 px-[5vw] overflow-x-auto pb-4 scrollbar-none
          cursor-grab active:cursor-grabbing select-none"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {picks.map((movie, i) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{
              delay: i * 0.07,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative flex-shrink-0 rounded-2xl overflow-hidden group"
            style={{
              width: "clamp(140px, 13vw, 190px)",
              aspectRatio: "2/3",
              scrollSnapAlign: "start",
            }}
          >
            {movie.poster_path ? (
              <Image
                src={getImageUrl(movie.poster_path, IMAGE_SIZES.poster.medium)}
                alt={movie.title}
                fill
                sizes="190px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
            ) : (
              <div className="w-full h-full bg-cream-warm" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="text-[9px] tracking-widest uppercase text-golden-warm mb-1.5">
                ★ {movie.vote_average.toFixed(1)}
              </div>
              <div className="font-display text-cream text-sm font-light leading-snug">
                {movie.title}
              </div>
              <div className="text-cream/40 text-[10px] mt-1">
                {movie.release_date?.slice(0, 4)}
              </div>
            </div>
            {ESSENTIAL_IDS.includes(movie.id) && (
              <div
                className="absolute top-3 right-3 px-2 py-0.5 rounded-full
                  bg-golden/90 backdrop-blur-sm text-white text-[8px]
                  tracking-widest uppercase"
              >
                Essential
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
