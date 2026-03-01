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
      className="scene relative pt-24 pb-0 px-[5vw] overflow-hidden
        bg-cream-warm/40 border-t border-ink/[0.07]"
      id="footer"
    >
      {/* Sunset gradient background */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: bgOpacity }}
      >
        <div className="w-full h-full bg-gradient-to-b from-cream via-[#fde8d0] to-[#f0c8a0]" />
      </motion.div>

      {/* Giant watermark letterform */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute bottom-0 left-0 right-0
          font-display font-extralight text-center text-ink/[0.035] leading-none
          tracking-tight overflow-hidden"
        style={{ fontSize: "18vw", transform: "translateY(18%)" }}
      >
        VELORA
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-16">

          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="font-display text-2xl text-ink mb-4 font-light tracking-wide">
              Velora
            </div>
            <p className="text-ink-soft text-sm leading-[1.8] max-w-xs">
              The reel has not ended. It never does.
              Every film is a life; every viewing, a rebirth.
            </p>
          </motion.div>

          {/* Links column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="text-[10px] tracking-[0.32em] uppercase text-ink-muted mb-5">
              Explore
            </div>
            {["Discover", "Spin", "Moods", "By Era", "Essential Films"].map((link) => (
              <div
                key={link}
                className="text-sm text-ink-soft hover:text-ink transition-colors
                  cursor-pointer mb-2.5 tracking-wide"
              >
                {link}
              </div>
            ))}
          </motion.div>

          {/* Philosophy column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-between gap-8"
          >
            <div>
              <div className="text-[10px] tracking-[0.32em] uppercase text-ink-muted mb-5">
                The ritual
              </div>
              <blockquote
                className="font-display font-extralight text-ink/65 italic leading-relaxed"
                style={{ fontSize: "clamp(1.1rem, 2vw, 1.4rem)" }}
              >
                &ldquo;Tonight, fate chooses your film.&rdquo;
              </blockquote>
            </div>
            <div className="text-[10px] tracking-widest uppercase text-ink-muted pb-6">
              Powered by TMDB · © {new Date().getFullYear()} Velora
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
