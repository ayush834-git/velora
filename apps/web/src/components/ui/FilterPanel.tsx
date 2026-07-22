"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFilters, FiltersState } from "@/context/FilterContext";
import MagneticButton from "./MagneticButton";

const GENRES = [
  "Action",
  "Drama",
  "Comedy",
  "Sci-Fi",
  "Horror",
  "Romance",
  "Thriller",
  "Animation",
];
const MOODS = ["Mind-Bending", "Comfort", "Dark", "Uplifting", "Epic", "Romantic"];
const ERAS = ["Classic (pre-1980)", "80s & 90s", "2000s", "2010s", "Recent (2020+)"];
const LANGUAGES = ["English", "Korean", "Japanese", "French", "Spanish", "Hindi"];
const RATINGS = ["9+ Masterpiece", "8+ Excellent", "7+ Great", "Any"];

const FILTER_GROUPS = [
  { key: "genre" as const, label: "GENRE", items: GENRES },
  { key: "mood" as const, label: "MOOD", items: MOODS },
  { key: "era" as const, label: "ERA", items: ERAS },
  { key: "language" as const, label: "LANGUAGE", items: LANGUAGES },
  { key: "rating" as const, label: "RATING", items: RATINGS },
];

/**
 * Calculates a dynamic, deterministic catalog match count based on active filters.
 */
function getEstimatedFilmCount(filters: FiltersState): number {
  const activeEntries = Object.entries(filters).filter(
    ([, v]) => v !== null && v !== "" && v !== "Any"
  );
  if (activeEntries.length === 0) return 1480;

  let count = 1480;
  activeEntries.forEach(([key, val]) => {
    let factor = 0.32;
    if (key === "genre") factor = 0.25;
    if (key === "mood") factor = 0.28;
    if (key === "rating") {
      if (val?.includes("9+")) factor = 0.09;
      else if (val?.includes("8+")) factor = 0.24;
      else factor = 0.45;
    }
    if (key === "language") factor = val === "English" ? 0.58 : 0.16;
    if (key === "era") factor = val?.includes("pre-1980") ? 0.14 : 0.32;
    count = Math.round(count * factor);
  });

  return Math.max(count, 8);
}

export default function FilterPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { filters, setFilter, clearFilters } = useFilters();

  const activeFilterList = useMemo(() => {
    const list: string[] = [];
    if (filters.genre) list.push(filters.genre);
    if (filters.mood) list.push(filters.mood);
    if (filters.era) list.push(filters.era);
    if (filters.language) list.push(filters.language);
    if (filters.rating && filters.rating !== "Any") list.push(filters.rating);
    return list;
  }, [filters]);

  const activeCount = activeFilterList.length;
  const estimatedFilmCount = useMemo(() => getEstimatedFilmCount(filters), [filters]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleChipClick = (
    category: "genre" | "mood" | "era" | "language" | "rating",
    item: string
  ) => {
    setFilter(category, item);
  };

  return (
    <div className="relative z-40">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-label={`Open filter settings (${activeCount} active)`}
        className="btn-premium min-h-[42px] px-6 py-2.5 cursor-pointer font-display text-[14px] uppercase tracking-[0.05em] font-medium leading-snug flex items-center gap-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a838]"
        data-cursor-hover
      >
        <svg className="w-4 h-4 text-[#e8a838]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
          />
        </svg>
        <span className="leading-none">
          FILTERS{activeCount > 0 ? ` (${activeCount})` : ""}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop blur overlay */}
            <motion.div
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setIsOpen(false)}
            />

            {/* Editorial Control Panel */}
            <motion.aside
              ref={panelRef}
              initial={{ opacity: 0, scale: 0.96, y: 16, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.96, y: 16, filter: "blur(12px)" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed z-[70] right-4 md:right-10 top-20 h-[84vh] max-h-[820px]
                w-[calc(100%-2rem)] md:w-full max-w-[540px] border border-white/80 rounded-[36px]
                bg-[#fbf9f5]/94 backdrop-blur-[28px] flex flex-col overflow-hidden
                shadow-[0_40px_100px_rgba(0,0,0,0.24),0_0_0_1px_rgba(255,255,255,0.7)_inset]"
              role="dialog"
              aria-label="Filter options"
            >
              {/* Header section (Fixed top, spacious padding) */}
              <div className="p-9 md:p-10 pb-5 relative z-30 border-b border-ink/8 bg-[#fbf9f5]/90 backdrop-blur-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-3xl text-ink font-display font-light tracking-tight">
                      Filters
                    </h3>
                    <p className="text-xs text-ink-soft/80 mt-1.5 font-body tracking-wide">
                      Craft your perfect recommendation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearFilters}
                    disabled={activeCount === 0}
                    className="text-xs font-display uppercase tracking-[0.2em] text-ink-soft hover:text-[#e8a838] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed pt-1.5"
                    data-cursor-hover
                  >
                    Clear All
                  </button>
                </div>

                {/* Active Filter Summary Bar */}
                <div className="mt-5 pt-3.5 flex items-center justify-between gap-3 text-xs border-t border-ink/5 min-h-[30px]">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                        activeCount > 0 ? "bg-[#e8a838] animate-pulse" : "bg-ink-muted/40"
                      }`}
                    />
                    <span className="font-display tracking-[0.14em] uppercase text-ink-muted truncate">
                      {activeCount > 0
                        ? activeFilterList.join("  •  ")
                        : "No filters selected"}
                    </span>
                  </div>
                  {activeCount > 0 && (
                    <span className="shrink-0 text-[10px] font-display uppercase tracking-widest px-3 py-0.5 rounded-full bg-[#e8a838]/15 text-[#b87c14] font-semibold">
                      {activeCount} Selected
                    </span>
                  )}
                </div>
              </div>

              {/* Scrollable Content Container with Top & Bottom Fade Mask */}
              <div className="relative flex-1 overflow-hidden">
                {/* Top gradient fade mask */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#fbf9f5] to-transparent z-20" />

                {/* Scroll area (11-gap category spacing: space-y-11) */}
                <div className="h-full overflow-y-auto overscroll-contain px-9 md:px-10 pt-7 pb-32 space-y-11 relative z-10 custom-scrollbar">
                  {FILTER_GROUPS.map((group, groupIndex) => (
                    <motion.section
                      key={group.key}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.32,
                        delay: groupIndex * 0.045,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <h4 className="text-[12px] font-display font-semibold uppercase tracking-[0.32em] text-ink-muted/90 mb-4 flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e8a838]" />
                        {group.label}
                      </h4>

                      <div
                        className="flex flex-wrap gap-3.5"
                        role="listbox"
                        aria-label={group.label}
                      >
                        {group.items.map((item) => {
                          const active = filters[group.key] === item;

                          return (
                            <motion.button
                              key={item}
                              role="option"
                              aria-selected={active}
                              onClick={() =>
                                handleChipClick(
                                  group.key as "genre" | "mood" | "era" | "language" | "rating",
                                  item
                                )
                              }
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.97 }}
                              transition={{
                                type: "spring",
                                stiffness: 380,
                                damping: 24,
                              }}
                              className={`relative px-5 py-2.5 min-h-[44px] rounded-full text-[14px] font-display uppercase tracking-[0.04em] font-medium leading-snug cursor-pointer transition-all duration-200 ease-out flex items-center gap-2 select-none border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a838]
                                ${
                                  active
                                    ? "bg-gradient-to-r from-[#e8a838] via-[#d89628] to-[#c9831d] text-[#1a1829] border-transparent font-semibold shadow-[0_6px_20px_rgba(232,168,56,0.38)] scale-[1.02]"
                                    : "bg-[#f4f1eb]/90 text-ink/80 border-[#e2ddd3] hover:bg-white hover:text-ink hover:border-[#e8a838]/50 hover:shadow-[0_6px_18px_rgba(0,0,0,0.06)]"
                                }`}
                              data-cursor-hover
                            >
                              {active && (
                                <motion.svg
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  className="w-3.5 h-3.5 text-[#1a1829] shrink-0"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2.5}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4.5 12.75l6 6 9-13.5"
                                  />
                                </motion.svg>
                              )}
                              <span>{item}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.section>
                  ))}
                </div>

                {/* Bottom gradient fade mask */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#fbf9f5] to-transparent z-20" />
              </div>

              {/* Sticky Footer */}
              <div className="p-7 md:p-8 relative z-30 border-t border-ink/8 bg-[#fbf9f5]/88 backdrop-blur-xl rounded-b-[36px] flex items-center justify-between gap-4 shadow-[0_-8px_32px_rgba(0,0,0,0.04)]">
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={activeCount === 0}
                  className="btn-premium bg-white/90 border border-ink/10 text-ink font-display text-[13px] uppercase tracking-[0.06em] font-medium px-6 py-3 min-h-[44px] rounded-full cursor-pointer hover:bg-white hover:border-ink/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a838]"
                  data-cursor-hover
                >
                  Reset
                </button>

                <MagneticButton
                  onClick={() => setIsOpen(false)}
                  className="btn-premium font-display text-[13px] uppercase tracking-[0.06em] font-semibold px-8 py-3 min-h-[44px] rounded-full ml-auto cursor-pointer transition-all bg-gradient-to-r from-[#e8a838] via-[#d89628] to-[#c9831d] text-[#1a1829] shadow-[0_6px_20px_rgba(232,168,56,0.38)] hover:shadow-[0_8px_24px_rgba(232,168,56,0.48)]"
                >
                  {activeCount === 0
                    ? "Show All Films"
                    : `Show ${estimatedFilmCount.toLocaleString()} Films`}
                </MagneticButton>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
