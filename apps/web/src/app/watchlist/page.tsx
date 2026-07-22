'use client';

import { useWatchlist } from '@/hooks/useWatchlist';
import FilmCard from '@/components/FilmCard';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import MagneticButton from '@/components/ui/MagneticButton';

export default function WatchlistPage() {
  const { list, remove } = useWatchlist();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-cream flex flex-col justify-between">
      <div>
        {/* ─── Header bar ─── */}
        <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-xl border-b border-ink/5">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="font-display text-xs md:text-sm tracking-[0.4em] uppercase text-ink hover:text-golden transition-colors"
            >
              Back to VELORA
            </Link>

            <h1
              className="font-display font-extralight text-lg md:text-xl tracking-tight text-ink"
              style={{ letterSpacing: "-0.01em" }}
            >
              My Watchlist
            </h1>

            <MagneticButton
              onClick={() => router.push('/browse')}
              className="font-display text-xs tracking-[0.12em] uppercase px-5 py-2.5"
              data-cursor="EXPLORE"
            >
              Browse Films
            </MagneticButton>
          </div>
        </header>

        {/* ─── Hero header ─── */}
        <section className="relative py-12 md:py-16 text-center px-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="font-display text-[10px] md:text-xs tracking-[0.45em] uppercase text-golden-warm block mb-3 font-medium">
              Saved Films
            </span>
            <h2
              className="font-display font-extralight text-ink leading-[1.05] tracking-tight"
              style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)", letterSpacing: "-0.02em" }}
            >
              A quiet place for the films that stay with you.
            </h2>
            <p className="mt-4 text-ink-soft/75 font-body max-w-md mx-auto leading-relaxed text-[15px]">
              {list.length === 0
                ? "Every unforgettable journey begins with a single discovery."
                : `${list.length} ${list.length === 1 ? "film" : "films"} saved for your next viewing.`}
            </p>
          </motion.div>
        </section>

        {/* ─── Content ─── */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-20">
          {list.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xl mx-auto text-center py-14 md:py-16 px-8 rounded-3xl border border-ink/8 bg-cream-warm/40 backdrop-blur-sm shadow-[0_16px_40px_rgba(0,0,0,0.03)]"
            >
              {/* Decorative Reel Icon */}
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-golden-warm/12 border border-golden-warm/25 flex items-center justify-center text-golden-warm">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-8.625 1.125v-3.375c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v3.375m0 0a1.125 1.125 0 01-1.125 1.125m1.125-1.125h-7.5c-.621 0-1.125-.504-1.125-1.125m0 1.125v-3.375m-3.75 3.375v-3.375m0 3.375h3.75m-3.75 0h-7.5m11.25 0h-3.75m3.75 0V15m-3.75 0V15" />
                </svg>
              </div>

              <h3 className="font-display font-light text-2xl text-ink mb-2">
                No films saved yet.
              </h3>
              <p className="text-ink-soft/70 font-body text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                Your collection is ready. Explore curated collections or spin the reel for immediate recommendations.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <MagneticButton
                  onClick={() => router.push('/browse')}
                  className="w-full sm:w-auto px-7 py-3 font-display text-xs tracking-[0.14em] uppercase"
                  data-cursor="EXPLORE"
                >
                  Browse Films
                </MagneticButton>
                <MagneticButton
                  onClick={() => router.push('/#spin')}
                  className="w-full sm:w-auto px-7 py-3 font-display text-xs tracking-[0.14em] uppercase"
                  data-cursor="SPIN"
                >
                  Spin the Reel
                </MagneticButton>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-6">
              {list.map((film, i) => (
                <motion.div
                  key={film.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min(i * 0.04, 0.4),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group relative"
                >
                  <a
                    href={`https://www.themoviedb.org/movie/${film.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block outline-none focus-visible:ring-2 focus-visible:ring-golden/50 rounded-[14px]"
                  >
                    <FilmCard film={{ ...film, original_language: 'en' }} />
                  </a>
                  <button
                    onClick={() => remove(film.id)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md
                      text-white/80 hover:text-white hover:bg-red-600/90
                      flex items-center justify-center opacity-0 group-hover:opacity-100
                      transition-all duration-200 text-xs cursor-pointer border-none shadow-md"
                    aria-label={`Remove ${film.title} from watchlist`}
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Footer ─── */}
      <footer className="border-t border-ink/8 py-8 text-center bg-cream-warm/20">
        <p className="text-ink-muted text-xs tracking-[0.16em] uppercase font-display">
          Powered by TMDB · VELORA
        </p>
      </footer>
    </main>
  );
}
