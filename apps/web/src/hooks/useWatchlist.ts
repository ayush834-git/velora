'use client';

import { useSyncExternalStore } from 'react';

interface WatchlistFilm {
  id: number;
  title: string;
  year: number;
  rating: number;
  poster_path: string;
}

const KEY = 'velora-watchlist';
let store: WatchlistFilm[] | null = null;
const listeners = new Set<() => void>();

function parseList(raw: string | null): WatchlistFilm[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readStore(): WatchlistFilm[] {
  if (store !== null) return store;
  if (typeof window === 'undefined') return [];
  store = parseList(window.localStorage.getItem(KEY));
  return store;
}

function writeStore(next: WatchlistFilm[]) {
  store = next;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Ignore quota/storage errors
    }
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return;
    store = parseList(event.newValue);
    listeners.forEach((cb) => cb());
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

function getSnapshot() {
  return readStore();
}

function getServerSnapshot() {
  return [] as WatchlistFilm[];
}

export function useWatchlist() {
  const list = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    list,
    add: (film: WatchlistFilm) => {
      const current = readStore();
      if (current.find((f) => f.id === film.id)) return;
      writeStore([...current, film]);
    },
    remove: (id: number) => {
      const current = readStore();
      writeStore(current.filter((film) => film.id !== id));
    },
    isInList: (id: number) => list.some((film) => film.id === id),
    count: list.length,
  };
}
