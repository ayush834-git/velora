"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorMode = "default" | "hover" | "poster" | "spin";

export default function CursorFollower() {
  const [mode, setMode] = useState<CursorMode>("default");
  const [label, setLabel] = useState("");
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springX = useSpring(mouseX, { stiffness: 500, damping: 40, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 500, damping: 40, mass: 0.5 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      let nextMode: CursorMode = "default";
      let nextLabel = "";

      const target = e.target as HTMLElement;
      const closest = target.closest("[data-cursor]") as HTMLElement | null;
      
      if (closest) {
        nextMode = (closest.dataset.cursor as CursorMode) ?? "hover";
        nextLabel = closest.dataset.cursorLabel ?? "";
      } else if (
        target.closest("[data-cursor-hover]") ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest(".floating-card") ||
        target.closest(".mood-card")
      ) {
        nextMode = "hover";
      }

      setMode((prev) => prev !== nextMode ? nextMode : prev);
      setLabel((prev) => prev !== nextLabel ? nextLabel : prev);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mouseX, mouseY]);

  const sizes: Record<CursorMode, number> = {
    default: 10, hover: 44, poster: 64, spin: 80,
  };

  // Only render on client to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center hidden md:flex"
        style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: sizes[mode],
          height: sizes[mode],
          opacity: mode === "default" ? 0.5 : 0.9,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      >
        <div
          className="w-full h-full rounded-full border border-golden/60 flex items-center justify-center transition-colors duration-300"
          style={{
            background: mode === "spin"
              ? "rgba(232,168,56,0.15)"
              : mode === "poster"
              ? "rgba(255,255,255,0.08)"
              : "transparent",
            backdropFilter: mode !== "default" ? "blur(8px)" : "none",
          }}
        >
          {label && (
            <span className="text-[9px] tracking-[0.28em] uppercase text-golden font-display">
              {label}
            </span>
          )}
        </div>
      </motion.div>

      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full bg-golden hidden md:block"
        style={{ x: mouseX, y: mouseY, translateX: "-50%", translateY: "-50%" }}
        animate={{ width: mode === "default" ? 6 : 0, height: mode === "default" ? 6 : 0 }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
}
