"use client";
import { useCallback, useRef } from "react";
import { gsap } from "@/lib/gsapConfig";

interface MagnetHoverOptions {
  /** Max tilt degrees on each axis. Default: 18 */
  tiltMax?: number;
  /** Scale on hover. Default: 1.04 */
  hoverScale?: number;
  /** Spring-back duration in seconds. Default: 0.7 */
  resetDuration?: number;
}

/**
 * Returns pointer event handlers that apply GSAP-driven magnetic tilt
 * to a referenced element. Applies rotateX/Y + scale on pointer move,
 * springs back to neutral on leave.
 */
export function useMagnetHover(
  ref: React.RefObject<HTMLElement | null>,
  options: MagnetHoverOptions = {}
) {
  const { tiltMax = 18, hoverScale = 1.04, resetDuration = 0.7 } = options;
  const glowRef = useRef<HTMLDivElement>(null);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5…0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(ref.current, {
        rotateY: nx * tiltMax,
        rotateX: -ny * tiltMax,
        scale: hoverScale,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
    [ref, tiltMax, hoverScale]
  );

  const onPointerLeave = useCallback(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      duration: resetDuration,
      ease: "expo.out",
      overwrite: "auto",
    });
  }, [ref, resetDuration]);

  return { onPointerMove, onPointerLeave, glowRef };
}
