"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const STEPS = [
  {
    number: "01",
    title: "Set the mood",
    body: "Choose a genre, era, language, or emotional register. Or choose nothing — let fate have full control.",
  },
  {
    number: "02",
    title: "Spin the reel",
    body: "One click. The algorithm weighs quality, obscurity, and cultural resonance to surface something truly worthy.",
  },
  {
    number: "03",
    title: "Watch today",
    body: "Your film is revealed with its story, its world, and its reason for finding you right now. Press play.",
  },
];

export default function HowItWorksScene() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      ref={ref}
      className="relative py-28 px-[5vw] overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,168,56,0.05),transparent_50%)] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="block text-[10px] tracking-[0.42em] uppercase text-golden-warm mb-16 text-center md:text-left"
        >
          The Ritual
        </motion.span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: i * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -8, backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }}
              className="relative p-8 rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] transition-all duration-500 overflow-hidden group border-b-white/[0.02] border-r-white/[0.02]"
            >
              <div className="absolute top-0 left-0 w-32 h-32 bg-golden opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-[40px] -translate-x-1/2 -translate-y-1/2 mix-blend-screen" />
              
              <div
                className="font-display font-extralight leading-none mb-6 select-none opacity-80 text-gradient-gold"
                style={{
                  fontSize: "clamp(3.5rem, 6vw, 4.5rem)",
                }}
              >
                {step.number}
              </div>
              
              <div className="w-8 h-[2px] mb-6 bg-gradient-to-r from-golden to-transparent opacity-60" />
              
              <h3
                className="font-display font-light text-cream mb-4 tracking-wide"
                style={{ fontSize: "clamp(1.1rem, 2vw, 1.4rem)" }}
              >
                {step.title}
              </h3>
              <p className="text-cream/60 text-sm leading-[1.8] font-body">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
