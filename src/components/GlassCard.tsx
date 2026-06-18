import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover3D?: boolean;
  delay?: number;
}

export default function GlassCard({ children, className = '', hover3D = true, delay = 0 }: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover3D || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setTransform({ rotateX: (y - centerY) / 20, rotateY: (centerX - x) / 20 });
  };

  const handleMouseLeave = () => setTransform({ rotateX: 0, rotateY: 0 });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`, transformStyle: 'preserve-3d' }}
      className={`bg-glass border-glow rounded-xl p-6 card-glow transition-all duration-300 hover:shadow-[0_0_40px_rgba(138,43,226,0.3)] ${className}`}
    >
      {children}
    </motion.div>
  );
}
