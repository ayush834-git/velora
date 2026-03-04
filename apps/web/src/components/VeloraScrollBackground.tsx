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
  // Amber: fully visible at top, starts fading at 15%, gone by 30%
  { className: 'velora-bg-layer amber',     range: [0, 0.15, 0.30] as const, peak: 1.0, startVisible: true },
  // Champagne: fades in 10-20%, holds, fades out by 45%
  { className: 'velora-bg-layer champagne', range: [0.10, 0.20, 0.35, 0.45] as const, peak: 0.95, startVisible: false },
  // Blush: fades in 30-40%, holds, fades out by 62%
  { className: 'velora-bg-layer blush',     range: [0.30, 0.40, 0.52, 0.62] as const, peak: 0.90, startVisible: false },
  // Lavender: fades in 50-60%, holds, fades out by 80%
  { className: 'velora-bg-layer lavender',  range: [0.50, 0.60, 0.72, 0.80] as const, peak: 0.85, startVisible: false },
  // Sky: fades in 70-82%, holds through end
  { className: 'velora-bg-layer sky',       range: [0.70, 0.82, 0.95, 1.00] as const, peak: 0.85, startVisible: false },
] as const;

function ScrollLayer({
  className,
  range,
  peak,
  startVisible,
  scrollYProgress,
}: {
  className: string;
  range: readonly number[];
  peak: number;
  startVisible: boolean;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  // For startVisible layers: peak → peak → fade out (3-point)
  // For regular layers: fade in → peak → peak → fade out (4-point)
  const opacity = useTransform(
    scrollYProgress,
    range as unknown as number[],
    startVisible
      ? [peak, peak, 0]
      : [0, peak, peak, 0],
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
          startVisible={layer.startVisible}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </div>
  );
}
