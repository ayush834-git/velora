"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFilters } from "@/context/FilterContext";

// ─── Time → Mood data ────────────────────────────────────────────────────────
interface TimeMood {
  headline: string;
  sub: string;
  mood: string;
  icon: string;
  accent: string;
  shadow: string;
  bg: string;
  label: string;       // used in day-progress bar
  btnText: string;     // CTA label — never uses "tonight"
}

function getTimeMood(hour: number): TimeMood {
  if (hour >= 5 && hour < 8) return {
    headline: "Morning light.",
    sub: "Something gentle to ease into the day.",
    mood: "Comfort", icon: "🌅",
    accent: "#f59e0b", shadow: "rgba(245,158,11,0.4)",
    bg: "rgba(245,158,11,0.07)", label: "Early Morning",
    btnText: "Set Comfort · Pick Now",
  };
  if (hour >= 8 && hour < 12) return {
    headline: "Clear-headed.",
    sub: "Something to sharpen the imagination right now.",
    mood: "Mind-Bending", icon: "☀️",
    accent: "#38bdf8", shadow: "rgba(56,189,248,0.4)",
    bg: "rgba(56,189,248,0.06)", label: "Morning",
    btnText: "Set Mind-Bending · Pick Now",
  };
  if (hour >= 12 && hour < 15) return {
    headline: "Midday drift.",
    sub: "Something epic to carry you through the afternoon.",
    mood: "Epic", icon: "⚡",
    accent: "#06b6d4", shadow: "rgba(6,182,212,0.4)",
    bg: "rgba(6,182,212,0.06)", label: "Midday",
    btnText: "Set Epic · Pick Now",
  };
  if (hour >= 15 && hour < 18) return {
    headline: "Afternoon glow.",
    sub: "Something warm and romantic for now.",
    mood: "Romantic", icon: "🌸",
    accent: "#ec4899", shadow: "rgba(236,72,153,0.4)",
    bg: "rgba(236,72,153,0.05)", label: "Afternoon",
    btnText: "Set Romantic · Pick Now",
  };
  if (hour >= 18 && hour < 21) return {
    headline: "Golden hour.",
    sub: "Something that earns its ending.",
    mood: "Comfort", icon: "🌆",
    accent: "#e8a838", shadow: "rgba(232,168,56,0.45)",
    bg: "rgba(232,168,56,0.07)", label: "Golden Hour",
    btnText: "Set Comfort · Pick Now",
  };
  if (hour >= 21 && hour < 23) return {
    headline: "Late evening.",
    sub: "Something that holds weight.",
    mood: "Dark", icon: "🌙",
    accent: "#dc2626", shadow: "rgba(220,38,38,0.4)",
    bg: "rgba(220,38,38,0.06)", label: "Evening",
    btnText: "Set Dark · Pick Now",
  };
  return {
    headline: "The quiet hours.",
    sub: "Something that asks the hard questions.",
    mood: "Mind-Bending", icon: "🌌",
    accent: "#9b7aed", shadow: "rgba(155,122,237,0.4)",
    bg: "rgba(155,122,237,0.06)", label: "Late Night",
    btnText: "Set Mind-Bending · Pick Now",
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// ─── Single flip card ─────────────────────────────────────────────────────────
interface FlipCardProps {
  digit: string;
  accent: string;
}

function FlipCard({ digit, accent }: FlipCardProps) {
  const [displayed, setDisplayed] = useState(digit);
  const [flipping, setFlipping] = useState(false);
  const [incoming, setIncoming] = useState(digit);
  const prevRef = useRef(digit);

  useEffect(() => {
    if (digit === prevRef.current) return;
    setIncoming(digit);
    setFlipping(true);
    const t = setTimeout(() => {
      setDisplayed(digit);
      setFlipping(false);
      prevRef.current = digit;
    }, 320);
    return () => clearTimeout(t);
  }, [digit]);

  const glowStyle = {
    textShadow: `0 0 28px ${accent}99, 0 0 8px ${accent}44`,
  };

  const topHalfStyle: React.CSSProperties = {
    height: "50%",
    borderRadius: "14px 14px 0 0",
    background: "linear-gradient(180deg, #232040 0%, #1a1830 100%)",
  };
  
  const bottomHalfStyle: React.CSSProperties = {
    height: "50%",
    borderRadius: "0 0 14px 14px",
    background: "linear-gradient(180deg, #15132a 0%, #0d0c1e 100%)",
  };

  const textStyle: React.CSSProperties = {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 68,
    lineHeight: "130px",
    width: "100%",
    textAlign: "center",
    height: 130,
    ...glowStyle,
  };

  return (
    <div
      className="relative"
      style={{ width: 110, height: 130, perspective: 500 }}
    >
      {/* Dark card body */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: "linear-gradient(160deg, #1c1a30 0%, #0f0e1e 100%)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.45), 0 2px 0 rgba(255,255,255,0.04) inset",
        }}
      />

      {/* Static top half */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden" style={topHalfStyle}>
        <div className="absolute top-0 left-0 right-0 font-mono text-white select-none" style={textStyle}>
          {displayed}
        </div>
      </div>

      {/* Static bottom half */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={bottomHalfStyle}>
        <div className="absolute bottom-0 left-0 right-0 font-mono text-white select-none" style={textStyle}>
          {displayed}
        </div>
      </div>

      {/* Animated flap — falls showing old digit */}
      {flipping && (
        <motion.div
          className="absolute top-0 left-0 right-0 overflow-hidden"
          style={{
            ...topHalfStyle,
            transformOrigin: "bottom center",
            zIndex: 4,
          }}
          initial={{ rotateX: 0 }}
          animate={{ rotateX: -92 }}
          transition={{ duration: 0.28, ease: "easeIn" }}
        >
          <div className="absolute top-0 left-0 right-0 font-mono text-white select-none" style={textStyle}>
            {prevRef.current}
          </div>
        </motion.div>
      )}

      {/* Incoming bottom flap — rises showing new digit */}
      {flipping && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 overflow-hidden"
          style={{
            ...bottomHalfStyle,
            transformOrigin: "top center",
            zIndex: 5,
          }}
          initial={{ rotateX: 90 }}
          animate={{ rotateX: 0 }}
          transition={{ duration: 0.28, ease: "easeOut", delay: 0.26 }}
        >
          <div className="absolute bottom-0 left-0 right-0 font-mono text-white select-none" style={textStyle}>
            {incoming}
          </div>
        </motion.div>
      )}

      {/* Horizontal fold crease */}
      <div
        className="absolute left-0 right-0 z-10 pointer-events-none"
        style={{ top: "50%", height: 2, background: "rgba(0,0,0,0.55)" }}
      />

      {/* Corner screws */}
      {[["top-2 left-2","tl"],["top-2 right-2","tr"],["bottom-2 left-2","bl"],["bottom-2 right-2","br"]].map(([pos])=>(
        <div
          key={pos}
          className={`absolute w-1.5 h-1.5 rounded-full z-10 ${pos}`}
          style={{ background: "radial-gradient(circle at 35% 35%, #2a2840, #141226)", border: "1px solid rgba(255,255,255,0.05)" }}
        />
      ))}

      {/* Accent LED strip at bottom edge */}
      <div
        className="absolute bottom-0 left-4 right-4 rounded-full z-10"
        style={{ height: 1, background: accent, boxShadow: `0 0 6px ${accent}`, opacity: 0.6 }}
      />
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function MoodClockScene() {
  const [now, setNow] = useState<Date | null>(null);
  const [accepted, setAccepted] = useState(false);
  const { setFilter } = useFilters();

  // Client-only to prevent SSR hydration mismatch
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleAccept = useCallback(() => {
    if (!now) return;
    const mood = getTimeMood(now.getHours());
    setFilter("mood", mood.mood);
    setAccepted(true);
    setTimeout(() => {
      document.getElementById("spin")?.scrollIntoView({ behavior: "smooth" });
    }, 700);
  }, [now, setFilter]);

  const handleDecline = useCallback(() => {
    document.getElementById("curated")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  if (!now) return null;

  const hour = now.getHours();
  const min = now.getMinutes();
  const mood = getTimeMood(hour);
  const displayH = hour % 12 || 12;
  const hStr = pad(displayH);
  const mStr = pad(min);
  const ampm = hour < 12 ? "AM" : "PM";

  // Day progress (0–100)
  const dayPct = ((hour * 60 + min) / (24 * 60)) * 100;

  return (
    <section
      className="relative overflow-hidden flex items-center justify-center
        px-[5vw] py-24 min-h-[90vh]"
      style={{
        background: `radial-gradient(ellipse 90% 70% at 50% 45%, ${mood.bg} 0%, var(--color-cream) 65%)`,
        transition: "background 1.5s ease",
      }}
    >
      {/* Film strip perforation columns — purely decorative */}
      {["left-0", "right-0"].map((side) => (
        <div
          key={side}
          className={`absolute top-0 bottom-0 ${side} flex flex-col
            justify-around py-6 pointer-events-none`}
          style={{ width: 52, opacity: 0.04 }}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="mx-auto rounded-sm flex-shrink-0"
              style={{ width: 28, height: 20, background: "var(--color-ink)" }}
            />
          ))}
        </div>
      ))}

      {/* Ambient radial pulse */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 50% 45% at 50% 50%, ${mood.accent}14 0%, transparent 70%)`,
          transition: "background 1.5s ease",
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-3xl w-full">

        {/* Eyebrow */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.55 }}
          className="font-display text-[10px] md:text-xs tracking-[0.4em] uppercase mb-12 md:mb-16 block"
          style={{ color: mood.accent, transition: "color 1s ease" }}
        >
          ✦ What are you watching today?
        </motion.span>

        {/* Flip clock */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="flex items-center gap-3 md:gap-5 mb-16 md:mb-20"
        >
          {/* Hours */}
          <div className="flex flex-col items-center gap-2">
            <FlipCard digit={hStr[0]} accent={mood.accent} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <FlipCard digit={hStr[1]} accent={mood.accent} />
          </div>

          {/* Blinking colon */}
          <div className="flex flex-col gap-3 mb-6">
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                className="rounded-full"
                style={{
                  width: 9, height: 9,
                  background: mood.accent,
                  boxShadow: `0 0 10px ${mood.accent}`,
                  transition: "background 1s, box-shadow 1s",
                }}
                animate={{ opacity: [0.8, 0.15, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.5 }}
              />
            ))}
          </div>

          {/* Minutes */}
          <div className="flex flex-col items-center gap-2">
            <FlipCard digit={mStr[0]} accent={mood.accent} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <FlipCard digit={mStr[1]} accent={mood.accent} />
          </div>

          {/* AM/PM */}
          <div className="flex flex-col gap-1.5 mb-6">
            {["AM", "PM"].map((label) => (
              <div
                key={label}
                className="px-2 py-1 rounded text-sm"
                style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  color: (label === "AM") === (hour < 12) ? mood.accent : "rgba(255,255,255,0.18)",
                  background: (label === "AM") === (hour < 12) ? `${mood.accent}12` : "transparent",
                  textShadow: (label === "AM") === (hour < 12) ? `0 0 14px ${mood.accent}` : "none",
                  transition: "all 0.5s",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mood suggestion card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-[540px] rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.95)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.07)",
          }}
        >
          <div className="flex items-center gap-5 px-7 py-6">
            {/* Icon */}
            <motion.div
              className="flex items-center justify-center rounded-2xl flex-shrink-0 text-2xl"
              style={{
                width: 52, height: 52,
                background: `${mood.accent}18`,
                transition: "background 1s",
              }}
              whileHover={{ rotate: -8, scale: 1.12 }}
            >
              {mood.icon}
            </motion.div>

            {/* Text */}
            <div className="flex-1 min-w-0 pr-4">
              <p
                className="font-display font-light text-ink mb-1"
                style={{ fontSize: "clamp(1.1rem, 2vw, 1.4rem)", transition: "color 0.5s" }}
              >
                {mood.headline}
              </p>
              <p className="font-body text-ink-soft text-sm leading-relaxed">{mood.sub}</p>
            </div>

            {/* CTAs */}
            <AnimatePresence mode="wait">
              {!accepted ? (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col gap-3 flex-shrink-0"
                >
                  <motion.button
                    onClick={handleAccept}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-premium btn-primary text-white text-sm font-medium tracking-wide glow-button cursor-pointer border-none"
                    style={{
                      background: `linear-gradient(135deg, ${mood.accent}, ${mood.accent}cc)`,
                      boxShadow: `0 8px 20px ${mood.shadow}`,
                      transition: "background 1s, box-shadow 1s",
                    }}
                    aria-label={`${mood.btnText} — mood filter for this time of day`}
                  >
                    {mood.btnText}
                  </motion.button>

                  <motion.button
                    onClick={handleDecline}
                    whileHover={{ scale: 1.02 }}
                    className="btn-premium glass-warm text-ink text-sm font-medium tracking-wide hover:bg-white/40 transition-colors cursor-pointer border-none"
                  >
                    I'll choose
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <motion.div
                    className="rounded-full"
                    style={{ width: 8, height: 8, background: mood.accent }}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  <span
                    className="text-[10px] tracking-[0.22em] uppercase"
                    style={{ color: mood.accent, fontFamily: "var(--font-display)" }}
                  >
                    {mood.mood} · Scrolling
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Day progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="w-full max-w-[540px] mt-6"
        >
          <div className="flex justify-between mb-2.5 text-[9px] tracking-[0.28em] uppercase text-ink-muted">
            <span>12 AM</span>
            <span style={{ color: mood.accent, transition: "color 1s" }}>
              Now · {mood.label}
            </span>
            <span>11 PM</span>
          </div>
          <div className="h-[2px] rounded-full overflow-visible relative" style={{ background: "rgba(0,0,0,0.07)" }}>
            <motion.div
              className="h-full rounded-full relative"
              style={{
                background: `linear-gradient(90deg, #e8a838, ${mood.accent})`,
                transition: "background 1.5s ease",
              }}
              initial={{ width: "0%" }}
              animate={{ width: `${dayPct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div
                className="absolute -right-1 -top-[3px] w-2 h-2 rounded-full"
                style={{
                  background: mood.accent,
                  boxShadow: `0 0 8px ${mood.accent}`,
                  transition: "background 1s, box-shadow 1s",
                }}
              />
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
