'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import { useWatchlist } from '@/hooks/useWatchlist';

export default function WatchlistDrawer() {
  const [open, setOpen] = useState(false);
  const { list, remove, count } = useWatchlist();

  return (
    <>
      {/* Floating trigger - bottom right */}
      <motion.button
        className="fixed bottom-8 right-8 z-[4000] w-12 h-12 rounded-full bg-[#C9A84C] flex items-center justify-center shadow-lg"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 8, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        data-cursor="LIST"
        aria-label="Open watchlist"
      >
        WL
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1A1A2E] text-[#C9A84C] text-[10px] font-bold flex items-center justify-center font-mono">
            {count}
          </span>
        )}
      </motion.button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[4001] bg-[#1A1A2E]/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed right-0 top-0 bottom-0 z-[4002] w-[380px] bg-[#F5F0E8] shadow-2xl flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="p-6 border-b border-[rgba(26,26,46,0.1)]">
                <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-2xl text-[#1A1A2E]">
                  My Watchlist
                </h2>
                <p className="font-mono text-[10px] text-[#8B8FA8] tracking-widest uppercase mt-1">
                  {count} film{count !== 1 ? 's' : ''} saved
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence>
                  {list.length === 0 && (
                    <p className="text-center text-[#8B8FA8] mt-12 font-mono text-xs tracking-wider">
                      Fate has chosen nothing yet.
                    </p>
                  )}
                  {list.map((film) => (
                    <motion.div
                      key={film.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      className="flex gap-3 items-center p-2 rounded-xl hover:bg-[#1A1A2E]/5 group"
                    >
                      <div className="relative w-12 h-[72px] rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={`https://image.tmdb.org/t/p/w200${film.poster_path}`}
                          alt={film.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#1A1A2E] text-sm truncate">{film.title}</p>
                        <p className="font-mono text-[10px] text-[#8B8FA8] tracking-wider mt-0.5">
                          {film.year} | * {film.rating.toFixed(1)}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(film.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8B8FA8] hover:text-[#1A1A2E] text-lg"
                        aria-label={`Remove ${film.title}`}
                      >
                        x
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
