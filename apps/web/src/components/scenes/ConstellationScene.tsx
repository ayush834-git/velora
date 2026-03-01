"use client";

import { useState, useRef, useCallback, useId, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useFilters } from "@/context/FilterContext";

// ─── Genre node data ──────────────────────────────────────────────────────────
interface GenreNode {
  id: string;
  label: string;
  x: number;   // viewBox percent (0–100)
  y: number;   // viewBox percent (0–62)
  r: number;   // visual radius in SVG units
  color: string;
  films: string[];
}

// Positions are organic — deliberately NOT a grid
const NODES: GenreNode[] = [
  { id: "Drama",     label: "Drama",     x: 28, y: 20, r: 2.2, color: "#e8a838",
    films: ["The Shawshank Redemption", "Schindler's List", "Parasite"] },
  { id: "Thriller",  label: "Thriller",  x: 66, y: 14, r: 1.8, color: "#dc2626",
    films: ["Oldboy", "Prisoners", "Gone Girl"] },
  { id: "Sci-Fi",    label: "Sci-Fi",    x: 84, y: 38, r: 2.0, color: "#4a9eff",
    films: ["Interstellar", "Blade Runner 2049", "Arrival"] },
  { id: "Action",    label: "Action",    x: 74, y: 62, r: 1.7, color: "#f5734a",
    films: ["Mad Max: Fury Road", "The Dark Knight", "John Wick"] },
  { id: "Animation", label: "Animation", x: 44, y: 74, r: 2.1, color: "#10b981",
    films: ["Spirited Away", "Princess Mononoke", "WALL·E"] },
  { id: "Romance",   label: "Romance",   x: 16, y: 60, r: 1.6, color: "#ec4899",
    films: ["Before Sunrise", "Eternal Sunshine", "Her"] },
  { id: "Comedy",    label: "Comedy",    x: 12, y: 35, r: 1.5, color: "#f0c060",
    films: ["The Grand Budapest Hotel", "Knives Out", "The Nice Guys"] },
  { id: "Horror",    label: "Horror",    x: 52, y: 44, r: 1.4, color: "#9b7aed",
    films: ["Hereditary", "Get Out", "A Quiet Place"] },
];

// Constellation lines — pairs of node indices
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [4, 5], [5, 6], [6, 0], [7, 0],
  [7, 2], [7, 4], [1, 7], [5, 4],
];

// ─── Tooltip positioned relative to SVG container ───────────────────────────
interface TooltipProps {
  node: GenreNode;
  svgRect: DOMRect | null;
  wrapRect: DOMRect | null;
}

function NodeTooltip({ node, svgRect, wrapRect }: TooltipProps) {
  if (!svgRect || !wrapRect) return null;

  const svgW = svgRect.width;
  const svgH = svgRect.height;
  const xPx = (node.x / 100) * svgW;
  const yPx = (node.y / 82) * svgH; // viewBox height is 82 (0–82)
  const relX = svgRect.left - wrapRect.left + xPx;
  const relY = svgRect.top  - wrapRect.top  + yPx;
  const flipX = node.x > 62;
  const flipY = node.y > 55;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: flipY ? 8 : -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      className="absolute pointer-events-none z-20 w-52"
      style={{
        left: flipX ? `${relX - 208}px` : `${relX + 18}px`,
        top:  flipY ? `${relY - 148}px` : `${relY - 8}px`,
      }}
    >
      <div
        className="rounded-2xl px-5 py-4"
        style={{
          background: "rgba(10, 9, 22, 0.95)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${node.color}28`,
          boxShadow: `0 16px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)`,
        }}
      >
        <div
          className="font-display text-[10px] tracking-[0.38em] uppercase mb-3"
          style={{ color: node.color }}
        >
          {node.label}
        </div>
        <div className="flex flex-col gap-1.5 mb-3">
          {node.films.map((film) => (
            <div
              key={film}
              className="text-xs leading-snug font-body"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              {film}
            </div>
          ))}
        </div>
        <div
          className="font-display text-[9px] tracking-[0.3em] uppercase"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Click to filter →
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function ConstellationScene() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const svgRef     = useRef<SVGSVGElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const isInView   = useInView(sectionRef, { once: true, margin: "-10%" });

  const [hoveredId, setHoveredId]   = useState<string | null>(null);
  const [svgRect, setSvgRect]       = useState<DOMRect | null>(null);
  const [wrapRect, setWrapRect]     = useState<DOMRect | null>(null);
  const [clickedId, setClickedId]   = useState<string | null>(null);

  const { setFilter } = useFilters();
  const uid = useId();

  // Measure rects for tooltip positioning
  const measure = useCallback(() => {
    if (svgRef.current)  setSvgRect(svgRef.current.getBoundingClientRect());
    if (wrapRef.current) setWrapRect(wrapRef.current.getBoundingClientRect());
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const handleClick = useCallback((node: GenreNode) => {
    setFilter("genre", node.id);
    setClickedId(node.id);
    setTimeout(() => {
      setClickedId(null);
      document.getElementById("spin")?.scrollIntoView({ behavior: "smooth" });
    }, 600);
  }, [setFilter]);

  const hoveredNode = NODES.find((n) => n.id === hoveredId) ?? null;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-20"
      style={{
        background: "linear-gradient(180deg, #080714 0%, #0e0c1e 50%, #080714 100%)",
        minHeight: "88vh",
      }}
    >
      {/* Star field — CSS-only twinkle */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {Array.from({ length: 80 }).map((_, i) => {
          const size   = i % 12 === 0 ? 2 : 1;
          const dur    = 3 + (i % 7) * 0.6;
          const delay  = (i % 9) * 0.4;
          const loOp   = 0.05 + (i % 6) * 0.02;
          const hiOp   = loOp + 0.15 + (i % 4) * 0.05;
          return (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: size, height: size,
                left: `${(i * 7.31 + 11) % 100}%`,
                top:  `${(i * 11.73 + 5) % 100}%`,
                animation: `velor-twinkle ${dur}s ease-in-out ${delay}s infinite alternate`,
                "--lo": loOp,
                "--hi": hiOp,
              } as React.CSSProperties}
            />
          );
        })}
      </div>

      {/* Scan-lines — subtle CRT feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px)",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 35%, rgba(4,3,14,0.75) 100%)" }}
      />

      {/* Header */}
      <div className="relative z-10 text-center px-[5vw] mb-16 md:mb-24">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="font-display text-[10px] md:text-xs tracking-[0.4em] uppercase mb-4 block"
          style={{ color: "#e8a838" }}
        >
          Navigate by Genre
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="font-display font-extralight text-white/90 leading-tight"
          style={{
            fontSize: "var(--text-headline)",
            letterSpacing: "-0.02em",
          }}
        >
          The cinema constellation
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="font-body text-white/40 text-sm mt-4 tracking-wide"
        >
          Hover to explore · Click to filter your pick
        </motion.p>
      </div>

      {/* SVG + tooltip wrapper */}
      <motion.div
        ref={wrapRef}
        className="relative z-10 w-full max-w-4xl mx-auto px-6"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 0.35 }}
        onMouseLeave={() => setHoveredId(null)}
        onMouseEnter={measure}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 100 82"
          className="w-full"
          style={{ overflow: "visible" }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {NODES.map((node) => (
              <radialGradient key={node.id} id={`${uid}-halo-${node.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={node.color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={node.color} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* Edges */}
          {EDGES.map(([ai, bi], i) => {
            const a = NODES[ai], b = NODES[bi];
            const lit = hoveredId === a.id || hoveredId === b.id;
            return (
              <motion.line
                key={i}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="white"
                strokeWidth={lit ? 0.18 : 0.09}
                strokeOpacity={lit ? 0.35 : 0.15}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + i * 0.07 }}
                style={{ transition: "stroke-opacity 0.3s, stroke-width 0.3s" }}
              />
            );
          })}

          {/* Nodes */}
          {NODES.map((node, i) => {
            const hovered = hoveredId === node.id;
            const clicked = clickedId === node.id;
            return (
              <g
                key={node.id}
                role="button"
                tabIndex={0}
                aria-label={`Filter by ${node.label} — click to set genre filter`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleClick(node)}
                onKeyDown={(e) => e.key === "Enter" && handleClick(node)}
              >
                {/* Outer halo */}
                <motion.circle
                  cx={node.x} cy={node.y}
                  r={node.r * 3}
                  fill={`url(#${uid}-halo-${node.id})`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isInView
                    ? { scale: hovered || clicked ? 1.8 : 1, opacity: hovered || clicked ? 1 : 0.4 }
                    : { scale: 0, opacity: 0 }
                  }
                  transition={hovered
                    ? { type: "spring", stiffness: 260, damping: 18 }
                    : { duration: 0.8, delay: 0.7 + i * 0.08 }
                  }
                />

                {/* Pulse ring — animates continuously */}
                <motion.circle
                  cx={node.x} cy={node.y}
                  r={node.r * 1.9}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={0.15}
                  initial={{ opacity: 0 }}
                  animate={isInView
                    ? { opacity: [0.2, 0.5, 0.2] }
                    : { opacity: 0 }
                  }
                  transition={{
                    opacity: { duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
                    delay: 0.8 + i * 0.08,
                  }}
                />

                {/* Core dot */}
                <motion.circle
                  cx={node.x} cy={node.y}
                  r={hovered || clicked ? node.r * 0.85 : node.r * 0.55}
                  fill={node.color}
                  fillOpacity={hovered || clicked ? 1 : 0.78}
                  initial={{ r: 0, opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.75 + i * 0.08 }}
                  style={{
                    filter: hovered || clicked
                      ? `drop-shadow(0 0 ${node.r * 1.5}px ${node.color}) drop-shadow(0 0 ${node.r * 3}px ${node.color}66)`
                      : "none",
                    transition: "r 0.25s, fill-opacity 0.25s, filter 0.25s",
                  }}
                />

                {/* Label */}
                <motion.text
                  x={node.x}
                  y={node.y + node.r * 0.75 + 3.2}
                  textAnchor="middle"
                  fill="white"
                  fontSize={hovered ? "2.8" : "2.3"}
                  fontFamily="var(--font-display)"
                  letterSpacing="0.06"
                  fillOpacity={hovered ? 1 : 0.6}
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 + i * 0.08 }}
                  style={{
                    userSelect: "none",
                    transition: "fill-opacity 0.25s, font-size 0.25s",
                    pointerEvents: "none",
                  }}
                >
                  {node.label}
                </motion.text>

                {/* Click confirmation flash */}
                <AnimatePresence>
                  {clicked && (
                    <motion.circle
                      cx={node.x} cy={node.y}
                      r={node.r * 5}
                      fill="none"
                      stroke={node.color}
                      strokeWidth={0.3}
                      initial={{ opacity: 0.8, scale: 0.5 }}
                      animate={{ opacity: 0, scale: 2 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  )}
                </AnimatePresence>
              </g>
            );
          })}
        </svg>

        {/* Floating tooltip */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {hoveredNode && (
              <NodeTooltip
                key={hoveredNode.id}
                node={hoveredNode}
                svgRect={svgRect}
                wrapRect={wrapRect}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Bottom fade back to cream */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: 120,
          background: "linear-gradient(to bottom, transparent, var(--color-cream))",
          zIndex: 15,
        }}
      />

      {/* Twinkle keyframes — scoped to avoid global collision */}
      <style>{`
        @keyframes velor-twinkle {
          from { opacity: var(--lo, 0.06); transform: scale(1); }
          to   { opacity: var(--hi, 0.22); transform: scale(1.5); }
        }
      `}</style>
    </section>
  );
}
