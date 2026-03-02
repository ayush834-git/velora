'use client';

import { useEffect, useRef } from 'react';
import VeloraBackground from '@/lib/velora-background';

export default function VeloraBackgroundLayer() {
  const rootRef = useRef<HTMLDivElement>(null);
  const bgInstance = useRef<VeloraBackground | null>(null);

  useEffect(() => {
    if (rootRef.current && !bgInstance.current) {
      bgInstance.current = new VeloraBackground();
      bgInstance.current.init();
    }

    return () => {
      if (bgInstance.current) {
        bgInstance.current.destroy();
        bgInstance.current = null;
      }
    };
  }, []);

  return (
    <div ref={rootRef} className="velora-bg-root" aria-hidden="true" role="presentation">
      <div className="velora-bg-layer velora-bg-layer--amber"></div>
      <div className="velora-bg-layer velora-bg-layer--champagne"></div>
      <div className="velora-bg-layer velora-bg-layer--blush"></div>
      <div className="velora-bg-layer velora-bg-layer--sky"></div>
      <div className="velora-bg-layer velora-bg-layer--lavender"></div>
    </div>
  );
}
