"use client";
import { useSyncExternalStore } from "react";

/**
 * Returns true if the user prefers reduced motion.
 * Used to skip GSAP timelines and show final states immediately.
 *
 * Uses useSyncExternalStore instead of useEffect+setState to avoid
 * the setState-in-effect React Compiler warning.
 */

function subscribe(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerSnapshot(): boolean {
  return false; // SSR default — assume full motion
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
