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
    <main className="min-h-screen bg-cream">
      {/* ─── Header bar ─── */}
      <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-xl border-b border-ink/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-sm tracking-[0.4em] uppercase text-ink hover:text-golden transition-colors"
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
      <section className="relative py-16 md:py-24 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-display text-[10px] tracking-[0.5em] uppercase text-golden-warm/70 block mb-4">
            Your Collection
          </span>
          <h2
            className="font-display font-extralight text-ink leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", letterSpacing: "-0.02em" }}
          >
            Saved Films
          </h2>
          <p className="mt-5 text-ink-soft/70 font-body max-w-lg mx-auto leading-relaxed text-[15px]">
            {list.length === 0
              ? "Your watchlist is waiting. Spin the reel or browse to find your next film."
              : `${list.length} ${list.length === 1 ? "film" : "films"} saved for later.`}
          </p>
        </motion.div>
      </section>

      {/* ─── Content ─── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
        {list.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-20 rounded-3xl border border-ink/[0.06] bg-cream-warm/30"
          >
            <div
              className="font-display font-extralight text-ink/10 select-none mb-6"
              style={{ fontSize: "clamp(4rem, 8vw, 8rem)" }}
            >
              ∅
            </div>
            <p className="text-ink-soft/60 font-body text-lg mb-8 leading-relaxed">
              No films yet — your next favorite is one spin away.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticButton
                onClick={() => router.push('/#spin')}
                data-cursor="SPIN"
              >
                Spin the Reel
              </MagneticButton>
              <MagneticButton
                onClick={() => router.push('/browse')}
                data-cursor="EXPLORE"
              >
                Browse Films
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
                  className="block outline-none focus-visible:ring-2 focus-visible:ring-golden/50 rounded-[12px]"
                >
                  <FilmCard film={{ ...film, original_language: 'en' }} />
                </a>
                <button
                  onClick={() => remove(film.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm
                    text-white/80 hover:text-white hover:bg-red-600/80
                    flex items-center justify-center opacity-0 group-hover:opacity-100
                    transition-all duration-200 text-sm cursor-pointer border-none"
                  aria-label={`Remove ${film.title} from watchlist`}
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Footer ─── */}
      <footer className="border-t border-ink/[0.06] py-10 text-center">
        <p className="text-ink-muted text-xs tracking-[0.12em] uppercase font-display">
          Powered by TMDB · VELORA
        </p>
      </footer>
    </main>
  );
}
