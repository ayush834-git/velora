"use client";

import { useRef, useLayoutEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsapConfig";
import AnimatedText from "@/components/ui/AnimatedText";
import GlowButton from "@/components/ui/GlowButton";
import BlurUpImage from "@/components/ui/BlurUpImage";
import CinematicDust from "@/components/ui/CinematicDust";
import { Movie } from "@/types/movie";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ANIMATION } from "@/lib/constants";

interface HeroSceneProps {
  movies: Movie[];
}

/*
  GSAP Master Timeline choreography:
  ───────────────────────────────────
  T0.0s     Badge "VELORA" fades in           (1.2s, expo.out)
  T0.8s     Ghost posters stagger in          (2.5s, stagger 0.25s, power3.out)
  T1.4s     Subtitle fades in                 (1.2s, expo.out)
  T1.8s     CTAs fade in                      (1.2s, expo.out)
  T3.0s     Scroll indicator fades in         (1.2s)
  ───────────────────────────────────
  IDLE:     18s yoyo drift loop on ghost posters (sine.inOut)
  SCROLL:   ScrollTrigger fades hero-content out (opacity→0, scale→0.9, y→-80)

  Headline animation is handled by the AnimatedText component via Framer Motion
  (stagger 0.08s, delay 0.5s). GSAP is layered on top for scroll-scrub only.
*/

// Ghost poster layout: positions, depths, rotations
// z values 40–140px give subtle parallax via perspective: 1200px
const GHOST_LAYOUT = [
  { top: "8%",  left: "3%",  z: 40,  rotate: -12, w: 140, h: 200 },
  { top: "55%", left: "6%",  z: 80,  rotate: 8,   w: 130, h: 190 },
  { top: "12%", right: "4%", z: 60,  rotate: 15,  w: 135, h: 195 },
  { top: "50%", right: "6%", z: 100, rotate: -10, w: 120, h: 175 },
  { top: "30%", left: "12%", z: 20,  rotate: 5,   w: 110, h: 160 },
  { top: "35%", right: "10%", z: 140, rotate: -8,  w: 115, h: 168 },
];

export default function HeroScene({ movies }: HeroSceneProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const ghostPosters = movies.slice(0, 6);

  const scrollToSpin = () => {
    const el = document.getElementById("spin");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  useLayoutEffect(() => {
    // Skip all GSAP if reduced motion preferred
    if (prefersReduced || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      /* ── Entrance master timeline ── */
      const tl = gsap.timeline({
        defaults: { ease: ANIMATION.ease.hero },
      });

      // T0.0 — Badge
      tl.from(".hero-badge", {
        y: 25, opacity: 0,
        duration: 1.2,
      }, 0);

      // T0.8 — Ghost posters stagger in from below with scale
      tl.from(".ghost-poster", {
        opacity: 0,
        scale: 0.7,
        y: 40,
        stagger: ANIMATION.stagger.ghostPoster,
        duration: 2.5,
        ease: ANIMATION.ease.section,
      }, 0.8);

      // T1.4 — Subtitle
      tl.from(".hero-subtitle", {
        y: 35, opacity: 0,
        duration: 1.2,
      }, 1.4);

      // T1.8 — CTAs
      tl.from(".hero-ctas", {
        y: 35, opacity: 0,
        duration: 1.2,
      }, 1.8);

      // T3.0 — Scroll indicator
      tl.from(".hero-scroll-hint", {
        opacity: 0,
        duration: 1.2,
      }, 3.0);

      /* ── Idle drift loop (18s = 9s × yoyo) ── */
      gsap.to(".ghost-poster", {
        y: "+=8",
        rotation: "+=2",
        duration: ANIMATION.duration.idleHalf,
        ease: ANIMATION.ease.idle,
        repeat: -1,
        yoyo: true,
        stagger: { each: 1.5, from: "random" },
      });

      /* ── Scroll-linked fade out (scrub) ── */
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        animation: gsap
          .timeline()
          .to(".hero-content", {
            opacity: 0,
            scale: 0.9,
            y: -80,
            ease: "none",
          }),
      });

      /* ── Mouse parallax on ghost posters ── */
      const handleMouseMove = (e: MouseEvent) => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        const ny = (e.clientY / window.innerHeight - 0.5) * 2;

        document.querySelectorAll<HTMLElement>(".ghost-poster").forEach((el, i) => {
          gsap.to(el, {
            x: nx * (12 + i * 6),
            y: `+=${ny * (2 + i * 1)}`,
            duration: 0.8,
            ease: "power2.out",
            overwrite: "auto",
          });
        });
      };

      window.addEventListener("mousemove", handleMouseMove, { passive: true });

      // Cleanup stored for context revert
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReduced]);

  return (
    <section
      ref={sectionRef}
      className="scene relative min-h-[110vh] flex items-center justify-center"
      id="hero"
      style={{ perspective: `${ANIMATION.depth.perspective}px` }}
    >
      {/* Cinematic Dust Overlay */}
      <CinematicDust />

      {/* Ghost poster silhouettes — floating behind text */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ transformStyle: "preserve-3d" }}
      >
        {ghostPosters.map((movie, i) => {
          const g = GHOST_LAYOUT[i];
          return (
            <div
              key={movie.id}
              className="ghost-poster absolute rounded-xl overflow-hidden"
              style={{
                top: g.top,
                left: "left" in g ? g.left : undefined,
                right: "right" in g ? (g as { right: string }).right : undefined,
                width: g.w,
                height: g.h,
                transform: `translateZ(${g.z}px) rotate(${g.rotate}deg)`,
                opacity: prefersReduced ? 0.12 : 0,
                filter: "blur(3px) saturate(0.5) brightness(1.1)",
                willChange: "transform, opacity",
              }}
            >
              <BlurUpImage path={movie.poster_path} alt="" type="poster" fill />
            </div>
          );
        })}
      </div>

      {/* Main content — GSAP controls opacity/position via scroll */}
      <div className="hero-content relative z-10 text-center px-6 max-w-6xl mx-auto">
        {/* VELORA badge */}
        <div
          className="hero-badge mb-6"
          style={{ opacity: prefersReduced ? 1 : 0 }}
        >
          <span className="font-display text-sm md:text-base tracking-[0.5em] uppercase text-golden-warm/80">
            VELORA
          </span>
        </div>

        {/* Hero headline — AnimatedText handles its own FM entrance */}
        <AnimatedText
          text="Tonight, fate chooses your film."
          className="font-display font-extralight leading-[0.95] tracking-tight text-ink"
          style={{ fontSize: "var(--text-hero)" }}
          delay={0.5}
          stagger={ANIMATION.stagger.heroWords}
          splitBy="words"
          as="h1"
        />

        {/* Subtitle */}
        <p
          className="hero-subtitle mt-6 md:mt-10 text-ink-soft font-body max-w-xl mx-auto leading-relaxed"
          style={{
            fontSize: "var(--text-body)",
            opacity: prefersReduced ? 1 : 0,
          }}
        >
          An AI-powered cinematic ritual that discovers the perfect film for
          this exact moment in your life.
        </p>

        {/* CTAs */}
        <div
          className="hero-ctas mt-10 md:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ opacity: prefersReduced ? 1 : 0 }}
        >
          <GlowButton onClick={scrollToSpin} variant="primary" size="lg">
            Enter VELORA
          </GlowButton>
          <GlowButton onClick={scrollToSpin} variant="secondary" size="lg">
            Spin Now →
          </GlowButton>
        </div>

        {/* Scroll indicator */}
        <div
          className="hero-scroll-hint absolute -bottom-28 left-1/2 -translate-x-1/2"
          style={{ opacity: prefersReduced ? 1 : 0 }}
        >
          <div className="flex flex-col items-center gap-2 animate-bounce-slow">
            <span className="text-xs tracking-[0.2em] uppercase text-ink-muted">
              Scroll to discover
            </span>
            <div className="w-px h-10 bg-gradient-to-b from-golden/40 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
