"use client";
import { useRef, useLayoutEffect } from "react";
import { motion, useInView } from "framer-motion";
import { gsap } from "@/lib/gsapConfig";

const STATS = [
  { value: "10M+", label: "Films catalogued" },
  { value: "6", label: "Mood dimensions" },
  { value: "1", label: "Perfect pick for now" },
  { value: "∞", label: "Possible journeys" },
];

export default function ManifestoScene() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-15%" });

  useLayoutEffect(() => {
    if (!headlineRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".manifesto-word", {
        y: 70,
        opacity: 0,
        duration: 1.0,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headlineRef.current,
          start: "top 82%",
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[50vh] min-h-[500px] flex flex-col justify-center
        py-16 md:py-20 px-[5vw] bg-gradient-to-b from-cream via-cream-warm/30 to-cream
        overflow-hidden"
    >
      {/* Decorative giant V */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute -right-8 top-0
          font-display font-extralight leading-none text-ink/[0.03]"
        style={{ fontSize: "30vw" }}
      >
        V
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="block text-[11px] tracking-[0.42em] uppercase text-golden-warm mb-10"
        >
          The Philosophy
        </motion.span>

        <h2
          ref={headlineRef}
          className="font-display font-extralight text-ink overflow-hidden"
          style={{
            fontSize: "clamp(3rem, 8.5vw, 8.5rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1.0,
          }}
        >
          {["Every", "film", "is", "a"].map((word, i) => (
            <span
              key={i}
              className="manifesto-word inline-block"
              style={{ marginRight: "0.22em" }}
            >
              {word}
            </span>
          ))}
          <span
            className="manifesto-word inline-block"
            style={{ color: "var(--color-golden-warm)" }}
          >
            mirror.
          </span>
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.62 }}
          className="mt-8 max-w-lg text-ink-soft leading-[1.8]"
          style={{ fontSize: "var(--text-body)" }}
        >
          Velora reads the moment, not just your mood. The right film is rarely the
          most popular — it is the one that finds you exactly where you are today.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.84 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-10
            border-t border-ink/10"
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <div
                className="font-display font-light"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3.5rem)",
                  color: "var(--color-golden-warm)",
                }}
              >
                {s.value}
              </div>
              <div className="text-[10px] tracking-[0.24em] uppercase text-ink-muted mt-2">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
