'use client';
import { useEffect } from 'react';
import VeloraBackground from '@/lib/velora-background';

let instance: VeloraBackground | null = null;

export default function VeloraBackgroundInit() {
  useEffect(() => {
    if (instance) return;
    instance = new VeloraBackground();
    instance.init();
    return () => {
      instance?.destroy();
      instance = null;
    };
  }, []);
  return null;
}
