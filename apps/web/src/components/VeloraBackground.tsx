'use client';

import { useEffect } from 'react';
import VeloraBackground from '@/lib/velora-background';
import '@/styles/velora-background.css';

export default function VeloraBackgroundLayer() {
  useEffect(() => {
    const bg = new VeloraBackground();
    bg.init();
    return () => bg.destroy();
  }, []);

  return (
    <div className="velora-bg-root" aria-hidden="true" role="presentation">
      <div className="velora-bg-layer velora-bg-layer--amber" />
      <div className="velora-bg-layer velora-bg-layer--champagne" />
      <div className="velora-bg-layer velora-bg-layer--blush" />
      <div className="velora-bg-layer velora-bg-layer--sky" />
      <div className="velora-bg-layer velora-bg-layer--lavender" />
    </div>
  );
}
