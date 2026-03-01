"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

export default function FooterScene() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-5%" });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"],
  });

  const bgOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <footer
      ref={sectionRef}
      className="scene relative pt-32 pb-0 px-[5vw] overflow-hidden
        bg-black border-t border-white/10"
      id="footer"
    >
      {/* Spotlight and Grain */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle 600px at ${mousePos.x}px ${mousePos.y}px, rgba(232, 168, 56, 0.08), transparent 80%)`,
        }}
      />
      <div className="absolute inset-0 z-0 grain-overlay opacity-[0.15] mix-blend-screen pointer-events-none" />

      {/* Giant watermark letterform */}
      <motion.div
        aria-hidden
        className="pointer-events-auto absolute bottom-0 left-0 right-0 font-accent italic text-center text-white/[0.04] leading-none overflow-hidden cursor-crosshair z-0"
        style={{ fontSize: "20vw", transform: "translateY(15%)", WebkitTextStroke: "1px rgba(255,255,255,0.02)" }}
        whileHover={{ letterSpacing: "0.15em", color: "rgba(255,255,255,0.08)" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        VELORA
      </motion.div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-24">

          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="font-display text-2xl text-cream mb-4 font-light tracking-widest uppercase">
              Velora
            </div>
            <p className="text-cream/60 text-sm leading-[1.8] max-w-xs font-body tracking-wide">
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
            <div className="text-[10px] tracking-[0.32em] uppercase text-golden-warm mb-6">
              Explore
            </div>
            {["Discover", "Spin", "Moods", "By Era", "Essential Films"].map((link) => (
              <div
                key={link}
                className="text-sm text-cream/70 hover:text-white hover:translate-x-1 transition-all
                  cursor-pointer mb-3.5 tracking-wide w-max"
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
            className="flex flex-col justify-between gap-12"
          >
            <div>
              <div className="text-[10px] tracking-[0.32em] uppercase text-golden-warm mb-6">
                The ritual
              </div>
              <blockquote
                className="font-display font-extralight text-cream/80 italic leading-relaxed"
                style={{ fontSize: "clamp(1.1rem, 2vw, 1.4rem)" }}
              >
                &ldquo;Today, fate chooses your film.&rdquo;
              </blockquote>
            </div>
            <div className="text-[10px] tracking-widest uppercase text-cream/40 pb-6 font-mono">
              Powered by TMDB · © {new Date().getFullYear()} Velora
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
