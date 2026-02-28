"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterPanelProps {
  onFilterChange?: (filters: ActiveFilters) => void;
}

export interface ActiveFilters {
  genres: string[];
  mood: string | null;
  era: string | null;
  language: string | null;
  rating: string | null;
}

const GENRES = ["Action", "Drama", "Comedy", "Sci-Fi", "Horror", "Romance", "Thriller", "Animation"];
const MOODS = ["Mind-Bending", "Comfort", "Dark", "Uplifting", "Epic", "Romantic"];
const ERAS = ["Classic (pre-1980)", "80s & 90s", "2000s", "2010s", "Recent (2020+)"];
const LANGUAGES = ["English", "Korean", "Japanese", "French", "Spanish", "Hindi"];
const RATINGS = ["9+ Masterpiece", "8+ Excellent", "7+ Great", "Any"];

// All filter groups for keyboard navigation
const FILTER_GROUPS = [
  { key: "genres" as const, label: "Genre", items: GENRES, multi: true },
  { key: "mood" as const, label: "Mood", items: MOODS, multi: false },
  { key: "era" as const, label: "Era", items: ERAS, multi: false },
  { key: "language" as const, label: "Language", items: LANGUAGES, multi: false },
  { key: "rating" as const, label: "Rating", items: RATINGS, multi: false },
];

/*
  FilterPanel — Glass UI with keyboard navigation
  ─────────────────────────────────────────────────
  - Glassmorphism backdrop (backdrop-filter: blur)
  - Animated open/close with spring easing
  - Keyboard nav: ArrowDown/ArrowUp between groups, ArrowLeft/ArrowRight between chips
  - Enter/Space to toggle chip, Escape to close panel
  - aria-expanded, role="listbox", role="option" for a11y
  - Active filter count badge
*/

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [focusGroup, setFocusGroup] = useState(0);
  const [focusItem, setFocusItem] = useState(0);

  const [filters, setFilters] = useState<ActiveFilters>({
    genres: [],
    mood: null,
    era: null,
    language: null,
    rating: null,
  });

  // ── Toggle genre (multi-select) ──
  const toggleGenre = useCallback((genre: string) => {
    setFilters((prev) => {
      const newGenres = prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre];
      const newFilters = { ...prev, genres: newGenres };
      onFilterChange?.(newFilters);
      return newFilters;
    });
  }, [onFilterChange]);

  // ── Set single-select filter ──
  const setFilter = useCallback((key: keyof ActiveFilters, value: string) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [key]: prev[key] === value ? null : value,
      } as ActiveFilters;
      onFilterChange?.(newFilters);
      return newFilters;
    });
  }, [onFilterChange]);

  // ── Active filter count ──
  const activeCount =
    filters.genres.length +
    (filters.mood ? 1 : 0) +
    (filters.era ? 1 : 0) +
    (filters.language ? 1 : 0) +
    (filters.rating ? 1 : 0);

  // ── Close on outside click ──
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // ── Keyboard navigation ──
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      const group = FILTER_GROUPS[focusGroup];

      switch (e.key) {
        case "Escape":
          setIsOpen(false);
          triggerRef.current?.focus();
          e.preventDefault();
          break;
        case "ArrowDown":
          setFocusGroup((g) => Math.min(g + 1, FILTER_GROUPS.length - 1));
          setFocusItem(0);
          e.preventDefault();
          break;
        case "ArrowUp":
          setFocusGroup((g) => Math.max(g - 1, 0));
          setFocusItem(0);
          e.preventDefault();
          break;
        case "ArrowRight":
          setFocusItem((i) => Math.min(i + 1, group.items.length - 1));
          e.preventDefault();
          break;
        case "ArrowLeft":
          setFocusItem((i) => Math.max(i - 1, 0));
          e.preventDefault();
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (group.multi) {
            toggleGenre(group.items[focusItem]);
          } else {
            setFilter(group.key, group.items[focusItem]);
          }
          break;
      }
    },
    [isOpen, focusGroup, focusItem, toggleGenre, setFilter]
  );

  // ── Check if a chip is active ──
  const isActive = (groupKey: string, item: string): boolean => {
    if (groupKey === "genres") return filters.genres.includes(item);
    return filters[groupKey as keyof ActiveFilters] === item;
  };

  return (
    <div className="relative z-30" onKeyDown={handleKeyDown}>
      {/* Toggle button */}
      <motion.button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="rounded-full px-5 py-2.5 flex items-center gap-2 cursor-pointer
          hover:shadow-lg transition-shadow duration-300"
        style={{
          background: "var(--glass-tint)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          boxShadow: "var(--shadow-glass), inset 0 1px 0 rgba(255,255,255,0.5)",
        }}
        data-cursor-hover
      >
        <svg
          className="w-4 h-4 text-ink-soft"
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
        <span className="text-sm font-medium text-ink-light tracking-wide">
          Filters
        </span>
        {activeCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="w-5 h-5 rounded-full bg-golden text-white text-xs flex items-center justify-center font-bold"
          >
            {activeCount}
          </motion.span>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
            className="absolute top-14 right-0 w-[380px] max-h-[70vh] overflow-y-auto rounded-2xl p-6 shadow-xl"
            style={{
              background: "var(--glass-tint)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.35)",
              boxShadow:
                "0 25px 60px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
            role="dialog"
            aria-label="Filter options"
          >
            {FILTER_GROUPS.map((group, gi) => (
              <div key={group.key} className={gi < FILTER_GROUPS.length - 1 ? "mb-5" : ""}>
                <h4 className="font-display text-xs tracking-[0.2em] uppercase text-ink-muted mb-3">
                  {group.label}
                </h4>
                <div className="flex flex-wrap gap-2" role="listbox" aria-label={group.label}>
                  {group.items.map((item, ii) => {
                    const active = isActive(group.key, item);
                    const focused = gi === focusGroup && ii === focusItem;

                    return (
                      <button
                        key={item}
                        onClick={() =>
                          group.multi
                            ? toggleGenre(item)
                            : setFilter(group.key, item)
                        }
                        role="option"
                        aria-selected={active}
                        tabIndex={focused ? 0 : -1}
                        className={`filter-chip px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer
                          ${
                            active
                              ? "active"
                              : "bg-white/50 border-ink/10 text-ink-light hover:bg-white/80"
                          }
                          ${focused ? "ring-2 ring-golden/50 ring-offset-1" : ""}
                        `}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
