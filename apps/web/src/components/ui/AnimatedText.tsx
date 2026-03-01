"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  splitBy?: "chars" | "words";
}

export default function AnimatedText({
  text,
  className = "",
  style,
  delay = 0,
  stagger = 0.04,
  as: Tag = "h1",
  splitBy = "words",
}: AnimatedTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  const parts = splitBy === "chars" ? text.split("") : text.split(" ");

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={`overflow-hidden ${className}`}
      style={style}
      aria-label={text}
    >
      {parts.map((part, i) => (
        <motion.span
          key={i}
          initial={{ y: 100, opacity: 0, rotateX: -60 }}
          animate={isInView ? { y: 0, opacity: 1, rotateX: 0 } : {}}
          transition={{
            duration: 0.42,
            delay: delay + i * stagger,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block"
          style={{
            transformOrigin: "bottom center",
            whiteSpace: splitBy === "chars" ? "pre" : undefined,
            perspective: "600px",
          }}
        >
          {part}
          {splitBy === "words" && i < parts.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </Tag>
  );
}
