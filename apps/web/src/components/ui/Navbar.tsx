'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import FilterPanel from './FilterPanel';
import MagneticButton from './MagneticButton';
import { useFilters } from '@/context/FilterContext';
import { useScrollPosition } from '@/hooks/useScrollPosition';

export default function Navbar() {
  const [logoPeriodBounce, setLogoPeriodBounce] = useState(false);
  const { filters, setFilter, clearFilters } = useFilters();
  const scrollY = useScrollPosition();
  const scrolled = scrollY > 80;

  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const activeFilters = useMemo(
    () =>
      Object.entries(filters).filter(
        ([, value]) => Boolean(value) && value !== 'Any'
      ) as Array<[keyof typeof filters, string]>,
    [filters]
  );

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.div className="scroll-progress" style={{ scaleX }} />

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        className={`fixed left-0 right-0 z-50 flex justify-center transition-all duration-400 ${scrolled ? 'top-3 px-4' : 'top-0 px-0'}`}
      >
        <div
          className={`w-full flex items-center justify-between max-w-7xl mx-auto px-6 md:px-12 rounded-full transition-all duration-400 ${scrolled
            ? 'py-3 border-b border-[rgba(201,168,76,0.15)] backdrop-blur-[20px] bg-[rgba(245,240,232,0.72)] shadow-md max-w-4xl'
            : 'py-5'
          }`}
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-display tracking-[0.3em] uppercase text-ink hover:text-golden-warm transition-colors relative flex items-center h-full w-24 overflow-hidden"
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
                  >
                    .
                  </motion.span>
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

          <div className="flex items-center gap-5 md:gap-8">
            <button
              onClick={() => scrollToSection('curated')}
              className="hidden md:block text-sm tracking-widest uppercase text-ink-soft hover:text-ink transition-colors"
              data-cursor-hover
            >
              Discover
            </button>

            <Link
              href="/browse"
              className="hidden md:block text-sm tracking-widest uppercase text-ink-soft hover:text-ink transition-colors"
              data-cursor-hover
            >
              Browse
            </Link>

            <button
              onClick={() => scrollToSection('spin')}
              className="hidden md:block text-sm tracking-widest uppercase text-ink-soft hover:text-ink transition-colors"
              data-cursor-hover
            >
              Spin
            </button>

            <Link
              href="/watchlist"
              className="text-xs md:text-sm tracking-widest uppercase text-ink-soft hover:text-ink transition-colors"
              data-cursor-hover
            >
              Watchlist
            </Link>

            <FilterPanel />

            <MagneticButton
              onClick={() => scrollToSection('spin')}
              className={`btn-premium text-sm uppercase font-medium border border-golden/45 text-[#1A1A2E] ${activeFilters.length > 0 ? 'ring-2 ring-golden/35 shadow-[0_0_24px_rgba(201,168,76,0.35)]' : ''} ${scrolled ? 'px-4 py-1.5 text-xs' : ''}`}
              data-cursor="SPIN"
            >
              Spin Now
            </MagneticButton>
          </div>
        </div>

        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div
              key="filter-bar"
              initial={{ opacity: 0, scaleY: 0.92, y: -6 }}
              animate={{ opacity: 1, scaleY: 1, y: 0 }}
              exit={{ opacity: 0, scaleY: 0.92, y: -6 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden border-t border-golden/20 bg-golden/[0.07] origin-top"
            >
              <div className="flex items-center gap-3 flex-wrap px-6 md:px-12 py-2 min-h-[2.5rem] max-w-7xl mx-auto">
                <span className="text-[10px] tracking-[0.3em] uppercase text-ink-muted shrink-0">Filtering by</span>
                {activeFilters.map(([key, value]) => (
                  <motion.button
                    key={key}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                    onClick={() => setFilter(key, null)}
                    className="flex items-center gap-1.5 h-7 px-3 rounded-full bg-golden text-[#F5F0E8] text-[11px] tracking-wide hover:bg-golden-warm transition-colors shrink-0"
                  >
                    {value}
                    <span className="opacity-60 text-xs leading-none ml-0.5">x</span>
                  </motion.button>
                ))}
                <button
                  onClick={clearFilters}
                  className="text-[10px] tracking-widest uppercase text-ink-muted hover:text-ink transition-colors ml-auto"
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
