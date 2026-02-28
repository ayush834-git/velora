"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

export default function FooterScene() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-5%" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"],
  });

  const bgOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <footer
      ref={sectionRef}
      className="scene relative min-h-[50vh] flex flex-col items-center justify-center py-20"
      id="footer"
    >
      {/* Sunset gradient background */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: bgOpacity }}
      >
        <div className="w-full h-full bg-gradient-to-b from-cream via-[#fde8d0] to-[#f0c8a0]" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Logo */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-4xl md:text-6xl tracking-[0.4em] uppercase text-ink/30 mb-8"
        >
          VELORA
        </motion.h2>

        {/* Poetic tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2 mb-10"
        >
          <p className="text-ink-soft/60 text-sm leading-relaxed">
            The reel hasn&apos;t ended. It never does.
          </p>
          <p className="text-ink-soft/40 text-sm leading-relaxed">
            Every film is a life; every viewing, a rebirth.
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-24 h-px bg-golden/30 mx-auto mb-6"
        />

        {/* Credits */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1 }}
          className="text-ink-muted text-xs tracking-wider"
        >
          Powered by TMDB · Built with obsession
        </motion.p>
      </div>
    </footer>
  );
}
