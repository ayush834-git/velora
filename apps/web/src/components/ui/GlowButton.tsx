"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  className?: string;
}

export default function GlowButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
}: GlowButtonProps) {
  const variants = {
    primary:
      "btn-primary text-white border border-golden/45",
    secondary:
      "bg-white/75 border border-ink/12 text-ink-light hover:bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
    ghost:
      "bg-transparent text-ink-soft hover:text-ink hover:bg-white/30",
  };

  const sizes = {
    md: "btn-premium text-sm",
    lg: "btn-premium text-base",
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`glow-button relative font-display tracking-[0.03em] uppercase
        transition-all duration-300 cursor-pointer
        ${variants[variant]} ${sizes[size]} ${className}`}
      data-cursor-hover
    >
      {children}
    </motion.button>
  );
}
