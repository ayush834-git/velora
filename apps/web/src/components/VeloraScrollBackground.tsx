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
 * Peak opacities:
 *   amber 0.85 | champagne 0.80 | blush 0.75 | lavender 0.70 | sky 0.70
 */

const LAYERS = [
  { className: 'velora-bg-layer amber',     range: [0, 0.10, 0.18, 0.25] as const, peak: 0.85 },
  { className: 'velora-bg-layer champagne', range: [0.15, 0.24, 0.33, 0.40] as const, peak: 0.80 },
  { className: 'velora-bg-layer blush',     range: [0.35, 0.44, 0.52, 0.60] as const, peak: 0.75 },
  { className: 'velora-bg-layer lavender',  range: [0.55, 0.64, 0.72, 0.80] as const, peak: 0.70 },
  { className: 'velora-bg-layer sky',       range: [0.75, 0.84, 0.92, 1.00] as const, peak: 0.70 },
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
