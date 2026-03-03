"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }
    
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Recalculate GSAP math when dynamic content (like movies) loads and changes document height
    let resizeTimer: NodeJS.Timeout;
    let lastHeight = document.body.scrollHeight;
    
    const resizeObserver = new ResizeObserver(() => {
      const currentHeight = document.body.scrollHeight;
      // Only refresh if height changes significantly (ignores mobile address bar 100svh jitter)
      if (Math.abs(currentHeight - lastHeight) > 100) {
        lastHeight = currentHeight;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          ScrollTrigger.refresh();
        }, 150);
      }
    });
    
    resizeObserver.observe(document.body);

    return () => {
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
