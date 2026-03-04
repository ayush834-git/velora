'use client';

import { useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  'data-cursor'?: string;
  variant?: 'gold' | 'ghost';
  disabled?: boolean;
}

export default function MagneticButton({
  children,
  className = '',
  onClick,
  variant = 'gold',
  disabled = false,
  ...rest
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useSpring(0, { stiffness: 300, damping: 20 });
  const y = useSpring(0, { stiffness: 300, damping: 20 });

  const onMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  };

  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const base = 'relative px-8 py-3 rounded-full font-mono text-xs tracking-widest uppercase overflow-hidden transition-shadow duration-300';
  const gold = 'bg-[#C9A84C] text-[#1A1A2E] hover:shadow-[0_8px_32px_rgba(201,168,76,0.4)]';
  const ghost = 'border border-[#1A1A2E] text-[#1A1A2E] hover:border-[#C9A84C] hover:text-[#C9A84C]';

  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variant === 'gold' ? gold : ghost} ${className}`}
      data-cursor="SPIN"
      {...rest}
    >
      {children}
    </motion.button>
  );
}
