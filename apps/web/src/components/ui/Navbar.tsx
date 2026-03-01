"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
        {activeFilters.length > 0 && (
          <div className="border-t border-golden/20 bg-golden/10 px-6 md:px-12 py-2.5">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-golden-warm/90">
                Filtering By
              </span>
              {activeFilters.map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 rounded-full bg-golden px-3 py-1 text-xs text-white"
                >
                  {value}
                  <button
                    type="button"
                    onClick={() => setFilter(key, null)}
                    className="cursor-pointer text-white/90 hover:text-white"
                    aria-label={`Clear ${key}`}
                  >
                    x
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={clearFilters}
                className="ml-1 text-[11px] uppercase tracking-[0.16em] text-ink-soft hover:text-ink cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </motion.nav>
    </>
  );
}
