"use client";
import { RefObject, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function useSceneEntrance(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            once: true,
          }
        }
      );
    });
    return () => ctx.revert();
  }, [ref]);
}
