"use client";

import { useMemo, useRef, useState, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GlowButton from "@/components/ui/GlowButton";
import BlurUpImage from "@/components/ui/BlurUpImage";
import CinematicDust from "@/components/ui/CinematicDust";
import { Movie } from "@/types/movie";
import { useReducedMotion } from "@/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroSceneProps {
  movies: Movie[];
}

const GHOST_LAYOUT = [
  { top: "8%", left: "3%", rotate: -12, w: 140, h: 200, z: 120 },
  { top: "55%", left: "6%", rotate: 8, w: 130, h: 190, z: 80 },
  { top: "12%", right: "4%", rotate: 15, w: 135, h: 195, z: 100 },
  { top: "50%", right: "6%", rotate: -10, w: 120, h: 175, z: 60 },
  { top: "30%", left: "12%", rotate: 5, w: 110, h: 160, z: 40 },
  { top: "35%", right: "10%", rotate: -8, w: 115, h: 168, z: 20 },
] as const;

const SUBTITLES = [
  "An AI-powered cinematic ritual for this exact moment.",
  "No endless scrolling. No algorithms. Just fate.",
  "One click. One film. The one you need right now.",
];

function SubtitleCycler({ prefersReduced }: { prefersReduced: boolean }) {
  const [subIndex, setSubIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSubIndex(i => (i + 1) % SUBTITLES.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mt-8 mb-6 h-16 md:h-20 relative w-full flex justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={subIndex}
          initial={prefersReduced ? false : { y: 10, opacity: 0 }}
          animate={prefersReduced ? undefined : { y: 0, opacity: 1 }}
          exit={prefersReduced ? undefined : { y: -10, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-lg md:text-xl text-ink-soft/85 font-body leading-[1.6] md:leading-[1.9] tracking-wide absolute w-full px-4"
        >
          {SUBTITLES[subIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function HeroScene({ movies }: HeroSceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const ghostPosters = movies.slice(0, 6);
  const title = "Today, fate chooses your film.";
  
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

  useLayoutEffect(() => {
    if (prefersReduced || !sectionRef.current) return;
    
    const ctx = gsap.context(() => {
      // Pin hero
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=50%",
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
      });

      // Headline drifts up and fades as hero pins
      if (headlineRef.current) {
        gsap.to(headlineRef.current, {
          y: -80,
          opacity: 0,
          scale: 0.92,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=120%",
            scrub: 1.2,
          },
        });
      }
    }, sectionRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [prefersReduced]);

  return (
    <section ref={sectionRef} className="scene relative h-[100svh] flex items-center justify-center" id="hero">
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-cream/10 via-cream-warm/5 to-transparent pointer-events-none"
        initial={prefersReduced ? false : { opacity: 0, scale: 1.05 }}
        animate={prefersReduced ? undefined : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      />

      <CinematicDust />

      {/* Removed legacy ghost-posters as they block VeloraBackground */}

      <div ref={headlineRef} className="relative z-10 text-center px-4 w-full max-w-5xl mx-auto flex flex-col items-center">
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
          className="font-accent font-light leading-[0.95] tracking-tight text-ink flex flex-wrap justify-center"
          style={{ fontSize: "var(--text-hero)" }}
          aria-label={title}
        >
          {titleWords.map((wordObj, wi) => {
            const charOffset = titleWords.slice(0, wi).reduce((sum, w) => sum + w.chars.length + 1, 0);
            return (
              <span key={wi} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                {wordObj.chars.map((char, ci) => (
                  <motion.span
                    key={`${char}-${ci}`}
                    className="inline-block"
                    initial={prefersReduced ? false : { opacity: 0, y: 24 }}
                    animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.28,
                      delay: 0.12 + (charOffset + ci) * 0.018,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
                {wi < titleWords.length - 1 && "\u00A0"}
              </span>
            );
          })}
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
          <GlowButton onClick={() => window.location.href = '/watchlist'} variant="secondary" size="lg">
            My Watchlist →
          </GlowButton>
        </motion.div>
      </div>

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
          {Array.from({length: 8}).map((_, i) => (
            <div key={i} className="h-full w-4 bg-golden" />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
