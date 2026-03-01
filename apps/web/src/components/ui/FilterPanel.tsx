"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFilters } from "@/context/filterContext";

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
  { key: "moods" as const, label: "MOOD", items: MOODS, multi: true },
  { key: "era" as const, label: "ERA", items: ERAS, multi: false },
  { key: "language" as const, label: "LANGUAGE", items: LANGUAGES, multi: false },
  { key: "rating" as const, label: "RATING", items: RATINGS, multi: false },
];

export default function FilterPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { filters, setFilters, clearFilters } = useFilters();

  const activeCount = useMemo(() => {
    return (
      filters.genres.length +
      filters.moods.length +
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

  const toggleMulti = (key: "genres" | "moods", value: string) => {
    setFilters((prev) => {
      const nextValues = prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value];

      return {
        ...prev,
        [key]: nextValues,
      };
    });
  };

  const toggleSingle = (key: "era" | "language" | "rating", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  };

  const isActive = (groupKey: string, value: string) => {
    if (groupKey === "genres") return filters.genres.includes(value);
    if (groupKey === "moods") return filters.moods.includes(value);
    if (groupKey === "era") return filters.era === value;
    if (groupKey === "language") return filters.language === value;
    if (groupKey === "rating") return filters.rating === value;
    return false;
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
        className="rounded-full h-10 px-5 inline-flex items-center gap-2.5 cursor-pointer
          bg-gradient-to-br from-[#f7c873]/95 to-[#f3a63a]/95 text-white
          border border-golden/40 shadow-[0_8px_24px_rgba(243,166,58,0.28)]
          hover:shadow-[0_12px_30px_rgba(243,166,58,0.4)] transition-shadow duration-300"
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
              className="fixed top-16 md:top-20 left-0 right-0 bottom-0 z-[65] bg-black/10 backdrop-blur-[2px]"
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
              className="fixed z-[70] right-0 top-16 md:top-20 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]
                w-full max-w-[420px] border-l border-white/70
                bg-[rgba(255,255,255,0.58)] backdrop-blur-[24px]
                shadow-[-16px_0_36px_rgba(0,0,0,0.08)]"
              role="dialog"
              aria-label="Filter options"
            >
              <div className="h-full overflow-y-auto px-6 py-6">
                <div className="flex items-center justify-between mb-5">
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
                  {FILTER_GROUPS.map((group) => (
                    <section key={group.key} className="space-y-3">
                      <h4
                        className="text-[12px] uppercase tracking-[0.24em] text-ink-muted"
                        style={{ fontFamily: "var(--font-accent), serif" }}
                      >
                        {group.label}
                      </h4>
                      <div className="flex flex-wrap gap-2.5" role="listbox" aria-label={group.label}>
                        {group.items.map((item) => {
                          const active = isActive(group.key, item);

                          return (
                            <motion.button
                              key={item}
                              role="option"
                              aria-selected={active}
                              onClick={() =>
                                group.multi
                                  ? toggleMulti(group.key as "genres" | "moods", item)
                                  : toggleSingle(group.key as "era" | "language" | "rating", item)
                              }
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.97 }}
                              animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                              transition={
                                active
                                  ? { type: "spring", stiffness: 420, damping: 20, duration: 0.35 }
                                  : { duration: 0.2 }
                              }
                              className={`h-9 px-4 rounded-full text-xs font-medium cursor-pointer transition-all duration-300
                                border ${
                                  active
                                    ? "text-white border-transparent bg-gradient-to-br from-[#f7c873] to-[#f3a63a] shadow-[0_0_18px_rgba(243,166,58,0.34)]"
                                    : "text-ink bg-[rgba(255,255,255,0.72)] border-[rgba(20,28,45,0.12)] hover:border-[rgba(243,166,58,0.45)] hover:shadow-[0_0_14px_rgba(243,166,58,0.2)]"
                                }`}
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
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
