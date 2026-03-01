"use client";

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
  const posterPath = preferBackdrop
    ? getBackdropPath(movie) ?? getPosterPath(movie)
    : getPosterPath(movie);
  const rating = getMovieRating(movie);

  return (
    <motion.div
      layoutId={`movie-card-${movie.id}`}
      onClick={onClick}
      whileHover={{
        y: -6,
        scale: 1.03,
        rotateY: 2,
        boxShadow: "0 24px 56px rgba(0,0,0,0.16), 0 0 28px rgba(232,168,56,0.14)",
      }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      className={`floating-card relative group cursor-pointer overflow-hidden rounded-2xl ${className}`}
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

      <div className="absolute inset-0 z-20 rounded-2xl bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {showInfo && (
        <div className="absolute bottom-0 left-0 right-0 z-30 translate-y-4 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="truncate font-display text-sm font-semibold text-white">{movie.title}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-golden-light">* {rating.toFixed(1)}</span>
            <span className="text-xs text-white/60">{movie.release_date?.slice(0, 4)}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
