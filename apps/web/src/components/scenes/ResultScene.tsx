"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Movie } from "@/types/movie";
import { getImageUrl } from "@/lib/tmdb";
import { IMAGE_SIZES } from "@/lib/constants";
import GlowButton from "@/components/ui/GlowButton";
import { getBackdropPath, getPosterPath } from "@/lib/movie-utils";
import { useFilters } from "@/context/FilterContext";

interface ResultSceneProps {
  movie: Movie | null;
  isTransitioning?: boolean;
}

type WatchProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
};

export default function ResultScene({ movie, isTransitioning = false }: ResultSceneProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });
  const [dominantColor, setDominantColor] = useState("rgba(232, 168, 56, 0.15)");
  const [aiReason, setAiReason] = useState("");
  const [watchProviders, setWatchProviders] = useState<WatchProvider[]>([]);
  const { filters } = useFilters();
  const directBackdropPath = movie ? getBackdropPath(movie) : null;
  const backdropSourcePath = movie ? directBackdropPath ?? getPosterPath(movie) : null;
  const isPosterBackdropFallback = Boolean(backdropSourcePath && !directBackdropPath);
  const directBackdropUrl =
    movie?.backdrop && movie.backdrop.startsWith("http") ? movie.backdrop : null;
  const backdropSrc = backdropSourcePath
    ? getImageUrl(backdropSourcePath, IMAGE_SIZES.backdrop.large)
    : directBackdropUrl;
  const backdropBlur = backdropSourcePath ? getImageUrl(backdropSourcePath, "w92") : undefined;
  const posterPath = movie ? getPosterPath(movie) : null;
  const posterSrc = posterPath ? getImageUrl(posterPath, IMAGE_SIZES.poster.large) : null;
  const posterBlur = posterPath ? getImageUrl(posterPath, "w92") : undefined;

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
      } catch {
        // ignore CORS extraction issues
      }
    };
  }, [movie]);

  useEffect(() => {
    if (!movie?.id) return;

    let active = true;
    const year = movie.release_date?.slice(0, 4) ?? "";

    const loadMeta = async () => {
      try {
        const [reasonResponse, providersResponse] = await Promise.all([
          fetch("/api/film-reason", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: movie.title,
              year,
              filters,
            }),
            cache: "no-store",
          }),
          fetch(`/api/watch-providers?id=${movie.id}&region=US`, {
            method: "GET",
            cache: "no-store",
          }),
        ]);

        if (!active) return;

        const reasonJson = reasonResponse.ok
          ? ((await reasonResponse.json()) as { reason?: string })
          : { reason: "" };
        const providersJson = providersResponse.ok
          ? ((await providersResponse.json()) as { providers?: WatchProvider[] })
          : { providers: [] };

        setAiReason(reasonJson.reason?.trim() ?? "");
        setWatchProviders(Array.isArray(providersJson.providers) ? providersJson.providers : []);
      } catch {
        if (!active) return;
        setAiReason("");
        setWatchProviders([]);
      }
    };

    loadMeta();

    return () => {
      active = false;
    };
  }, [
    filters,
    movie?.id,
    movie?.release_date,
    movie?.title,
  ]);

  return (
    <section
      ref={sectionRef}
      id="movie-banner"
      className="scene relative min-h-[90vh] flex items-center overflow-hidden"
    >
      <div id="result" className="absolute top-0 left-0 h-px w-px" />

      <div
        className="absolute inset-0 z-0 transition-colors duration-700"
        style={{ background: `linear-gradient(180deg, ${dominantColor}, var(--background))` }}
      />

      {backdropSrc && (
        <div
          className="absolute inset-0 z-0"
          style={{ transform: "translateY(calc(var(--scroll) * -0.2px)) translateZ(0)" }}
        >
          <Image
            src={backdropSrc}
            alt=""
            fill
            priority
            quality={95}
            sizes="100vw"
            placeholder={backdropBlur ? "blur" : "empty"}
            blurDataURL={backdropBlur}
            className={`object-cover scale-[1.05] blur-[18px] brightness-[0.75] ${
              isPosterBackdropFallback ? "contrast-[0.96]" : ""
            }`}
          />
        </div>
      )}

      <div className="absolute inset-0 z-[1] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.65))]" />

      <motion.div
        className="relative z-10 w-full max-w-[1200px] mx-auto px-[5vw] py-16 md:py-24"
        animate={{ opacity: isTransitioning ? 0.45 : 1 }}
        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-10 md:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex justify-center md:justify-start"
          >
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative w-64 h-96 md:w-80 md:h-[30rem] rounded-2xl overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.28)]"
            >
              {posterSrc ? (
                <Image
                  src={posterSrc}
                  alt={movie?.title ?? "Poster"}
                  fill
                  priority
                  quality={95}
                  sizes="(max-width:1200px) 33vw, 320px"
                  placeholder={posterBlur ? "blur" : "empty"}
                  blurDataURL={posterBlur}
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-cream-warm/50" />
              )}

              <motion.div
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.32, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] }}
                className="absolute -top-3 -right-3 h-14 w-14 rounded-full bg-golden text-white
                  flex items-center justify-center text-sm font-semibold shadow-lg ring-4 ring-cream"
              >
                {(movie?.vote_average ?? 0).toFixed(1)}
              </motion.div>

              {isTransitioning && <div className="absolute inset-0 shimmer opacity-80" />}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.06, ease: [0.2, 0.8, 0.2, 1] }}
            className="space-y-5 md:space-y-6 text-center md:text-left"
          >
            <h2
              className="text-cream"
              style={{
                fontFamily: "var(--font-accent), serif",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                fontSize: "var(--text-headline)",
              }}
            >
              {movie?.title ?? "Loading Film"}
            </h2>

            <div
              className="text-cream/85 uppercase"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                letterSpacing: "0.08em",
                fontSize: "0.8rem",
              }}
            >
              <span>{movie?.release_date?.slice(0, 4) ?? "----"}</span>
              <span className="mx-2">·</span>
              <span>★ {(movie?.vote_average ?? 0).toFixed(1)}</span>
              <span className="mx-2">·</span>
              <span>{movie?.original_language?.toUpperCase() ?? "--"}</span>
            </div>

            <p
              className="text-cream/90 leading-[1.75] max-w-[540px] mx-auto md:mx-0"
              style={{ fontSize: "max(1rem, var(--text-body))" }}
            >
              {movie?.overview ?? "Preparing your next cinematic pick..."}
            </p>

            {aiReason && (
              <p className="text-cream/70 italic text-sm max-w-[560px] mx-auto mt-1 leading-relaxed">
                {aiReason}
              </p>
            )}

            {watchProviders.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <span className="text-cream/60 text-xs uppercase tracking-[0.08em]">
                  Available on
                </span>
                {watchProviders.map((provider) =>
                  provider.logo_path ? (
                    <div
                      key={provider.provider_id}
                      className="h-7 w-7 rounded-md overflow-hidden bg-white/20 ring-1 ring-white/40"
                    >
                      <Image
                        src={getImageUrl(provider.logo_path, "w92")}
                        alt={provider.provider_name}
                        width={28}
                        height={28}
                        className="h-7 w-7 object-cover"
                      />
                    </div>
                  ) : (
                    <span
                      key={provider.provider_id}
                      className="text-cream/75 text-xs"
                    >
                      {provider.provider_name}
                    </span>
                  )
                )}
              </div>
            )}

            <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
              <GlowButton variant="primary">Spin Again</GlowButton>
              <GlowButton variant="secondary">Share -&gt;</GlowButton>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-[11] pointer-events-none"
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-x-[20%] top-[45%] h-3 rounded-full shimmer" />
        </motion.div>
      )}
    </section>
  );
}
