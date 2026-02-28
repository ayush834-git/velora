/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Movie } from "@/types/movie";
import { getImageUrl } from "@/lib/tmdb";
import { IMAGE_SIZES } from "@/lib/constants";
import GlowButton from "@/components/ui/GlowButton";

interface ResultSceneProps {
  movie: Movie | null;
}

export default function ResultScene({ movie }: ResultSceneProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });
  const [dominantColor, setDominantColor] = useState("rgba(232, 168, 56, 0.15)");

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  // Extract dominant color from poster and inject as CSS variables
  useEffect(() => {
    if (!movie?.poster_path) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = getImageUrl(movie.poster_path, IMAGE_SIZES.poster.small);
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        setDominantColor(`rgba(${r}, ${g}, ${b}, 0.12)`);

        // Inject dynamic theme CSS variables on :root
        const root = document.documentElement;
        root.style.setProperty("--theme-accent", `rgb(${r}, ${g}, ${b})`);
        root.style.setProperty(
          "--theme-accent-weak",
          `rgba(${r}, ${g}, ${b}, 0.15)`
        );
        root.style.setProperty(
          "--glass-tint",
          `rgba(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(
            b + 40,
            255
          )}, 0.55)`
        );
        root.style.setProperty(
          "--rim-color",
          `rgba(${Math.min(r + 80, 255)}, ${Math.min(g + 80, 255)}, ${Math.min(
            b + 80,
            255
          )}, 0.25)`
        );
      } catch {
        // CORS fail silently
      }
    };
  }, [movie]);

  if (!movie) {
    return (
      <section
        ref={sectionRef}
        className="scene relative min-h-[80vh] flex items-center justify-center"
        id="result"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-cream to-cream-warm" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          className="relative z-10 text-center px-6"
        >
          <p className="font-display text-ink-muted text-lg italic">
            Spin the wheel above to reveal your film...
          </p>
        </motion.div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="scene relative min-h-screen overflow-hidden"
      id="result"
    >
      {/* Dynamic color wash background */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{ background: `linear-gradient(180deg, ${dominantColor}, var(--background))` }}
      />

      {/* Backdrop image */}
      {movie.backdrop_path && (
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{ y: bgY }}
        >
          <img
            src={getImageUrl(movie.backdrop_path, IMAGE_SIZES.backdrop.large)}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/60 to-cream/30" />
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center py-24 px-6">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-10 md:gap-16 items-center">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center md:items-end"
          >
            <div className="relative">
              <div className="w-64 md:w-80 h-96 md:h-[28rem] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={getImageUrl(movie.poster_path, IMAGE_SIZES.poster.large)}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              {/* Rating badge */}
              <div className="absolute -top-3 -right-3 w-14 h-14 rounded-full bg-golden text-white
                flex items-center justify-center text-sm font-bold shadow-lg
                ring-4 ring-cream">
                {movie.vote_average.toFixed(1)}
              </div>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {movie.tagline && (
              <p className="font-body italic text-golden-warm text-base">
                &ldquo;{movie.tagline}&rdquo;
              </p>
            )}

            <h2
              className="font-display font-extralight text-ink leading-[1.05]"
              style={{ fontSize: "var(--text-headline)" }}
            >
              {movie.title}
            </h2>

            <div className="flex items-center gap-4 text-sm text-ink-soft">
              <span>{movie.release_date?.slice(0, 4)}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <span className="text-golden">★</span> {movie.vote_average.toFixed(1)}
              </span>
              <span>·</span>
              <span className="uppercase tracking-wider text-xs">
                {movie.original_language}
              </span>
            </div>

            <p className="text-ink-soft/80 leading-relaxed max-w-lg" style={{ fontSize: "var(--text-body)" }}>
              {movie.overview}
            </p>

            <div className="flex items-center gap-4 pt-4">
              <GlowButton variant="primary">Spin Again</GlowButton>
              <GlowButton variant="secondary">Share ↗</GlowButton>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
