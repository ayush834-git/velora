"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const STEPS = [
  {
    number: "01",
    color: "var(--color-golden-warm)",
    title: "Set the mood",
    body: "Choose a genre, era, language, or emotional register. Or choose nothing — let fate have full control.",
  },
  {
    number: "02",
    color: "#c4845a",
    title: "Spin the reel",
    body: "One click. The algorithm weighs quality, obscurity, and cultural resonance to surface something truly worthy.",
  },
  {
    number: "03",
    color: "#7a9e8e",
    title: "Watch tonight",
    body: "Your film is revealed with its story, its world, and its reason for finding you right now. Press play.",
  },
];

export default function HowItWorksScene() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      ref={ref}
      className="relative py-20 px-[5vw] bg-cream border-t border-ink/[0.06]"
    >
      <div className="max-w-6xl mx-auto">
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="block text-[10px] tracking-[0.42em] uppercase text-ink-muted mb-14"
        >
          The Ritual
        </motion.span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 28 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.65,
                delay: i * 0.14,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div
                className="font-display font-extralight leading-none mb-5 select-none"
                style={{
                  fontSize: "clamp(4rem, 8vw, 7rem)",
                  color: step.color,
                  opacity: 0.16,
                }}
              >
                {step.number}
              </div>
              <div className="w-8 h-px mb-5" style={{ background: step.color }} />
              <h3
                className="font-display font-light text-ink mb-3"
                style={{ fontSize: "clamp(1.1rem, 2vw, 1.4rem)" }}
              >
                {step.title}
              </h3>
              <p className="text-ink-soft text-sm leading-[1.8]">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
