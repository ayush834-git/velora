"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import CinematicImage from "./CinematicImage";
import { BackendMovie, Movie } from "@/types/movie";
import { getBackdropPath, getMovieRating, getPosterPath } from "@/lib/movie-utils";

interface MovieCardProps {
  movie: Movie | BackendMovie;
  width?: number;
  height?: number;
  className?: string;
  showInfo?: boolean;
  preferBackdrop?: boolean;
  onClick?: () => void;
}

export default function MovieCard({
  movie,
  width = 260,
  height = 390,
  className = "",
  showInfo = true,
  preferBackdrop = false,
  onClick,
}: MovieCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const posterPath = preferBackdrop
    ? getBackdropPath(movie) ?? getPosterPath(movie)
    : getPosterPath(movie);
  const rating = getMovieRating(movie);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateY = Math.max(-6, Math.min(6, x * 10));
    const rotateX = Math.max(-6, Math.min(6, -y * 10));

    cardRef.current.style.transform = `perspective(800px) translateY(-6px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.02)`;
    cardRef.current.style.boxShadow =
      "0 24px 56px rgba(0,0,0,0.16), 0 0 28px rgba(232,168,56,0.14)";

    if (glowRef.current) {
      glowRef.current.style.opacity = "1";
      glowRef.current.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(232,168,56,0.2) 0%, transparent 60%)`;
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)";
    cardRef.current.style.boxShadow = "0 8px 28px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.05)";
    if (glowRef.current) {
      glowRef.current.style.opacity = "0";
    }
  };

  return (
    <motion.div
      ref={cardRef}
      layoutId={`movie-card-${movie.id}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.99 }}
      className={`floating-card rounded-2xl overflow-hidden cursor-pointer relative group transition-shadow duration-300 ${className}`}
      style={{
        width,
        height,
        transformStyle: "preserve-3d",
        boxShadow: "0 8px 28px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.05)",
        transition: "transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s cubic-bezier(.2,.8,.2,1)",
      }}
      data-cursor-hover
    >
      <CinematicImage
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
            <span className="text-xs text-golden-light">★ {rating.toFixed(1)}</span>
            <span className="text-xs text-white/60">
              {movie.release_date?.slice(0, 4)}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
