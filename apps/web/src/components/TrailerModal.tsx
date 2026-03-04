'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

interface Props {
  videoKey: string | null;
  onClose: () => void;
}

export default function TrailerModal({ videoKey, onClose }: Props) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {videoKey && (
        <>
          <motion.div
            className="fixed inset-0 z-[6000] bg-[#0D0D1A]/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[6001] flex items-center justify-center p-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(13,13,26,0.8)]">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
            <button
              className="absolute top-4 right-4 text-[#F5F0E8]/70 hover:text-[#F5F0E8] text-3xl font-thin transition-colors"
              onClick={onClose}
              aria-label="Close trailer modal"
            >
              x
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
