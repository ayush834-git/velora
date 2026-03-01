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

const DESKTOP_PANEL_MOTION = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 60 },
  transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] as [number, number, number, number] },
};

const MOBILE_PANEL_MOTION = {
  initial: { opacity: 0, y: 80 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 80 },
  transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] as [number, number, number, number] },
};

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [focusGroup, setFocusGroup] = useState(0);
  const [focusItem, setFocusItem] = useState(0);

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const { genres, mood, era, language, rating, setGenre, setMood, setEra, setLanguage, setRating } =
    useFilterContext();

  const activeCount =
    genres.length +
    (mood ? 1 : 0) +
    (era ? 1 : 0) +
    (language ? 1 : 0) +
    (rating ? 1 : 0);

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

  useEffect(() => {
    if (!onFilterChange) return;
    onFilterChange({ genres, mood, era, language, rating });
  }, [onFilterChange, genres, mood, era, language, rating]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(media.matches);
    apply();

    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) return;

      const group = FILTER_GROUPS[focusGroup];
      if (!group) return;

      switch (event.key) {
        case "Escape":
          setIsOpen(false);
          triggerRef.current?.focus();
          event.preventDefault();
          break;
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

  const closeOnDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y > 120 || info.velocity.y > 700) {
      setIsOpen(false);
    }
  };

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
        <span className="text-sm font-medium tracking-wide">Filters</span>
        {activeCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 20 }}
            className="w-5 h-5 rounded-full text-[11px] font-semibold text-white
              inline-flex items-center justify-center
              bg-gradient-to-br from-[#f7c873] to-[#f3a63a]
              shadow-[0_0_18px_rgba(243,166,58,0.45)]"
          >
            {activeCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-transparent z-[65]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {!isMobile ? (
              <motion.aside
                ref={panelRef}
                {...DESKTOP_PANEL_MOTION}
                className="fixed z-[70] right-[40px] top-[100px] w-[calc(100vw-2.5rem)] max-w-[420px]
                  max-h-[calc(100vh-140px)] overflow-y-auto rounded-[28px] p-7
                  bg-[rgba(255,255,255,0.55)] backdrop-blur-[24px]
                  border border-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
                role="dialog"
                aria-label="Filter options"
              >
                <div className="space-y-8">
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
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.97 }}
                              className={`h-9 px-4 rounded-full text-xs font-medium cursor-pointer transition-all duration-300
                                border ${
                                  active
                                    ? "text-white border-transparent bg-gradient-to-br from-[#f7c873] to-[#f3a63a] shadow-[0_0_18px_rgba(243,166,58,0.35)]"
                                    : "text-ink bg-[rgba(255,255,255,0.75)] border-[rgba(20,28,45,0.12)] hover:border-[rgba(243,166,58,0.45)] hover:shadow-[0_0_14px_rgba(243,166,58,0.22)]"
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
              </motion.aside>
            ) : (
              <motion.aside
                ref={panelRef}
                {...MOBILE_PANEL_MOTION}
                drag="y"
                dragConstraints={{ top: 0, bottom: 240 }}
                dragElastic={0.2}
                onDragEnd={closeOnDrag}
                className="fixed z-[70] inset-x-0 bottom-0 h-[80vh] rounded-t-[28px] px-6 pt-3 pb-6
                  bg-[rgba(255,255,255,0.72)] backdrop-blur-[24px]
                  border-t border-white/80 shadow-[0_-20px_60px_rgba(0,0,0,0.10)]"
                role="dialog"
                aria-label="Filter options"
              >
                <div className="mx-auto mb-5 h-1.5 w-14 rounded-full bg-[rgba(20,28,45,0.16)]" />
                <div className="h-[calc(80vh-3rem)] overflow-y-auto pr-1">
                  <div className="space-y-8">
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
                                onClick={() =>
                                  group.multi ? setGenre(item) : setFilter(group.key, item)
                                }
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                                className={`h-9 px-4 rounded-full text-xs font-medium cursor-pointer transition-all duration-300
                                  border ${
                                    active
                                      ? "text-white border-transparent bg-gradient-to-br from-[#f7c873] to-[#f3a63a] shadow-[0_0_18px_rgba(243,166,58,0.35)]"
                                      : "text-ink bg-[rgba(255,255,255,0.82)] border-[rgba(20,28,45,0.12)] hover:border-[rgba(243,166,58,0.45)] hover:shadow-[0_0_14px_rgba(243,166,58,0.22)]"
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
                </div>
              </motion.aside>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
