'use client';

import { useWatchlist } from '@/hooks/useWatchlist';
import FilmCard from '@/components/FilmCard';
import { useRouter } from 'next/navigation';
import MagneticButton from '@/components/ui/MagneticButton';

export default function WatchlistPage() {
  const { list } = useWatchlist();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-cream pt-24 px-6 md:px-12 pb-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display font-extralight text-4xl md:text-5xl tracking-tight text-ink mb-2">My Watchlist</h1>
        <p className="font-body text-ink-soft mb-12">{list.length} films saved for later.</p>
        
        {list.length === 0 ? (
          <div className="text-center py-20 bg-cream-warm/50 rounded-2xl border border-ink/5">
            <p className="text-ink-soft font-body mb-6">Your watchlist is empty.</p>
            <MagneticButton onClick={() => router.push('/browse')} data-cursor="EXPLORE">
              Browse Films
            </MagneticButton>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6">
            {list.map(film => (
              <a key={film.id} href={`https://www.themoviedb.org/movie/${film.id}`} target="_blank" rel="noopener noreferrer" className="block outline-none focus-visible:ring-2 focus-visible:ring-golden/50 rounded-[12px]">
                <FilmCard film={{ ...film, original_language: 'en' }} />
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
