"use client";

import { createContext, useContext, useMemo, useState } from "react";

export interface FiltersState {
  genres: string[];
  moods: string[];
  era: string | null;
  language: string | null;
  rating: string | null;
}

type FiltersUpdater = Partial<FiltersState> | ((prev: FiltersState) => FiltersState);

interface FilterContextValue {
  filters: FiltersState;
  setFilters: (updater: FiltersUpdater) => void;
  clearFilters: () => void;
}

const DEFAULT_FILTERS: FiltersState = {
  genres: [],
  moods: [],
  era: null,
  language: null,
  rating: null,
};

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFiltersState] = useState<FiltersState>(DEFAULT_FILTERS);

  const setFilters = (updater: FiltersUpdater) => {
    if (typeof updater === "function") {
      setFiltersState((prev) => updater(prev));
      return;
    }

    setFiltersState((prev) => ({
      ...prev,
      ...updater,
    }));
  };

  const clearFilters = () => {
    setFiltersState(DEFAULT_FILTERS);
  };

  const value = useMemo(
    () => ({
      filters,
      setFilters,
      clearFilters,
    }),
    [filters]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used inside FilterProvider.");
  }
  return context;
}
