'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type SpinPhase = 'idle' | 'closing' | 'reeling' | 'revealing' | 'done';

interface Props {
  isSpinning: boolean;
  onComplete: () => void;
  posterUrl?: string;
}

export default function SpinSequence({ isSpinning, onComplete, posterUrl }: Props) {
  const [phase, setPhase] = useState<SpinPhase>('idle');

  useEffect(() => {
    if (!isSpinning) {
      setPhase('idle');
      return;
    }

    setPhase('closing');
    const t1 = setTimeout(() => setPhase('reeling'), 400);
    const t2 = setTimeout(() => setPhase('revealing'), 1800);
    const t3 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isSpinning, onComplete]);

  if (phase === 'idle') return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[5000] flex items-center justify-center bg-[#0D0D1A]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Phase 1 and 2: Iris + Reel */}
        {(phase === 'closing' || phase === 'reeling') && (
          <div className="relative flex flex-col items-center gap-2">
            {/* Simulated film strip */}
            <motion.div
              className="w-[160px] h-[320px] overflow-hidden rounded"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{
                scaleY: phase === 'reeling' ? 1 : 0,
                opacity: phase === 'reeling' ? 1 : 0,
              }}
              transition={{ duration: 0.4 }}
              style={{ transformOrigin: 'top center' }}
            >
              <motion.div
                className="flex flex-col gap-1"
                animate={{ y: phase === 'reeling' ? [-600, 0] : 0 }}
                transition={{ duration: 1.4, ease: [0.7, 0, 0.1, 1] }}
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full h-[80px] rounded border border-[#F5F0E8]/10 bg-[#F5F0E8]/10 flex-shrink-0"
                  />
                ))}
              </motion.div>
            </motion.div>

            {/* Iris blades */}
            <svg width="300" height="300" className="absolute" viewBox="0 0 300 300">
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <motion.path
                  key={i}
                  d="M 150 150 L 150 0 A 150 150 0 0 1 280 75 Z"
                  fill="#131428"
                  style={{ transformOrigin: '150px 150px', rotate: deg }}
                  animate={{
                    rotate: phase === 'closing' ? deg + 60 : deg,
                  }}
                  transition={{ duration: 0.5, ease: [0.7, 0, 0.3, 1] }}
                />
              ))}
            </svg>
          </div>
        )}

        {/* Phase 3: Poster reveal */}
        {(phase === 'revealing' || phase === 'done') && posterUrl && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0, filter: 'blur(12px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative"
          >
            <div className="absolute inset-0 -z-10 blur-[60px] bg-[#C9A84C] opacity-30 rounded-2xl" />
            <img src={posterUrl} alt="" className="w-[240px] rounded-2xl shadow-2xl" />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
