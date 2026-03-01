"use client";

import { useRef, useCallback } from "react";
import { gsap } from "@/lib/gsapConfig";
import BlurUpImage from "./BlurUpImage";
import { BackendMovie, Movie } from "@/types/movie";
import { getMovieRating, getPosterPath } from "@/lib/movie-utils";

interface PosterCardProps {
  movie: Movie | BackendMovie;
  width?: number;
  height?: number;
  className?: string;
  depth?: number;
  showInfo?: boolean;
  onClick?: () => void;
}

export default function PosterCard({
  movie,
  width = 240,
  height = 360,
  className = "",
  depth = 0,
  showInfo = true,
  onClick,
}: PosterCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const posterPath = getPosterPath(movie);
  const rating = getMovieRating(movie);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(cardRef.current, {
      rotateY: nx * 6,
      rotateX: -ny * 6,
      scale: 1.04,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });

    if (glowRef.current) {
      glowRef.current.style.opacity = "1";
      glowRef.current.style.background = `radial-gradient(circle at ${(nx + 0.5) * 100}% ${(ny + 0.5) * 100}%, rgba(232,168,56,0.18) 0%, transparent 60%)`;
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      duration: 0.7,
      ease: "expo.out",
      overwrite: "auto",
    });
    if (glowRef.current) glowRef.current.style.opacity = "0";
  }, []);

  const shadowSpread = 10 + depth * 0.1;
  const shadowBlur = 40 + depth * 0.3;

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`relative rounded-2xl overflow-hidden cursor-pointer group transition-shadow duration-300
        will-change-transform ${className}`}
      style={{
        width,
        height,
        perspective: "600px",
        transformStyle: "preserve-3d",
        transform: `translateZ(${depth}px)`,
        boxShadow: `0 ${shadowSpread}px ${shadowBlur}px rgba(0,0,0,0.08),
                     0 2px 10px rgba(0,0,0,0.05)`,
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      data-cursor-hover
    >
      <BlurUpImage
        path={posterPath}
        alt={movie.title}
        type="poster"
        fill
        className="rounded-2xl"
      />

      <div
        ref={glowRef}
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none z-10"
      />

      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-ink/70 via-transparent to-transparent z-20" />

      {showInfo && (
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-30">
          <p className="font-display text-sm font-semibold text-white truncate">
            {movie.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-golden-light">
              ★ {rating.toFixed(1)}
            </span>
            <span className="text-xs text-white/60">
              {movie.release_date?.slice(0, 4)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
