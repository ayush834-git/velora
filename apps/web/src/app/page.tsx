"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import ParallaxBackground from "@/components/ui/ParallaxBackground";
import CursorFollower from "@/components/ui/CursorFollower";
import HeroScene from "@/components/scenes/HeroScene";
import MarqueeScene from "@/components/scenes/MarqueeScene";
import MoodClockScene from "@/components/scenes/MoodClockScene";
import ConstellationScene from "@/components/scenes/ConstellationScene";
import ManifestoScene from "@/components/scenes/ManifestoScene";
import HowItWorksScene from "@/components/scenes/HowItWorksScene";
import CuratedScene from "@/components/scenes/CuratedScene";
import DirectorPicksScene from "@/components/scenes/DirectorPicksScene";
import SpinRitual from "@/components/scenes/SpinRitual";
import ResultScene from "@/components/scenes/ResultScene";
import GridScene from "@/components/scenes/GridScene";
import FooterScene from "@/components/scenes/FooterScene";
import { Movie } from "@/types/movie";
import { getDiscover } from "@/lib/tmdb";
import { LayoutGroup } from "framer-motion";

function uniqueById(movies: Movie[]) {
  const seen = new Set<number>();
  return movies.filter((movie) => {
    if (seen.has(movie.id)) return false;
    seen.add(movie.id);
    return true;
  });
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
  const router = useRouter();
  const [chosenMovie, setChosenMovie] = useState<Movie | null>(null);
  const [isBannerTransitioning, setIsBannerTransitioning] = useState(false);
  const [baseMovies, setBaseMovies] = useState<Movie[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [moviesError, setMoviesError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadMovies = async () => {
      setIsLoadingMovies(true);
      setMoviesError(null);

      try {
        const [pageOne, pageTwo] = await Promise.all([
          getDiscover(undefined, 1),
          getDiscover(undefined, 2),
        ]);

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

  const exploringMovies = useMemo(() => {
    return shuffleMovies(baseMovies).slice(0, 12);
  }, [baseMovies]);

  useEffect(() => {
    if (chosenMovie || baseMovies.length === 0) return;
    setChosenMovie(baseMovies[0]);
  }, [baseMovies, chosenMovie]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#result") return;

    const timer = window.setTimeout(() => {
      document.getElementById("movie-banner")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);

    return () => window.clearTimeout(timer);
  }, [chosenMovie]);

  const handleSpinResult = useCallback(
    (movie: Movie) => {
      setIsBannerTransitioning(true);
      router.push("/#result", { scroll: false });

      window.setTimeout(() => {
        setChosenMovie(movie);
        setIsBannerTransitioning(false);
        document.getElementById("movie-banner")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    },
    [router]
  );

  const handleMoodSelect = useCallback(() => {
    setTimeout(() => {
      const el = document.getElementById("spin");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, []);

  const handleSpinAgain = useCallback(() => {
    const el = document.getElementById("spin");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <main className="app-shell relative">
      <ParallaxBackground movies={baseMovies} />
      <CursorFollower />
      <Navbar />

      <LayoutGroup id="velora-shared-layout">
        <div className="relative z-10">
          <HeroScene movies={baseMovies} />
          <MarqueeScene />
          <MoodClockScene />
          <ConstellationScene />
          <ManifestoScene />
          <HowItWorksScene />
          <CuratedScene movies={baseMovies} onMoodSelect={handleMoodSelect} />
          <DirectorPicksScene movies={baseMovies} />
          <SpinRitual movies={baseMovies} onResult={handleSpinResult} />
          <ResultScene movie={chosenMovie} isTransitioning={isBannerTransitioning} onSpinAgain={handleSpinAgain} />
          <GridScene
            movies={exploringMovies}
            isLoading={isLoadingMovies}
            hasError={Boolean(moviesError)}
          />
          <FooterScene />
        </div>
      </LayoutGroup>
    </main>
  );
}

