import { useState, useEffect } from 'react';

interface WatchlistFilm {
  id: number;
  title: string;
  year: number;
  rating: number;
  poster_path: string;
}

const KEY = 'velora-watchlist';

export function useWatchlist() {
  const [list, setList] = useState<WatchlistFilm[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setList(JSON.parse(stored));
    } catch {}
  }, []);

  const save = (next: WatchlistFilm[]) => {
    setList(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };

  return {
    list,
    add: (film: WatchlistFilm) => {
      if (list.find(f => f.id === film.id)) return;
      save([...list, film]);
    },
    remove: (id: number) => save(list.filter(f => f.id !== id)),
    isInList: (id: number) => list.some(f => f.id === id),
    count: list.length,
  };
}
