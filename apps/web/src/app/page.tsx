"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Navbar from "@/components/ui/Navbar";
import ParallaxBackground from "@/components/ui/ParallaxBackground";
import CursorFollower from "@/components/ui/CursorFollower";
import HeroScene from "@/components/scenes/HeroScene";
import ChaosScene from "@/components/scenes/ChaosScene";
import CuratedScene from "@/components/scenes/CuratedScene";
import SpinRitual from "@/components/scenes/SpinRitual";
import ResultScene from "@/components/scenes/ResultScene";
import GridScene from "@/components/scenes/GridScene";
import FooterScene from "@/components/scenes/FooterScene";
import { Movie } from "@/types/movie";
import { getDiscover } from "@/lib/tmdb";
import { MOODS } from "@/lib/constants";
import { useFilters } from "@/context/filterContext";

const GENRE_TO_ID: Record<string, number> = {
  Action: 28,
  Drama: 18,
  Comedy: 35,
  "Sci-Fi": 878,
  Horror: 27,
  Romance: 10749,
  Thriller: 53,
  Animation: 16,
};

const LANGUAGE_TO_CODE: Record<string, string> = {
  English: "en",
  Korean: "ko",
  Japanese: "ja",
  French: "fr",
  Spanish: "es",
  Hindi: "hi",
};

const ERA_RANGES: Record<string, { min: number; max?: number }> = {
  "Classic (pre-1980)": { min: 1900, max: 1979 },
  "80s & 90s": { min: 1980, max: 1999 },
  "2000s": { min: 2000, max: 2009 },
  "2010s": { min: 2010, max: 2019 },
  "Recent (2020+)": { min: 2020 },
};

function uniqueById(movies: Movie[]) {
  const seen = new Set<number>();
  return movies.filter((movie) => {
    if (seen.has(movie.id)) return false;
    seen.add(movie.id);
    return true;
  });
}

function parseRatingThreshold(value: string | null): number | null {
  if (!value || value === "Any") return null;
  const match = value.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function shuffleMovies(items: Movie[]) {
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = clone[i];
    clone[i] = clone[j];
    clone[j] = temp;
  }
  return clone;
}

export default function Home() {
  const { filters } = useFilters();
  const [chosenMovie, setChosenMovie] = useState<Movie | null>(null);
  const [baseMovies, setBaseMovies] = useState<Movie[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [moviesError, setMoviesError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadMovies = async () => {
      setIsLoadingMovies(true);
      setMoviesError(null);

      try {
        const [pageOne, pageTwo] = await Promise.all([getDiscover(undefined, 1), getDiscover(undefined, 2)]);
        if (!active) return;
        const deduped = uniqueById([...pageOne, ...pageTwo]);
        setBaseMovies(deduped);
      } catch (error) {
        console.error("Failed to load discover movies", error);
        if (!active) return;
        setBaseMovies([]);
        setMoviesError("Unable to load discover movies.");
      } finally {
        if (active) setIsLoadingMovies(false);
      }
    };

    loadMovies();

    return () => {
      active = false;
    };
  }, []);

  const filteredMovies = useMemo(() => {
    const selectedGenreIds = filters.genres
      .map((genre) => GENRE_TO_ID[genre])
      .filter((value): value is number => Number.isFinite(value));
    const selectedMoodGenreIds = filters.moods.flatMap((moodLabel) => {
      const mood = MOODS.find((item) => item.label === moodLabel);
      return mood ? mood.genreIds : [];
    });
    const allGenreIds = new Set<number>([...selectedGenreIds, ...selectedMoodGenreIds]);

    const eraRange = filters.era ? ERA_RANGES[filters.era] : undefined;
    const ratingThreshold = parseRatingThreshold(filters.rating);
    const languageCode = filters.language ? LANGUAGE_TO_CODE[filters.language] || null : null;

    return uniqueById(
      baseMovies.filter((movie) => {
        if (allGenreIds.size > 0) {
          const movieGenres = Array.isArray(movie.genre_ids) ? movie.genre_ids : [];
          const hasGenre = movieGenres.some((genreId) => allGenreIds.has(genreId));
          if (!hasGenre) return false;
        }

        if (eraRange) {
          const releaseYear = Number.parseInt(movie.release_date?.slice(0, 4) || "", 10);
          if (!Number.isFinite(releaseYear)) return false;
          if (releaseYear < eraRange.min) return false;
          if (typeof eraRange.max === "number" && releaseYear > eraRange.max) return false;
        }

        if (typeof ratingThreshold === "number") {
          if ((movie.vote_average || 0) < ratingThreshold) return false;
        }

        if (languageCode) {
          if ((movie.original_language || "").toLowerCase() !== languageCode.toLowerCase()) {
            return false;
          }
        }

        return true;
      })
    );
  }, [baseMovies, filters]);

  const exploringMovies = useMemo(() => {
    return shuffleMovies(baseMovies).slice(0, 12);
  }, [baseMovies]);

  const handleSpinResult = useCallback((movie: Movie) => {
    setChosenMovie(movie);
    setTimeout(() => {
      const el = document.getElementById("result");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 2500);
  }, []);

  const handleMoodSelect = useCallback(() => {
    setTimeout(() => {
      const el = document.getElementById("spin");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, []);

  const showNoResults = !isLoadingMovies && !moviesError && filteredMovies.length === 0;
  const discoveryMovies = showNoResults ? [] : filteredMovies;

  return (
    <main className="relative">
      <ParallaxBackground />
      <CursorFollower />
      <Navbar />

      <div className="relative z-10">
        <HeroScene movies={discoveryMovies} />
        <ChaosScene movies={discoveryMovies} />
        <CuratedScene movies={discoveryMovies} onMoodSelect={handleMoodSelect} />

        {showNoResults && (
          <section className="relative z-10 py-10 text-center">
            <p className="font-display text-ink-soft text-lg">No films available.</p>
          </section>
        )}

        <SpinRitual movies={baseMovies} onResult={handleSpinResult} />
        <ResultScene movie={chosenMovie} />
        <GridScene
          movies={exploringMovies}
          isLoading={isLoadingMovies}
          hasError={Boolean(moviesError)}
        />
        <FooterScene />
      </div>
    </main>
  );
}
