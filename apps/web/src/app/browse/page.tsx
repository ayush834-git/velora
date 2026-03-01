"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { getImageUrl } from "@/lib/tmdb";
import { IMAGE_SIZES } from "@/lib/constants";
import { useSearchParams } from "next/navigation";

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
  { id: 28, name: "Action", emoji: "🔥" },
  { id: 35, name: "Comedy", emoji: "😂" },
  { id: 18, name: "Drama", emoji: "🎭" },
  { id: 27, name: "Horror", emoji: "👻" },
  { id: 10749, name: "Romance", emoji: "💖" },
  { id: 878, name: "Sci-Fi", emoji: "🚀" },
  { id: 53, name: "Thriller", emoji: "🔪" },
  { id: 16, name: "Animation", emoji: "✨" },
  { id: 99, name: "Documentary", emoji: "📽" },
  { id: 14, name: "Fantasy", emoji: "🧙" },
  { id: 80, name: "Crime", emoji: "🕵️" },
  { id: 10751, name: "Family", emoji: "👨‍👩‍👧‍👦" },
];

function GenreRow({ genre }: { genre: (typeof GENRE_ROWS)[number] }) {
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const rowRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(rowRef, { once: true, margin: "200px" });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInView) return;

    const fetchGenre = async () => {
      try {
        const randomPage = Math.floor(Math.random() * 5) + 1;
        const res = await fetch(
          `/api/tmdb?action=discover&genres=${genre.id}&page=${randomPage}`
        );
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        const results = (data.results ?? []) as TmdbMovie[];
        setMovies(results.filter((m: TmdbMovie) => m.poster_path));
      } catch {
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenre();
  }, [isInView, genre.id]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section ref={rowRef} className="mb-10 md:mb-14">
      <div className="flex items-center justify-between px-6 md:px-12 mb-4">
        <h2 className="font-display font-light text-xl md:text-2xl text-ink">
          <span className="mr-2">{genre.emoji}</span>
          {genre.name}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full bg-cream-warm/60 border border-ink/8 flex items-center justify-center
              text-ink-soft hover:bg-golden/20 hover:text-golden transition-all duration-200 cursor-pointer"
            aria-label="Scroll left"
          >
            ←
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full bg-cream-warm/60 border border-ink/8 flex items-center justify-center
              text-ink-soft hover:bg-golden/20 hover:text-golden transition-all duration-200 cursor-pointer"
            aria-label="Scroll right"
          >
            →
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-cream to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-cream to-transparent z-20 pointer-events-none" />

        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-5 px-6 md:px-12 overflow-x-auto py-2 scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`skel-${i}`}
                className="flex-shrink-0 rounded-xl bg-gradient-to-br from-cream-warm/80 to-cream animate-pulse overflow-hidden"
                style={{ width: 180, height: 270 }}
              >
                <div className="absolute inset-0 shimmer" />
              </div>
            ))}

          {!isLoading &&
            movies.map((movie, i) => (
              <motion.a
                key={movie.id}
                href={`https://www.themoviedb.org/movie/${movie.id}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group flex-shrink-0 relative rounded-xl overflow-hidden cursor-pointer"
                style={{ width: 180, height: 270 }}
              >
                <Image
                  src={getImageUrl(movie.poster_path!, IMAGE_SIZES.poster.medium)}
                  alt={movie.title}
                  fill
                  sizes="180px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <h3 className="text-cream text-sm font-medium leading-tight mb-1 line-clamp-2">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-cream/70">
                    <span className="text-golden font-medium">
                      ★ {movie.vote_average?.toFixed(1)}
                    </span>
                    <span>{movie.release_date?.slice(0, 4)}</span>
                    <span className="uppercase">{movie.original_language}</span>
                  </div>
                </div>

                {/* Rating badge */}
                <div className="absolute top-2 right-2 h-7 w-7 rounded-full bg-golden/90 text-white
                  flex items-center justify-center text-[10px] font-bold shadow-md">
                  {movie.vote_average?.toFixed(1)}
                </div>
              </motion.a>
            ))}

          {!isLoading && movies.length === 0 && (
            <div className="w-full text-center py-12 text-ink-soft/60">
              No films found for this genre.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function BrowseContent() {
  const params = useSearchParams();
  const mood = params.get("mood");
  const genresParam = params.get("genres");

  const activeGenreIds = genresParam ? genresParam.split(",").map(Number) : null;
  const displayGenres = activeGenreIds
    ? GENRE_ROWS.filter((g) => activeGenreIds.includes(g.id))
    : GENRE_ROWS;

  return (
    <main className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-xl border-b border-ink/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-sm tracking-[0.4em] uppercase text-ink hover:text-golden transition-colors"
          >
            ← VELORA
          </Link>

          <h1 className="font-display font-light text-lg md:text-xl tracking-wide text-ink">
            {mood ? "Curated Selection" : "Browse Films"}
          </h1>

          <Link
            href="/#spin"
            className="font-display text-xs tracking-[0.12em] uppercase px-5 py-2.5 rounded-full
              bg-golden text-white hover:bg-golden-warm transition-colors"
          >
            Spin Now
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative py-16 md:py-24 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-display text-xs tracking-[0.5em] uppercase text-golden-warm/70 block mb-4">
            {mood ? "Tailored for you" : "Cinema Library"}
          </span>
          <h2
            className="font-display font-extralight text-ink leading-[0.95] tracking-tight capitalize"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
          >
            {mood ? `${mood.replace("-", " ")} Collection` : "Explore by Genre"}
          </h2>
          <p className="mt-4 text-ink-soft/70 font-body max-w-lg mx-auto leading-relaxed">
            {mood 
              ? `Discover films that match your exact craving right now. A handpicked selection for your mood.`
              : `Dive into curated collections across every genre. Discover your next favorite film — from blockbusters to hidden gems.`}
          </p>
        </motion.div>
      </section>

      {/* Genre Rows */}
      <div className="max-w-[1400px] mx-auto pb-20">
        {displayGenres.map((genre) => (
          <GenreRow key={genre.id} genre={genre} />
        ))}
        {displayGenres.length === 0 && (
          <div className="text-center py-20 text-ink-soft">
            No genres found for this selection.
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-ink/8 py-8 text-center">
        <p className="text-ink-muted text-xs tracking-wide">
          Powered by TMDB · © 2026 VELORA
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
