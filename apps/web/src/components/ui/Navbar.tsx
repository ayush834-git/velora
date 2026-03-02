"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import FilterPanel from "./FilterPanel";
import { useFilters } from "@/context/FilterContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [logoPeriodBounce, setLogoPeriodBounce] = useState(false);
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
        className={`fixed left-0 right-0 z-50 transition-all duration-700 flex justify-center ${
          scrolled
            ? "top-4 px-4"
            : "top-0 px-0"
        }`}
      >
        <div className={`transition-all duration-400 w-full flex items-center justify-between ${
          scrolled 
            ? 'max-w-4xl mx-auto py-3 px-6 border-b border-[rgba(201,168,76,0.15)] backdrop-blur-[20px] bg-[rgba(245,240,232,0.72)] rounded-full shadow-md' 
            : 'max-w-7xl mx-auto py-5 px-6 md:px-12 bg-transparent'
        }`}>
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="font-display tracking-[0.3em] uppercase text-ink hover:text-golden-warm transition-colors cursor-pointer relative flex items-center h-full w-24 overflow-hidden"
            data-cursor-hover
            onMouseEnter={() => setLogoPeriodBounce(true)}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {scrolled ? (
                <motion.span
                  key="v"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="text-2xl md:text-3xl font-bold absolute left-0 flex items-baseline"
                >
                  V
                  <motion.span
                    className="text-[#C9A84C]"
                    animate={logoPeriodBounce ? { y: [0, 3, 0] } : {}}
                    transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                    onHoverStart={() => setLogoPeriodBounce(true)}
                    onAnimationComplete={() => setLogoPeriodBounce(false)}
                  >.</motion.span>
                </motion.span>
              ) : (
                <motion.span
                  key="velora"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="text-lg md:text-xl absolute left-0"
                >
                  VELORA
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Navigation */}
          <div className="flex items-center gap-5 md:gap-8">
            {!scrolled && (
              <motion.button
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                onClick={() => scrollToSection("curated")}
                className="hidden md:block text-sm tracking-widest uppercase text-ink-soft hover:text-ink transition-colors cursor-pointer"
                data-cursor-hover
              >
                Discover
              </motion.button>
            )}
            
            {!scrolled && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="hidden md:flex items-center gap-8"
              >
                <Link
                  href="/browse"
                  className="text-sm tracking-widest uppercase text-ink-soft hover:text-ink transition-colors block"
                  data-cursor-hover
                >
                  Browse
                </Link>
              </motion.div>
            )}

            <button
              onClick={() => scrollToSection("spin")}
              className="hidden md:block text-sm tracking-widest uppercase text-ink-soft hover:text-ink transition-colors cursor-pointer"
              data-cursor-hover
            >
              Spin
            </button>

            <Link
              href="/watchlist"
              className={`text-xs md:text-sm tracking-widest uppercase text-ink-soft hover:text-ink transition-colors cursor-pointer block ${scrolled ? "" : ""}`}
              data-cursor-hover
            >
              Watchlist
            </Link>

            <FilterPanel />

            <motion.button
              onClick={() => scrollToSection("spin")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={`glow-button btn-premium btn-primary text-sm uppercase font-medium text-white border border-golden/45
                ${activeFilters.length > 0 ? "ring-2 ring-golden/35 shadow-[0_0_24px_rgba(216,154,63,0.35)]" : ""}
                transition-all duration-300 cursor-pointer ${scrolled ? "px-4 py-1.5 text-xs" : ""}
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
