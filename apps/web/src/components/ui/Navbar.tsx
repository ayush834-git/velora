"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import FilterPanel from "./FilterPanel";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

            <button
              onClick={() => scrollToSection("spin")}
              className="glow-button px-5 py-2 rounded-full text-sm tracking-wider uppercase font-medium
                bg-golden/90 text-white border-none
                hover:bg-golden hover:shadow-[0_4px_24px_rgba(232,168,56,0.4)]
                transition-all duration-300 cursor-pointer"
              data-cursor-hover
            >
              Spin Now
            </button>
          </div>
        </div>
      </motion.nav>
    </>
  );
}
