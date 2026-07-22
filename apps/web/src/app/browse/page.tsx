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
      className="flex-shrink-0 rounded-2xl bg-gradient-to-br from-cream-warm/80 to-cream overflow-hidden relative shadow-sm"
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
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className="w-9 h-9 rounded-full bg-[#F5F0E8] border border-ink/10 flex items-center justify-center text-ink-soft hover:text-golden-warm shadow-sm hover:border-golden-warm/40 transition-all duration-200 cursor-pointer"
      aria-label={`Scroll ${direction}`}
      data-cursor-hover
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
    <section ref={rowRef} className="mb-16 md:mb-20 relative z-10">
      {/* Sticky Section Header */}
      <div className="sticky top-[61px] z-30 bg-cream/95 backdrop-blur-md border-b border-ink/8 py-3.5 px-6 md:px-12 lg:px-16 flex items-center justify-between mb-8 shadow-[0_4px_12px_rgba(0,0,0,0.02)] max-w-7xl mx-auto">
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-golden-warm font-display font-medium">
            Genre Collection
          </span>
          <span className="text-ink/30">•</span>
          <h2
            className="font-display font-extralight text-2xl md:text-3xl text-ink tracking-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            {genre.name}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <ScrollButton direction="left" onClick={() => scroll("left")} />
          <ScrollButton direction="right" onClick={() => scroll("right")} />
        </div>
      </div>

      {/* Carousel Wrapper */}
      <div className="relative group/row">
        {/* Subtle Edge Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-cream via-cream/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-cream via-cream/80 to-transparent z-20 pointer-events-none" />

        <div
          ref={scrollRef}
          className="flex gap-6 px-6 md:px-12 overflow-x-auto pt-2 pb-8 scroll-smooth relative z-10 custom-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading && Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={`skel-${i}`} />)}

          {!isLoading &&
            movies.map((movie, i) => (
              <motion.a
                key={movie.id}
                href={`https://www.themoviedb.org/movie/${movie.id}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
                className="flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-golden/50 rounded-[14px] block"
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
            <div className="w-full text-center py-12 text-ink-soft/60 font-body text-sm">
              No films found in this collection.
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
    <main className="min-h-screen bg-cream isolate flex flex-col justify-between">
      <div>
        {/* Main Sticky Header */}
        <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-xl border-b border-ink/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="font-display text-xs md:text-sm tracking-[0.4em] uppercase text-ink hover:text-golden transition-colors"
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

        {/* Hero Section (Optimized Spacing: reduced by 30%) */}
        <section className="relative py-12 md:py-16 text-center px-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="font-display text-[10px] md:text-xs tracking-[0.45em] uppercase text-golden-warm font-medium block mb-3">
              {mood ? "Tailored for you" : "Cinema Library"}
            </span>
            <h2
              className="font-display font-extralight text-ink leading-[1.02] capitalize tracking-tight"
              style={{ fontSize: "clamp(2.25rem, 5vw, 4.25rem)", letterSpacing: "-0.025em" }}
            >
              {mood ? `${mood.replace("-", " ")} Collection` : "Explore by Genre"}
            </h2>
            <p className="mt-4 text-ink-soft/75 font-body max-w-lg mx-auto leading-relaxed text-balance text-[15px]">
              {mood
                ? "Discover films that match your exact craving right now. A handpicked selection for your mood."
                : "Dive into curated collections across every genre. Discover your next favorite film from timeless masterpieces to hidden gems."}
            </p>
          </motion.div>
        </section>

        {/* Genre Collections */}
        <div className="max-w-[1400px] mx-auto pb-16">
          {displayGenres.map((genre) => (
            <GenreRow key={genre.id} genre={genre} />
          ))}
          {displayGenres.length === 0 && (
            <div className="text-center py-20 text-ink-soft font-body">No genres found for this selection.</div>
          )}
        </div>
      </div>

      {/* Editorial Footer */}
      <footer className="border-t border-ink/8 py-8 text-center bg-cream-warm/20">
        <p className="text-ink-muted text-xs tracking-[0.16em] uppercase font-display">
          Powered by TMDB · VELORA
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
