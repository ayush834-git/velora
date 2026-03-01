"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiltersState, useFilterContext } from "@/context/FilterContext";

interface FilterPanelProps {
  onFilterChange?: (filters: ActiveFilters) => void;
}

export type ActiveFilters = FiltersState;

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
  { key: "genres" as const, label: "GENRE", items: GENRES, multi: true },
  { key: "mood" as const, label: "MOOD", items: MOODS, multi: false },
  { key: "era" as const, label: "ERA", items: ERAS, multi: false },
  { key: "language" as const, label: "LANGUAGE", items: LANGUAGES, multi: false },
  { key: "rating" as const, label: "RATING", items: RATINGS, multi: false },
];

const EMPTY_FILTERS: ActiveFilters = {
  genres: [],
  mood: null,
  era: null,
  language: null,
  rating: null,
};

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusGroup, setFocusGroup] = useState(0);
  const [focusItem, setFocusItem] = useState(0);

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const {
    genres,
    mood,
    era,
    language,
    rating,
    activeCount,
    setGenre,
    setMood,
    setEra,
    setLanguage,
    setRating,
    applyFilters,
    resetFilters,
  } = useFilterContext();

  const setFilter = useCallback(
    (key: keyof ActiveFilters, value: string) => {
      switch (key) {
        case "mood":
          setMood(mood === value ? null : value);
          break;
        case "era":
          setEra(era === value ? null : value);
          break;
        case "language":
          setLanguage(language === value ? null : value);
          break;
        case "rating":
          setRating(rating === value ? null : value);
          break;
        default:
          break;
      }
    },
    [mood, era, language, rating, setMood, setEra, setLanguage, setRating]
  );

  const isActive = (groupKey: string, item: string): boolean => {
    if (groupKey === "genres") return genres.includes(item);
    const singleValueMap: Record<string, string | null> = {
      mood,
      era,
      language,
      rating,
    };
    return singleValueMap[groupKey] === item;
  };

  const handleApply = () => {
    const nextFilters = { genres, mood, era, language, rating };
    applyFilters();
    onFilterChange?.(nextFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    resetFilters();
    onFilterChange?.(EMPTY_FILTERS);
  };

  useEffect(() => {
    if (!isOpen) return;

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

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) return;

      const group = FILTER_GROUPS[focusGroup];
      if (!group) return;

      switch (event.key) {
        case "ArrowDown":
          setFocusGroup((value) => Math.min(value + 1, FILTER_GROUPS.length - 1));
          setFocusItem(0);
          event.preventDefault();
          break;
        case "ArrowUp":
          setFocusGroup((value) => Math.max(value - 1, 0));
          setFocusItem(0);
          event.preventDefault();
          break;
        case "ArrowRight":
          setFocusItem((value) => Math.min(value + 1, group.items.length - 1));
          event.preventDefault();
          break;
        case "ArrowLeft":
          setFocusItem((value) => Math.max(value - 1, 0));
          event.preventDefault();
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          if (group.multi) {
            setGenre(group.items[focusItem]);
          } else {
            setFilter(group.key, group.items[focusItem]);
          }
          break;
        default:
          break;
      }
    },
    [isOpen, focusGroup, focusItem, setGenre, setFilter]
  );

  return (
    <div className="relative z-40" onKeyDown={handleKeyDown}>
      <motion.button
        ref={triggerRef}
        onClick={() => setIsOpen((value) => !value)}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="group rounded-full h-10 px-5 inline-flex items-center gap-2.5 cursor-pointer
          bg-[rgba(255,255,255,0.62)] border border-white/70 text-ink
          backdrop-blur-[14px] shadow-[0_10px_26px_rgba(0,0,0,0.06)]
          hover:shadow-[0_14px_34px_rgba(243,166,58,0.20)] transition-shadow duration-300"
        data-cursor-hover
      >
        <svg
          className="w-4 h-4 text-ink-soft group-hover:text-golden-warm transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
          />
        </svg>
        <span className="text-sm font-medium tracking-wide">
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed top-16 md:top-20 left-0 right-0 bottom-0 z-[65] bg-black/10 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              onClick={() => setIsOpen(false)}
            />

            <motion.aside
              ref={panelRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed z-[70] right-0 top-16 md:top-20 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]
                w-full max-w-[420px] border-l border-white/70
                bg-[rgba(255,255,255,0.55)] backdrop-blur-[24px]
                shadow-[-16px_0_36px_rgba(0,0,0,0.08)]"
              role="dialog"
              aria-label="Filter options"
            >
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                  {FILTER_GROUPS.map((group, groupIndex) => (
                    <section key={group.key} className="space-y-3">
                      <h4 className="text-[12px] uppercase tracking-[0.25em] text-ink-muted">
                        {group.label}
                      </h4>
                      <div className="flex flex-wrap gap-2.5" role="listbox" aria-label={group.label}>
                        {group.items.map((item, itemIndex) => {
                          const active = isActive(group.key, item);
                          const focused = groupIndex === focusGroup && itemIndex === focusItem;

                          return (
                            <motion.button
                              key={item}
                              role="option"
                              aria-selected={active}
                              tabIndex={focused ? 0 : -1}
                              onClick={() => (group.multi ? setGenre(item) : setFilter(group.key, item))}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              animate={
                                active
                                  ? { boxShadow: "0 0 18px rgba(243,166,58,0.34)" }
                                  : { boxShadow: "0 0 0 rgba(243,166,58,0)" }
                              }
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className={`h-9 px-4 rounded-full text-xs font-medium cursor-pointer transition-all duration-300
                                border ${
                                  active
                                    ? "text-white border-transparent bg-gradient-to-br from-[#f7c873] to-[#f3a63a]"
                                    : "text-ink bg-[rgba(255,255,255,0.75)] border-[rgba(20,28,45,0.12)] hover:border-[rgba(243,166,58,0.45)]"
                                } ${focused ? "ring-2 ring-[#f3a63a]/50 ring-offset-2 ring-offset-transparent" : ""}`}
                              data-cursor-hover
                            >
                              {item}
                            </motion.button>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>

                <div className="border-t border-white/70 px-6 py-4 bg-[rgba(250,248,245,0.75)] backdrop-blur-[12px]">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="h-10 rounded-full text-sm font-medium border border-ink/15 text-ink
                        bg-white/70 hover:bg-white transition-colors cursor-pointer"
                      data-cursor-hover
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={handleApply}
                      className="h-10 rounded-full text-sm font-medium text-white
                        bg-gradient-to-br from-[#f7c873] to-[#f3a63a]
                        shadow-[0_8px_22px_rgba(243,166,58,0.32)] hover:shadow-[0_12px_30px_rgba(243,166,58,0.42)]
                        transition-shadow cursor-pointer"
                      data-cursor-hover
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
