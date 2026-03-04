'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Movie } from '@/types/movie';
import { IMAGE_SIZES } from '@/lib/constants';
import { fetchSpinMovie } from '@/lib/api';
import { getPosterPath, normalizeBackendMovie } from '@/lib/movie-utils';
import { getImageUrl } from '@/lib/tmdb';
import { useFilters } from '@/context/FilterContext';
import AnimatedText from '@/components/ui/AnimatedText';
import MagneticButton from '@/components/ui/MagneticButton';
import SpinSequence from '@/components/SpinSequence';

interface SpinRitualProps {
  movies: Movie[];
  onResult?: (movie: Movie) => void;
}

type SpinPhase = 'idle' | 'spinning' | 'done';

const GENRE_TO_ID: Record<string, number> = {
  Action: 28,
  Drama: 18,
  Comedy: 35,
  'Sci-Fi': 878,
  Horror: 27,
  Romance: 10749,
  Thriller: 53,
  Animation: 16,
};

const MOOD_TO_GENRE_IDS: Record<string, number[]> = {
  'Mind-Bending': [878, 9648, 53],
  Comfort: [35, 10751, 16],
  Dark: [27, 53, 80],
  Uplifting: [35, 10751, 10402],
  Epic: [28, 12, 14],
  Romantic: [10749, 18],
};

export default function SpinRitual({ movies, onResult }: SpinRitualProps) {
  const [phase, setPhase] = useState<SpinPhase>('idle');
  const [isSpinning, setIsSpinning] = useState(false);
  const [chosenMovie, setChosenMovie] = useState<Movie | null>(null);
  const [sequencePoster, setSequencePoster] = useState<string | undefined>(undefined);
  const pendingMovieRef = useRef<Movie | null>(null);

  const { filters } = useFilters();

  const spinFilters = useMemo(
    () => ({
      genre: filters.genre,
      mood: filters.mood,
      era: filters.era,
      language: filters.language,
      rating: filters.rating,
    }),
    [filters.genre, filters.mood, filters.era, filters.language, filters.rating]
  );

  const activeFilterLabels = Object.values(spinFilters).filter(
    (value): value is string => typeof value === 'string' && value.length > 0 && value !== 'Any'
  );

  const flashPool = useMemo(() => {
    if (movies.length === 0) return movies;
    let pool = movies;

    if (filters.mood && MOOD_TO_GENRE_IDS[filters.mood]) {
      const moodIds = MOOD_TO_GENRE_IDS[filters.mood];
      pool = pool.filter((movie) => movie.genre_ids?.some((id) => moodIds.includes(id)));
    }

    if (filters.genre && GENRE_TO_ID[filters.genre]) {
      const genreId = GENRE_TO_ID[filters.genre];
      pool = pool.filter((movie) => movie.genre_ids?.includes(genreId));
    }

    return pool.length > 0 ? pool : movies;
  }, [filters.genre, filters.mood, movies]);

  const fallbackMovie = useMemo(() => {
    if (flashPool.length === 0) return null;
    return flashPool[Math.floor(Math.random() * flashPool.length)] || flashPool[0] || null;
  }, [flashPool]);

  const startSpin = useCallback(() => {
    if (isSpinning || flashPool.length === 0) return;

    setPhase('spinning');
    setIsSpinning(true);

    pendingMovieRef.current = fallbackMovie;
    const fallbackPosterPath = fallbackMovie ? getPosterPath(fallbackMovie) : null;
    setSequencePoster(
      fallbackPosterPath ? getImageUrl(fallbackPosterPath, IMAGE_SIZES.poster.large) : undefined
    );

    fetchSpinMovie(spinFilters)
      .then((movie) => {
        const normalized = normalizeBackendMovie(movie);
        pendingMovieRef.current = normalized;
        const posterPath = getPosterPath(normalized);
        if (posterPath) {
          setSequencePoster(getImageUrl(posterPath, IMAGE_SIZES.poster.large));
        }
      })
      .catch((error) => {
        console.error('Spin API request failed', error);
      });
  }, [fallbackMovie, flashPool.length, isSpinning, spinFilters]);

  const onSequenceComplete = useCallback(() => {
    const selected = pendingMovieRef.current || fallbackMovie;
    setIsSpinning(false);

    if (!selected) {
      setPhase('idle');
      return;
    }

    setChosenMovie(selected);
    setPhase('done');
    onResult?.(selected);
  }, [fallbackMovie, onResult]);

  const resetSpin = useCallback(() => {
    setChosenMovie(null);
    setSequencePoster(undefined);
    pendingMovieRef.current = null;
    setPhase('idle');
  }, []);

  return (
    <section id="spin" className="scene relative min-h-screen flex items-center justify-center py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream-warm to-cream" />

      <div className="relative z-10 w-full max-w-3xl mx-auto text-center px-6">
        <AnimatePresence mode="wait">
          {(phase === 'idle' || phase === 'spinning') && (
            <motion.div
              key="spin-ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.42 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.08, duration: 0.35 }}
                className="font-display text-xs tracking-[0.4em] uppercase text-golden-warm/75 mb-4 block"
              >
                The Ritual
              </motion.span>

              <AnimatedText
                text="One click. One film."
                className="font-display font-extralight text-ink mb-6"
                style={{ fontSize: 'var(--text-headline)' }}
                delay={0.08}
                stagger={0.03}
                splitBy="words"
                as="h2"
              />

              <div className="relative w-56 h-56 md:w-72 md:h-72 mx-auto my-10" data-cursor="SPIN">
                <div className="spin-ring w-[85%] h-[85%] top-[7.5%] left-[7.5%]" />
                <div className="spin-ring w-[70%] h-[70%] top-[15%] left-[15%]" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <MagneticButton
                    onClick={startSpin}
                    disabled={isSpinning || flashPool.length === 0}
                    data-cursor="SPIN"
                    className="spin-glow-pulse relative overflow-hidden w-28 h-28 md:w-36 md:h-36 !rounded-full !p-0 flex items-center justify-center text-[#1A1A2E] font-display text-xl md:text-2xl tracking-[0.2em] uppercase disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSpinning ? '...' : 'SPIN'}
                  </MagneticButton>
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.58 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-ink-muted text-sm mt-4 italic"
              >
                One click. One film. No paradox of choice.
              </motion.p>

              {activeFilterLabels.length > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] tracking-[0.32em] uppercase text-golden-warm mt-3"
                >
                  {activeFilterLabels.join('  |  ')}
                </motion.p>
              )}
            </motion.div>
          )}

          {phase === 'done' && chosenMovie && (
            <motion.div
              key={`spin-done-${chosenMovie.id}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center"
            >
              <span className="font-display text-xs tracking-[0.3em] uppercase text-golden-warm mb-4">
                Fate has spoken
              </span>

              <h3 className="font-display font-light text-ink" style={{ fontSize: 'var(--text-subheadline)' }}>
                {chosenMovie.title}
              </h3>

              <p className="text-ink-soft text-sm mt-2">
                {chosenMovie.release_date?.slice(0, 4)} | {chosenMovie.original_language?.toUpperCase()}
              </p>

              <MagneticButton
                onClick={resetSpin}
                data-cursor="SPIN"
                className="mt-8"
              >
                Spin Again
              </MagneticButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SpinSequence isSpinning={isSpinning} onComplete={onSequenceComplete} posterUrl={sequencePoster} />
    </section>
  );
}
