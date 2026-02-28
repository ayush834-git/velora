"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import CinematicImage from "./CinematicImage";
import { Movie } from "@/types/movie";

interface MovieCardProps {
  movie: Movie;
  width?: number;
  height?: number;
  className?: string;
  showInfo?: boolean;
  onClick?: () => void;
}

export default function MovieCard({
  movie,
  width = 260,
  height = 390,
  className = "",
  showInfo = true,
  onClick,
}: MovieCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Deep perspective tilt — FOLLOW.ART inspired
    cardRef.current.style.transform = `perspective(600px) rotateY(${x * 15}deg) rotateX(${-y * 15}deg) scale(1.04)`;

    // Move glow to cursor
    if (glowRef.current) {
      glowRef.current.style.opacity = "1";
      glowRef.current.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(232,168,56,0.2) 0%, transparent 60%)`;
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)";
    if (glowRef.current) {
      glowRef.current.style.opacity = "0";
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`floating-card rounded-2xl overflow-hidden cursor-pointer relative group ${className}`}
      style={{
        width,
        height,
        boxShadow: "0 10px 40px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.04)",
      }}
      data-cursor-hover
    >
      <CinematicImage
        path={movie.poster_path}
        alt={movie.title}
        type="poster"
        fill
        className="rounded-2xl"
      />

      {/* Cursor-tracking glow */}
      <div
        ref={glowRef}
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none z-10"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-ink/70 via-transparent to-transparent z-20" />

      {/* Info */}
      {showInfo && (
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-30">
          <p className="font-display text-sm font-semibold text-white truncate">
            {movie.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-golden-light">★ {movie.vote_average.toFixed(1)}</span>
            <span className="text-xs text-white/60">
              {movie.release_date?.slice(0, 4)}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
