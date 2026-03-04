"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import GlowButton from "@/components/ui/GlowButton";
import CinematicDust from "@/components/ui/CinematicDust";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const SUBTITLES = [
  "An AI-powered cinematic ritual for this exact moment.",
  "No endless scrolling. No algorithms. Just fate.",
  "One click. One film. The one you need right now.",
];

function SubtitleCycler({ prefersReduced }: { prefersReduced: boolean }) {
  const [subIndex, setSubIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSubIndex((i) => (i + 1) % SUBTITLES.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative mt-8 mb-6 h-16 w-full md:h-20 flex justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={subIndex}
          initial={prefersReduced ? false : { y: 10, opacity: 0 }}
          animate={prefersReduced ? undefined : { y: 0, opacity: 1 }}
          exit={prefersReduced ? undefined : { y: -10, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute w-full px-4 text-lg md:text-xl text-ink-soft/85 font-body leading-[1.6] md:leading-[1.9] tracking-wide"
        >
          {SUBTITLES[subIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function HeroScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const title = "Today, fate chooses your film.";

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const overlayOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.62]);
  const headlineY = useTransform(scrollYProgress, [0, 0.65], [0, -48]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0.35]);
  const headlineScale = useTransform(scrollYProgress, [0, 0.65], [1, 0.96]);

  const titleWords = useMemo(() => {
    return title.split(" ").map((word) => ({
      word,
      chars: word.split(""),
    }));
  }, [title]);

  const scrollToSpin = () => {
    const el = document.getElementById("spin");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="scene relative min-h-[180svh] [transform:translateZ(0)]">
      <div
        id="hero"
        className="sticky top-0 flex min-h-[100svh] items-center justify-center overflow-hidden transform-gpu [backface-visibility:hidden]"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-cream/10 via-cream-warm/5 to-transparent pointer-events-none"
          initial={prefersReduced ? false : { opacity: 0, scale: 1.05 }}
          animate={prefersReduced ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={prefersReduced ? undefined : { opacity: overlayOpacity }}
        />

        <CinematicDust />

        <motion.div
          className="relative z-10 text-center px-4 w-full max-w-5xl mx-auto flex flex-col items-center"
          style={prefersReduced ? undefined : { y: headlineY, opacity: headlineOpacity, scale: headlineScale }}
        >
          <motion.div
            className="mb-8"
            initial={prefersReduced ? false : { opacity: 0, y: 12 }}
            animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="font-display text-sm md:text-base tracking-[0.5em] uppercase text-golden-warm mb-6 block">
              VELORA
            </span>
          </motion.div>

          <h1
            className="font-accent font-light leading-[0.9] tracking-tight text-ink flex flex-wrap justify-center py-2"
            style={{ fontSize: "var(--text-hero)" }}
            aria-label={title}
          >
            {titleWords.map((wordObj, wi) => (
              <motion.span
                key={wi}
                className="inline-block mr-[0.25em] last:mr-0 will-change-transform"
                initial={prefersReduced ? false : { opacity: 0, y: 16 }}
                animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.1 + wi * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {wordObj.word}
              </motion.span>
            ))}
          </h1>

          <SubtitleCycler prefersReduced={prefersReduced} />

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-8"
            initial={prefersReduced ? false : { opacity: 0, y: 12 }}
            animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlowButton onClick={scrollToSpin} variant="primary" size="lg">
              Spin Now
            </GlowButton>
            <GlowButton onClick={() => (window.location.href = "/watchlist")} variant="secondary" size="lg">
              My Watchlist
            </GlowButton>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-12 left-0 right-0 overflow-hidden flex justify-center opacity-60"
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={prefersReduced ? undefined : { opacity: 0.6 }}
          transition={{ duration: 0.28, delay: 0.62 }}
          title="Scroll to discover"
        >
          <motion.div
            className="h-[2px] w-48 flex gap-3"
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-full w-4 bg-golden" />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
