"use client";

import { useState, useCallback } from "react";
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
import { DEMO_MOVIES } from "@/lib/constants";
import { Movie } from "@/types/movie";

export default function Home() {
  const [chosenMovie, setChosenMovie] = useState<Movie | null>(null);
  const movies = DEMO_MOVIES;

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
      {/* Background layers */}
      <ParallaxBackground />
      <CursorFollower />
      <Navbar />

      {/* Content — sits above parallax bg */}
      <div className="relative z-10">
        <HeroScene movies={movies} />
        <ChaosScene movies={movies} />
        <CuratedScene movies={movies} onMoodSelect={handleMoodSelect} />
        <SpinRitual movies={movies} onResult={handleSpinResult} />
        <ResultScene movie={chosenMovie} />
        <GridScene movies={gridMovies} />
        <FooterScene />
      </div>
    </main>
  );
}

