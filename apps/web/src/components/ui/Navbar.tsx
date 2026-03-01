"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import FilterPanel from "./FilterPanel";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

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
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="glow-button btn-premium text-sm tracking-[0.03em] uppercase font-medium
                bg-gradient-to-br from-[#f7c873] to-[#f3a63a] text-white border border-golden/40
                hover:shadow-[0_8px_28px_rgba(243,166,58,0.45)]
                transition-all duration-300 cursor-pointer"
              data-cursor-hover
            >
              Spin Now
            </motion.button>
          </div>
        </div>
      </motion.nav>
    </>
  );
}
