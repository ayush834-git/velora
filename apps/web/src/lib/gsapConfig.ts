"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins (client-side only)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Global GSAP defaults — editorial feel
gsap.defaults({
  ease: "expo.out",
  duration: 1.2,
});

export { gsap, ScrollTrigger };
