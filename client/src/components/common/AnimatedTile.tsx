import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimatedTileProps {
  label: string;
  details?: string[];
  color: string;
  icon?: ReactNode;
  emoji?: string;
  onClick: () => void;
  index?: number;
}

export function AnimatedTile({ label, details = [], color, icon, emoji, onClick, index = 0 }: AnimatedTileProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.12, type: 'spring', stiffness: 200, damping: 20 }}
      onClick={onClick}
      className="w-full rounded-xl p-4 text-left shadow-md active:scale-95 transition-transform"
      style={{ backgroundColor: color }}
    >
      <div className="flex items-center gap-3">
        {emoji && <div className="text-2xl">{emoji}</div>}
        {icon && <div className="text-white text-2xl">{icon}</div>}
        <div>
          <div className="text-white font-bold text-lg">{label}</div>
          {details.map((d, i) => (
            <div key={i} className="text-white/80 text-sm">{d}</div>
          ))}
        </div>
      </div>
    </motion.button>
  );
}
