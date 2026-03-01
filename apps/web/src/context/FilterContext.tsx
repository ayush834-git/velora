"use client";

import { createContext, useContext, useMemo, useState } from "react";

export interface FiltersState {
  genres: string[];
  mood: string | null;
  era: string | null;
  language: string | null;
  rating: string | null;
}

interface FilterContextValue extends FiltersState {
  setGenre: (genre: string) => void;
  setMood: (mood: string | null) => void;
  setEra: (era: string | null) => void;
  setLanguage: (language: string | null) => void;
  setRating: (rating: string | null) => void;
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [genres, setGenres] = useState<string[]>([]);
  const [mood, setMood] = useState<string | null>(null);
  const [era, setEra] = useState<string | null>(null);
  const [language, setLanguageState] = useState<string | null>(null);
  const [rating, setRatingState] = useState<string | null>(null);

  const setGenre = (genre: string) => {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((item) => item !== genre) : [...prev, genre]
    );
  };

  const setLanguage = (nextLanguage: string | null) => {
    setLanguageState(nextLanguage);
  };

  const setRating = (nextRating: string | null) => {
    setRatingState(nextRating);
  };

  const value = useMemo<FilterContextValue>(
    () => ({
      genres,
      mood,
      era,
      language,
      rating,
      setGenre,
      setMood,
      setEra,
      setLanguage,
      setRating,
    }),
    [genres, mood, era, language, rating]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilterContext() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilterContext must be used inside FilterProvider.");
  }
  return context;
}
