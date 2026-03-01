"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import FilterPanel from "./FilterPanel";
import { useFilters } from "@/context/FilterContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { filters, setFilter, clearFilters } = useFilters();
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const activeFilters = useMemo(
    () =>
      Object.entries(filters).filter(
        ([, value]) => Boolean(value) && value !== "Any"
      ) as Array<[keyof typeof filters, string]>,
    [filters]
  );

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting);
      },
      {
        threshold: 0.98,
        rootMargin: "-60px 0px 0px 0px",
      }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        className="scroll-progress"
        style={{ scaleX }}
      />

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "glass-warm shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="font-display text-lg md:text-xl tracking-[0.3em] uppercase text-ink hover:text-golden-warm transition-colors cursor-pointer"
            data-cursor-hover
          >
            VELORA
          </button>

          {/* Navigation */}
          <div className="flex items-center gap-5 md:gap-8">
            <button
              onClick={() => scrollToSection("curated")}
              className="hidden md:block text-sm tracking-widest uppercase text-ink-soft hover:text-ink transition-colors cursor-pointer"
              data-cursor-hover
            >
              Discover
            </button>
            <button
              onClick={() => scrollToSection("spin")}
              className="hidden md:block text-sm tracking-widest uppercase text-ink-soft hover:text-ink transition-colors cursor-pointer"
              data-cursor-hover
            >
              Spin
            </button>

            <FilterPanel />

            <motion.button
              onClick={() => scrollToSection("spin")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className={`glow-button btn-premium btn-primary text-sm uppercase font-medium text-white border border-golden/45
                ${activeFilters.length > 0 ? "ring-2 ring-golden/35 shadow-[0_0_24px_rgba(216,154,63,0.35)]" : ""}
                transition-all duration-300 cursor-pointer
              `}
              data-cursor-hover
            >
              Spin Now
            </motion.button>
          </div>
        </div>
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div
              key="filter-bar"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden border-t border-golden/20 bg-golden/[0.07]"
            >
              <div className="flex items-center gap-3 flex-wrap px-6 md:px-12 py-2 min-h-[2.5rem] max-w-7xl mx-auto">
                <span className="text-[10px] tracking-[0.3em] uppercase text-ink-muted shrink-0">
                  Filtering by
                </span>
                {activeFilters.map(([key, value]) => (
                  <motion.button
                    key={key}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 22 }}
                    onClick={() => setFilter(key, null)}
                    className="flex items-center gap-1.5 h-7 px-3 rounded-full
                      bg-golden text-white text-[11px] tracking-wide
                      hover:bg-golden-warm transition-colors cursor-pointer shrink-0"
                  >
                    {value}
                    <span className="opacity-60 text-xs leading-none ml-0.5">×</span>
                  </motion.button>
                ))}
                <button
                  onClick={clearFilters}
                  className="text-[10px] tracking-widest uppercase text-ink-muted
                    hover:text-ink transition-colors cursor-pointer ml-auto"
                >
                  Clear all
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
