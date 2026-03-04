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
    const handleMouseMove = (event: MouseEvent) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <footer
      ref={sectionRef}
      className="scene relative pt-40 pb-20 px-[5vw] min-h-[75svh] flex flex-col justify-end overflow-hidden border-t border-ink/10"
      id="footer"
    >
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-1000"
        style={{
          opacity: bgOpacity,
          background: `radial-gradient(circle 600px at ${mousePos.x}px ${mousePos.y}px, rgba(232, 168, 56, 0.08), transparent 80%)`,
        }}
      />
      <div className="absolute inset-0 z-0 velora-grain-local opacity-[0.15] pointer-events-none" />

      <motion.div
        aria-hidden
        className="pointer-events-auto absolute bottom-0 left-0 right-0 font-accent italic text-center text-ink/[0.03] leading-none overflow-hidden cursor-crosshair z-0"
        style={{
          fontSize: "20vw",
          transform: "translateY(15%)",
          WebkitTextStroke: "1px rgba(13,13,26,0.02)",
        }}
        whileHover={{ letterSpacing: "0.15em", color: "rgba(13,13,26,0.08)" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        VELORA
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto w-full mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="font-display text-4xl md:text-5xl text-ink mb-6 font-light tracking-widest uppercase">
              Velora
            </div>
            <p className="text-ink-soft/80 text-lg md:text-xl leading-[1.8] max-w-sm font-body tracking-wide">
              The reel has not ended. It never does. Every film is a life; every viewing, a rebirth.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="text-xs md:text-sm tracking-[0.32em] uppercase text-golden-warm mb-8">Explore</div>
            {["Discover", "Spin", "Moods", "By Era", "Essential Films"].map((link) => (
              <div
                key={link}
                className="text-lg md:text-xl text-ink-soft hover:text-ink hover:translate-x-1 transition-all cursor-pointer mb-5 tracking-wide w-max"
              >
                {link}
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-between gap-12"
          >
            <div>
              <div className="text-xs md:text-sm tracking-[0.32em] uppercase text-golden-warm mb-8">The ritual</div>
              <blockquote
                className="font-display font-extralight text-ink italic leading-relaxed"
                style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.5rem)" }}
              >
                &ldquo;Today, fate chooses your film.&rdquo;
              </blockquote>
            </div>
            <div className="text-xs tracking-widest uppercase text-ink-muted pb-6 font-mono">
              Powered by TMDB | Copyright {new Date().getFullYear()} Velora
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
