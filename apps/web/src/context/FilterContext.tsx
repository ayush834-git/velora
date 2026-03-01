"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export interface FiltersState {
  genre: string | null;
  mood: string | null;
  era: string | null;
  language: string | null;
  rating: string | null;
}

type FilterCategory = keyof FiltersState;

interface FilterContextValue {
  filters: FiltersState;
  setFilter: (category: FilterCategory, value: string | null) => void;
  clearFilters: () => void;
}

const DEFAULT_FILTERS: FiltersState = {
  genre: null,
  mood: null,
  era: null,
  language: null,
  rating: null,
};

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFiltersState] = useState<FiltersState>(DEFAULT_FILTERS);

  const setFilter = useCallback((category: FilterCategory, value: string | null) => {
    setFiltersState((prev) => ({
      ...prev,
      [category]: prev[category] === value ? null : value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const value = useMemo(
    () => ({
      filters,
      setFilter,
      clearFilters,
    }),
    [clearFilters, filters, setFilter]
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
