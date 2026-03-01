"use client";

import { useRef, ReactNode } from "react";
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
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btnRef.current.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
  };

  const handleMouseLeave = () => {
    if (!btnRef.current) return;
    btnRef.current.style.transform = "translate(0, 0)";
  };

  const variants = {
    primary:
      "bg-golden/90 text-white hover:bg-golden hover:shadow-[0_8px_32px_rgba(232,168,56,0.35)]",
    secondary:
      "bg-white/70 border border-ink/10 text-ink-light hover:bg-white hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:text-ink",
    ghost:
      "bg-transparent text-ink-soft hover:text-ink hover:bg-white/30",
  };

  const sizes = {
    md: "btn-premium text-sm",
    lg: "btn-premium px-[1.45rem] py-[0.78rem] text-base",
  };

  return (
    <motion.button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.95 }}
      className={`glow-button relative font-display tracking-[0.03em] uppercase
        transition-all duration-500 cursor-pointer
        ${variants[variant]} ${sizes[size]} ${className}`}
      data-cursor-hover
    >
      {children}
    </motion.button>
  );
}
