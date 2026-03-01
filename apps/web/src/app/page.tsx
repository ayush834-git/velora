"use client";

import { useState, useCallback, useEffect } from "react";
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
import { fetchDiscoverMovies } from "@/lib/api";
import { normalizeBackendMovie } from "@/lib/movie-utils";

export default function Home() {
  const [chosenMovie, setChosenMovie] = useState<Movie | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [moviesError, setMoviesError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadMovies = async () => {
      setIsLoadingMovies(true);
      setMoviesError(null);

      try {
        const discoverMovies = await fetchDiscoverMovies();
        if (!active) return;

        const normalizedMovies = discoverMovies.map(normalizeBackendMovie);
        setMovies(normalizedMovies);
      } catch (error) {
        console.error("Failed to load discover movies from backend API", error);
        if (!active) return;
        setMovies([]);
        setMoviesError("Unable to load discover movies.");
      } finally {
        if (active) {
          setIsLoadingMovies(false);
        }
      }
    };

    loadMovies();

    return () => {
      active = false;
    };
  }, []);

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

  const gridMovies = chosenMovie
    ? movies.filter((m) => m.id !== chosenMovie.id).slice(0, 12)
    : movies.slice(0, 12);

  return (
    <main className="relative">
      <ParallaxBackground />
      <CursorFollower />
      <Navbar />

      <div className="relative z-10">
        <HeroScene movies={movies} />
        <ChaosScene movies={movies} />
        <CuratedScene movies={movies} onMoodSelect={handleMoodSelect} />
        <SpinRitual movies={movies} onResult={handleSpinResult} />
        <ResultScene movie={chosenMovie} />
        <GridScene
          movies={gridMovies}
          isLoading={isLoadingMovies}
          hasError={Boolean(moviesError)}
        />
        <FooterScene />
      </div>
    </main>
  );
}
