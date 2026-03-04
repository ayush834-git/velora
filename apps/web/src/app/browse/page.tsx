"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import FilmCard from "@/components/FilmCard";
import MagneticButton from "@/components/ui/MagneticButton";

type TmdbMovie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  original_language: string;
};

const GENRE_ROWS = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 16, name: "Animation" },
  { id: 99, name: "Documentary" },
  { id: 14, name: "Fantasy" },
  { id: 80, name: "Crime" },
  { id: 10751, name: "Family" },
];

function SkeletonCard() {
  return (
    <div
      className="flex-shrink-0 rounded-2xl bg-gradient-to-br from-cream-warm/80 to-cream overflow-hidden relative"
      style={{ width: 220, height: 330 }}
    >
      <div className="absolute inset-0 shimmer" />
    </div>
  );
}

function ScrollButton({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.94 }}
      className="w-10 h-10 rounded-full bg-[#F5F0E8]/70 backdrop-blur-md border border-[#F5F0E8]/50 flex items-center justify-center text-ink-soft hover:text-golden shadow-[0_4px_16px_rgba(13,13,26,0.08)] transition-all duration-200"
      aria-label={`Scroll ${direction}`}
      data-cursor="EXPLORE"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {direction === "left" ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        )}
      </svg>
    </motion.button>
  );
}

function GenreRow({ genre }: { genre: (typeof GENRE_ROWS)[number] }) {
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const rowRef = useRef<HTMLElement>(null);
  const isInView = useInView(rowRef, { once: true, margin: "200px" });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInView) return;

    const fetchGenre = async () => {
      try {
        const startPage = Math.floor(Math.random() * 3) + 1;
        const [res1, res2] = await Promise.all([
          fetch(`/api/tmdb?action=discover&genres=${genre.id}&page=${startPage}`),
          fetch(`/api/tmdb?action=discover&genres=${genre.id}&page=${startPage + 1}`),
        ]);

        const [data1, data2] = await Promise.all([
          res1.ok ? res1.json() : { results: [] },
          res2.ok ? res2.json() : { results: [] },
        ]);

        const all = [
          ...((data1.results ?? []) as TmdbMovie[]),
          ...((data2.results ?? []) as TmdbMovie[]),
        ];

        const seen = new Set<number>();
        const deduped = all.filter((movie) => {
          if (!movie.poster_path || seen.has(movie.id)) return false;
          seen.add(movie.id);
          return true;
        });

        setMovies(deduped);
      } catch {
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenre();
  }, [genre.id, isInView]);

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }, []);

  return (
    <section ref={rowRef} className="mb-14 relative z-10 [transform:translateZ(0)]">
      <div className="flex items-center justify-between px-6 md:px-12 mb-2 relative z-20">
        <div>
          <span className="block text-[10px] uppercase tracking-[0.3em] text-golden-warm/60 font-display mb-2">
            Genre Collection
          </span>
          <h2
            className="font-display font-extralight text-3xl md:text-4xl text-ink"
            style={{ letterSpacing: "-0.03em" }}
          >
            {genre.name}
          </h2>
        </div>
        <div className="flex gap-2">
          <ScrollButton direction="left" onClick={() => scroll("left")} />
          <ScrollButton direction="right" onClick={() => scroll("right")} />
        </div>
      </div>

      <div className="relative group/row">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-cream to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-cream to-transparent z-20 pointer-events-none" />

        <div
          ref={scrollRef}
          className="flex gap-5 md:gap-6 px-6 md:px-12 overflow-x-auto pt-6 pb-10 scroll-smooth relative z-10"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading && Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={`skel-${i}`} />)}

          {!isLoading &&
            movies.map((movie, i) => (
              <motion.a
                key={movie.id}
                href={`https://www.themoviedb.org/movie/${movie.id}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: Math.min(i * 0.03, 0.35), ease: [0.16, 1, 0.3, 1] }}
                className="flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-golden/50 rounded-[12px] block"
              >
                <FilmCard
                  film={{
                    id: movie.id,
                    title: movie.title,
                    year: parseInt(movie.release_date?.slice(0, 4) || "0", 10) || new Date().getFullYear(),
                    rating: movie.vote_average,
                    poster_path: movie.poster_path || "",
                    original_language: movie.original_language || "en",
                  }}
                  style={{ width: 220, height: 330 }}
                />
              </motion.a>
            ))}

          {!isLoading && movies.length === 0 && (
            <div className="w-full text-center py-16 text-ink-soft/60 font-body">
              No films found for this genre.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function BrowseContent() {
  const router = useRouter();
  const params = useSearchParams();
  const mood = params.get("mood");
  const genresParam = params.get("genres");

  const activeGenreIds = genresParam ? genresParam.split(",").map(Number) : null;
  const displayGenres = activeGenreIds
    ? GENRE_ROWS.filter((genre) => activeGenreIds.includes(genre.id))
    : GENRE_ROWS;

  return (
    <main className="min-h-screen bg-cream isolate [transform:translateZ(0)]">
      <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-xl border-b border-ink/5 transform-gpu [backface-visibility:hidden] [transform:translateZ(0)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-sm tracking-[0.4em] uppercase text-ink hover:text-golden transition-colors"
          >
            Back to VELORA
          </Link>

          <h1 className="font-display font-extralight text-lg md:text-xl tracking-tight text-ink" style={{ letterSpacing: "-0.01em" }}>
            {mood ? "Curated Selection" : "Browse Films"}
          </h1>

          <MagneticButton
            onClick={() => router.push("/#spin")}
            className="font-display text-xs tracking-[0.12em] uppercase px-5 py-2.5"
            data-cursor="SPIN"
          >
            Spin Now
          </MagneticButton>
        </div>
      </header>

      <section className="relative py-20 md:py-28 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-display text-[10px] tracking-[0.5em] uppercase text-golden-warm/70 block mb-4">
            {mood ? "Tailored for you" : "Cinema Library"}
          </span>
          <h2
            className="font-display font-extralight text-ink leading-[0.95] capitalize"
            style={{ fontSize: "clamp(3rem, 7vw, 6rem)", letterSpacing: "-0.03em" }}
          >
            {mood ? `${mood.replace("-", " ")} Collection` : "Explore by Genre"}
          </h2>
          <p className="mt-6 text-ink-soft/70 font-body max-w-xl mx-auto leading-relaxed" style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.15rem)" }}>
            {mood
              ? "Discover films that match your exact craving right now. A handpicked selection for your mood."
              : "Dive into curated collections across every genre. Discover your next favorite film from blockbusters to hidden gems."}
          </p>
        </motion.div>
      </section>

      <div className="max-w-[1400px] mx-auto pb-24">
        {displayGenres.map((genre) => (
          <GenreRow key={genre.id} genre={genre} />
        ))}
        {displayGenres.length === 0 && (
          <div className="text-center py-20 text-ink-soft font-body">No genres found for this selection.</div>
        )}
      </div>

      <footer className="border-t border-ink/8 py-10 text-center">
        <p className="text-ink-muted text-xs tracking-[0.12em] uppercase font-display">
          Powered by TMDB - Copyright 2026 VELORA
        </p>
      </footer>
    </main>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-cream" />}>
      <BrowseContent />
    </Suspense>
  );
}
