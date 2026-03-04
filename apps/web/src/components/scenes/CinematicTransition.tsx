"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function CinematicTransition() {
  const sectionRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const [played, setPlayed] = useState(
    () => typeof window !== "undefined" && !!sessionStorage.getItem("velora-intro-played")
  );

  useEffect(() => {
    if (played || prefersReduced || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.timeline({
            onComplete: () => {
              sessionStorage.setItem("velora-intro-played", "true");
              setPlayed(true);
            }
          })
          .to(wrapperRef.current, { opacity: 1, duration: 0.05 })
          .fromTo(counterRef.current, 
            { rotate: -30, scale: 0.9 },
            { rotate: 0, scale: 1, duration: 1.2, ease: "power2.out" }
          )
          .to(wrapperRef.current, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, "+=0.1");
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [played, prefersReduced]);

  if (played) return null;

  return (
    <section ref={sectionRef} className="h-0 w-full relative z-[100]">
      <div 
        ref={wrapperRef}
        className="fixed inset-0 bg-ink z-[100] flex items-center justify-center opacity-0 pointer-events-none"
        style={{ willChange: "transform, opacity" }}
      >
        {/* Film leader circle countdown */}
        <div 
          ref={counterRef}
          className="relative w-72 h-72 md:w-[400px] md:h-[400px] rounded-full border-2 border-white/20 flex flex-col items-center justify-center"
        >
          {/* Tracking crosshairs */}
          <div className="absolute inset-0 rounded-full border-t-4 border-white flex justify-center">
            <div className="w-1.5 h-6 bg-white mt-[-4px]" />
          </div>
          <div className="absolute inset-0 rounded-full border-b-4 border-white flex justify-center items-end">
            <div className="w-1.5 h-6 bg-white mb-[-4px]" />
          </div>
          <div className="absolute inset-x-0 top-1/2 h-[2px] bg-white/30" />
          <div className="absolute inset-y-0 left-1/2 w-[2px] bg-white/30" />
          
          <div className="text-white/90 font-mono text-[100px] md:text-[140px] tracking-tighter film-countdown relative z-10 font-bold" />
          
          {/* Scratches and dust */}
          <div className="absolute inset-0 rounded-full ring-[60px] ring-black/60 mix-blend-overlay z-0" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.6%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')] opacity-[0.15] pointer-events-none" />
        </div>
      </div>
      <style>{`
        @keyframes countdown-text {
          0%, 33% { content: "5"; }
          34%, 66% { content: "4"; }
          67%, 100% { content: "3"; }
        }
        .film-countdown::before {
          content: "5";
          animation: countdown-text 1.2s steps(1) forwards;
        }
      `}</style>
    </section>
  );
}
