'use client';

import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  const handler = () => callback();
  window.addEventListener('scroll', handler, { passive: true });
  window.addEventListener('resize', handler, { passive: true });
  return () => {
    window.removeEventListener('scroll', handler);
    window.removeEventListener('resize', handler);
  };
}

function getSnapshot() {
  return window.scrollY || window.pageYOffset || 0;
}

function getServerSnapshot() {
  return 0;
}

export function useScrollPosition() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
