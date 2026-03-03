"use client";
import { motion } from "framer-motion";

const ROW_ONE = [
  "Drama", "★", "One click. One film.", "Thriller", "◆",
  "No paradox of choice", "Sci-Fi", "★", "Comfort", "◆",
  "Today's pick awaits", "Romance", "★", "Animation", "◆",
];

const ROW_TWO = [
  "Mind-Bending", "◆", "Every viewing a rebirth", "Epic", "★",
  "Dark", "◆", "Fate chooses today", "Underrated", "★",
  "Essential Cinema", "◆", "Classic", "★", "Foreign Film", "◆",
];

function TickerRow({
  items,
  reverse = false,
  duration = 30,
}: {
  items: string[];
  reverse?: boolean;
  duration?: number;
}) {
  const repeated = [...items, ...items, ...items, ...items];
  return (
    <div className="relative overflow-hidden py-5 border-y border-ink/[0.08]">
      <motion.div
        className="flex gap-14 whitespace-nowrap"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
        style={{ width: "max-content", willChange: "transform" }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className={[
              "text-[13px] tracking-[0.35em] uppercase select-none font-display",
              item === "★" || item === "◆"
                ? "text-golden-warm"
                : "text-ink-soft",
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
  return (
    <section className="relative overflow-hidden bg-cream">
      <TickerRow items={ROW_ONE} duration={32} />
      <TickerRow items={ROW_TWO} reverse duration={26} />
    </section>
  );
}
