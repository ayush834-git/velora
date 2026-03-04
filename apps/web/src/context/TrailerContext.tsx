'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import TrailerModal from '@/components/TrailerModal';

interface TrailerContextValue {
  videoKey: string | null;
  openTrailer: (key: string) => void;
  closeTrailer: () => void;
}

const TrailerContext = createContext<TrailerContextValue | undefined>(undefined);

export function TrailerProvider({ children }: { children: React.ReactNode }) {
  const [videoKey, setVideoKey] = useState<string | null>(null);

  const openTrailer = useCallback((key: string) => {
    if (!key) return;
    setVideoKey(key);
  }, []);

  const closeTrailer = useCallback(() => {
    setVideoKey(null);
  }, []);

  const value = useMemo(
    () => ({
      videoKey,
      openTrailer,
      closeTrailer,
    }),
    [closeTrailer, openTrailer, videoKey]
  );

  return (
    <TrailerContext.Provider value={value}>
      {children}
      <TrailerModal videoKey={videoKey} onClose={closeTrailer} />
    </TrailerContext.Provider>
  );
}

export function useTrailer() {
  const context = useContext(TrailerContext);
  if (!context) {
    throw new Error('useTrailer must be used inside TrailerProvider.');
  }
  return context;
}
