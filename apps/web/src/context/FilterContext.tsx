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
  appliedFilters: FiltersState;
  appliedRevision: number;
  activeCount: number;
  setGenre: (genre: string) => void;
  setMood: (mood: string | null) => void;
  setEra: (era: string | null) => void;
  setLanguage: (language: string | null) => void;
  setRating: (rating: string | null) => void;
  applyFilters: () => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

const EMPTY_FILTERS: FiltersState = {
  genres: [],
  mood: null,
  era: null,
  language: null,
  rating: null,
};

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [draftFilters, setDraftFilters] = useState<FiltersState>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>(EMPTY_FILTERS);
  const [appliedRevision, setAppliedRevision] = useState(0);

  const { genres, mood, era, language, rating } = draftFilters;

  const setGenre = (genre: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((item) => item !== genre)
        : [...prev.genres, genre],
    }));
  };

  const setMood = (nextMood: string | null) => {
    setDraftFilters((prev) => ({ ...prev, mood: nextMood }));
  };

  const setEra = (nextEra: string | null) => {
    setDraftFilters((prev) => ({ ...prev, era: nextEra }));
  };

  const setLanguage = (nextLanguage: string | null) => {
    setDraftFilters((prev) => ({ ...prev, language: nextLanguage }));
  };

  const setRating = (nextRating: string | null) => {
    setDraftFilters((prev) => ({ ...prev, rating: nextRating }));
  };

  const applyFilters = () => {
    setAppliedFilters({
      genres: [...draftFilters.genres],
      mood: draftFilters.mood,
      era: draftFilters.era,
      language: draftFilters.language,
      rating: draftFilters.rating,
    });
    setAppliedRevision((prev) => prev + 1);
  };

  const resetFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setAppliedRevision((prev) => prev + 1);
  };

  const activeCount =
    genres.length +
    (mood ? 1 : 0) +
    (era ? 1 : 0) +
    (language ? 1 : 0) +
    (rating && rating !== "Any" ? 1 : 0);

  const value = useMemo<FilterContextValue>(
    () => ({
      genres,
      mood,
      era,
      language,
      rating,
      appliedFilters,
      appliedRevision,
      activeCount,
      setGenre,
      setMood,
      setEra,
      setLanguage,
      setRating,
      applyFilters,
      resetFilters,
    }),
    [
      genres,
      mood,
      era,
      language,
      rating,
      appliedFilters,
      appliedRevision,
      activeCount,
    ]
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
