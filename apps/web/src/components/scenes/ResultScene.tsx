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
import { useTrailer } from "@/context/TrailerContext";

interface ResultSceneProps {
  movie: Movie | null;
  isTransitioning?: boolean;
  onSpinAgain?: () => void;
}

type WatchProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
};

type TmdbVideo = {
  key?: string;
  site?: string;
  type?: string;
  official?: boolean;
};

export default function ResultScene({ movie, isTransitioning = false, onSpinAgain }: ResultSceneProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });
  const [aiReason, setAiReason] = useState("");
  const [watchProviders, setWatchProviders] = useState<WatchProvider[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const { filters } = useFilters();
  const { openTrailer } = useTrailer();

  const directBackdropPath = movie ? getBackdropPath(movie) : null;
  const backdropSourcePath = movie ? directBackdropPath ?? getPosterPath(movie) : null;
  const directBackdropUrl = movie?.backdrop && movie.backdrop.startsWith("http") ? movie.backdrop : null;
  const backdropSrc = backdropSourcePath
    ? getImageUrl(backdropSourcePath, IMAGE_SIZES.backdrop.large)
    : directBackdropUrl;
  const backdropBlur = backdropSourcePath ? getImageUrl(backdropSourcePath, "w92") : undefined;

  const posterPath = movie ? getPosterPath(movie) : null;
  const posterSrc = posterPath ? getImageUrl(posterPath, IMAGE_SIZES.poster.large) : null;
  const posterBlur = posterPath ? getImageUrl(posterPath, "w92") : undefined;
  const aiReasonChars = aiReason.split("");

  useEffect(() => {
    if (!movie?.id) return;

    let active = true;
    const year = movie.release_date?.slice(0, 4) ?? "";

    const loadMeta = async () => {
      try {
        const [reasonResponse, providersResponse, videosResponse] = await Promise.all([
          fetch("/api/film-reason", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: movie.title, year, filters }),
            cache: "no-store",
          }),
          fetch(`/api/watch-providers?id=${movie.id}&region=US`, { method: "GET", cache: "no-store" }),
          fetch(`/api/tmdb?action=videos&id=${movie.id}`, { method: "GET", cache: "no-store" }),
        ]);

        if (!active) return;

        const reasonJson = reasonResponse.ok ? await reasonResponse.json() : { reason: "" };
        const providersJson = providersResponse.ok ? await providersResponse.json() : { providers: [] };

        setAiReason(reasonJson.reason?.trim() ?? "");
        setWatchProviders(Array.isArray(providersJson.providers) ? providersJson.providers : []);

        if (!videosResponse.ok) {
          setTrailerKey(null);
          return;
        }

        const videosJson = await videosResponse.json();
        const videos: TmdbVideo[] = Array.isArray(videosJson.results) ? videosJson.results : [];
        const trailer =
          videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ??
          videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
          videos.find((v) => v.site === "YouTube" && v.type === "Teaser") ??
          videos.find((v) => v.site === "YouTube");

        setTrailerKey(trailer?.key ?? null);
      } catch {
        if (!active) return;
        setAiReason("");
        setWatchProviders([]);
        setTrailerKey(null);
      }
    };

    loadMeta();
    return () => {
      active = false;
    };
  }, [filters, movie?.id, movie?.release_date, movie?.title]);

  return (
    <section ref={sectionRef} id="movie-banner" className="scene relative min-h-[90vh] flex items-center overflow-hidden">
      <div id="result" className="absolute top-0 left-0 h-px w-px" />

      {backdropSrc && (
        <motion.div
          className="absolute inset-0 z-0 origin-center"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={isInView && movie ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
          transition={{
            opacity: { duration: 0.6, ease: "easeOut" },
            scale: { duration: 1.5, delay: 0.3, ease: "easeOut" },
          }}
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
            className="object-cover blur-[6px] saturate-[1.2] brightness-[0.45]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />
          <div className="absolute inset-0 z-0 velora-grain-local" />
        </motion.div>
      )}

      <motion.div
        className="relative z-10 w-full max-w-[1200px] mx-auto px-[5vw] py-16 md:py-24"
        animate={{ opacity: isTransitioning ? 0.45 : 1 }}
        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-10 md:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40, rotateY: -8 }}
            animate={isInView && movie ? { opacity: 1, x: 0, rotateY: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.2, 1, 0.3, 1] }}
            style={{ perspective: 1000 }}
            className="flex justify-center md:justify-start pt-8 md:pt-0"
          >
            <motion.div
              whileHover={{ rotateY: 5, scale: 1.02 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative w-64 h-96 md:w-80 md:h-[30rem] rounded-xl overflow-hidden shadow-[0_40px_80px_rgba(13,13,26,0.6),0_0_0_1px_rgba(245,240,232,0.08)]"
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

              <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#F5F0E8]/30 to-transparent" />

              <motion.div
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.32, delay: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                className="absolute -top-3 -right-3 h-14 w-14 rounded-full bg-golden border border-[#F5F0E8]/20 text-[#F5F0E8] flex items-center justify-center text-sm font-semibold shadow-xl"
              >
                {(movie?.vote_average ?? 0).toFixed(1)}
              </motion.div>

              {isTransitioning && <div className="absolute inset-0 shimmer opacity-80" />}
            </motion.div>
          </motion.div>

          <div className="space-y-6 md:space-y-8 text-center md:text-left pt-2 md:pt-6">
            <h2
              className="text-cream relative overflow-hidden flex flex-wrap justify-center md:justify-start"
              style={{
                fontFamily: "var(--font-accent), serif",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                fontSize: "var(--text-headline)",
              }}
            >
              <motion.div
                initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0, y: 10 }}
                animate={isInView && movie ? { clipPath: "inset(0 0 0% 0)", opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {movie?.title ?? "Loading Film"}
              </motion.div>
            </h2>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView && movie ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.9 }}
              className="text-cream/80 uppercase"
              style={{ fontFamily: "var(--font-body), sans-serif", letterSpacing: "0.08em", fontSize: "0.85rem" }}
            >
              <span>{movie?.release_date?.slice(0, 4) ?? "----"}</span>
              <span className="mx-2">|</span>
              <span>* {(movie?.vote_average ?? 0).toFixed(1)}</span>
              <span className="mx-2">|</span>
              <span>{movie?.original_language?.toUpperCase() ?? "--"}</span>
            </motion.div>

            <div className="text-cream/90 leading-[1.75] max-w-[540px] mx-auto md:mx-0" style={{ fontSize: "max(1rem, var(--text-body))" }}>
              {(movie?.overview ?? "Preparing your next cinematic pick...").split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={isInView && movie ? { opacity: 1 } : {}}
                  transition={{ duration: 0.4, delay: 1.1 + i * 0.02 }}
                  style={{ display: "inline-block" }}
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </div>

            {aiReason && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView && movie ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 1.8 }}
                className="max-w-[560px] mx-auto md:mx-0 mt-4 pl-5 border-l-2 border-golden relative"
              >
                <span className="absolute -top-3 -left-4 text-golden font-accent text-5xl opacity-40">&ldquo;</span>
                <p className="text-cream/85 font-accent italic text-[1.1rem] leading-relaxed tracking-wide">
                  {aiReasonChars.map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : {}}
                      transition={{ duration: 0.1, delay: 1.8 + i * 0.015 }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView && movie ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 1.4 }}
            >
              <div className="flex items-center flex-wrap justify-center md:justify-start gap-4">
                <GlowButton
                  variant="primary"
                  onClick={() => {
                    if (onSpinAgain) onSpinAgain();
                    else document.getElementById("spin")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Spin Again
                </GlowButton>

                {trailerKey && (
                  <GlowButton
                    variant="ghost"
                    onClick={() => openTrailer(trailerKey)}
                    className="!border !border-cream/30 !text-cream hover:!text-[#F5F0E8] hover:!border-cream/50 hover:!bg-cream/10"
                    data-cursor="PLAY"
                  >
                    Play Trailer
                  </GlowButton>
                )}

                {movie && (
                  <a
                    href={`https://www.themoviedb.org/movie/${movie.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-transparent border border-cream/20 text-cream/70 text-xs tracking-[0.03em] uppercase font-display hover:bg-cream/10 hover:text-cream transition-all duration-300"
                  >
                    View on TMDB
                  </a>
                )}
              </div>

              {watchProviders.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
                  <span className="text-cream/50 text-xs uppercase tracking-[0.1em] font-display">
                    Available on
                  </span>
                  {watchProviders.map((provider, i) =>
                    provider.logo_path ? (
                      <motion.div
                        key={provider.provider_id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={isInView && movie ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.3, delay: 1.4 + i * 0.1 }}
                        className="h-8 w-8 rounded-md overflow-hidden bg-[#F5F0E8]/10 ring-1 ring-[#F5F0E8]/20 hover:ring-[#F5F0E8]/60 transition-colors grayscale hover:grayscale-0"
                        title={provider.provider_name}
                      >
                        <Image
                          src={getImageUrl(provider.logo_path, "w92")}
                          alt={provider.provider_name}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      </motion.div>
                    ) : (
                      <span key={provider.provider_id} className="text-cream/60 text-xs px-2 py-1 bg-[#F5F0E8]/5 rounded">
                        {provider.provider_name}
                      </span>
                    )
                  )}
                </div>
              )}
            </motion.div>
          </div>
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
          <div className="absolute inset-0 bg-[#0D0D1A]/10" />
          <div className="absolute inset-x-[20%] top-[45%] h-3 rounded-full shimmer" />
        </motion.div>
      )}
    </section>
  );
}
