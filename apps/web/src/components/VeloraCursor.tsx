'use client';
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function VeloraCursor() {
  const [label, setLabel] = useState('');
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Outer ring follows with spring lag
  const ringX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const ringY = useSpring(mouseY, { stiffness: 120, damping: 20 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement;
      const closest = target.closest('[data-cursor]') as HTMLElement | null;
      if (closest) {
        setLabel(closest.dataset.cursor || '');
        setIsHovering(true);
      } else {
        setLabel('');
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Inner dot — instant follow */}
      <motion.div
        className="fixed top-0 left-0 z-[10000] pointer-events-none"
        style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%' }}
      >
        <motion.div
          className="rounded-full bg-[#C9A84C]"
          animate={{ width: isHovering ? 0 : 6, height: isHovering ? 0 : 6 }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      {/* Outer ring — spring lag */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
      >
        <motion.div
          className="rounded-full border border-[#1A1A2E] flex items-center justify-center"
          animate={{
            width:  isHovering ? 64 : 32,
            height: isHovering ? 64 : 32,
            backgroundColor: isHovering ? 'rgba(201,168,76,0.08)' : 'transparent',
          }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {label && (
            <motion.span
              className="text-[9px] font-mono tracking-widest uppercase text-[#1A1A2E]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.span>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
