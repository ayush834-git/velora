'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { useWatchlist } from '@/hooks/useWatchlist';

interface Film {
  id: number;
  title: string;
  year: number;
  rating: number;
  poster_path: string;
  original_language: string;
}

export default function FilmCard({ film, onClick, className = '', style }: { film: Film; onClick?: () => void; className?: string; style?: React.CSSProperties }) {
  const [hovered, setHovered] = useState(false);
  const { add, isInList } = useWatchlist();

  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={style || { width: 200, height: 300 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <motion.div
        className="w-full h-full relative rounded-[12px] overflow-hidden cursor-pointer bg-ink/10"
        animate={{
          y: hovered ? -8 : 0,
          boxShadow: hovered
            ? '0 32px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(201,168,76,0.25)'
            : '0 4px 10px rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        data-cursor="EXPLORE"
      >
      {/* Poster */}
      <motion.div
        className="absolute inset-0"
        animate={{ scale: hovered ? 1.06 : 1 }}
        transition={{ duration: 0.5, ease: [0.7, 0, 0.3, 1] }}
      >
        <Image
          src={`https://image.tmdb.org/t/p/w500${film.poster_path}`}
          alt={film.title}
          fill className="object-cover"
        />
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Rating — bottom right */}
      <div className="absolute bottom-3 right-3 bg-[#C9A84C] rounded-full w-9 h-9 flex items-center justify-center">
        <span className="text-[11px] font-bold text-[#1A1A2E]" style={{ fontFamily: 'Bodoni Moda, serif' }}>
          {film.rating.toFixed(1)}
        </span>
      </div>

      {/* Year — bottom left, always */}
      <span className="absolute bottom-3 left-3 font-mono text-[10px] text-white/70 tracking-wider">
        {film.year}
      </span>

      {/* Hover reveal: title + language + watchlist add */}
      <motion.div
        className="absolute inset-0 flex flex-col justify-end p-3"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      >
        <p className="text-white text-[13px] font-medium mb-6 leading-tight">{film.title}</p>
        <span className="absolute top-3 right-3 bg-[#F5F0E8] text-[#1A1A2E] font-mono text-[9px] px-2 py-1 rounded-full uppercase tracking-wider">
          {film.original_language}
        </span>

        {/* Watchlist add button */}
        <motion.button
          className="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white text-lg leading-none transition-colors"
          whileTap={{ scale: 1.4, transition: { duration: 0.15 } }}
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); add(film); }}
          title="Add to watchlist"
        >
          {isInList(film.id) ? '✓' : '+'}
        </motion.button>
      </motion.div>

      {/* FATE GOLD border trace on hover — SVG overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ borderRadius: 12 }}>
        <motion.rect
          x="1" y="1"
          width="calc(100% - 2px)" height="calc(100% - 2px)"
          rx="11" fill="none"
          stroke="#C9A84C" strokeWidth="1.5"
          pathLength={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: hovered ? 1 : 0 }}
          transition={{ duration: 0.5, ease: [0.7, 0, 0.3, 1] }}
        />
      </svg>
      </motion.div>
    </div>
  );
}
