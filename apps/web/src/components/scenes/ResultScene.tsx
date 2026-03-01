"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Movie } from "@/types/movie";
import { getImageUrl } from "@/lib/tmdb";
import { IMAGE_SIZES } from "@/lib/constants";
import GlowButton from "@/components/ui/GlowButton";
import { getBackdropPath, getPosterPath } from "@/lib/movie-utils";

interface ResultSceneProps {
  movie: Movie | null;
}

export default function ResultScene({ movie }: ResultSceneProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });
  const [dominantColor, setDominantColor] = useState("rgba(232, 168, 56, 0.15)");
  const directBackdropPath = movie ? getBackdropPath(movie) : null;
  const backdropSourcePath = movie ? directBackdropPath ?? getPosterPath(movie) : null;
  const isPosterBackdropFallback = Boolean(backdropSourcePath && !directBackdropPath);
  const backdropSrc = backdropSourcePath
    ? getImageUrl(backdropSourcePath, IMAGE_SIZES.backdrop.large)
    : null;
  const backdropBlur = backdropSourcePath ? getImageUrl(backdropSourcePath, "w92") : undefined;
  const posterPath = movie ? getPosterPath(movie) : null;
  const posterSrc = posterPath ? getImageUrl(posterPath, IMAGE_SIZES.poster.large) : null;
  const posterBlur = posterPath ? getImageUrl(posterPath, "w92") : undefined;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

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

        const root = document.documentElement;
        root.style.setProperty("--theme-accent", `rgb(${r}, ${g}, ${b})`);
        root.style.setProperty("--theme-accent-weak", `rgba(${r}, ${g}, ${b}, 0.15)`);
        root.style.setProperty(
          "--glass-tint",
          `rgba(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)}, 0.55)`
        );
        root.style.setProperty(
          "--rim-color",
          `rgba(${Math.min(r + 80, 255)}, ${Math.min(g + 80, 255)}, ${Math.min(b + 80, 255)}, 0.25)`
        );
      } catch {
        // CORS fail silently
      }
    };
  }, [movie]);

  if (!movie) {
    return (
      <section className="relative h-0 overflow-hidden" id="movie-banner" aria-hidden="true">
        <div id="result" />
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="scene relative min-h-screen overflow-hidden"
      id="movie-banner"
    >
      <div id="result" className="absolute top-0 left-0 h-px w-px" />

      <div
        className="absolute inset-0 transition-colors duration-1000 z-0"
        style={{ background: `linear-gradient(180deg, ${dominantColor}, var(--background))` }}
      />

      {backdropSrc && (
        <motion.div
          className="absolute inset-0 z-0 opacity-20"
          style={{ y: bgY, transform: "translateZ(0)" }}
        >
          <Image
            src={backdropSrc}
            alt=""
            fill
            sizes="100vw"
            quality={90}
            priority
            placeholder={backdropBlur ? "blur" : "empty"}
            blurDataURL={backdropBlur}
            className={`object-cover ${isPosterBackdropFallback ? "scale-110 blur-sm" : ""}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/60 to-cream/30" />
          {isPosterBackdropFallback && (
            <div className="absolute inset-0 bg-gradient-to-r from-cream/45 via-cream/25 to-cream/45" />
          )}
        </motion.div>
      )}

      <div className="relative z-[2] min-h-screen flex items-center py-24 px-6">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-10 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center md:items-end"
          >
            <div className="relative">
              <div className="relative w-64 md:w-80 h-96 md:h-[28rem] rounded-2xl overflow-hidden shadow-2xl">
                {posterSrc && (
                  <Image
                    src={posterSrc}
                    alt={movie.title}
                    fill
                    sizes="(max-width:1200px) 33vw, 320px"
                    quality={90}
                    priority
                    placeholder={posterBlur ? "blur" : "empty"}
                    blurDataURL={posterBlur}
                    className="object-cover"
                  />
                )}
              </div>
              <div
                className="absolute -top-3 -right-3 w-14 h-14 rounded-full bg-golden text-white
                flex items-center justify-center text-sm font-bold shadow-lg
                ring-4 ring-cream"
              >
                {movie.vote_average.toFixed(1)}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {movie.tagline && <p className="font-body italic text-golden-warm text-base">&ldquo;{movie.tagline}&rdquo;</p>}

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
              <span className="uppercase tracking-wider text-xs">{movie.original_language}</span>
            </div>

            <p
              className="text-ink-soft/80 leading-relaxed max-w-[900px] mx-auto md:mx-0 text-center md:text-left"
              style={{ fontSize: "var(--text-body)" }}
            >
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
