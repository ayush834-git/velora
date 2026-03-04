"use client";

import { motion, useReducedMotion } from "framer-motion";

const ROW_ONE = [
  "Drama",
  "*",
  "One click. One film.",
  "Thriller",
  "+",
  "No paradox of choice",
  "Sci-Fi",
  "*",
  "Comfort",
  "+",
  "Today's pick awaits",
  "Romance",
  "*",
  "Animation",
  "+",
];

const ROW_TWO = [
  "Mind-Bending",
  "+",
  "Every viewing a rebirth",
  "Epic",
  "*",
  "Dark",
  "+",
  "Fate chooses today",
  "Underrated",
  "*",
  "Essential Cinema",
  "+",
  "Classic",
  "*",
  "Foreign Film",
  "+",
];

const ROW_THREE = [
  "Director Picks",
  "*",
  "Curated by mood",
  "+",
  "One spin, one answer",
  "*",
  "No endless scrolling",
  "+",
  "Velora",
  "*",
  "Fate chooses today",
  "+",
];

function TickerRow({
  items,
  reverse = false,
  duration = 30,
  reduced = false,
}: {
  items: string[];
  reverse?: boolean;
  duration?: number;
  reduced?: boolean;
}) {
  const repeated = [...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden py-5 border-y border-ink/[0.08] transform-gpu [backface-visibility:hidden]">
      <motion.div
        className="flex gap-14 whitespace-nowrap transform-gpu [backface-visibility:hidden]"
        initial={{ x: reverse ? "-33.333%" : "0%" }}
        animate={reduced ? undefined : { x: reverse ? ["-33.333%", "0%"] : ["0%", "-33.333%"] }}
        transition={reduced ? undefined : { duration, ease: "linear", repeat: Infinity }}
        style={{ width: "max-content", willChange: "transform" }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className={[
              "text-[13px] tracking-[0.35em] uppercase select-none font-display",
              item === "*" || item === "+" ? "text-golden-warm" : "text-ink-soft",
            ].join(" ")}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function MarqueeScene() {
  const reduced = useReducedMotion();

  return (
    <motion.section
      className="relative z-10 overflow-hidden bg-cream"
      initial={reduced ? false : { opacity: 0, y: 14 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-cream to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-cream to-transparent z-10" />
      <TickerRow items={ROW_ONE} duration={30} reduced={Boolean(reduced)} />
      <TickerRow items={ROW_TWO} reverse duration={24} reduced={Boolean(reduced)} />
      <TickerRow items={ROW_THREE} duration={36} reduced={Boolean(reduced)} />
    </motion.section>
  );
}
