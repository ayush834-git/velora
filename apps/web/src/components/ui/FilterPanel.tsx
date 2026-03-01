"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFilters } from "@/context/FilterContext";

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

export default function FilterPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [rippleChip, setRippleChip] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { filters, setFilter, clearFilters } = useFilters();

  const activeCount = useMemo(() => {
    return (
      (filters.genre ? 1 : 0) +
      (filters.mood ? 1 : 0) +
      (filters.era ? 1 : 0) +
      (filters.language ? 1 : 0) +
      (filters.rating && filters.rating !== "Any" ? 1 : 0)
    );
  }, [filters]);

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
    const rippleId = `${category}:${item}`;
    setRippleChip(rippleId);
    window.setTimeout(() => {
      setRippleChip((prev) => (prev === rippleId ? null : prev));
    }, 320);
    setFilter(category, item);
  };

  return (
    <div className="relative z-40">
      <motion.button
        ref={triggerRef}
        onClick={() => setIsOpen((value) => !value)}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 320, damping: 18 }}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="btn-premium h-10 cursor-pointer
          btn-primary text-white border border-golden/45 transition-shadow duration-300"
        data-cursor-hover
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
          />
        </svg>
        <span className="text-sm tracking-wide">
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="filter-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            />
            <motion.div
              className="fixed inset-0 z-[65] bg-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              onClick={() => setIsOpen(false)}
            />

            <motion.aside
              ref={panelRef}
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed z-[70] right-4 md:right-10 top-20 h-[80vh]
                w-[calc(100%-2rem)] md:w-full max-w-[420px] border border-white/70 rounded-[28px]
                bg-[rgba(255,255,255,0.75)] backdrop-blur-[18px]
                shadow-[0_30px_80px_rgba(0,0,0,0.2)]"
              role="dialog"
              aria-label="Filter options"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/45 to-transparent" />
              <div className="pointer-events-none absolute -left-24 top-12 h-32 w-56 rotate-[14deg] bg-gradient-to-r from-white/55 to-transparent blur-2xl" />
              <div className="h-full overflow-y-auto overscroll-contain px-6 py-6 pb-28">
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className="text-xl text-ink"
                    style={{ fontFamily: "var(--font-accent), serif" }}
                  >
                    Filters
                  </h3>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs uppercase tracking-[0.2em] text-ink-soft hover:text-ink cursor-pointer"
                    data-cursor-hover
                  >
                    Clear
                  </button>
                </div>

                <div className="space-y-8">
                  {FILTER_GROUPS.map((group, groupIndex) => (
                    <motion.section
                      key={group.key}
                      className="space-y-3 mb-6"
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.25,
                        delay: groupIndex * 0.05,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <h4
                        className="text-[12px] uppercase tracking-[0.24em] text-ink-muted mb-4"
                        style={{ fontFamily: "var(--font-accent), serif" }}
                      >
                        {group.label}
                      </h4>
                      <div className="flex flex-wrap gap-x-3 gap-y-3" role="listbox" aria-label={group.label}>
                        {group.items.map((item, itemIndex) => {
                          const active = filters[group.key] === item;
                          const rippleId = `${group.key}:${item}`;

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
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              initial={{ opacity: 0, y: 6 }}
                              animate={
                                active
                                  ? { opacity: 1, y: 0, scale: 1.02, boxShadow: "0 4px 10px rgba(0,0,0,0.06)" }
                                  : { opacity: 1, y: 0, scale: 1, boxShadow: "0 0 0 rgba(0,0,0,0)" }
                              }
                              transition={
                                active
                                  ? {
                                      type: "spring",
                                      stiffness: 300,
                                      damping: 20,
                                      duration: 0.35,
                                      delay: itemIndex * 0.03,
                                    }
                                  : { duration: 0.2, delay: itemIndex * 0.03 }
                              }
                              className={`relative overflow-hidden px-5 py-2.5 min-h-[38px] rounded-full text-sm tracking-wide leading-none font-medium cursor-pointer transition-all duration-200 ease-out flex items-center justify-center
                                border ${
                                  active
                                    ? "text-white border-transparent bg-gradient-to-br from-[#e7b45e] to-[#d89a3f] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_10px_rgba(216,154,63,0.35)]"
                                    : "text-ink bg-[rgba(243,243,245,0.9)] border-neutral-200 hover:border-neutral-300 hover:shadow-[0_6px_15px_rgba(0,0,0,0.08)]"
                                }`}
                              data-cursor-hover
                            >
                              {active && (
                                <span className="absolute inset-[1px] rounded-full bg-white/12 blur-[7px] pointer-events-none" />
                              )}
                              {rippleChip === rippleId && (
                                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <motion.span
                                    initial={{ scale: 0, opacity: 0.35 }}
                                    animate={{ scale: 2.8, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="w-6 h-6 rounded-full bg-white/70"
                                  />
                                </span>
                              )}
                              <span className="relative z-10">{item}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.section>
                  ))}
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 border-t border-white/55 bg-white/70 backdrop-blur-xl rounded-b-[28px]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="btn-premium bg-white/80 border border-black/5 text-ink text-xs uppercase cursor-pointer hover:bg-white"
                    data-cursor-hover
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="btn-premium btn-primary border border-golden/45 text-white text-xs uppercase ml-auto cursor-pointer"
                    data-cursor-hover
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
