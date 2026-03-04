'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import '@/styles/velora-scroll-background.css';

/**
 * Scroll-driven cinematic background.
 *
 * Five atmospheric images cross-fade based on scroll progress (0 → 1).
 * Pure opacity crossfading — no blend modes.
 *
 * Transition order:
 *   Amber → Champagne → Blush → Lavender → Sky
 *
 * Amber starts fully visible at the top of the page.
 * Each subsequent layer crossfades in with overlap.
 */

const LAYERS = [
  // Amber: visible immediately, fades out by 30%
  { className: 'velora-bg-layer amber',     range: [0, 0, 0.18, 0.30] as const, peak: 1.0 },
  // Champagne: fades in 12-22%, holds, fades out by 45%
  { className: 'velora-bg-layer champagne', range: [0.12, 0.22, 0.35, 0.45] as const, peak: 0.95 },
  // Blush: fades in 32-42%, holds, fades out by 62%
  { className: 'velora-bg-layer blush',     range: [0.32, 0.42, 0.52, 0.62] as const, peak: 0.90 },
  // Lavender: fades in 52-62%, holds, fades out by 82%
  { className: 'velora-bg-layer lavender',  range: [0.52, 0.62, 0.72, 0.82] as const, peak: 0.85 },
  // Sky: fades in 72-82%, holds through end
  { className: 'velora-bg-layer sky',       range: [0.72, 0.82, 0.95, 1.00] as const, peak: 0.85 },
] as const;

function ScrollLayer({
  className,
  range,
  peak,
  scrollYProgress,
}: {
  className: string;
  range: readonly [number, number, number, number];
  peak: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  // fade in → hold at peak → fade out
  const opacity = useTransform(
    scrollYProgress,
    [range[0], range[1], range[2], range[3]],
    [0, peak, peak, 0],
  );

  return <motion.div className={className} style={{ opacity }} />;
}

export default function VeloraScrollBackground() {
  const { scrollYProgress } = useScroll();

  return (
    <div className="velora-bg-root" aria-hidden="true" role="presentation">
      {LAYERS.map((layer) => (
        <ScrollLayer
          key={layer.className}
          className={layer.className}
          range={layer.range}
          peak={layer.peak}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </div>
  );
}
