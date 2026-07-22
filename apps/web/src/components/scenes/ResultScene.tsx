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
    <section ref={sectionRef} id="movie-banner" className="scene relative py-28 md:py-36 flex items-center overflow-hidden">
      <div id="result" className="absolute top-0 left-0 h-px w-px" />

      {/* Cinematic Backdrop Image & Overlay */}
      {backdropSrc && (
        <motion.div
          className="absolute inset-0 z-0 origin-center"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={isInView && movie ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.04 }}
          transition={{
            opacity: { duration: 0.7, ease: "easeOut" },
            scale: { duration: 1.4, delay: 0.2, ease: "easeOut" },
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
            className="object-cover blur-[6px] saturate-[1.2] brightness-[0.38]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0915] via-[#0A0915]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0915]/80 via-transparent to-transparent" />
          <div className="absolute inset-0 z-0 velora-grain-local" />
        </motion.div>
      )}

      {/* Main Content Card */}
      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-20"
        animate={{ opacity: isTransitioning ? 0.45 : 1 }}
        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[340px_1fr] gap-10 md:gap-14 lg:gap-16 items-center">
          {/* Film Poster Card */}
          <motion.div
            initial={{ opacity: 0, x: -30, rotateY: -6 }}
            animate={isInView && movie ? { opacity: 1, x: 0, rotateY: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: 1000 }}
            className="flex justify-center md:justify-start"
          >
            <motion.div
              whileHover={{ rotateY: 4, scale: 1.02 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative w-60 h-[22.5rem] md:w-72 md:h-[27rem] lg:w-80 lg:h-[30rem] rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(245,240,232,0.1)]"
            >
              {posterSrc ? (
                <Image
                  src={posterSrc}
                  alt={movie?.title ?? "Poster"}
                  fill
                  priority
                  quality={95}
                  sizes="(max-width:1200px) 33vw, 340px"
                  placeholder={posterBlur ? "blur" : "empty"}
                  blurDataURL={posterBlur}
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-cream-warm/30" />
              )}

              <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#F5F0E8]/25 to-transparent" />

              {/* Rating Badge */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-3.5 right-3.5 h-12 w-12 rounded-full bg-[#e8a838] border border-[#F5F0E8]/30 text-[#1a1829] flex items-center justify-center text-sm font-semibold shadow-xl"
              >
                {(movie?.vote_average ?? 0).toFixed(1)}
              </motion.div>

              {isTransitioning && <div className="absolute inset-0 shimmer opacity-80" />}
            </motion.div>
          </motion.div>

          {/* Film Details */}
          <div className="space-y-6 text-center md:text-left">
            {/* Header Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView && movie ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e8a838]/15 border border-[#e8a838]/30 text-[#e8a838] text-[11px] font-display uppercase tracking-[0.25em]"
            >
              <span>✦ Chosen Recommendation</span>
            </motion.div>

            {/* Title */}
            <h2
              className="text-[#F5F0E8] relative overflow-hidden flex flex-wrap justify-center md:justify-start"
              style={{
                fontFamily: "var(--font-accent), serif",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: 1.08,
                fontSize: "clamp(2.25rem, 4.5vw, 4rem)",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={isInView && movie ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {movie?.title ?? "Loading Film"}
              </motion.div>
            </h2>

            {/* Metadata Line */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={isInView && movie ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="text-[#F5F0E8]/70 uppercase text-xs tracking-[0.14em] font-display flex items-center justify-center md:justify-start gap-2.5"
            >
              <span>{movie?.release_date?.slice(0, 4) ?? "----"}</span>
              <span className="text-[#F5F0E8]/30">•</span>
              <span>★ {(movie?.vote_average ?? 0).toFixed(1)}</span>
              <span className="text-[#F5F0E8]/30">•</span>
              <span>{movie?.original_language?.toUpperCase() ?? "--"}</span>
            </motion.div>

            {/* Overview */}
            <div className="text-[#F5F0E8]/85 leading-[1.8] max-w-[560px] mx-auto md:mx-0 font-body text-[15px]">
              {(movie?.overview ?? "Preparing your next cinematic pick...").split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={isInView && movie ? { opacity: 1 } : {}}
                  transition={{ duration: 0.35, delay: 0.7 + i * 0.015 }}
                  style={{ display: "inline-block" }}
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </div>

            {/* AI Rationale Quote */}
            {aiReason && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={isInView && movie ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="max-w-[560px] mx-auto md:mx-0 mt-4 pl-5 border-l-2 border-[#e8a838] relative"
              >
                <p className="text-[#F5F0E8]/90 font-accent italic text-[1.05rem] leading-relaxed tracking-wide">
                  &ldquo;{aiReasonChars.map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : {}}
                      transition={{ duration: 0.08, delay: 0.9 + i * 0.012 }}
                    >
                      {char}
                    </motion.span>
                  ))}&rdquo;
                </p>
              </motion.div>
            )}

            {/* Actions & Watch Providers */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isInView && movie ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="pt-2"
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
                    className="!border !border-[#F5F0E8]/30 !text-[#F5F0E8] hover:!border-[#e8a838]/60 hover:!bg-[#F5F0E8]/10"
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
                    className="inline-flex items-center gap-1.5 h-11 px-6 rounded-full bg-transparent border border-[#F5F0E8]/20 text-[#F5F0E8]/75 text-xs tracking-[0.05em] uppercase font-display hover:bg-[#F5F0E8]/10 hover:text-[#F5F0E8] transition-all duration-300"
                  >
                    View on TMDB
                  </a>
                )}
              </div>

              {/* Streaming Providers */}
              {watchProviders.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
                  <span className="text-[#F5F0E8]/50 text-xs uppercase tracking-[0.14em] font-display font-medium">
                    Available on
                  </span>
                  {watchProviders.map((provider, i) =>
                    provider.logo_path ? (
                      <motion.div
                        key={provider.provider_id}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={isInView && movie ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.3, delay: 1.2 + i * 0.08 }}
                        className="h-8 w-8 rounded-lg overflow-hidden bg-[#F5F0E8]/10 ring-1 ring-[#F5F0E8]/20 hover:ring-[#e8a838]/60 transition-all duration-200 grayscale hover:grayscale-0 shadow-sm"
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
                      <span key={provider.provider_id} className="text-[#F5F0E8]/60 text-xs px-2.5 py-1 bg-[#F5F0E8]/8 rounded-md font-display">
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
    </section>
  );
}
