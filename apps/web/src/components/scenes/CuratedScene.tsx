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

function MoodCard({
  mood,
  index,
  backdropUrl,
  isInView,
  onSelect,
}: {
  mood: typeof MOODS[0];
  index: number;
  backdropUrl: string | null;
  isInView: boolean;
  onSelect: () => void;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = ((y - centerY) / centerY) * -12;
    const tiltY = ((x - centerX) / centerX) * 12;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <motion.button
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 1,
        delay: 0.4 + index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="mood-card relative overflow-hidden rounded-2xl md:rounded-3xl cursor-pointer text-left border border-white/40"
      style={{ height: "clamp(13rem, 22vw, 19rem)",
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transition: isHovered ? "none" : "transform 0.5s ease-out",
        "--mood-glow": `${mood.accentColor}30`,
        transformStyle: "preserve-3d",
      } as React.CSSProperties}
      data-cursor-hover
    >
      {/* Backdrop image */}
      {backdropUrl && (
        <div className="absolute inset-0 bg-ink/5" style={{ transform: "translateZ(-20px)" }}>
          <Image
            src={backdropUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className={`object-cover opacity-100 transition-transform duration-700 ease-out ${isHovered ? "scale-110" : "scale-100"}`}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80" />
        </div>
      )}

      {/* Accent corner glow */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full transition-opacity duration-500 -translate-y-1/2 translate-x-1/2 ${isHovered ? "opacity-40" : "opacity-20"}`}
        style={{
          background: `radial-gradient(circle, ${mood.accentColor}, transparent)`,
        }}
      />

      {/* Label */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8 drop-shadow-md" style={{ transform: "translateZ(30px)" }}>
        <h3
          className="font-display font-semibold text-2xl md:text-3xl mb-2 text-white"
          style={{ color: mood.accentColor, textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
        >
          {mood.label}
        </h3>
        <p className="text-sm md:text-base text-white/90 font-medium" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
          {mood.subtitle}
        </p>
      </div>
    </motion.button>
  );
}

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
      className={`scene relative flex flex-col items-center transition-all duration-500 ${
        isTransitioning ? "blur-sm scale-105 opacity-80" : ""
      }`}
      style={{ paddingTop: "25vh", paddingBottom: "25vh", marginTop: "10vh", marginBottom: "10vh" }}
      id="curated"
    >
      {/* Section heading */}
      <div className="relative z-10 text-center mb-16 md:mb-24 px-6">
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-display text-[13px] tracking-[0.4em] uppercase text-golden-warm/80 mb-5 block"
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
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
        {MOODS.map((mood, i) => {
          const backdropUrl = moodBackdrops[mood.id]
            ? getImageUrl(moodBackdrops[mood.id]!, IMAGE_SIZES.backdrop.medium)
            : null;

          return (
            <MoodCard
              key={mood.id}
              mood={mood}
              index={i}
              backdropUrl={backdropUrl}
              isInView={isInView}
              onSelect={() => {
                if (onMoodSelect) onMoodSelect(mood.id, mood.genreIds);
                setIsTransitioning(true);
                setTimeout(() => {
                  router.push(`/browse?mood=${mood.id}&genres=${mood.genreIds.join(",")}`);
                }, 400);
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
